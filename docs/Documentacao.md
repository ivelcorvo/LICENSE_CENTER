# LICENSE CENTER — Documentação Técnica

---

## 1. Visão Geral

O **LICENSE CENTER** é um dashboard administrativo para gestão de licenças de software em grupos empresariais. O sistema permite cadastrar grupos de empresas, vincular CNPJs a cada grupo e controlar o ciclo de vida das licenças de cada unidade (ativação, suspensão e expiração).

### Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Vite | 7 | Bundler e servidor de desenvolvimento |
| React | 19 | Interface do usuário |
| TypeScript | 5.9 | Tipagem estática |
| Tailwind CSS | 4 | Estilização via plugin Vite |
| React Router | 7 | Navegação e rotas dinâmicas |
| Firebase (Firestore) | 12 | Banco de dados NoSQL em tempo real |
| Font Awesome | 6.4 | Ícones (CDN via index.html) |

---

## 2. Arquitetura

### Estrutura de Pastas

```
src/
├── components/       # Componentes reutilizáveis de UI
├── contexts/         # Contextos React globais (estado compartilhado entre páginas)
├── hooks/            # Lógica de dados e comunicação com o Firebase
├── layouts/          # Estruturas de página (RootLayout com Sidebar e Outlet)
├── lib/              # Configurações de terceiros (firebase_config.ts)
├── pages/            # Telas da aplicação
├── utils/            # Funções puras de domínio e helpers reutilizáveis
└── App.tsx           # Definição das rotas
```

```
docs/
└── Documentacao.md   # Esta documentação
```

### Hierarquia de Dados (Firestore)

O banco segue uma estrutura hierárquica de subcoleções:

```
customers/                        ← Coleção: Grupos/Clientes
  {customerId}/
    nickname: string
    createdAt: Timestamp
    
    companies/                    ← Subcoleção: Unidades/CNPJs
      {companyId}/
        cnpj: string
        corporateName: string
        email: string
        status: 'active' | 'suspended'
        licenseKey: string
        expiresAt: Timestamp
        customerId: string
        createdAt: Timestamp
        updatedAt: Timestamp
```

### Fluxo de Dados

```
Firebase (Firestore)
       ↓
    Hooks (src/hooks/)
    onSnapshot → estado local via useState
       ↓
    Utils (src/utils/)
    funções puras aplicadas sobre os dados brutos
       ↓
    Páginas (src/pages/)
    consomem os hooks, aplicam utils e passam dados para os componentes
       ↓
    Componentes (src/components/)
    recebem props e renderizam a UI
```

---

## 3. Rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | — | Redireciona para `/dashboard` |
| `/dashboard` | `Dashboard` | Visão geral com cards de estatísticas globais |
| `/clients` | `Clients` | Listagem e criação de Grupos/Clientes |
| `/clients/:id` | `ClientDetails` | Gerenciamento de CNPJs de um grupo específico |
| `/licenses` | `Licenses` | Gestão global de licenças por grupo e unidade |
| `/seed` | `Seed` | Ferramenta de dados simulados — rota comentada por padrão |
| `*` | — | Qualquer rota inválida redireciona para `/dashboard` |

---

## 4. Componentes

Todos os componentes ficam em `src/components/`. A maioria é de UI pura — não acessa o Firebase diretamente. Exceção documentada: `EditCompanyModal`, que contém validação de regra de negócio antes de chamar o hook.

---

### `PageHeader`

Cabeçalho padrão de página com título, subtítulo e ícone opcional.

**Props**

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `title` | `string` | ✅ | Título principal da página |
| `subtitle` | `string` | ✅ | Texto descritivo abaixo do título |
| `icon` | `string` | ❌ | Classe Font Awesome (ex: `fa-solid fa-shield-halved`) |

**Exemplo de uso**

```tsx
import { PageHeader } from "../components/PageHeader";

<PageHeader
  title="Gestão de Licenciamento"
  subtitle="Controle global e por grupos de unidades"
  icon="fa-solid fa-shield-halved"
/>
```

**Quando usar:** No topo de toda página da aplicação, substituindo títulos `h1` avulsos.

---

### `StatusBadge`

Indicador visual do status de uma unidade. Possui duas variantes: badge de texto e ponto colorido.

**Props**

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `status` | `'active' \| 'suspended'` | ✅ | — | Status da unidade |
| `variant` | `'badge' \| 'dot'` | ❌ | `'badge'` | Estilo de exibição |

**Exemplo de uso**

```tsx
import { StatusBadge } from "../components/StatusBadge";
import { getEffectiveStatus } from "../utils/licenseStatus";

// Sempre passar o status EFETIVO, nunca company.status diretamente.
// company.status é a intenção no banco; getEffectiveStatus considera a expiração por data.

// Badge de texto (padrão) — usado em tabelas
<StatusBadge status={getEffectiveStatus(company)} />

// Ponto colorido — usado em listas densas
<StatusBadge status={getEffectiveStatus(company)} variant="dot" />
```

**Quando usar:** Sempre que precisar exibir o status de uma unidade. Nunca passar `company.status` diretamente — sempre derivar com `getEffectiveStatus`. Nunca recriar a lógica de cor manualmente.

---

### `SectionCard`

Container visual padrão para seções de página (formulários, tabelas, painéis).

**Props**

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `children` | `React.ReactNode` | ✅ | — | Conteúdo interno |
| `className` | `string` | ❌ | `""` | Classes adicionais para casos excepcionais |

**Exemplo de uso**

```tsx
import { SectionCard } from "../components/SectionCard";

// Uso padrão (com padding p-6 embutido)
<SectionCard>
  <form>...</form>
</SectionCard>

// Uso com tabela (remove padding para a tabela ocupar toda a largura)
<SectionCard className="overflow-hidden p-0">
  <table>...</table>
</SectionCard>
```

**Quando usar:** Como wrapper de qualquer seção de conteúdo dentro de uma página. O `className` deve ser usado apenas em exceções — o padrão já cobre a maioria dos casos.

---

### `StatCard`

Card de estatística para o Dashboard. Exibe um indicador numérico com ícone, título e descrição.

**Props**

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `title` | `string` | ✅ | Rótulo do indicador (ex: "Grupos") |
| `value` | `string \| number` | ✅ | Valor principal em destaque |
| `icon` | `string` | ✅ | Classe Font Awesome do ícone |
| `colorClass` | `string` | ✅ | Classes Tailwind de cor do ícone e fundo (ex: `bg-blue-500/10 text-blue-500`) |
| `description` | `string` | ✅ | Texto descritivo abaixo do valor |

**Exemplo de uso**

```tsx
import { StatCard } from "../components/StatCard";

<StatCard
  title="Grupos"
  value={stats.totalGroups}
  icon="fa-solid fa-users-rectangle"
  colorClass="bg-blue-500/10 text-blue-500"
  description="Clientes corporativos cadastrados"
/>
```

**Quando usar:** Exclusivamente no Dashboard para exibir indicadores globais do sistema.

---

### `LoadingSpinner`

Estado de carregamento padronizado com ícone animado e mensagem.

**Props**

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `message` | `string` | ❌ | `"Carregando..."` | Texto exibido abaixo do ícone |

**Exemplo de uso**

```tsx
import { LoadingSpinner } from "../components/LoadingSpinner";

// Com mensagem padrão
<LoadingSpinner />

// Com mensagem customizada
<LoadingSpinner message="Sincronizando com o banco de dados..." />
```

**Quando usar:** Sempre que uma página ou seção estiver aguardando dados do Firebase. Nunca recriar spinners avulsos.

---

### `TableShell`

Estrutura base de tabela com cabeçalho padronizado. Recebe as colunas como prop e o corpo (`tbody`) como children.

**Props**

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `columns` | `string[]` | ✅ | Array com os títulos das colunas do cabeçalho |
| `children` | `React.ReactNode` | ✅ | Conteúdo do `tbody` (linhas `<tr>`) |

**Exemplo de uso**

```tsx
import { TableShell } from "../components/TableShell";

<TableShell columns={["Empresa / CNPJ", "Chave da Licença", "Expiração", "Status", "Ações"]}>
  {companies.map(company => (
    <tr key={company.id}>
      <td>...</td>
    </tr>
  ))}
</TableShell>
```

**Quando usar:** Em toda tabela da aplicação. O `TableShell` garante consistência visual entre todas as listagens.

---

### `EmptyState`

Estado vazio padronizado para tabelas sem registros. Deve ser usado como filho direto do `TableShell`.

**Props**

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `message` | `string` | ✅ | — | Mensagem exibida quando não há registros |
| `icon` | `string` | ❌ | `"fa-solid fa-inbox"` | Classe Font Awesome do ícone |

**Exemplo de uso**

```tsx
import { EmptyState } from "../components/EmptyState";

<TableShell columns={["Grupo", "Ações"]}>
  {loading ? (
    <tr><td><LoadingSpinner /></td></tr>
  ) : customers.length === 0 ? (
    <EmptyState message="Nenhum grupo encontrado." />
  ) : (
    customers.map(customer => <tr key={customer.id}>...</tr>)
  )}
</TableShell>
```

**Quando usar:** Sempre como fallback em tabelas vazias, dentro do `TableShell`. O `colSpan={100}` interno garante que ocupe toda a largura independente do número de colunas.

---

### `EditCompanyModal`

Modal de edição completa de uma unidade. Permite alterar razão social, CNPJ, e-mail, chave de licença, data de expiração e status.

> ⚠️ Este componente é uma exceção à regra de "UI pura": ele contém validação de regra de negócio diretamente (ver Regras de Ativação na seção 9), pois valida os dados antes de chamar o hook de persistência.

**Props**

| Prop | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controla a visibilidade do modal |
| `onClose` | `() => void` | ✅ | Callback chamado ao fechar ou cancelar |
| `company` | `Company \| null` | ✅ | Dados da unidade a ser editada |
| `onUpdate` | `(id: string, data: Partial<Company>) => Promise<void>` | ✅ | Função de persistência vinda do hook |

**Exemplo de uso**

```tsx
import { EditCompanyModal } from "../components/EditCompanyModal";

<EditCompanyModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  company={companyToEdit}
  onUpdate={updateCompany}
/>
```

**Quando usar:** Exclusivamente em `ClientDetails.tsx` para editar os dados de uma unidade existente. O modal preenche o formulário automaticamente com os dados atuais da unidade ao abrir.

---

## 5. Contexts

Todos os contexts ficam em `src/contexts/`. Gerenciam estado global da aplicação compartilhado entre páginas e componentes, sem passar props manualmente por toda a árvore.

---

### `ToastContext`

Sistema de notificações flutuantes (toasts) disponível globalmente em toda a aplicação. Renderiza os toasts via `createPortal` diretamente no `document.body`, garantindo que fiquem sempre visíveis independente do scroll ou do layout da página.

**Exporta**

| Exportação | Tipo | Descrição |
|---|---|---|
| `ToastProvider` | `React.FC` | Provider que deve envolver o layout raiz |
| `useToast` | `hook` | Hook para disparar toasts em qualquer componente |

**`useToast` — Retorna**

| Campo | Tipo | Descrição |
|---|---|---|
| `showToast` | `(message: string, type?: 'error' \| 'success') => void` | Exibe um toast. O tipo padrão é `'error'` |

**Exemplo de uso**

```tsx
import { useToast } from "../contexts/ToastContext";

const { showToast } = useToast();

// Toast de erro
showToast("Erro ao salvar os dados.", "error");

// Toast de sucesso
showToast("Chave copiada!", "success");
```

**Configuração:** O `ToastProvider` já está configurado no `RootLayout.tsx`. Não é necessário adicioná-lo em nenhum outro lugar.

**Auto-dismiss:** O toast some automaticamente após 4 segundos. O usuário também pode fechá-lo manualmente clicando no `×`.

**Quando usar:** Sempre que precisar exibir feedback de erro ou sucesso ao usuário. Nunca usar `alert()` ou `<div>` de erro inline nas páginas.

---

## 6. Hooks

Todos os hooks ficam em `src/hooks/`. Centralizam a comunicação com o Firebase e expõem estado e funções para as páginas.

---

### `useCustomers`

Gerencia a coleção `customers` (Grupos/Clientes).

**Retorna**

| Campo | Tipo | Descrição |
|---|---|---|
| `customers` | `Customer[]` | Lista de grupos em tempo real |
| `loading` | `boolean` | Verdadeiro enquanto carrega os dados iniciais |
| `isSubmitting` | `boolean` | Verdadeiro enquanto cria um novo grupo |
| `createCustomer` | `(nickname: string) => Promise<void>` | Cria um novo grupo no Firestore |

**Usado em:** `Clients.tsx`

---

### `useClientDetails`

Busca o nome de um grupo específico pelo ID.

**Parâmetros**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | `string \| undefined` | ID do grupo (vem do `useParams`) |

**Retorna**

| Campo | Tipo | Descrição |
|---|---|---|
| `clientName` | `string` | Nome (nickname) do grupo |
| `loading` | `boolean` | Verdadeiro enquanto carrega |

**Usado em:** `ClientDetails.tsx`

---

### `useCompanies`

Gerencia a subcoleção `companies` de um grupo específico. Retorna os dados brutos do banco e, separadamente, sincroniza o status de licenças vencidas em uma operação atômica via `writeBatch`.

**Parâmetros**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `customerId` | `string \| undefined` | ID do grupo pai |

**Retorna**

| Campo | Tipo | Descrição |
|---|---|---|
| `companies` | `Company[]` | Lista de unidades em tempo real (dados brutos do banco) |
| `loading` | `boolean` | Verdadeiro enquanto carrega |
| `isSubmitting` | `boolean` | Verdadeiro enquanto cria uma unidade |
| `addCompany` | `(data) => Promise<void>` | Adiciona uma nova unidade ao grupo |
| `updateCompany` | `(id, data) => Promise<void>` | Atualiza campos de uma unidade |

**Comportamento de sincronização:** A cada disparo do `onSnapshot`, o hook separa o mapeamento de dados da verificação de expiração. Se houver unidades com `status: 'active'` e `expiresAt` vencido, um único `writeBatch` atualiza todas para `'suspended'` no banco. Essa operação é atômica (tudo ou nada) e não bloqueia a renderização.

**Usado em:** `ClientDetails.tsx`

---

### `useDashboardStats`

Agrega estatísticas globais do sistema via `collectionGroup`. Utiliza `isLicenseExpired` de `licenseStatus.ts` para calcular o status efetivo de cada unidade em memória, garantindo contagens corretas independente do valor gravado no campo `status` do banco.

**Retorna**

| Campo | Tipo | Descrição |
|---|---|---|
| `stats.totalGroups` | `number` | Total de grupos cadastrados |
| `stats.totalCompanies` | `number` | Total de unidades cadastradas |
| `stats.activeLicenses` | `number` | Licenças efetivamente ativas (status ativo + data não vencida) |
| `stats.expired` | `number` | Licenças com data de expiração já passada (independente do status administrativo) |
| `stats.expiring24h` | `number` | Licenças efetivamente ativas que vencem hoje ou amanhã |
| `stats.expiringWeek` | `number` | Licenças efetivamente ativas que vencem do 2º ao 7º dia |
| `loading` | `boolean` | Verdadeiro enquanto carrega |

**Usado em:** `Dashboard.tsx`

---

### `useLicensesManager`

Gerencia todas as licenças do sistema com suporte a atualizações em lote (single, grupo e global). Além da gestão, sincroniza o banco automaticamente ao carregar: unidades com `status: 'active'` e data vencida são atualizadas para `'suspended'` via `writeBatch`, cobrindo todos os grupos de uma vez.

**Retorna**

| Campo | Tipo | Descrição |
|---|---|---|
| `groupedData` | `GroupedLicenses` | Empresas agrupadas por cliente |
| `allCompanies` | `Company[]` | Lista plana de todas as empresas |
| `updateSingle` | `(company, data) => Promise` | Atualiza uma única unidade |
| `updateGroup` | `(companies[], data) => Promise` | Atualiza todas as unidades de um grupo |
| `updateGlobal` | `(data) => Promise` | Atualiza todas as unidades do sistema |
| `loading` | `boolean` | Verdadeiro enquanto carrega |
| `isUpdating` | `boolean` | Verdadeiro durante uma atualização em lote |
| `error` | `string \| null` | Mensagem de erro caso a operação falhe |

**Usado em:** `Licenses.tsx`

---

## 7. Utilitários

Funções puras de domínio sem estado e sem efeitos colaterais. Ficam em `src/utils/`. Não acessam o Firebase e não dependem de React — podem ser importadas em hooks, páginas e componentes sem restrição.

---

### `licenseStatus` (`src/utils/licenseStatus.ts`)

Centraliza toda a lógica de expiração de licenças. É a fonte única de verdade para determinar se uma licença está vencida e qual é o seu status efetivo. Todo código que precisa dessas respostas deve importar daqui — nunca reimplementar a lógica localmente.

**Funções exportadas**

---

#### `isLicenseExpired(expiresAt, now?)`

Retorna `true` se a licença está vencida segundo a semântica do sistema.

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `expiresAt` | `any` | ✅ | Data de expiração — aceita Firestore Timestamp, `{ seconds }`, `Date` ou `string` |
| `now` | `Date` | ❌ | Data de referência. Padrão: `new Date()`. Útil para testes com data fixa. |

**Retorna:** `boolean`

**Semântica:** Uma licença é considerada vencida somente a partir do dia **seguinte** ao `expiresAt`. A comparação é feita na meia-noite de ambas as datas (`startOfDay`), portanto uma licença que vence hoje ainda é válida hoje — consistent com a regra de ativação.

```
startOfDay(expiresAt) < startOfDay(now)  →  vencida
startOfDay(expiresAt) >= startOfDay(now) →  válida
```

**Exemplo de uso**

```ts
import { isLicenseExpired } from '../utils/licenseStatus';

isLicenseExpired(company.expiresAt)        // usa new Date() internamente
isLicenseExpired(company.expiresAt, now)   // usa a data passada (recomendado em loops)
```

---

#### `getEffectiveStatus(company, now?)`

Retorna o status efetivo de uma unidade, combinando a intenção administrativa gravada no banco com a regra de expiração por data.

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `company` | `Pick<Company, 'status' \| 'expiresAt'>` | ✅ | Objeto com os dois campos necessários |
| `now` | `Date` | ❌ | Data de referência. Padrão: `new Date()`. |

**Retorna:** `'active' | 'suspended'`

**Regra central:** A expiração por data só pode **suspender**, nunca **reativar**. Uma unidade suspensa manualmente (mesmo com data futura) permanece suspensa. Uma unidade ativa com data vencida é tratada como suspensa.

```
status === 'suspended'              →  'suspended'  (suspensão administrativa)
status === 'active' && isExpired    →  'suspended'  (suspensão por data)
status === 'active' && !isExpired   →  'active'
```

**Exemplo de uso**

```tsx
import { getEffectiveStatus } from '../utils/licenseStatus';

// Em componentes — para exibição
<StatusBadge status={getEffectiveStatus(company)} />

// Em hooks — para contagens
const effectiveStatus = getEffectiveStatus(company, now);
```

**Por que `Pick<Company, 'status' | 'expiresAt'>` e não `Company`:** A função aceita qualquer objeto com esses dois campos, sem exigir a interface completa. Isso facilita o uso em hooks que trabalham com dados parciais e em testes unitários.

---

## 8. Variáveis de Ambiente

O projeto usa variáveis de ambiente para proteger as credenciais do Firebase. Crie um arquivo `.env` na raiz do projeto (mesmo nível do `index.html`).

> ⚠️ O arquivo `.env` nunca deve ser commitado no Git.

| Variável | Descrição |
|---|---|
| `VITE_FIREBASE_API_KEY` | Chave de API do projeto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto no Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket do Firebase Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID do remetente para mensagens |
| `VITE_FIREBASE_APP_ID` | ID do app web registrado no Firebase |
| `VITE_FIREBASE_MEASUREMENT_ID` | ID do Google Analytics (opcional) |

> ⚠️ O Vite exige o prefixo `VITE_` em todas as variáveis para que fiquem acessíveis via `import.meta.env`.

---

## 9. Regras de Negócio

### Status Persistido vs. Status Efetivo

Esta é a distinção de design mais importante do sistema. O campo `status` no Firestore representa a **intenção administrativa** — o que o operador definiu manualmente. Ele não é, sozinho, suficiente para determinar se uma licença está realmente ativa.

O **status efetivo** é o resultado de combinar a intenção administrativa com a regra de expiração por data, calculado pela função `getEffectiveStatus` em `src/utils/licenseStatus.ts`. Todo código de exibição e contagem deve usar o status efetivo, nunca o campo `status` bruto.

| Situação | `status` no banco | Status efetivo |
|---|---|---|
| Ativa, data futura | `active` | `active` |
| Ativa, data vencida | `active` | `suspended` |
| Suspensa manualmente, data futura | `suspended` | `suspended` |
| Suspensa manualmente, data passada | `suspended` | `suspended` |

### Semântica de "Vencido"

Uma licença é considerada vencida a partir do dia **seguinte** ao `expiresAt` — ela vale até o fim do dia de vencimento. A comparação sempre ocorre entre as meia-noites de ambas as datas (`startOfDay`), eliminando ambiguidade de horário.

**Exemplo:** licença com `expiresAt = 31/05/2026`:
- Em 31/05/2026 às 23:59 → **válida**
- Em 01/06/2026 às 00:01 → **vencida**

### Sincronização Automática do Banco

Quando o usuário abre a página **Licenses** (`useLicensesManager`) ou a página **ClientDetails** de qualquer grupo (`useCompanies`), o sistema verifica automaticamente se há unidades com `status: 'active'` e data vencida. Se houver, um único `writeBatch` atualiza todas para `'suspended'` no Firestore em uma operação atômica.

Características desta implementação:
- O mapeamento de dados e a gravação no banco são operações separadas — sem efeitos colaterais dentro do `.map`.
- O `writeBatch` é atômico: grava tudo ou não grava nada em caso de erro.
- A operação é auto-estabilizante: após o commit, o `onSnapshot` dispara novamente, mas como não há mais unidades `active` vencidas, nenhuma nova gravação ocorre.
- Erros no batch são capturados e logados no console sem interromper a renderização.

### Regras de Ativação

Uma unidade **não pode** ser ativada se `startOfDay(expiresAt) < startOfDay(hoje)` — ou seja, se a data de expiração for estritamente anterior a hoje. A data de hoje é permitida (a licença vale até o fim do dia).

Essa regra é aplicada em três lugares, todos usando o operador `<` (estritamente menor):

| Local | Contexto |
|---|---|
| `useLicensesManager.ts` → `updateBatch` | Atualizações em lote via página Licenses |
| `EditCompanyModal.tsx` → `handleSubmit` | Edição individual via modal em ClientDetails |
| `src/utils/licenseStatus.ts` → `isLicenseExpired` | Base de todas as derivações de status |

> ⚠️ Se esta regra precisar mudar (ex: bloquear também a data de hoje), a alteração deve ser feita nos três lugares acima de forma sincronizada. O comentário no `EditCompanyModal` e no `updateBatch` referencia explicitamente esta decisão.

### Geração de Chave de Licença

Ao cadastrar uma nova unidade, uma chave é gerada automaticamente no formato `XXXX-XXXX-XXXX` com caracteres alfanuméricos maiúsculos. A chave pode ser editada manualmente posteriormente via `EditCompanyModal`.

### Datas e Fuso Horário

Todas as datas são criadas via `new Date(year, month - 1, day)` para evitar o deslocamento de fuso horário que ocorre ao usar `new Date("YYYY-MM-DD")` diretamente (que interpreta a string como UTC e pode resultar no dia anterior no horário local).

---

## 10. Seed de Dados

O projeto possui uma ferramenta para limpar e repovoar o banco com dados simulados. Útil para demonstrações e testes.

### Como usar

1. Em `src/App.tsx`, descomente a rota e o import:
```tsx
import Seed from './pages/Seed';
// ...
{ path: "seed", element: <Seed /> },
```

2. Em `src/components/NavBar.tsx`, descomente o item do menu:
```tsx
{ name: "Seed", path: "/seed", icon: "fa-solid fa-flask" },
```

3. Reinicie o servidor, acesse `/seed` e clique em **Limpar e Repovoar Banco**.

4. Após o uso, comente novamente a rota e o item do menu.

> ⚠️ O Seed **apaga todos os dados existentes** antes de recriar. Nunca deixar a rota ativa em produção.

### Dados Simulados

Os dados são gerados relativos à data atual, garantindo que os alertas do Dashboard sempre façam sentido.

| Grupo | Unidade | Status no banco | Vencimento | Observação |
|---|---|---|---|---|
| Grupo Oliveira | Oliveira Combustíveis Ltda | `active` | +75 dias | Ativa normal |
| Grupo Oliveira | Oliveira Transportes S.A. | `active` | +3 dias | Ativa, alerta semanal |
| Grupo Oliveira | Oliveira Logística ME | `suspended` | -15 dias | Suspensa por vencimento |
| Grupo Oliveira | Oliveira Holding Ltda | `active` | +90 dias | Ativa normal |
| Rede Posto Ipiranga | Posto Ipiranga Centro Ltda | `active` | +1 dia | Ativa, alerta 24h |
| Rede Posto Ipiranga | Posto Ipiranga Norte ME | `active` | +60 dias | Ativa normal |
| Rede Posto Ipiranga | Posto Ipiranga Sul Ltda | `suspended` | -30 dias | Suspensa por vencimento |
| Rede Posto Ipiranga | Posto Ipiranga Leste S.A. | `suspended` | +45 dias | **Suspensa manualmente** — data futura, demonstra que expiração não reativa |
| Rede Posto Ipiranga | Posto Ipiranga Oeste ME | `active` | hoje | Ativa, vence hoje (válida até fim do dia) |
| Farmácias Bem Estar | Farmácia Bem Estar Matriz Ltda | `active` | +6 dias | Ativa, alerta semanal |
| Farmácias Bem Estar | Farmácia Bem Estar Filial 01 | `active` | +80 dias | Ativa normal |
| Farmácias Bem Estar | Farmácia Bem Estar Filial 02 | `suspended` | -7 dias | Suspensa por vencimento |
| Farmácias Bem Estar | Farmácia Bem Estar Filial 03 | `suspended` | +30 dias | **Suspensa manualmente** — data futura, demonstra que expiração não reativa |

---

## 11. Deploy

O projeto está hospedado no **Firebase Hosting** e a URL de produção é:

**https://license-center-4a0bd.web.app**

### Pré-requisitos

- Firebase CLI instalado globalmente:
```powershell
npm install -g firebase-tools
```

- Autenticado na conta Firebase:
```powershell
firebase login
```

### Processo de Deploy

Sempre que quiser publicar uma nova versão, execute em sequência:

**1. Gerar o build de produção:**
```powershell
npm run build
```

**2. Publicar no Firebase Hosting:**
```powershell
firebase deploy --only hosting
```

> O comando `--only hosting` garante que apenas o Hosting seja afetado, sem tocar em outras configurações do Firebase como regras do Firestore.

### Arquivos gerados pelo Firebase

| Arquivo | Descrição |
|---|---|
| `firebase.json` | Configuração do Firebase Hosting (pasta `dist`, rewrite para SPA) |
| `.firebaserc` | Associação do projeto local com o projeto Firebase |

> Esses arquivos devem ser commitados no Git.
