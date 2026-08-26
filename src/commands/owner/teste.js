import { PREFIX } from "../../config.js";

export default {
name: "teste",
description: "teste",
commands: ["teste"],
usage: `${PREFIX}teste`,

handle: async ({ webMessage, sendReply }) => {

```
console.log("===== WEBMESSAGE =====");

console.log(
  JSON.stringify(
    webMessage,
    (key, value) =>
      typeof value === "bigint"
        ? value.toString()
        : value,
    2
  )
);

console.log("======================");

await sendReply("☠ 𝕋𝔼𝕊𝕋𝔼");
```

},
};