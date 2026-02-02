# 🚀 API Backend Seguro - Node.js + Express + MySQL (2026)

API backend **enterprise-grade** focada em autenticação, segurança e rastreabilidade de usuários.

---

## ✨ Visão Geral

- Autenticação por **token proprietário** (HMAC-SHA512 + SHA256)
- **Senhas fortes obrigatórias** (bcrypt salt 12)
- **Rate limit por IP** (5 tentativas / 15 min)
- Recuperação de senha com **token temporário**
- Histórico de login e IP
- Emails automáticos (Mailtrap)
- Arquitetura organizada e pronta para produção

---

## 🔌 Tech Stack

- Node.js + Express
- MySQL 8.x
- bcrypt
- crypto / crypto-js
- nodemailer (Mailtrap)
- dotenv

---

## 🚀 Primeiros Passos

```bash
git clone git@github.com:wellarj/api_backend.git
cd api_backend
npm install
```

### Configuração do ambiente

Crie um `.env` baseado no `.env.example`.

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASS=senha
DB_NAME=minha_api

TOKEN_SECRET=CHAVE_SUPER_SECRETA_64_CHARS
JWT_NOME_APLICACAO=API_BACKEND_2026
NODE_ENV=production
```

---

## 🟢 Health Check

### GET `/api/public/ping`

**Response**
```json
{
  "message": "API Pública OK",
  "timestamp": "2026-02-02T17:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 🔓 Rotas Públicas (`/api/public`)

### 🔑 Login
**POST** `/login`

**Request**
```json
{
  "email": "user@email.com",
  "password": "SenhaForte@2026"
}
```

**Response**
```json
{
  "success": true,
  "uid": "user_1700000000_abcd123",
  "token": "9f2c1e7b5a...",
  "message": "Login realizado com sucesso"
}
```

---

### ➕ Registro
**POST** `/register`

**Request**
```json
{
  "email": "user@email.com",
  "password": "SenhaMuitoForte@2026"
}
```

**Response**
```json
{
  "success": true,
  "uid": "user_1700000000_abcd123",
  "message": "Conta criada com sucesso! Verifique seu email."
}
```

---

### 📧 Recuperação de Senha
**POST** `/recovery`

**Request**
```json
{
  "email": "user@email.com"
}
```

**Response**
```json
{
  "success": true,
  "message": "Instruções de recuperação enviadas para seu email."
}
```

---

### 🔄 Reset de Senha
**POST** `/reset-password/:token`

**Request**
```json
{
  "password": "NovaSenhaForte@2026"
}
```

**Response**
```json
{
  "success": true,
  "message": "Senha redefinida com sucesso! Faça login."
}
```

---

## 🔒 Autenticação das Rotas Protegidas (`/api/user`)

### Headers obrigatórios

```
X-UID: user_1700000000_abcd123
X-TOKEN: TOKEN_GERADO_NO_LOGIN
```

### Funcionamento do middleware

1. Valida presença dos headers
2. Valida token (`verificarToken(uid, token)`)
3. Confirma usuário no banco
4. Injeta `req.user`

```js
req.user = {
  uid,
  email,
  role
}
```

---

## 🔐 Rotas Protegidas

### 👤 Meu Perfil
**GET** `/me`

**Response**
```json
{
  "success": true,
  "user": {
    "uid": "user_1700000000_abcd123",
    "email": "user@email.com",
    "role": "user",
    "is_admin": false,
    "last_ip": "192.168.0.10",
    "last_login": "02/02/2026 14:33",
    "login_attempts": 0
  }
}
```

---

### ✏️ Atualizar Perfil
**PUT** `/profile`

**Request**
```json
{
  "email": "novo@email.com"
}
```

---

### 🔐 Alterar Senha
**POST** `/change-password`

**Request**
```json
{
  "currentPassword": "SenhaAtual@2025",
  "newPassword": "SenhaNovaMuitoForte@2026"
}
```

---

### 📋 Histórico de Login
**GET** `/login-history`

**Response**
```json
{
  "success": true,
  "history": {
    "last_ip": "192.168.0.10",
    "formatted_login": "02/02/2026 14:33",
    "login_attempts": 0,
    "formatted_failed": "N/A"
  }
}
```

---

## 🔄 Fluxos da API

### 🔐 Fluxo de Autenticação

1. Usuário faz login
2. API valida credenciais
3. Retorna `uid` + `token`
4. Frontend salva token
5. Envia headers em rotas protegidas

---

### 🔁 Fluxo de Recuperação de Senha

1. Usuário solicita recovery
2. Token temporário (1h) é gerado
3. Email enviado
4. Usuário redefine senha
5. Token é invalidado

---

### 🔒 Fluxo de Segurança

- Senhas sempre com bcrypt
- Token validado em todas as rotas privadas
- IP e login armazenados
- Rate limit por IP

---

## 🏗️ Estrutura do Projeto

```bash
api_backend/
├── src/
│   ├── routes/
│   │   ├── public.js
│   │   └── user.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   ├── tokenUtils.js
│   │   └── emailService.js
│   └── config/
│       └── database.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

## 📈 Status

✔ Produção pronta  
✔ Segurança aplicada  
✔ Fluxos documentados  
✔ API funcional  

---

**Feito no Brasil – 2026**
