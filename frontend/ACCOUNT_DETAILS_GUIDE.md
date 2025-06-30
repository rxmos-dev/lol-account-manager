# 📋 Modal de Detalhes da Conta - Guia de Uso

## 🖱️ Como Acessar

1. Na tela principal, clique em qualquer **card de conta**
2. O modal de detalhes será aberto instantaneamente

## 📋 Funcionalidades de Cópia

### ✨ Múltiplas Formas de Copiar

Cada campo pode ser copiado de **2 maneiras**:
1. **Clique no campo** (input) - copia automaticamente
2. **Clique no botão de cópia** (📋) - copia com confirmação visual

### 📝 Campos Disponíveis

- **Username**: Nome de usuário para login no League
- **Password**: Senha da conta (com opção de mostrar/ocultar)
- **Riot ID**: Nome completo no formato `SummonerName#Tagline`

## 🔐 Funcionalidades de Senha

### 👁️ Mostrar/Ocultar Senha
- **Botão do olho**: Alterna entre mostrar e ocultar a senha
- **Padrão**: Senha sempre inicia oculta por segurança

### 🔒 Segurança
- Senhas são descriptografadas apenas na visualização
- Dados nunca são enviados para servidores externos
- Cópia funciona via clipboard local

## ✅ Feedback Visual

### 🎯 Confirmação de Cópia
- **Ícone verde**: Mostra ✓ quando algo foi copiado
- **Notificação**: Banner verde confirma qual campo foi copiado
- **Duração**: Feedback desaparece após 2 segundos

### 🎨 Estados Visuais
- **Hover**: Campos ficam destacados ao passar o mouse
- **Click**: Feedback imediato ao clicar
- **Copiado**: Ícone muda para ✓ temporariamente

## ⌨️ Atalhos e Dicas

### 🖱️ Interações Rápidas
- **Clique direto no campo**: Copia instantaneamente
- **ESC ou clique fora**: Fecha o modal
- **Botão X**: Fecha o modal

### 💡 Dicas de Uso
1. **Para login rápido**: Copie username, cole no jogo, depois copie a senha
2. **Para adicionar amigos**: Copie o Riot ID completo
3. **Para segurança**: Use o botão de mostrar/ocultar senha conforme necessário

## 🔄 Fluxo Recomendado

```
1. Clique no card da conta
   ↓
2. Modal abre com detalhes
   ↓
3. Clique no campo "Username" (copia automaticamente)
   ↓
4. Cole no League of Legends
   ↓
5. Clique no botão de olho para ver a senha
   ↓
6. Clique no campo "Password" (copia automaticamente)
   ↓
7. Cole no League of Legends
   ↓
8. Clique em "Fechar" ou ESC
```

## 🛠️ Compatibilidade

- ✅ **Clipboard API**: Navegadores modernos
- ✅ **Fallback**: Navegadores antigos (Internet Explorer, etc.)
- ✅ **Electron**: Funciona perfeitamente na versão desktop
- ✅ **Responsivo**: Adapta-se a diferentes tamanhos de tela
