# Atualização Automática de Lançamentos

## Visão Geral

Esta funcionalidade permite que, ao atualizar uma conta no Plano de Contas, todos os lançamentos relacionados sejam automaticamente atualizados com os novos dados.

## Relacionamento de Campos

O relacionamento entre Plano de Contas e Lançamentos ocorre através dos seguintes campos:

| Plano de Contas | Lançamentos |
|-----------------|-------------|
| ID_Conta        | Id_Item     |
| Natureza        | Natureza    |
| Tipo            | Tipo        |
| Categoria       | Categoria   |
| SubCategoria    | SubCategoria|
| Conta           | Item        |

## Como Funciona

### 1. Sincronização em Massa de Lançamentos (NOVO!)

Para atualizar **todos os lançamentos existentes** com os dados atuais do plano de contas:

```
POST /api/transactions/sync-with-account-plan
```

O sistema automaticamente:

1. ✅ Percorre todos os lançamentos
2. ✅ Para cada lançamento com `Id_Item`, busca a conta correspondente no plano (por `ID_Conta`)
3. ✅ Atualiza todos os campos do lançamento:
   - `Natureza`
   - `Tipo`
   - `Categoria`
   - `SubCategoria`
   - `Item` (corresponde ao campo `Conta` do plano)
   - `category` (para compatibilidade)
   - `description` (para compatibilidade)
4. ✅ Salva todas as alterações
5. ✅ Retorna estatísticas detalhadas da sincronização

**Exemplo de Request:**

```json
POST /api/transactions/sync-with-account-plan
Content-Type: application/json
```

**Resposta:**

```json
{
  "message": "Sincronização concluída com sucesso",
  "updatedCount": 247,
  "notFoundCount": 3,
  "notFoundIds": ["999", "888", "777"],
  "totalTransactions": 250,
  "totalAccounts": 63
}
```

**Quando usar:**
- ✅ Após importar ou atualizar o plano de contas
- ✅ Quando detectar inconsistências nos dados
- ✅ Para garantir que todos os lançamentos estejam atualizados

### 2. Atualização Individual de Conta

Quando você atualiza uma conta específica do Plano de Contas usando o endpoint:

```
PUT /api/account-plan/:id
```

O sistema automaticamente:

1. ✅ Atualiza os dados da conta no Plano de Contas
2. ✅ Busca todos os lançamentos que possuem `Id_Item` igual ao `ID_Conta` atualizado
3. ✅ Atualiza os campos dos lançamentos com os novos dados da conta:
   - `Natureza`
   - `Tipo`
   - `Categoria`
   - `SubCategoria`
   - `Item` (corresponde ao campo `Conta` do plano)
   - `category` (para compatibilidade)
   - `description` (para compatibilidade)
4. ✅ Persiste as alterações nos arquivos JSON

**Exemplo de Request:**

```json
PUT /api/account-plan/101
{
  "Natureza": "Receita",
  "Tipo": "Fixa",
  "Categoria": "Folha Salarial",
  "SubCategoria": "Adiantamentos - Atualizado",
  "Conta": "Adiantamento de Salário - Revisado"
}
```

**Resposta:**

```json
{
  "message": "Conta atualizada com sucesso",
  "account": {
    "ID_Conta": "101",
    "Natureza": "Receita",
    "Tipo": "Fixa",
    "Categoria": "Folha Salarial",
    "SubCategoria": "Adiantamentos - Atualizado",
    "Conta": "Adiantamento de Salário - Revisado"
  },
  "transactionsUpdated": 5
}
```

### 3. Processo de Importação (NÃO Afetado)

⚠️ **IMPORTANTE:** O processo de importação continua funcionando como antes e **NÃO aciona a atualização em cascata**.

#### Importação de Plano de Contas
```
POST /api/account-plan/import
```
- Substitui completamente o plano de contas
- Não atualiza lançamentos existentes
- Mantém comportamento original

#### Importação de Lançamentos
```
POST /api/transactions/import
```
- Adiciona novos lançamentos
- Valida contra o plano de contas (se `validateAccountPlan = true`)
- Não modifica o plano de contas
- Mantém comportamento original

## Uso no Frontend

### Função para Sincronizar Todos os Lançamentos (NOVO!)

```typescript
import { syncTransactionsWithAccountPlan } from './services/api'

// Sincronizar todos os lançamentos com o plano de contas atual
const handleSyncTransactions = async () => {
  try {
    const result = await syncTransactionsWithAccountPlan()
    
    console.log(result.message)
    console.log(`✅ ${result.updatedCount} lançamentos atualizados`)
    console.log(`📊 Total de lançamentos: ${result.totalTransactions}`)
    console.log(`📋 Total de contas: ${result.totalAccounts}`)
    
    if (result.notFoundCount > 0) {
      console.warn(`⚠️  ${result.notFoundCount} lançamentos com Id_Item não encontrado`)
      console.warn('IDs não encontrados:', result.notFoundIds)
    }
  } catch (error) {
    console.error('Erro ao sincronizar lançamentos:', error)
  }
}
```

### Função para Atualizar Conta Individual

```typescript
import { updateAccountPlan } from './services/api'

// Atualizar uma conta específica
const handleUpdateAccount = async (id: string | number) => {
  try {
    const result = await updateAccountPlan(id, {
      Natureza: "Receita",
      Tipo: "Variável",
      Categoria: "Vendas",
      SubCategoria: "Produtos",
      Conta: "Venda de Produtos"
    })
    
    console.log(result.message)
    console.log(`${result.transactionsUpdated} lançamentos atualizados`)
  } catch (error) {
    console.error('Erro ao atualizar conta:', error)
  }
}
```

## Benefícios

1. ✅ **Consistência de Dados**: Garante que os lançamentos sempre refletem as informações atualizadas do plano de contas
2. ✅ **Sincronização em Massa**: Atualiza todos os lançamentos existentes de uma só vez
3. ✅ **Economia de Tempo**: Não é necessário atualizar manualmente cada lançamento
4. ✅ **Rastreabilidade**: O sistema informa quantos lançamentos foram atualizados e quais Id_Item não foram encontrados
5. ✅ **Segurança**: O ID da conta não pode ser alterado, preservando a integridade dos relacionamentos
6. ✅ **Compatibilidade**: O processo de importação continua funcionando normalmente
7. ✅ **Visibilidade**: Logs detalhados de todas as operações

## Limitações

- O campo `ID_Conta` não pode ser alterado (é a chave de relacionamento)
- Apenas atualizações individuais de contas acionam a atualização em cascata
- Importações em lote não acionam a atualização em cascata

## Logs

O sistema registra informações sobre as atualizações:

```
🔄 Iniciando sincronização de lançamentos com plano de contas...
📊 Total de lançamentos: 250
📋 Total de contas no plano: 63
✅ Sincronização concluída: 247 lançamentos atualizados
⚠️  3 lançamentos com Id_Item não encontrado no plano de contas
   IDs não encontrados: 999, 888, 777
💾 Transações salvas (250 registros)
```

Para atualizações individuais:
```
✅ 5 lançamentos atualizados para ID_Conta 101
💾 Plano de contas salvo (63 contas)
💾 Transações salvas (247 registros)
```

## Scripts de Teste

### Teste de Sincronização em Massa
```bash
./test-sync-transactions.sh
```

Este script demonstra:
1. Estatísticas antes da sincronização
2. Execução da sincronização
3. Estatísticas após sincronização
4. Comparação de dados

### Teste de Atualização Individual
```bash
./test-account-update.sh
```

Este script demonstra:
1. Atualização de uma conta específica
2. Verificação de lançamentos antes e depois
3. Restauração do estado original
