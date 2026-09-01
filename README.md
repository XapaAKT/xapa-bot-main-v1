# ⛓️ XAPA BOT — MAIN V1

> **Não é só um bot. É o caos organizado.**

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-ONLINE-00C853?style=for-the-badge" />
  <img src="https://img.shields.io/badge/BAILEYS-6.7.18-1976D2?style=for-the-badge" />
  <img src="https://img.shields.io/badge/NODE-%3E%3D18-111111?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/github/stars/XapaAKT/xapa-bot-main-v1?style=for-the-badge&label=STARS" />
</p>

<p align="center">
  <strong>🩸 Modular • ⚡ Rápido • ⛓️ Personalizável • ☠️ Sem frescura</strong>
</p>

---

## ⛧ SOBRE O PROJETO

O **Xapa Bot** é um bot de WhatsApp desenvolvido em **Node.js**, utilizando **Baileys**, com foco em modularidade, velocidade e personalização.

A ideia não é criar apenas mais um bot de WhatsApp cheio de comandos aleatórios.

A proposta é construir uma estrutura organizada onde novas funções, sistemas e comandos possam ser adicionados sem transformar o projeto em uma bagunça.

> **Xapa Bot não pede permissão. Ele executa.**

---

## 🔥 FUNCIONALIDADES

### 🎛️ Interface & Mensagens

* ✅ Botões
* ✅ Listas interativas
* ✅ Cards
* ✅ Edição de mensagens
* ✅ Reações personalizadas
* ✅ Mensagens estilizadas
* ✅ Sistema de `read more`
* ✅ Menus personalizados

### 📥 Downloads

* 🎵 YouTube
* 📱 TikTok
* 📸 Instagram
* ⬇️ Outros sistemas de download

### 🖼️ Mídia

* 🖼️ Figurinha
* 🔥 Figurinha em HD
* 📝 TTP
* 🖼️ ToImg
* 🎞️ GIF
* 🎵 Áudio
* 📹 Vídeo

### 🛡️ Administração

* 🔗 Anti-link
* ☠️ Anti-link Hard
* 🔇 Sistema de mute
* 👑 Controle de administradores
* 🚫 Banimento
* ⚠️ Sistema de permissões
* 🟢 Ativar/desativar bot por grupo

### 🤖 Automação

* 💬 Auto-responder
* 🖼️ Auto-sticker
* 👋 Sistema de boas-vindas
* 🚪 Sistema de saída
* ⚙️ Restrições personalizadas por grupo

### 🧠 Estrutura

* 📁 Sistema modular de comandos
* 🔌 Carregamento dinâmico
* 🗄️ Banco de dados local
* 🧩 Middlewares
* 🛠️ Tratamento de erros
* 🔄 Sistemas independentes
* ⚡ Arquitetura baseada em serviços

---

## 🩸 ESTRUTURA

```text
XAPA-BOT
│
├── 📁 assets/
│   ├── images/
│   ├── videos/
│   └── stickers/
│
├── 📁 database/
│
├── 📁 src/
│   ├── commands/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   └── config.js
│
├── 📄 database.json
├── 📄 package.json
└── 📄 README.md
```

A estrutura foi pensada para que cada parte do bot tenha sua própria responsabilidade.

---

## 🚀 INSTALAÇÃO

### 1. Clone o projeto

```bash
git clone https://github.com/XapaAKT/xapa-bot-main-v1.git
```

### 2. Entre na pasta

```bash
cd xapa-bot-main-v1
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure o bot

Edite o arquivo:

```text
src/config.js
```

Adicione suas configurações, tokens e demais informações necessárias.

### 5. Inicie

```bash
npm start
```

---

## ⚙️ REQUISITOS

Antes de iniciar, tenha instalado:

* 🟢 **Node.js 18 ou superior**
* 📦 **npm**
* 📱 Uma conta do WhatsApp
* 🌐 Conexão com a internet

---

## 🧩 COMANDOS

O bot possui um sistema modular de comandos.

Exemplo:

```text
/menu
/ping
/play
/sticker
/ban
/mute
/antilink
```

Os comandos podem ser adicionados ou modificados dentro da estrutura:

```text
src/commands/
```

---

## 🛡️ SISTEMA DE GRUPOS

Cada grupo pode possuir suas próprias configurações.

Entre elas:

```text
🟢 Bot ativo
🔗 Anti-link
🔊 Anti-áudio
🎭 Anti-sticker
💬 Auto-responder
🖼️ Auto-sticker
👋 Welcome
🚪 Exit
👑 Only Admins
🔇 Mute
```

Isso permite que diferentes grupos utilizem configurações diferentes sem interferir uns nos outros.

---

## 🧠 DESENVOLVIMENTO

O projeto utiliza uma estrutura baseada em módulos, permitindo separar:

```text
COMMANDS
   ↓
MIDDLEWARES
   ↓
SERVICES
   ↓
UTILS
   ↓
DATABASE
```

Isso facilita a manutenção e a criação de novos sistemas.

---

## ⚠️ AVISO

Este projeto está em desenvolvimento.

Algumas funções podem sofrer alterações, receber melhorias ou ser completamente modificadas conforme o desenvolvimento continuar.

Se alguma função parar de funcionar, verifique primeiro:

* Dependências
* Tokens/API
* Configuração
* Versão do Node.js
* Alterações nas APIs utilizadas

---

## 🩸 ROADMAP

### 🔨 Em desenvolvimento

* [ ] Melhorias no sistema de permissões
* [ ] Mais comandos de administração
* [ ] Melhorias no sistema de downloads
* [ ] Novos sistemas de automação
* [ ] Melhorias no banco de dados
* [ ] Mais personalização por grupo
* [ ] Otimização geral

### ☠️ Futuro

* [ ] Painel de gerenciamento
* [ ] Sistema de logs avançado
* [ ] Mais integração com APIs
* [ ] Sistema de plugins
* [ ] Melhor gerenciamento de usuários

---

## ⛓️ CONTRIBUIÇÃO

Quer contribuir?

Faça um fork do projeto, implemente sua alteração e envie um Pull Request.

```text
Fork
 ↓
Clone
 ↓
Modify
 ↓
Test
 ↓
Pull Request
```

Sugestões, correções e melhorias são bem-vindas.

---

## 📜 LICENÇA

Este projeto é destinado a fins de estudo, desenvolvimento e experimentação.

Utilize o código de forma responsável e respeite os termos das APIs e serviços utilizados.

---

<p align="center">

### ⛧━━━━━༺𖤐༻━━━━━⛓️━━━━━༺𖤐༻━━━━━⛧

**𝐗𝐈𝐂-𝐁𝐎𝐓 • 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒**

*O caos também pode ser organizado.*

### ⛧━━━━━༺𖤐༻━━━━━⛓️━━━━━༺𖤐༻━━━━━⛧

</p>
