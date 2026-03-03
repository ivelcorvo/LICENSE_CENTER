# 📂 Arquitetura do Projeto

A aplicação é um **Dashboard Administrativo** focado em **hierarquia de clientes e licenças**, construído com:

* **Vite + React + TypeScript** (Base do projeto)
* **Tailwind CSS v4** (Estilização moderna via plugin do Vite)
* **React Router 7** (Navegação com rotas dinâmicas e layouts aninhados)
* **Firebase (Firestore)** (Banco de dados NoSQL em tempo real)
* **Font Awesome (CDN)** (Ícones globais via index.html)

---

## 🏗️ Estrutura de Pastas

```plaintext
src/
├── components/       # Componentes reutilizáveis (NavBar, StatCard)
├── hooks/            # Lógica de dados isolada do Firebase (useCustomers, useCompanies)
├── layouts/          # Estruturas de página (RootLayout com Sidebar e Outlet)
├── lib/              # Configurações de terceiros (firebase_config.ts)
├── pages/            # Telas da aplicação (Dashboard, Clients, ClientDetails)
└── App.tsx           # Definição das rotas e hierarquia do sistema
```

---

## ⛓️ Hierarquia de Dados (Firestore)

Para suportar **grupos empresariais com múltiplas unidades**, estruturamos assim:

* **Coleção `customers`**: Representa o Grupo/Cliente (Ex: Grupo Oliveira)

  * Campos: `nickname`, `createdAt`

* **Subcoleção `companies`** (dentro de cada `Customer`): Representa as Unidades/CNPJs

  * Campos: `cnpj`, `corporateName`, `email`, `status`

* **Coleção `licenses`**: Chaves vinculadas a cada empresa

---

## 🚦 Rotas Configuradas

| Rota           | Componente    | Descrição                                     |
| -------------- | ------------- | --------------------------------------------- |
| `/dashboard`   | Dashboard     | Visão geral com cards de estatísticas         |
| `/clients`     | Clients       | Listagem e criação de Grupos/Clientes         |
| `/clients/:id` | ClientDetails | Gerenciamento de CNPJs de um grupo específico |
| `/licenses`    | Licenses      | Página de teste / futuro gerenciamento geral  |

---

## 🛠️ Onde Paramos (O "Próximo Passo")

### ✅ O que já funciona

* Layout com Sidebar retrátil e ícones Font Awesome
* Criação e listagem de Grupos (Clientes) em tempo real via Hook `useCustomers`
* Navegação dinâmica para a página de detalhes de cada grupo

### 🚧 O que estamos fazendo agora

* Implementando a página `ClientDetails.tsx`
* Criando o Hook `useCompanies.ts` para gerenciar a subcoleção de CNPJs
* Falta criar o formulário para cadastrar uma nova unidade (CNPJ, Razão Social e E-mail) dentro do grupo

### 💡 Dica de Retorno

O arquivo mais importante agora para você revisar é:

* `src/hooks/useCustomers.ts` — para entender como os dados fluem
* `src/pages/ClientDetails.tsx` — onde a interface parou


---

## ⚙️ Pré-requisitos

* **Node.js** (versão 18 ou superior)
* **NPM** ou **Yarn**
* Uma conta no **Firebase** com um projeto **Firestore** criado

---

## 🔑 Configuração do Firebase

Crie um arquivo `.env` na raiz do projeto e adicione as credenciais do Firebase.

> ⚠️ O Vite exige que as variáveis de ambiente utilizem o prefixo `VITE_`.

```env
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

---

## 🚀 Como rodar o projeto

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

4. **Acesse no navegador:**

```
http://localhost:5173
```

---

## 🔐 Segurança (Firestore Rules)

Para desenvolvimento inicial, certifique-se de que as regras do Firestore permitem leitura e escrita.

> ⚠️ **Atenção:** estas regras são **apenas para ambiente de teste** e **não devem** ser usadas em produção.

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
