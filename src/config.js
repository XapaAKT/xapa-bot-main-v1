import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefixo padrão dos comandos.
export const PREFIX = "/";

// Emoji do bot (mude se preferir).
export const BOT_EMOJI = "⛓️";

// Nome do bot (mude se preferir).
export const BOT_NAME = "꧁༒︎̶͜͡𝐗̸̡̬͚̤̟͇̙̙̤̜͎̙̮̺͕̫͆̈́͋͂̈́̽̐̈́́͒͋̚͠͝𝐀̷̡̢̦͓̰̟̩̖̼̦͓͙̼̞̓͆̈́͂̓́͋̓̈́̅̈́̚̕͝͠͠͝𝐏̴̛̜̜̯̩̘̯̗̖̞̠̻̼̬̖̈́͌͋͌͗̋̈́̐̀̀̚͝͝𝐀̸̛̛̞̖͉̖̬̙͎̩̞̾͂̍͆̄͂̽͂̐̿̍̾̇͠ 𝐈̶̤̦̙̮̘͚͉̞̞̹̽́͂̍̅̄̈́̾̅͐̍̔͝ͅ𝐍̸̢̡̛̳̦͕̳̫̮̜̪͚̠͖̝̈́̋͒͂̀͌̇͋͗̿͌͘͜͜͠ 𝐂̷͍͓̞̪̞̰̯̯̘̱̩̙̩̈́́̑͐̿͂̎̈́͌̏̿̕̕͜͠͝𝐇̸̢̛̹͍͙͖̜͕̞̠͕͔̖̱̯͊̅̄͌͒̎̈́̒͌̏̕͘͘͜͝𝐀̵̳̪͉͎͍̘͎̹͍͎͆͗͂͌̎̋͋̈́̽͛̍̚𝐈̷̛̛̬̬͍͉̟͔̮͖̞̠̬͕̎̋̑̍̅̈́̔̈́̓̄͝͝𝐍̶̡̛̼̙̩͚̙̞̱̹̫͎̟̈́͋̄͛̔̍̒̋̿̇͆̀̑̕𝐒̶̢̩̘̰̪̘̲̰̯̳̎̈́̋͒͂͌̔̒̈́̑̈́̿͌̚༒︎꧂";

// LID do bot.
export const BOT_LID = "227886971789349@lid";
// LID do dono do bot.
export const OWNER_LID = "227886971789349@lid";

// Diretórios
export const COMMANDS_DIR = path.join(__dirname, "commands");
export const DATABASE_DIR = path.resolve(__dirname, "..", "database");
export const ASSETS_DIR = path.resolve(__dirname, "..", "assets");
export const TEMP_DIR = path.resolve(__dirname, "..", "assets", "temp");

// Timeout em milissegundos por evento (evita banimento).
export const TIMEOUT_IN_MILLISECONDS_BY_EVENT = 100;

// ========== TOKITO API ==========
// Crie sua conta e pegue o token em:
// https://tokito-apis.com.br

export const TOKITO_API_BASE_URL = 
"https://tokito-apis.com.br";
export const TOKITO_API_TOKEN = "tokito_c9814504995dcf9021644108d9cb0a92e18e"
export const TOKITO_INSTANCE_NAME = "usr_ff6f0147-f38a-4211-aa86-230ac2f0a0c9";


// ========== LINKER API ==========
// Serviço para encurtar/linkar imagens
export const LINKER_BASE_URL = "https://linker.devgui.dev/api";
export const LINKER_API_KEY = "COLOCA_AQUI_O_TOKEN_DO_LINKER";

// Caso queira responder apenas um grupo específico,
export const ONLY_GROUP_ID = "";

// Configuração para modo de desenvolvimento
export const DEVELOPER_MODE = false;

// Caso queira usar proxy.
export const PROXY_PROTOCOL = "http";
export const PROXY_HOST = "";
export const PROXY_PORT = "";
export const PROXY_USERNAME = "";
export const PROXY_PASSWORD = "";

// Chave da OpenAI para o comando de suporte
export const OPENAI_API_KEY = "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";