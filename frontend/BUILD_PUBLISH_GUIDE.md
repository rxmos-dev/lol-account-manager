# 🚀 Guia Completo: Build e Publish do LoL Account Manager

## 📋 Pré-requisitos

### 1. **Configurar GitHub Token**
Você precisa de um token do GitHub para publicar releases automaticamente.

#### Como criar:
1. Vá para [GitHub.com](https://github.com) → Settings → Developer settings
2. Personal access tokens → Tokens (classic) → Generate new token
3. Selecione estas permissões:
   - `repo` (Full control of private repositories)
   - `write:packages` (Upload packages)
4. Copie o token gerado

#### Como configurar:
```powershell
# No PowerShell (Windows):
$env:GH_TOKEN = "seu_token_aqui"

# Para tornar permanente:
[Environment]::SetEnvironmentVariable("GH_TOKEN", "seu_token_aqui", "User")
```

### 2. **Verificar configurações do repositório**
- ✅ Repository: `yurirxmos/lol-account-manager`
- ✅ Owner: `yurirxmos`
- ✅ Precisa estar público ou ter permissões adequadas

## 🔨 Comandos de Build

### **Desenvolvimento:**
```bash
pnpm run electron-dev
```

### **Build local (sem publicar):**
```bash
pnpm run dist
```
📁 Arquivos gerados em: `dist-electron/`

### **Publicar nova versão:**
```bash
pnpm run publish
```
🚀 Cria release no GitHub automaticamente

## 📦 Tipos de Build Gerados

Sua configuração atual gera:

1. **📦 Instalador NSIS**: `LoL Account Manager-1.0.0-x64.exe`
   - Instalador completo com wizard
   - Cria atalhos no desktop e menu iniciar
   - Permite escolher diretório de instalação

2. **💼 Versão Portable**: `LoL Account Manager-1.0.0-portable.exe`
   - Não precisa instalação
   - Executável único
   - Ideal para usar em qualquer PC

## 🔄 Fluxo de Publicação

### **1. Preparar nova versão:**
```bash
# Incremente a versão no package.json
# Exemplo: 1.0.0 → 1.0.1 → 1.1.0 → 2.0.0
```

### **2. Fazer commit das mudanças:**
```bash
git add .
git commit -m "v1.0.1: Descrição das mudanças"
git tag v1.0.1
git push origin main --tags
```

### **3. Publicar:**
```bash
pnpm run publish
```

### **4. O que acontece automaticamente:**
- ✅ Build da aplicação
- ✅ Criação dos executáveis (.exe)
- ✅ Upload para GitHub Releases
- ✅ Geração de arquivos para auto-updater
- ✅ Usuários recebem notificação de update

## 🎯 Auto-Updater em Ação

### **Como funciona:**
1. **Usuário abre a aplicação** → Auto-updater verifica GitHub releases
2. **Nova versão encontrada** → Usuário vê notificação no Settings
3. **Usuário clica "Download"** → Download automático com progress bar
4. **Download completo** → Botão "Install & Restart" aparece
5. **Usuário instala** → Aplicação fecha, instala e reabre atualizada

### **Arquivos importantes gerados:**
- `latest.yml` - Metadados para auto-updater
- `.blockmap` - Para downloads incrementais (mais rápidos)

## 🐛 Troubleshooting

### **Erro: "GH_TOKEN not found"**
```bash
# Verificar se token está configurado:
echo $env:GH_TOKEN
```

### **Erro: "Repository not found"**
- Verificar se o repositório existe
- Verificar permissões do token
- Confirmar owner/repo no package.json

### **Build falha:**
```bash
# Limpar e rebuildar:
Remove-Item -Recurse -Force dist-electron
pnpm run build
pnpm run dist
```

## 📈 Versionamento Recomendado

- `1.0.0` → `1.0.1` - Bug fixes
- `1.0.0` → `1.1.0` - Novas features
- `1.0.0` → `2.0.0` - Breaking changes

## 🎉 Resumo dos Comandos

```bash
# Desenvolvimento
pnpm run electron-dev

# Build local
pnpm run dist

# Publicar nova versão
pnpm run publish

# Configurar token GitHub (uma vez só)
$env:GH_TOKEN = "seu_token_aqui"
```

## 📁 Estrutura de Arquivos

```
frontend/
├── build/
│   ├── installer.nsh     # Customização do instalador
│   └── notarize.js       # Pós-processamento
├── dist-electron/        # Arquivos de build gerados
├── main.js              # Electron main process
├── package.json         # Configurações de build
└── ...
```

**Agora você tem tudo configurado para build e publicação profissional! 🚀**
