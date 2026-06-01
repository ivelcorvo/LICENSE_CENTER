# LICENSE CENTER

Dashboard administrativo para gestão de licenças de software em grupos empresariais.

> Para documentação técnica completa, consulte [`docs/Documentacao.md`](docs/Documentacao.md).

---

## Pré-requisitos

- Node.js 18 ou superior
- NPM
- Conta no Firebase com projeto Firestore criado

---

## Configuração

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-projeto.git
cd license-center
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` na raiz do projeto com as credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

> As credenciais estão disponíveis no Firebase Console → Configurações do projeto → Seus apps.

---

## Executando

```bash
npm run dev
```

Acesse em `http://localhost:5173`.

---

## Regras do Firestore

Para ambiente de desenvolvimento, configure as regras do Firestore como:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ Estas regras são apenas para desenvolvimento. Não use em produção.
