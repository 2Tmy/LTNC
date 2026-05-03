# Customer Complaint Management System

A full-stack web application for managing customer complaints.
Built with **React 19 + Vite** (frontend) and **Spring Boot 3.4 + PostgreSQL** (backend).

---

## Project Structure

```
LTNC/
├── backend/          # Spring Boot REST API
├── frontend/         # React + Vite SPA
└── README.md
```

---

## Backend — What Has Been Built

### Authentication Module (completed)

| Feature | Details |
|---------|---------|
| User registration | `POST /api/auth/register` — creates a CUSTOMER account, returns JWT |
| User login | `POST /api/auth/login` — validates credentials, returns JWT |
| Current user profile | `GET /api/auth/me` — returns profile of the logged-in user |
| Role check | `GET /api/auth/check-role` — returns full role info with boolean flags |
| Role-gated endpoints | `GET /api/auth/customer-only`, `/staff-only`, `/management-only` |

### Security

- **JWT authentication** — stateless, signed with HMAC-SHA256, expires in 24 hours
- **BCrypt password hashing** — cost factor 10
- **Spring Security 6** — method-level `@PreAuthorize` enforced
- **CORS** — allowed origins: `localhost:5173` (Vite) and `localhost:3000`
- **Public endpoints** — `/api/auth/register` and `/api/auth/login` only; all others require a valid Bearer token

### Role System

| Role | Description |
|------|-------------|
| `CUSTOMER` | External user who submits complaints |
| `CS_STAFF` | Customer service staff — receives and validates complaints |
| `SPECIALIST` | Investigates complaints |
| `MANAGEMENT` | Approves resolutions |

New registrations via the public endpoint always receive the `CUSTOMER` role.
Staff accounts must be created directly in the database.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 3.4.5 |
| Language | Java 17+ |
| Security | Spring Security 6 + JJWT 0.12.3 |
| Database | PostgreSQL 18 |
| ORM | Hibernate 6 / Spring Data JPA |
| Validation | Jakarta Bean Validation |
| API Docs | SpringDoc OpenAPI 2.8.3 (Swagger UI) |
| Build | Maven 3.9 |
| Utilities | Lombok |

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java (JDK) | 17 or higher | Tested with Eclipse Temurin 25 |
| Maven | 3.6 or higher | |
| PostgreSQL | 14 or higher | Tested with PostgreSQL 18 |
| Node.js | 18 or higher | For the frontend only |

---

## PostgreSQL Setup

### 1. Install PostgreSQL

Download from https://www.postgresql.org/download/windows/ and install with default settings.
Default superuser: `postgres`, set a password during install.

### 2. Create the database

Open a terminal and run:

```bash
psql -U postgres
```

Then inside psql:

```sql
CREATE DATABASE db;
\q
```

### 3. Verify connection

```bash
psql -U postgres -d db -c "SELECT version();"
```

The backend connects with these credentials (configured in `application.properties`):

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `db` |
| Username | `postgres` |
| Password | `1` |

To use different credentials, edit [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/db
spring.datasource.username=postgres
spring.datasource.password=1
```

---

## Database Structure

### Table: `users`

Hibernate auto-creates this table on first startup (`ddl-auto=update`).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Unique user ID |
| `name` | `VARCHAR` | NOT NULL | Full name |
| `email` | `VARCHAR` | NOT NULL, UNIQUE | Login email |
| `password` | `VARCHAR` | NOT NULL | BCrypt hash |
| `role` | `VARCHAR` | NOT NULL | `CUSTOMER`, `CS_STAFF`, `SPECIALIST`, `MANAGEMENT` |
| `enabled` | `BOOLEAN` | NOT NULL, default `true` | Account active flag |
| `created_at` | `TIMESTAMP` | NOT NULL | Set automatically on insert |

### Test Data

On every server startup, `data.sql` seeds the database with 8 test accounts.
**All test accounts use the password `password123`.**

| Email | Role |
|-------|------|
| customer1@test.com | CUSTOMER |
| customer2@test.com | CUSTOMER |
| customer3@test.com | CUSTOMER |
| staff1@test.com | CS_STAFF |
| staff2@test.com | CS_STAFF |
| specialist1@test.com | SPECIALIST |
| specialist2@test.com | SPECIALIST |
| manager1@test.com | MANAGEMENT |

To verify in psql:

```sql
SELECT id, name, email, role FROM users ORDER BY role, id;
```

---

## Running the Project

### Backend

Open a terminal and run:

```powershell
# Windows — set JAVA_HOME if not configured system-wide
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot"

cd backend
& "C:\Program Files\Apache\maven\bin\mvn.cmd" spring-boot:run
```

Wait for:
```
Tomcat started on port 8080
```

The API is now available at `http://localhost:8080`.
Swagger UI is available at `http://localhost:8080/swagger-ui.html`.

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install      # first time only
npm run dev
```

Wait for:
```
Local: http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

### Stopping the servers

Close the terminal windows. If port 8080 remains occupied on next startup:

```powershell
$p = (Get-NetTCPConnection -LocalPort 8080).OwningProcess
Stop-Process -Id $p -Force
```

---

## API Reference

Full interactive documentation is available at `http://localhost:8080/swagger-ui.html` after starting the server.

### Auth Endpoints

| Method | Path | Auth required | Description |
|--------|------|---------------|-------------|
| `POST` | `/api/auth/register` | No | Create a new customer account |
| `POST` | `/api/auth/login` | No | Login and receive a JWT |
| `GET` | `/api/auth/me` | Yes | Get current user profile |
| `GET` | `/api/auth/check-role` | Yes | Get role info with boolean flags |
| `GET` | `/api/auth/customer-only` | Yes — CUSTOMER | Role access test |
| `GET` | `/api/auth/staff-only` | Yes — CS_STAFF / SPECIALIST / MANAGEMENT | Role access test |
| `GET` | `/api/auth/management-only` | Yes — MANAGEMENT | Role access test |

### Request / Response Format

**Login request:**
```json
{
  "email": "customer1@test.com",
  "password": "password123"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJ...",
    "userId": 1,
    "name": "Nguyen Van An",
    "email": "customer1@test.com",
    "role": "CUSTOMER"
  }
}
```

**Using the token:**
```
Authorization: Bearer eyJ...
```

---

## Source Code Structure

```
backend/src/main/java/com/company/complaints/
├── ComplaintsApplication.java          # Entry point
├── config/
│   ├── SecurityConfig.java             # Spring Security, CORS, JWT filter wiring
│   └── OpenApiConfig.java              # Swagger UI configuration
├── controller/
│   └── AuthController.java             # All /api/auth/** endpoints
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   └── RegisterRequest.java
│   └── response/
│       ├── ApiResponse.java            # Standard { success, message, data } envelope
│       └── AuthResponse.java           # Token + user info returned after login/register
├── entity/
│   └── User.java                       # JPA entity, implements UserDetails
├── enums/
│   └── Role.java                       # CUSTOMER, CS_STAFF, SPECIALIST, MANAGEMENT
├── exception/
│   ├── CustomExceptions.java           # Domain-specific exception classes
│   └── GlobalExceptionHandler.java     # Maps exceptions to HTTP responses
├── repository/
│   └── UserRepository.java             # findByEmail, existsByEmail
├── security/
│   ├── JwtTokenProvider.java           # Generate and validate JWT tokens
│   ├── JwtAuthenticationFilter.java    # Extracts token from each request
│   └── UserDetailsServiceImpl.java     # Loads user by email for Spring Security
└── service/
    └── AuthService.java                # Login, register, getCurrentUser logic

backend/src/main/resources/
├── application.properties              # DB, JWT, server config
└── data.sql                            # Test data seeded on every startup
```
