# Customer Complaint Management System

![Java 17](https://img.shields.io/badge/Java-17-blue.svg)
![Spring Boot 3.4](https://img.shields.io/badge/Spring_Boot-3.4.5-brightgreen.svg)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite 6](https://img.shields.io/badge/Vite-6-646CFF.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-336791.svg)

A full-stack web application for managing customer complaints.
Built with **React 19 + Vite + Tailwind CSS** (frontend) and **Spring Boot 3.4 + PostgreSQL** (backend).

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
| Role-gated endpoints | `GET /api/auth/customer-only`, `/admin-only` |

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
| `ADMIN` | Receives, validates, processes, and responds to complaints |

New registrations via the public endpoint always receive the `CUSTOMER` role.
Admin accounts must be created directly in the database.

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

`schema.sql` creates this table on startup and Hibernate verifies it (`ddl-auto=validate`).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Unique user ID |
| `name` | `VARCHAR` | NOT NULL | Full name |
| `email` | `VARCHAR` | NOT NULL, UNIQUE | Login email |
| `phone` | `VARCHAR` | | Contact phone |
| `password` | `VARCHAR` | NOT NULL | BCrypt hash |
| `role` | `VARCHAR` | NOT NULL | `CUSTOMER`, `ADMIN` |
| `enabled` | `BOOLEAN` | NOT NULL, default `true` | Account active flag |
| `created_at` | `TIMESTAMP` | NOT NULL | Set automatically on insert |

### Test Data

Run the `seed` profile when you explicitly want to reset the local database and load [backend/src/main/resources/data.sql](backend/src/main/resources/data.sql).
Normal startup preserves existing data because `spring.sql.init.mode=never` in the default profile.
**All test accounts use the password `password123`.**

#### Admin accounts

| Email | Role | Name |
|-------|------|------|
| `admin@test.com` | ADMIN | Admin User |

#### Customer accounts

100 customer accounts are seeded, following the pattern below:

| Email pattern | Role | Name pattern |
|---------------|------|--------------|
| `customer001@gmail.com` | CUSTOMER | Customer 001 |
| `customer002@gmail.com` | CUSTOMER | Customer 002 |
| … | … | … |
| `customer100@gmail.com` | CUSTOMER | Customer 100 |

#### Sample complaints

100 demo complaints are distributed across the four statuses:
`PENDING`, `VALIDATING`, `RESOLVING`, `RESOLVED`.

Rejected complaints are stored as `RESOLVED` with `validation_status = 'INVALID'` and a rejection reason.

To run the seed from PowerShell:

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=seed"
```

Stop the backend after the seed profile finishes startup, then run the backend normally to preserve data:

```powershell
mvn spring-boot:run
```

Use quotes around `-Dspring-boot.run.profiles=seed` in PowerShell. Without quotes, Maven can misread the argument and fail with `LifecyclePhaseNotFoundException`.

To verify in psql:

```sql
SELECT id, name, email, role FROM users ORDER BY role, id;
SELECT status, COUNT(*) FROM complaints GROUP BY status ORDER BY status;
```

---

### Table: `complaints`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Unique complaint ID |
| `complaint_code` | `VARCHAR` | NOT NULL, UNIQUE | Auto-generated ID (e.g., RC-YYYYMMDD-XXXX) |
| `customer_id` | `BIGINT` | FK to users | Submitting customer |
| `title` | `VARCHAR` | NOT NULL | Brief summary |
| `category` | `VARCHAR` | | Complaint category |
| `priority` | `VARCHAR` | | Low, Medium, High |
| `status` | `VARCHAR` | NOT NULL | Complaint lifecycle status: `PENDING`, `VALIDATING`, `RESOLVING`, or `RESOLVED` |
| `order_id` | `VARCHAR` | | Related order reference |
| `phone` | `VARCHAR` | | Complaint contact phone |
| `description` | `TEXT` | | Detailed explanation |
| `resolution` | `TEXT` | | Final response/resolution |
| `created_at` | `TIMESTAMP` | NOT NULL | Set automatically |
| `updated_at` | `TIMESTAMP` | NOT NULL | Set automatically |

---

## Running the Project

### Backend

#### 1. Configure environment variables

Create a file `backend/.env` with your OpenAI API key (this file is git-ignored):

```env
OPENAI_API_KEY=your-openai-api-key-here
```

#### 2. Run the backend

Open a terminal and run:

```powershell
cd backend
mvn spring-boot:run
```

Wait for:
```
Tomcat started on port 8080
```

To reset the local database and restore demo accounts, stop the backend and run:

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=seed"
```

Stop that process after startup, then return to normal `mvn spring-boot:run`.

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

## Complaint Module — Implementation (Current Progress)

This section describes the complaint management features that have been implemented on top of the existing authentication and security system.

The module focuses on enabling customers to submit complaints and allowing one admin role to receive and process them.

---

### Backend — Complaint APIs

The following REST endpoints have been implemented:

| Method | Path | Auth required | Role | Description |
|--------|------|--------------|------|------------|
| `POST` | `/api/complaints` | Yes | CUSTOMER | Submit a new complaint |
| `GET` | `/api/complaints/my` | Yes | CUSTOMER | Retrieve current user's complaints |
| `GET` | `/api/complaints/{complaintCode}` | Yes | ALL ROLES | Get complaint detail |
| `GET` | `/api/complaints` | Yes | ADMIN | Retrieve all complaints |
| `GET` | `/api/complaints/submitted` | Yes | ADMIN | Retrieve submitted (pending) complaints |
| `PUT` | `/api/complaints/{id}/receive` | Yes | ADMIN | Mark complaint as received |

---

### Complaint Processing Flow

The complaint lifecycle is currently defined as:
```text
PENDING -> VALIDATING -> RESOLVING -> RESOLVED
```

The four complaint statuses are:

| Status | Meaning |
|----------------|------------------|
| `PENDING` | Customer submitted the complaint; admin has not received it yet |
| `VALIDATING` | Admin received the complaint and checks whether it is valid |
| `RESOLVING` | Validated complaint is being handled, investigated, and given a solution |
| `RESOLVED` | Complaint is completed |

Rejected complaints are not a separate complaint status. They are completed as `RESOLVED` with `validation_status = 'INVALID'` in `complaint_validations`.

Complaints must be resolved within 15 days from the customer submission date. Admin dashboard and analysis pages highlight overdue complaints that are still not `RESOLVED`.

---

### Backend Implementation Notes

- Complaint codes are generated automatically using the format: RC-YYYYMMDD-XXXX
- Role-based access control is enforced using `@PreAuthorize`.

- Authorization logic includes:
- Customers can only access their own complaints
- Admin can access all complaints

- The service layer handles:
- Complaint creation
- Ownership validation
- Status transitions (e.g. receive complaint)

---

### Frontend — Complaint Integration

The frontend has been integrated with the backend APIs for real-time data handling.

#### Customer Features

- Submit complaint form  
`/customer/complaints/new`

- Redirect to complaint detail after submission  
- View complaint detail page with:
  - Complaint information
  - Status timeline
  - Resolution content

---

#### Admin Features

- View pending complaints  
`/admin/receive`

- Receive complaint (status update from `PENDING` to `VALIDATING`)
- Validate complaint (status update from `VALIDATING` to `RESOLVING`, or reject as `RESOLVED`)
- Resolve complaint (save investigation, root cause, and solution while `RESOLVING`)
- Send response (status update from `RESOLVING` to `RESOLVED`)

- View complaint detail (separate admin view)

### Current Implementation Status

#### Completed

- Customer complaint submission flow
- Complaint detail page (customer and admin)
- Admin complaint receiving flow
- Backend API integration with frontend
- Role-based access validation

---

#### In Progress

- Complaint status tracking dashboard
- Aggregated metrics (total / pending / resolved complaints)

---

### Notes

- Database schema is fully extracted to `schema.sql` for production readiness.
- Hibernate's auto-generation should be disabled (`spring.jpa.hibernate.ddl-auto=validate` or `none`).

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
| `GET` | `/api/auth/admin-only` | Yes — ADMIN | Role access test |

### Request / Response Format

**Login request:**
```json
{
  "email": "customer01@test.com",
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
    "email": "customer01@test.com",
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
│   └── Role.java                       # CUSTOMER, ADMIN
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
└── data.sql                            # Demo data loaded only with the seed profile
```
