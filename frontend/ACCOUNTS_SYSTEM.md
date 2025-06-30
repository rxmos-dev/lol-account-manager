# Sistema de Gerenciamento de Contas

Este projeto implementa um sistema de salvamento de contas em arquivo JSON usando Electron.

## Como funciona

### 1. Arquivo de Dados
- As contas são salvas em `accounts.json` na pasta de dados do usuário do Electron
- O caminho do arquivo é determinado automaticamente pelo Electron usando `app.getPath('userData')`

### 2. Criptografia Segura
- As senhas são criptografadas usando AES-256 antes de serem salvas no arquivo
- Isso fornece segurança real para proteção das credenciais

### 3. IPC (Inter-Process Communication)
- `save-accounts`: Handler para salvar contas no arquivo JSON
- `load-accounts`: Handler para carregar contas do arquivo JSON
- `get-accounts-path`: Retorna o caminho atual do arquivo de contas
- `set-accounts-path`: Define um novo caminho para o arquivo de contas
- `reset-accounts-path`: Reseta o caminho para o padrão
- `select-accounts-folder`: Abre dialog para selecionar novo local

### 4. Fallback para Desenvolvimento
- Se o Electron não estiver disponível (modo desenvolvimento), o sistema usa localStorage como fallback
- Isso permite testar a aplicação no navegador durante o desenvolvimento

## Arquivos Modificados

- `main.js`: Adicionados handlers IPC para salvar/carregar contas e gerenciar configurações
- `src/utils/accountsManager.ts`: Funções utilitárias para gerenciar contas
- `src/App.tsx`: Atualizado para usar o novo sistema de gerenciamento
- `src/components/AddAccountModal.tsx`: Atualizado para usar tipos compartilhados
- `src/components/SettingsModal.tsx`: **NOVO** Modal para configurar local do arquivo de contas
- `src/Navbar.jsx`: Atualizado para incluir botão de configurações

## Novas Funcionalidades

### Modal de Configurações
- Acesso através do botão de engrenagem na navbar
- Permite escolher onde salvar o arquivo `accounts.json`
- Opção de resetar para o local padrão
- Validação de caminhos e diretórios
- **Migração automática** do arquivo quando o local é alterado (move, não copia)
- Sistema inteligente que usa `fs.rename()` para melhor performance

## Detalhes Técnicos

### Sistema de Migração de Arquivo
O sistema utiliza uma abordagem inteligente para mover o arquivo:

1. **Tentativa com `fs.rename()`**: Primeiro tenta mover o arquivo diretamente
   - Mais rápido e eficiente
   - Funciona dentro do mesmo filesystem
   
2. **Fallback para cópia + remoção**: Se `fs.rename()` falhar
   - Copia o arquivo para o novo local
   - Remove o arquivo original após confirmação
   - Necessário quando movendo entre diferentes drives/partições

### Vantagens da Implementação
- **Performance**: Usa operação atômica quando possível
- **Segurança**: Não deixa arquivos duplicados
- **Compatibilidade**: Funciona entre diferentes drives
- **Robustez**: Tratamento de erros em múltiplas camadas

## Melhorias Futuras

1. ~~Implementar criptografia mais forte (AES) usando crypto-js~~ ✅ **IMPLEMENTADO**
2. Adicionar backup automático
3. Implementar validação de dados
4. Adicionar sistema de migração para atualizações futuras
5. Permitir múltiplos arquivos de contas (perfis)
