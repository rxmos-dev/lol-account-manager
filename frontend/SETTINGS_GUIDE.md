# 🔧 Guia de Configurações - LoL Account Manager

## Como Configurar o Local do Arquivo de Contas

### 📍 Acessando as Configurações
1. Clique no botão de **engrenagem** (⚙️) na navbar superior
2. O modal de configurações será aberto

### 📁 Escolhendo o Local do Arquivo

#### Opção 1: Seleção Manual
1. Clique no botão de pasta (📁) ao lado do campo de caminho
2. Escolha onde deseja salvar o arquivo `accounts.json`
3. Clique em **Salvar**

#### Opção 2: Digitação Direta
1. Digite o caminho completo no campo de texto
2. Exemplo: `C:\MeusArquivos\LoL\accounts.json`
3. Clique em **Salvar**

### 🔄 Resetando para o Padrão
- Clique em **Resetar para Padrão** para voltar ao local original
- Local padrão: `%APPDATA%\desktop-app\accounts.json`

## 🔒 Recursos de Segurança

### Migração Automática
- Quando você muda o local do arquivo, o sistema automaticamente:
  - **Move** o arquivo atual para o novo local (não copia)
  - Mantém todas as suas contas salvas
  - Preserva a criptografia
  - Remove o arquivo da localização anterior

### Validação
- O sistema verifica se o diretório existe antes de salvar
- Mostra mensagens de erro se algo der errado
- Não permite caminhos inválidos

## 📝 Exemplos de Uso

### Para Backup em Nuvem
```
C:\Users\SeuNome\Dropbox\LoL\accounts.json
C:\Users\SeuNome\OneDrive\LoL\accounts.json
```

### Para Dispositivo Externo
```
D:\MeusBackups\LoL\accounts.json
E:\USB\LoL\accounts.json
```

### Para Pasta Personalizada
```
C:\Games\LoL-Accounts\accounts.json
C:\MeusDados\accounts.json
```

## ⚠️ Avisos Importantes

1. **Sempre faça backup** antes de mudar o local
2. **Verifique se tem permissão** para escrever no diretório escolhido
3. **Não coloque em pastas do sistema** (Windows, Program Files, etc.)
4. **Mantenha o arquivo seguro** - ele contém suas senhas criptografadas

## 🆘 Resolução de Problemas

### "Diretório não existe"
- Crie a pasta antes de tentar salvar
- Verifique se digitou o caminho corretamente

### "Erro ao salvar"
- Verifique as permissões da pasta
- Tente como administrador se necessário
- Certifique-se de que não há outro programa usando o arquivo

### Arquivo não aparece no novo local
- Verifique se clicou em "Salvar"
- Olhe na pasta correta
- Tente resetar para o padrão e tentar novamente
