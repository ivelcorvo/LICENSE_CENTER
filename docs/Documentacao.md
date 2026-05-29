# Documentação Técnica

---

## 1. Visão Geral

O **LICENSE.sys** é um dashboard administrativo para gestão de licenças de software em grupos empresariais. O sistema permite cadastrar grupos de empresas, vincular CNPJs a cada grupo e controlar o ciclo de vida das licenças de cada unidade (ativação, suspensão e expiração).

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
├── hooks/            # Lógica de dados e comunicação com o Firebase
├── layouts/          # Estruturas de página (RootLayout com Sidebar e Outlet)
├── lib/              # Configurações de terceiros (firebase_config.ts)
├── pages/            # Telas da aplicação
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
    Páginas (src/pages/)
    consomem os hooks e passam dados para os componentes
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
| `*` | — | Qualquer rota inválida redireciona para `/dashboard` |

---

## 4. Componentes

Todos os componentes ficam em `src/components/`. São componentes de UI puros — não acessam o Firebase diretamente e não possuem lógica de negócio.

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

// Badge de texto (padrão) — usado em tabelas
<StatusBadge status={company.status} />

// Ponto colorido — usado em listas densas
<StatusBadge status={company.status} variant="dot" />
```

**Quando usar:** Sempre que precisar exibir o status `active` ou `suspended` de uma unidade. Nunca recriar a lógica de cor manualmente.

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

## 5. Hooks

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

Gerencia a subcoleção `companies` de um grupo específico. Inclui auto-suspensão de licenças vencidas.

**Parâmetros**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `customerId` | `string \| undefined` | ID do grupo pai |

**Retorna**

| Campo | Tipo | Descrição |
|---|---|---|
| `companies` | `Company[]` | Lista de unidades em tempo real |
| `loading` | `boolean` | Verdadeiro enquanto carrega |
| `isSubmitting` | `boolean` | Verdadeiro enquanto cria uma unidade |
| `addCompany` | `(data) => Promise<void>` | Adiciona uma nova unidade ao grupo |
| `updateCompany` | `(id, data) => Promise<void>` | Atualiza campos de uma unidade |

**Usado em:** `ClientDetails.tsx`

---

### `useDashboardStats`

Agrega estatísticas globais do sistema via `collectionGroup`.

**Retorna**

| Campo | Tipo | Descrição |
|---|---|---|
| `stats.totalGroups` | `number` | Total de grupos cadastrados |
| `stats.totalCompanies` | `number` | Total de unidades cadastradas |
| `stats.activeLicenses` | `number` | Total de licenças ativas |
| `stats.expired` | `number` | Licenças já expiradas e suspensas |
| `stats.expiring24h` | `number` | Licenças ativas que vencem em até 24h |
| `stats.expiringWeek` | `number` | Licenças ativas que vencem em até 7 dias |
| `loading` | `boolean` | Verdadeiro enquanto carrega |

**Usado em:** `Dashboard.tsx`

---

### `useLicensesManager`

Gerencia todas as licenças do sistema com suporte a atualizações em lote (single, grupo e global).

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

## 6. Variáveis de Ambiente

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

## 7. Regras de Negócio

### Expiração Automática de Licenças

Ao carregar as unidades de um grupo (`useCompanies`), o sistema verifica automaticamente se alguma licença com `status: 'active'` possui `expiresAt` anterior à data atual. Se sim, o status é atualizado para `'suspended'` diretamente no Firestore, sem intervenção manual.

### Regras de Ativação

Uma unidade **não pode** ser ativada se a data de expiração for igual ou anterior à data atual. Essa regra é aplicada em dois lugares:

- `EditCompanyModal.tsx` — ao salvar a edição de uma unidade
- `useLicensesManager.ts` (`updateBatch`) — ao executar atualizações em lote

### Geração de Chave de Licença

Ao cadastrar uma nova unidade, uma chave é gerada automaticamente no formato `XXXX-XXXX-XXXX` com caracteres alfanuméricos maiúsculos. A chave pode ser editada manualmente posteriormente via `EditCompanyModal`.

### Datas e Fuso Horário

Todas as datas são criadas manualmente via `new Date(year, month - 1, day)` para evitar o deslocamento de fuso horário que ocorre ao usar `new Date("YYYY-MM-DD")` diretamente (que interpreta a string como UTC e pode resultar no dia anterior no horário local).