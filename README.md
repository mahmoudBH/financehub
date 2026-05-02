# 🏦 FinanceHub - Digital Banking Dashboard Simulator

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)

**A modern, enterprise-grade fintech dashboard simulator built for portfolio demonstration.**

**Author:** Mahmoud Bousbih

</div>

---

## 🎯 Overview

FinanceHub is a full-stack digital banking simulator that showcases modern fintech application development. It features a complete authentication system, multi-account management, interactive 3D virtual cards, real-time transfers, currency exchange, AI-driven insights, Smart Savings Vaults, and an admin supervision panel. It incorporates an ultra-premium "Glassmorphism" UI/UX to match high-end banking apps.

> ⚠️ **This is a simulator.** No real financial transactions are processed.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication & Security** | JWT, 2FA/OTP simulation, Active Sessions management, full Security Audit Logs |
| 💰 **Accounts & Vaults** | Multiple virtual accounts + Smart Savings Vaults with "Round-up" spare change |
| 💳 **3D Virtual Cards** | Interactive physics-based 3D cards, create, block, activate (Visa/Mastercard/Amex) |
| 💸 **Transfers & Split Bill** | Internal transfers with fee calculation and "Split the Bill" request tracking |
| 📊 **Dashboard & AI Insights** | Real-time financial overview with AI-generated Smart Tips and spending analytics |
| 📈 **Investments Portfolio** | Track simulated Crypto and Stocks (Mock API) with interactive charts |
| 💱 **Exchange** | Live currency conversion with 8 supported currencies |
| 🎁 **Rewards System** | Loyalty Tiers (Standard, Premium, Metal) and Cashback points tracking |
| 🔔 **Notifications** | In-app notifications with unread indicators and mock system events |
| 🛡️ **Admin Panel** | User management, audit logs, transaction supervision |
| 📱 **Responsive UI/UX** | Glassmorphism, Framer Motion animations, mobile/tablet/desktop support |

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** + **shadcn/ui** components
- **Framer Motion** for 3D physics and smooth UI interactions
- **TanStack Query** for server state
- **Zustand** for client state
- **Recharts** for data visualization
- **Zod** + **React Hook Form** for validation
- **Socket.io** client for real-time

### Backend
- **NestJS** + **TypeScript**
- **Prisma ORM** + **MySQL**
- **Redis** for caching
- **JWT** authentication with refresh token rotation
- **Swagger/OpenAPI** documentation
- **Socket.io** for WebSocket
- **bcryptjs** for password hashing

### DevOps
- **Docker** + **Docker Compose**
- **GitHub Actions** CI/CD
- **Turborepo** monorepo management

## 📁 Project Structure

```
finance-dashboard/
├── apps/
│   ├── web/              # Next.js Frontend
│   │   └── src/
│   │       ├── app/      # Pages (App Router)
│   │       ├── components/  # UI Components
│   │       ├── lib/      # Utilities & API
│   │       └── store/    # Zustand stores
│   └── api/              # NestJS Backend
│       ├── prisma/       # Schema & migrations
│       └── src/
│           ├── common/   # Prisma, Redis
│           └── modules/  # Feature modules
├── docker/               # Docker configs
├── .github/workflows/    # CI/CD
└── docs/                 # Documentation
```

## 🏗️ Architecture Diagram

```mermaid
graph TD
    Client[Web Browser / Client] -->|HTTP / WebSocket| NextJS[Next.js Frontend]
    NextJS -->|REST API / Socket.io| NestJS[NestJS API Gateway & Backend]
    
    subgraph Backend Architecture
        NestJS -->|Prisma ORM| MySQL[(MySQL Database)]
        NestJS -->|ioredis| Redis[(Redis Cache / PubSub)]
        NestJS -.-> JWT[Auth & JWT Guard]
    end
```

## 📸 Screenshots

> ✨ A visual walkthrough of FinanceHub — from onboarding to advanced financial operations.  
> Built with a premium fintech aesthetic, smooth interactions, and a refined user experience.

### 🌐 Public Experience

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Landing Page</strong><br/>
      <img src="https://github.com/user-attachments/assets/d53d832b-1e25-49a4-a501-a13757620f71" alt="Landing Page" width="100%" />
      <p><em>Elegant marketing page with premium branding and onboarding flow.</em></p>
    </td>
    <td align="center" width="50%">
      <strong>Login Page</strong><br/>
      <img src="https://github.com/user-attachments/assets/02467e5c-16cd-4ba2-8aca-deac6eee9e71" alt="Login Page" width="100%" />
      <p><em>Secure and smooth login experience with modern UI patterns.</em></p>
    </td>
  </tr>
</table>

### 📊 Dashboard Experience

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Full Dashboard — Dark Mode</strong><br/>
      <img src="https://github.com/user-attachments/assets/c262ed14-6a90-4f80-bfbb-9ed55470166d" alt="Dark Mode Dashboard" width="100%" />
      <p><em>Immersive dark mode with financial insights and analytics.</em></p>
    </td>
    <td align="center" width="50%">
      <strong>Dashboard Overview</strong><br/>
      <img src="https://github.com/user-attachments/assets/903bb850-0198-4ed6-8411-8aa0edc65857" alt="Dashboard Overview" width="100%" />
      <p><em>Real-time financial summary, charts, and quick actions.</em></p>
    </td>
  </tr>
</table>

### 💳 Banking Features

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Accounts Management</strong><br/>
      <img src="https://github.com/user-attachments/assets/d1b980f5-1e16-4446-b98e-b946c1782e7e" alt="Accounts Page" width="100%" />
      <p><em>Multi-account overview with balances and analytics.</em></p>
    </td>
    <td align="center" width="50%">
      <strong>Virtual Cards</strong><br/>
      <img src="https://github.com/user-attachments/assets/a132e8ee-5c52-4375-a3e1-b057f5e47e1f" alt="Cards Page" width="100%" />
      <p><em>Interactive 3D cards with realistic fintech UI.</em></p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Transfers</strong><br/>
      <img src="https://github.com/user-attachments/assets/7861560f-7801-4b9f-ad02-b30c6c3d602b" alt="Transfers Page" width="100%" />
      <p><em>Seamless money transfer flow with validation and UX clarity.</em></p>
    </td>
    <td align="center" width="50%">
      <strong>Transactions History</strong><br/>
      <img src="https://github.com/user-attachments/assets/ad48e48b-b0f3-4749-8d3a-066e36f394d6" alt="Transactions Page" width="100%" />
      <p><em>Detailed transaction tracking with filters and insights.</em></p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Deposit & Withdrawal</strong><br/>
      <img src="https://github.com/user-attachments/assets/affb1135-69c2-4798-8c1e-8a70c94a8db3" alt="Deposit Withdraw Page" width="100%" />
      <p><em>Core banking operations with intuitive user flows.</em></p>
    </td>
    <td align="center" width="50%">
      <strong>Currency Exchange</strong><br/>
      <img src="https://github.com/user-attachments/assets/bb5e6dd6-32e7-4708-9e55-a900c1bb782a" alt="Currency Exchange Page" width="100%" />
      <p><em>Real-time currency conversion with visual feedback.</em></p>
    </td>
  </tr>
</table>

### 📈 Advanced Features

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Investments & Crypto</strong><br/>
      <img src="https://github.com/user-attachments/assets/5f3c8378-2349-4b3f-849f-ad3c08a960f3" alt="Investments Crypto Page" width="100%" />
      <p><em>Simulated investment portfolio with interactive charts.</em></p>
    </td>
    <td align="center" width="50%">
      <strong>Smart Savings Vaults</strong><br/>
      <img src="https://github.com/user-attachments/assets/e4865ec9-5c99-4dc9-8018-f60d9e1bf983" alt="Vaults Page" width="100%" />
      <p><em>Goal-based savings with progress tracking and automation.</em></p>
    </td>
  </tr>
</table>

### 🔔 User Experience

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Notifications</strong><br/>
      <img src="https://github.com/user-attachments/assets/724f0c0a-0b29-4b54-9476-e136b77b2214" alt="Notifications Page" width="100%" />
      <p><em>Real-time alerts and system notifications.</em></p>
    </td>
    <td align="center" width="50%">
      <strong>Profile & Security</strong><br/>
      <img src="https://github.com/user-attachments/assets/77ade3a7-b29e-4c06-a2b4-7f88b1f44cbd" alt="Profile Page" width="100%" />
      <p><em>User profile management with advanced security settings.</em></p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Settings & Security Center</strong><br/>
      <img src="https://github.com/user-attachments/assets/2b5a49cf-59c1-4942-9a55-f83f21000694" alt="Settings Security Page" width="100%" />
      <p><em>Full control over preferences, sessions, and security.</em></p>
    </td>
    <td align="center" width="50%">
      <strong>—</strong><br/>
      <p><em></em></p>
    </td>
  </tr>
</table>

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MySQL 8.0
- Redis 7+
- npm ≥ 9

### Option 1: Docker (Recommended)

```bash
# Clone and start
cd finance-dashboard
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d

# Run migrations and seed
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

### Option 2: Local Development

```bash
# 1. Install dependencies
cd finance-dashboard
npm install
cd apps/api && npm install
cd ../web && npm install

# 2. Setup database
cd apps/api
cp ../../.env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 3. Start services
# Terminal 1 - API
cd apps/api && npm run dev

# Terminal 2 - Frontend
cd apps/web && npm run dev
```

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/api/docs |
| Prisma Studio | `npx prisma studio` |

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@financehub.dev | Password@123 |
| User | john@example.com | Password@123 |
| User | sophie@example.com | Password@123 |
| User | ahmed@example.com | Password@123 |

## 🔑 API Endpoints

<details>
<summary>Click to expand all endpoints</summary>

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/signup | Create account |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/logout | Logout |
| POST | /api/v1/auth/refresh | Refresh token |
| POST | /api/v1/auth/forgot-password | Request reset |
| POST | /api/v1/auth/reset-password | Reset password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/users/me | Get profile |
| PATCH | /api/v1/users/me | Update profile |
| PATCH | /api/v1/users/me/password | Change password |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/accounts | List accounts |
| POST | /api/v1/accounts | Create account |
| GET | /api/v1/accounts/:id | Account details |
| PATCH | /api/v1/accounts/:id/status | Update status |

### Cards, Transfers, Transactions, Exchange, Notifications, Admin
Full documentation available at **/api/docs** (Swagger UI)

</details>

## 🗄️ Database Schema

The Prisma schema includes 15 models with proper relations, indexes, and constraints:
- User, RefreshToken, PasswordResetToken, EmailVerificationToken
- Account, Card, Beneficiary, Vault, SplitRequest
- Transfer, Transaction, Deposit, Withdrawal
- ExchangeRate, ExchangeHistory
- Notification, AuditLog

## 🔒 Security

- JWT access tokens (15min expiry)
- Refresh token rotation with hashed storage
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/60s)
- RBAC authorization guards
- Input validation with class-validator
- Helmet security headers
- CORS strict configuration
- Audit trail for sensitive actions
- No storage of CVV, raw PAN, or plain passwords

## 📝 License

MIT License - Built for portfolio demonstration purposes.
