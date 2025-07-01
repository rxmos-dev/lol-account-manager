# LoL Account Manager (Frontend)

Este é o frontend para o LoL Account Manager, um aplicativo de desktop para gerenciar várias contas do League of Legends.

## Tecnologias Utilizadas

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Electron](https://www.electronjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/yurirxmos/lol-account-manager.git
    cd lol-account-manager/frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Execute em modo de desenvolvimento:**
    ```bash
    npm run electron-dev
    ```
    Isso iniciará o aplicativo em modo de desenvolvimento com o Vite e o Electron.

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento do Vite.
- `npm run build`: Compila o projeto para produção.
- `npm run lint`: Executa o linter ESLint.
- `npm run preview`: Visualiza a build de produção.
- `npm run electron`: Inicia o Electron.
- `npm run electron-dev`: Executa o aplicativo em modo de desenvolvimento.
- `npm run dist`: Cria os pacotes de distribuição.
- `npm run publish`: Publica uma nova versão no GitHub.

## Build

Para criar uma versão de produção do aplicativo, execute:

```bash
npm run dist
```

Isso irá gerar os arquivos de instalação na pasta `release`.
