# Reiniciar o bot e criar uma nova sessão

Use este procedimento quando precisar apagar a sessão atual do WhatsApp e parear o bot novamente. A sessão salva localmente fica em `assets/auth/windows` quando o bot é executado no Windows.

## Passos no Visual Studio Code

1. Abra a pasta raiz do projeto no VS Code.
2. Abra o terminal integrado pelo menu **Terminal > Novo Terminal**.
3. Se o bot estiver rodando nesse terminal, pare-o com `Ctrl+C` e aguarde o encerramento.
4. No PowerShell do terminal integrado, confirme que está na pasta do projeto e execute:

   ```powershell
   Remove-Item -Recurse -Force .\assets\auth\windows
   ```

   Esse comando apaga os arquivos da sessão local do Windows. Não apague a pasta `assets` nem outros arquivos do projeto. Ao iniciar, o bot recria a pasta de autenticação.

5. Inicie o bot novamente:

   ```powershell
   npm start
   ```

6. Quando solicitado, informe o número do WhatsApp do bot e use o código de pareamento exibido para vincular o dispositivo novamente.

## Importante

- O VS Code não tem um comando próprio para trocar a sessão: os comandos são executados no terminal integrado, na pasta raiz do projeto.
- Apagar a sessão local não é o mesmo que remover o dispositivo da conta do WhatsApp. Se a sessão antiga ainda aparecer, abra **WhatsApp > Dispositivos conectados** e encerre a sessão antiga.
- Não compartilhe o código de pareamento nem os arquivos de `assets/auth/windows`; eles permitem acesso à conta do bot.
- O caminho acima é o usado no Windows. Não apague `assets/auth/android` para reiniciar uma sessão do Windows.
