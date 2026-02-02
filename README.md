
# 🚀 API Backend Seguro - Node.js + Express + MySQL (2026)

API backend **enterprise-grade** focada em autenticação, segurança e rastreabilidade de usuários.

---

## ✨ Visão Geral

- Autenticação segura com **tokens HMAC-SHA512 + SHA256**
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
- Swagger (opcional)

---

## 🚀 Primeiros Passos

```bash
git clone git@github.com:wellarj/api_backend.git
cd api_backend
npm install
```

### Configurar ambiente

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

| Método | Rota | Descrição |
|------|------|----------|
| GET | `/api/public/ping` | Verifica se a API está online |

---

## 🔓 Rotas Públicas (`/api/public`)

### 🔑 Login
| Método | Rota |
|------|------|
| POST | `/login` |

**Body**
```json
{
  "email": "user@email.com",
  "password": "SenhaForte@2026"
}
```

Rate limit: **5 tentativas / 15 min**

---

### ➕ Registro
| Método | Rota |
|------|------|
| POST | `/register` |

Senha obrigatoriamente forte:
- 12+ caracteres
- Maiúscula, minúscula, número e símbolo

---

### 📧 Recuperação de senha
| Método | Rota |
|------|------|
| POST | `/recovery` |

Envia email com token válido por **1 hora**.

---

### 🔄 Reset de senha
| Método | Rota |
|------|------|
| POST | `/reset-password/:token` |

Senha forte obrigatória.

---

## 🔒 Rotas Protegidas (`/api/user`)

🔐 **Autenticação obrigatória via middleware**  
Headers esperados:
```
X-UID
X-TOKEN
```

---

### 👤 Perfil do usuário
| Método | Rota |
|------|------|
| GET | `/me` |

Retorna:
- uid
- email
- role
- último login
- IP
- tentativas de login

---

### ✏️ Atualizar perfil
| Método | Rota |
|------|------|
| PUT | `/profile` |

Permite alterar o email do usuário.

---

### 🔐 Alterar senha
| Método | Rota |
|------|------|
| POST | `/change-password` |

Requer:
- senha atual
- nova senha forte

---

### 📋 Histórico de login
| Método | Rota |
|------|------|
| GET | `/login-history` |

Mostra:
- último IP
- último login
- tentativas
- última falha

---

## 🔒 Segurança Implementada

| Item | Implementação |
|----|--------------|
| Hash senha | bcrypt (salt 12) |
| Token | HMAC-SHA512 + SHA256 |
| Rate limit | IP + ação |
| SQL Injection | Queries preparadas |
| Reset senha | Token temporário (1h) |
| Auditoria | IP e login armazenados |

---

## 📧 Emails Automáticos

- Boas-vindas
- Login recente
- Recuperação de senha
- Alteração de email
- Troca de senha

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
✔ API funcional  
✔ SSH Git configurado  

---

## 📝 Próximos Passos

- Testes automatizados (Jest)
- Docker / Docker Compose
- CI/CD
- Integração frontend

---

**Feito no Brasil – 2026**
