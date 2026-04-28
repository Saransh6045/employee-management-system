# Enterprise Employee Management System (EMS)

A high-performance, production-ready employee management system built with a Full-Stack Node.js (Express) + React architecture. This system features Role-Based Access Control (RBAC), JWT Authentication, and a sleek "Bento Grid" dashboard design.

## 🚀 Features

- **RBAC Security**: 4 distinct roles (ADMIN, HR, MANAGER, EMPLOYEE) with granular permissions.
- **JWT Authentication**: Secure stateless authentication using industry-standard tokens.
- **Employee Directory**: Full management of staff with pagination, filtering, and search.
- **Leave Management**: Workflow for applying, reviewing, and tracking leaves.
- **Performance Tracking**: Manager-led reviews and evaluation history.
- **Audit Logging**: Real-time tracking of critical system actions.
- **Bento Dashboard**: Modern, dense information display for operational overhead.

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Lucide Icons, Motion (Framer).
- **Backend**: Node.js, Express, TSX (Run-time TypeScript).
- **Security**: JWT (jsonwebtoken), BCryptJS.
- **Design**: "Bento Grid" theme with custom enterprise styling.
- **Documentation**: Swagger/OpenAPI 3.0 via `swagger-ui-express`.

## 📦 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd enterprise-ems

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```env
PORT=3000
JWT_SECRET=your_secure_secret_key
NODE_ENV=development
```

### 4. Running the Application
```bash
# Start development server (Full-stack)
npm run dev
```
The app will be available at: `http://localhost:3000`

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@enterprise.com` | `password123` |
| **HR** | `hr@enterprise.com` | `password123` |
| **Manager** | `manager@enterprise.com` | `password123` |
| **Employee** | `alice@enterprise.com` | `password123` |

## 📖 API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:3000/api-docs`

## 🏗 Architecture

The project follows a clean, layered architecture:
- `src/server/routes`: API endpoint definitions and routing.
- `src/server/middleware`: Auth, Authorization, Audit Logging, and Error Handling.
- `src/server/services`: Business logic and data persistence (Simulated DB).
- `src/App.tsx`: Main React entry point with view-management logic.
- `src/types.ts`: Shared TypeScript interfaces across front and back.

## 🐳 Docker (Coming Soon)
A `Dockerfile` and `docker-compose.yml` are ready for containerized deployment in the next iteration.
