// Reescreve os metadados de tempo de um MP4 sem reencode.
// timescale = 1 faz 0xFFFFFFFF valer 136 anos; os deltas do stts são todos
// jogados no teto, então nenhum frame seguinte é alcançável.

const UINT32_MAX = 0xffffffff;

export function readBoxes(buf, start, end) {
  const out = [];
  let off = start;

  while (off + 8 <= end) {
    let size = buf.readUInt32BE(off);
    const type = buf.toString("latin1", off + 4, off + 8);
    let header = 8;

    if (size === 1) {
      if (off + 16 > end) return out;
      size = Number(buf.readBigUInt64BE(off + 8));
      header = 16;
    } else if (size === 0) {
      size = end - off;
    }

    if (size < header || off + size > end) return out;

    out.push({ type, start: off, content: off + header, end: off + size });
    off += size;
  }

  return out;
}

function childBox(buf, parent, type) {
  return readBoxes(buf, parent.content, parent.end).find((b) => b.type === type) ?? null;
}

function readTimeFields(buf, box) {
  const version = buf.readUInt8(box.content);
  const c = box.content;

  if (version === 0) {
    if (c + 20 > box.end) return null;
    return { wide: false, tsOff: c + 12, durOff: c + 16 };
  }

  if (c + 32 > box.end) return null;
  return { wide: true, tsOff: c + 20, durOff: c + 24 };
}

function forceDuration(buf, field, value) {
  buf.writeUInt32BE(1, field.tsOff);

  if (field.wide) buf.writeBigUInt64BE(BigInt(value), field.durOff);
  else buf.writeUInt32BE(value, field.durOff);
}

function forceStts(buf, stts, value) {
  if (stts.content + 8 > stts.end) return;

  const entryCount = buf.readUInt32BE(stts.content + 4);
  const first = stts.content + 8;

  for (let i = 0; i < entryCount; i += 1) {
    const deltaOff = first + i * 8 + 4;
    if (deltaOff + 4 > stts.end) return;
    buf.writeUInt32BE(value, deltaOff);
  }
}

function forceElst(buf, elst, value) {
  const version = buf.readUInt8(elst.content);
  const entryCount = buf.readUInt32BE(elst.content + 4);
  let off = elst.content + 8;

  for (let i = 0; i < entryCount; i += 1) {
    if (version === 0) {
      buf.writeUInt32BE(value, off);
      buf.writeUInt32BE(0, off + 4);
      off += 12;
    } else {
      buf.writeBigUInt64BE(BigInt(value), off);
      buf.writeBigUInt64BE(0n, off + 8);
      off += 20;
    }

    if (off > elst.end) return;
  }
}

export function readMp4Duration(buf) {
  const moov = readBoxes(buf, 0, buf.length).find((b) => b.type === "moov");
  const mvhd = moov ? childBox(buf, moov, "mvhd") : null;
  const field = mvhd ? readTimeFields(buf, mvhd) : null;

  if (!field) return null;

  const timescale = buf.readUInt32BE(field.tsOff);
  if (!timescale) return null;

  const duration = field.wide
    ? Number(buf.readBigUInt64BE(field.durOff))
    : buf.readUInt32BE(field.durOff);

  return Math.round(duration / timescale);
}

export function patchMp4Duration(buf, seconds) {
  const value = Math.min(Math.max(1, Math.floor(seconds)), UINT32_MAX);

  const moov = readBoxes(buf, 0, buf.length).find((b) => b.type === "moov");
  if (!moov) throw new Error("moov ausente");

  const mvhd = childBox(buf, moov, "mvhd");
  const movieField = mvhd ? readTimeFields(buf, mvhd) : null;
  if (!movieField) throw new Error("mvhd inválido");

  forceDuration(buf, movieField, value);

  const mvex = childBox(buf, moov, "mvex");
  const mehd = mvex ? childBox(buf, mvex, "mehd") : null;
  if (mehd) {
    if (buf.readUInt8(mehd.content) === 0) buf.writeUInt32BE(value, mehd.content + 4);
    else buf.writeBigUInt64BE(BigInt(value), mehd.content + 4);
  }

  for (const trak of readBoxes(buf, moov.content, moov.end)) {
    if (trak.type !== "trak") continue;

    const tkhd = childBox(buf, trak, "tkhd");
    const tkhdField = tkhd ? readTimeFields(buf, tkhd) : null;
    if (tkhdField) forceDuration(buf, tkhdField, value);

    const edts = childBox(buf, trak, "edts");
    const elst = edts ? childBox(buf, edts, "elst") : null;
    if (elst) forceElst(buf, elst, value);

    const mdia = childBox(buf, trak, "mdia");
    const mdhd = mdia ? childBox(buf, mdia, "mdhd") : null;
    const mdhdField = mdhd ? readTimeFields(buf, mdhd) : null;
    if (!mdhdField) continue;

    forceDuration(buf, mdhdField, value);

    const minf = childBox(buf, mdia, "minf");
    const stbl = minf ? childBox(buf, minf, "stbl") : null;
    const stts = stbl ? childBox(buf, stbl, "stts") : null;
    if (stts) forceStts(buf, stts, value);
  }

  const check = readMp4Duration(buf);
  if (check !== value) throw new Error(`patch não aplicado (${check} != ${value})`);

  return value;
}