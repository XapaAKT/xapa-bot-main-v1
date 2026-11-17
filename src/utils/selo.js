import { getSeloType } from "./database.js";

/* ---------- gerador ---------- */
function selo(id, nome, empresa, numero, label = "Celular") {
  return {
    key: {
      id,
      participant: `${numero}@s.whatsapp.net`,
      remoteJid: "status@broadcast",
      fromMe: false,
    },
    message: {
      contactMessage: {
        displayName: nome,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${nome};;;\nFN:${nome}\nORG:${empresa}\nitem1.TEL;waid=${numero}:${numero}\nitem1.X-ABLabel:${label}\nEND:VCARD`,
        contextInfo: { forwardingScore: 1, isForwarded: true },
      },
    },
  };
}

/* ---------- originais ---------- */
export const MeuSelo = {
  key: {
    id: "xic",
    participant: "5531997138522@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
  },
  message: {
    contactMessage: {
      displayName: "Ulquiorra BOT",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Xapa;;;\nFN:Xapa\nitem1.TEL;waid=5531997138522:5531997138522\nitem1.X-ABLabel:Dono\nEND:VCARD`,
      contextInfo: { forwardingScore: 1, isForwarded: true },
    },
  },
};

export const SeloMeta = {
  key: {
    id: "selinho",
    participant: "13135550002@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
  },
  message: {
    contactMessage: {
      displayName: "MetaAI",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Void;;;\nFN:Void\nitem1.TEL;waid=13135550002:13135550002\nitem1.X-ABLabel:Celular\nEND:VCARD`,
      contextInfo: { forwardingScore: 1, isForwarded: true },
    },
  },
};

/* ---------- bancos ---------- */
const BANCOS = [
  selo("nubank", "Nubank", "Nubank", "551151807064", "Atendimento"),
  selo("itau", "Itaú", "Itaú Unibanco", "551140044828", "Atendimento"),
  selo("bradesco", "Bradesco", "Banco Bradesco", "551140047799", "Atendimento"),
  selo("bb", "Banco do Brasil", "Banco do Brasil", "556140040001", "Atendimento"),
  selo("caixa", "Caixa", "Caixa Econômica Federal", "556140040104", "Atendimento"),
  selo("santander", "Santander", "Banco Santander", "551140043533", "Atendimento"),
  selo("inter", "Inter", "Banco Inter", "551140046999", "Atendimento"),
  selo("c6", "C6 Bank", "C6 Bank", "551140046111", "Atendimento"),
  selo("picpay", "PicPay", "PicPay", "551140060000", "Atendimento"),
  selo("mercadopago", "Mercado Pago", "Mercado Pago", "551140060100", "Atendimento"),
  selo("pagbank", "PagBank", "PagBank", "551140060200", "Atendimento"),
  selo("neon", "Neon", "Banco Neon", "551140060300", "Atendimento"),
  selo("will", "Will Bank", "Will Bank", "551140060400", "Atendimento"),
];

/* ---------- whatsapp / suporte ---------- */
const WHATSAPP = [
  selo("wpp", "WhatsApp", "WhatsApp LLC", "15551234567", "Suporte"),
  selo("wppsuporte", "WhatsApp Suporte", "WhatsApp LLC", "15551234568", "Suporte"),
  selo("wppbusiness", "WhatsApp Business", "WhatsApp LLC", "15551234569", "Comercial"),
  selo("meta", "Meta", "Meta Platforms", "16505550100", "Suporte"),
  selo("metaai", "Meta AI", "Meta Platforms", "13135550002", "Celular"),
  selo("suporte", "Equipe de Suporte", "Suporte Técnico", "551140010100", "Suporte"),
  selo("central", "Central de Atendimento", "Atendimento 24h", "551140010200", "Suporte"),
  selo("verificado", "Conta Verificada", "Verificado", "551140010300", "Verificado"),
  selo("comercial", "Comercial", "Equipe Comercial", "551140010400", "Comercial"),
  selo("financeiro", "Financeiro", "Departamento Financeiro", "551140010500", "Financeiro"),
  selo("bot", "BOT Oficial", "Automação", "551140010600", "Bot"),
  selo("dono", "Dono", "Administração", "551140010700", "Dono"),
  selo("adm", "Administrador", "Administração", "551140010800", "Admin"),
];

/* ---------- apps / tecnologia ---------- */
const APPS = [
  selo("instagram", "Instagram", "Meta Platforms", "16505550101", "Suporte"),
  selo("facebook", "Facebook", "Meta Platforms", "16505550102", "Suporte"),
  selo("google", "Google", "Google LLC", "16505550103", "Suporte"),
  selo("youtube", "YouTube", "Google LLC", "16505550104", "Suporte"),
  selo("twitter", "X", "X Corp", "16505550105", "Suporte"),
  selo("tiktok", "TikTok", "ByteDance", "16505550106", "Suporte"),
  selo("telegram", "Telegram", "Telegram FZ-LLC", "16505550107", "Suporte"),
  selo("apple", "Apple", "Apple Inc.", "16505550108", "Suporte"),
  selo("netflix", "Netflix", "Netflix Inc.", "16505550109", "Suporte"),
  selo("spotify", "Spotify", "Spotify AB", "16505550110", "Suporte"),
  selo("samsung", "Samsung", "Samsung Electronics", "551140070000", "Suporte"),
  selo("xiaomi", "Xiaomi", "Xiaomi Corp", "551140070100", "Suporte"),
  selo("motorola", "Motorola", "Motorola Mobility", "551140070200", "Suporte"),
  selo("amazon", "Amazon", "Amazon.com.br", "551140070300", "Atendimento"),
  selo("mercadolivre", "Mercado Livre", "Mercado Livre", "551140070400", "Atendimento"),
  selo("shopee", "Shopee", "Shopee Brasil", "551140070500", "Atendimento"),
  selo("aliexpress", "AliExpress", "Alibaba Group", "551140070600", "Atendimento"),
  selo("shein", "Shein", "Shein", "551140070700", "Atendimento"),
  selo("ifood", "iFood", "iFood", "551140070800", "Atendimento"),
  selo("uber", "Uber", "Uber Technologies", "551140070900", "Atendimento"),
  selo("99", "99", "99 Tecnologia", "551140071000", "Atendimento"),
  selo("rappi", "Rappi", "Rappi Brasil", "551140071100", "Atendimento"),
];

/* ---------- serviços / governo ---------- */
const SERVICOS = [
  selo("correios", "Correios", "Empresa Brasileira de Correios", "556140030101", "Atendimento"),
  selo("vivo", "Vivo", "Telefônica Brasil", "551140080000", "Atendimento"),
  selo("claro", "Claro", "Claro Brasil", "551140080100", "Atendimento"),
  selo("tim", "TIM", "TIM Brasil", "551140080200", "Atendimento"),
  selo("oi", "Oi", "Oi S.A.", "551140080300", "Atendimento"),
  selo("enel", "Enel", "Enel Distribuição", "551140080400", "Atendimento"),
  selo("sabesp", "Sabesp", "Sabesp", "551140080500", "Atendimento"),
  selo("copasa", "Copasa", "Copasa MG", "553140080600", "Atendimento"),
  selo("cemig", "Cemig", "Cemig", "553140080700", "Atendimento"),
  selo("detran", "Detran-MG", "Detran Minas Gerais", "553140080800", "Atendimento"),
  selo("receita", "Receita Federal", "Receita Federal", "556140080900", "Atendimento"),
  selo("inss", "INSS", "INSS", "551140080910", "Atendimento"),
  selo("sus", "Ministério da Saúde", "Governo Federal", "551140080920", "Atendimento"),
  selo("govbr", "Gov.br", "Governo Federal", "551140080930", "Atendimento"),
  selo("pm", "Polícia Militar", "PM", "553140080940", "Emergência"),
  selo("bombeiros", "Bombeiros", "Corpo de Bombeiros", "553140080950", "Emergência"),
];

/* ---------- catálogo ---------- */
export const SELOS = {
  bancos: BANCOS,
  whatsapp: WHATSAPP,
  apps: APPS,
  servicos: SERVICOS,
};

/* ---------- acesso ---------- */
export function listarSelos() {
  return Object.entries(SELOS).flatMap(([categoria, lista]) =>
    lista.map((s) => ({
      categoria,
      id: s.key.id,
      nome: s.message.contactMessage.displayName,
    }))
  );
}

export function getSeloById(id) {
  return Object.values(SELOS).flat().find((s) => s.key.id === id) || null;
}

export function getSeloAleatorio() {
  const todos = Object.values(SELOS).flat();
  return todos[Math.floor(Math.random() * todos.length)];
}

// mantém o comportamento antigo (2 = Meta, resto = seu selo)
export function getSelo() {
  if (getSeloType() === 2) return SeloMeta;
  return MeuSelo;
}
