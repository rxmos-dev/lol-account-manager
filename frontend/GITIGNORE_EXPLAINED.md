# 📝 Explicação do .gitignore

Este arquivo `.gitignore` está configurado especificamente para um projeto **Electron + Vite + React** com **electron-updater**.

## 📂 Seções explicadas:

### **🗂️ Build e Distribuição**
```gitignore
release/              # Arquivos finais do electron-builder
dist-electron/        # Build alternativo do Electron
*.exe, *.dmg         # Executáveis para diferentes OS
*.blockmap           # Arquivos para updates incrementais
latest.yml           # Metadados do auto-updater
```

### **🔐 Segurança**
```gitignore
.env*                # Variáveis de ambiente
.github-token        # Token do GitHub (se criado por acidente)
*.p12, *.key        # Certificados de code signing
secrets.json         # Arquivos de configuração sensíveis
```

### **⚡ Performance**
```gitignore
node_modules/        # Dependências (podem ser reinstaladas)
.cache/             # Cache de ferramentas
.parcel-cache/      # Cache do Parcel
.eslintcache        # Cache do ESLint
```

### **🛠️ Desenvolvimento**
```gitignore
vite.config.*.timestamp-*  # Timestamps do Vite
*.tsbuildinfo             # Cache do TypeScript
coverage/                 # Relatórios de teste
```

### **💻 Sistema Operacional**
```gitignore
.DS_Store           # macOS
Thumbs.db          # Windows
Desktop.ini        # Windows
$RECYCLE.BIN/      # Windows
```

## ✅ **Arquivos que DEVEM estar no Git:**

- `package.json` e `pnpm-lock.yaml`
- `main.js` (processo principal do Electron)
- Todo código fonte (`src/`)
- Configurações (`vite.config.mjs`, `tsconfig.json`)
- `BUILD_PUBLISH_GUIDE.md` e documentação
- `build/installer.nsh` (configuração do instalador)

## ❌ **Arquivos que NÃO devem estar no Git:**

- **Builds**: `release/`, `.exe`, `.dmg`
- **Dependências**: `node_modules/`
- **Secrets**: `.env`, tokens, certificados
- **Cache**: `.cache/`, `.eslintcache`
- **OS**: `.DS_Store`, `Thumbs.db`

## 🚀 **Workflow recomendado:**

```bash
# 1. Desenvolver
git add src/
git commit -m "feat: nova funcionalidade"

# 2. Incrementar versão no package.json
git add package.json
git commit -m "chore: bump version to 1.0.1"
git tag v1.0.1

# 3. Push (não inclui builds)
git push origin main --tags

# 4. Build e publish localmente
pnpm run publish
```

**O `.gitignore` garante que apenas código fonte e configurações sejam versionados, mantendo o repositório limpo e seguro! 🔒**
