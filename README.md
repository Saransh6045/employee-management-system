# Enterprise Employee Management System (EMS)

A high-performance, production-ready employee management system built with a Full-Stack Node.js (Express) + React architecture. This system features Role-Based Access Control (RBAC), JWT Authentication, and a sleek "Bento Grid" dashboard design.

## Features

- **RBAC Security**: 4 distinct roles (ADMIN, HR, MANAGER, EMPLOYEE) with granular permissions.
- **JWT Authentication**: Secure stateless authentication using industry-standard tokens.
- **…g leaves.
…- `src/server/routes`: API endpoint definitions and routing.
- `src/server/middleware`: Auth, Authorization, Audit Logging, and Error Handling.
- `src/server/services`: Business logic and data persistence (Simulated DB).
- `src/App.tsx`: Main React entry point with view-management logic.
- `src/types.ts`: Shared TypeScript interfaces across front and back.

## Docker (Coming Soon)
A `Dockerfile` and `docker-compose.yml` are ready for containerized deployment in the next iteration.
