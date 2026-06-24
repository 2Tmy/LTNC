# VISHIPEL Customer Complaint Management System

![Java 17](https://img.shields.io/badge/Java-17-blue.svg)
![Spring Boot 3.4.5](https://img.shields.io/badge/Spring_Boot-3.4.5-brightgreen.svg)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite 6](https://img.shields.io/badge/Vite-6-646CFF.svg)
![PostgreSQL 14+](https://img.shields.io/badge/PostgreSQL-14%2B-336791.svg)

A full-stack complaint management application for customers and support administrators.

Customers can submit and track complaints, receive the final resolution, and rate the
handling result. Administrators can manage the complete complaint workflow, receive
customer feedback notifications, monitor SLA metrics, and generate AI insights on demand.

## Features

### Customer

- Register and sign in with JWT authentication.
- Submit complaints with order details and evidence files.
- Track the workflow from submission to final response.
- View validation rejection reasons or the administrator's resolution.
- Submit or update a 1-5 star rating with an optional comment.
- Receive and manage complaint notifications.

### Administrator

- Receive, validate, reject, process, and resolve complaints.
- Assign priority during validation.
- Record investigation details, root cause, and customer-facing resolution.
- View all, pending, resolved, and rejected complaints.
- Review customer ratings in complaint lists and detail pages.
- Receive notifications when customers submit feedback.
- View complaint, SLA, customer, and feedback analytics.
- Generate AI insights only when requested.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS, Recharts, Axios |
| Backend | Java 17, Spring Boot 3.4.5, Spring Security 6 |
| Authentication | JWT, BCrypt |
| Database | PostgreSQL 14+ |
| Persistence | Spring Data JPA, Hibernate |
| API documentation | SpringDoc OpenAPI / Swagger UI |
| Build tools | Maven 3.6+, npm |

## Repository Structure

```text
LTNC/
|-- backend/
|   |-- database/                         One-time non-destructive migrations
|   |-- src/main/java/com/company/complaints/
|   |-- src/main/resources/
|   |   |-- application.properties
|   |   |-- application-seed.properties
|   |   |-- schema.sql
|   |   `-- data.sql
|   `-- src/test/
|-- frontend/
|   |-- src/
|   `-- .env.example
|-- PROJECT_DOCUMENTATION.md
`-- README.md
```

## Prerequisites

Install these tools before starting:

| Tool | Required version |
|---|---|
| Java JDK | 17 or newer |
| Maven | 3.6 or newer |
| PostgreSQL | 14 or newer |
| Node.js | 18 or newer |
| npm | Included with Node.js |

Verify the installation:

```bash
java -version
mvn -version
psql --version
node --version
npm --version
```

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd LTNC
```

### 2. Create the PostgreSQL database
# Database

## Database

The project uses a local PostgreSQL 14+ instance.

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/db
spring.datasource.username=postgres
spring.datasource.password=your-postgres-password
```

Create the database once:

```bash
psql -h localhost -U postgres -c "CREATE DATABASE db;"
```

## Startup Modes

| Mode | Profile | `init.mode` | `ddl-auto` | Behaviour |
|---|---|---|---|---|
| **Normal** | _(none)_ | `never` | `update` | Preserves all data. Hibernate adds new columns/tables if entities change. |
| **Seed** | `seed` | `always` | `update` | Runs `schema.sql` (DROP + CREATE) then `data.sql` (demo data). **Destructive.** |

### Seed (first-time or reset)

```bash
cd backend
mvn clean compile spring-boot:run -Dspring-boot.run.profiles=seed
```

Stop the server after seed completes. All subsequent starts use normal mode.

### Normal (daily development)

```bash
cd backend
mvn clean compile spring-boot:run
```

No SQL scripts run. Existing data is preserved.

## Accounts

All seeded accounts share the password `password123`.

| Role | Email |
|---|---|
| ADMIN | `admin@test.com` |
| CUSTOMER | `customer001@gmail.com` through `customer100@gmail.com` |

## Configuration Files

| File | Purpose |
|---|---|
| `application.properties` | Datasource URL, JPA, JWT, CORS, Swagger |
| `application-seed.properties` | Overrides `spring.sql.init.mode=always` for seed profile |
| `schema.sql` | DDL — drops and recreates all 6 tables |
| `data.sql` | Inserts 1 admin, 100 customers, 100 complaints, validations, and feedback |



### 3. Configure the backend

Create `backend/.env`:

```env
DB_URL=jdbc:postgresql://localhost:5432/db
DB_USERNAME=postgres
DB_PASSWORD=your-postgres-password

JWT_SECRET=replace-this-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRATION=86400000

# Optional. Only required for real AI-generated insights.
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_MAX_TOKENS=2500

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
COMPLAINTS_UPLOAD_DIR=uploads
```

`backend/.env` is ignored by Git. Do not commit real database passwords, JWT secrets,
or API keys.

The application can run without `OPENAI_API_KEY`. Database statistics and customer
feedback analytics still work. A valid key is only needed when an administrator clicks
**Generate** in AI Insights and expects a real model response.

### 4. Initialize demo data

The recommended first-time setup is the seed profile. It creates the complete schema,
one administrator, 100 customers, demo complaints, validations, and sample feedback.

> Warning: the seed profile drops and recreates application tables. Use it only for
> local development or when you intentionally want to reset the demo database.

macOS/Linux:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=seed
```

PowerShell:

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=seed"
```

Wait until Spring reports that the application has started, then stop it with `Ctrl+C`.
The database is now initialized.

### 5. Start the backend normally

From `backend/`:

```bash
mvn spring-boot:run
```

Wait for:

```text
Tomcat started on port 8080
```

Backend URLs:

| URL | Purpose |
|---|---|
| `http://localhost:8080` | REST API |
| `http://localhost:8080/swagger-ui.html` | Swagger UI |
| `http://localhost:8080/v3/api-docs` | OpenAPI JSON |

### 6. Start the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

During development, Vite proxies `/api` requests to `http://localhost:8080`.
No frontend environment file is required for the default local setup.

### 7. Sign in with demo accounts

All seeded accounts use:

```text
password123
```

| Role | Email |
|---|---|
| Administrator | `admin@test.com` |
| Customer | `customer001@gmail.com` |
| Customer | `customer002@gmail.com` |

Customer accounts continue through `customer100@gmail.com`.

## Existing Database Migration

If the database was created before customer feedback was introduced, apply this
non-destructive migration once:

macOS/Linux:

```bash
cd backend
PGPASSWORD=your-postgres-password \
psql -h localhost -U postgres -d db -v ON_ERROR_STOP=1 \
  -f database/add-complaint-feedbacks.sql
```

PowerShell:

```powershell
cd backend
$env:PGPASSWORD = "your-postgres-password"
psql -h localhost -U postgres -d db -v ON_ERROR_STOP=1 -f database/add-complaint-feedbacks.sql
Remove-Item Env:PGPASSWORD
```

Do not run the seed profile against a database whose data must be preserved.

## Frontend Environment Configuration

The default value in `frontend/.env.example` is:

```env
VITE_API_BASE_URL=
```

An empty value uses the Vite development proxy. If the frontend is hosted separately,
create `frontend/.env` and set the backend origin:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Restart Vite after changing frontend environment variables.

## Complaint Workflow

Successful complaint flow:

```text
PENDING -> VALIDATING -> RESOLVING -> RESOLVED
```

Rejected complaint flow:

```text
PENDING -> VALIDATING -> RESOLVED
```

Rejected complaints remain `RESOLVED` at the complaint level and are identified by
`complaint_validations.validation_status = 'INVALID'`.

After a successful final response:

1. The customer sees the administrator's resolution.
2. The customer can submit or update one 1-5 star rating.
3. The handling administrator receives a customer-feedback notification.
4. Feedback appears in administrator complaint views and Analysis.

## Analysis and SLA

The Analysis page loads database statistics from:

```text
GET /api/analysis/stats
```

Opening the page does not call OpenAI. AI content is generated only after the
administrator clicks **Generate**, which calls:

```text
POST /api/analysis/ai
```

The project currently uses a 15-day complaint resolution SLA:

- Open after more than 15 days: SLA breach.
- Open between days 12 and 15: SLA warning.
- `HEALTHY`: no breaches and average resolution time below 10 days.
- `WARNING`: at least one breach or average resolution time from 10 to 15 days.
- `CRITICAL`: more than five breaches or average resolution time above 15 days.

This is an application business rule, not an external legal requirement.
The seeded dataset intentionally includes overdue complaints for dashboard testing.

## Main API Endpoints

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |

### Complaints

| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/complaints` | CUSTOMER |
| `GET` | `/api/complaints/my` | CUSTOMER |
| `GET` | `/api/complaints/{code}` | CUSTOMER or ADMIN |
| `GET` | `/api/complaints` | ADMIN |
| `GET` | `/api/complaints/submitted` | ADMIN |
| `PUT` | `/api/complaints/{id}` | CUSTOMER |
| `PUT` | `/api/complaints/{id}/receive` | ADMIN |
| `PUT` | `/api/complaints/{id}/validate` | ADMIN |
| `PUT` | `/api/complaints/{id}/reject-validation` | ADMIN |
| `PUT` | `/api/complaints/{id}/resolution` | ADMIN |
| `PUT` | `/api/complaints/{id}/send-response` | ADMIN |
| `PUT` | `/api/complaints/{code}/feedback` | CUSTOMER |

### Notifications and Analysis

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/notifications/my` | Authenticated |
| `PUT` | `/api/notifications/{id}/read` | Authenticated owner |
| `PUT` | `/api/notifications/read-all` | Authenticated |
| `GET` | `/api/analysis/stats` | ADMIN |
| `POST` | `/api/analysis/ai` | ADMIN |

See Swagger UI for request and response schemas.

## Build and Test

Backend tests:

```bash
cd backend
mvn test
```

Backend package:

```bash
cd backend
mvn clean package
```

Frontend production build:

```bash
cd frontend
npm install
npm run build
```

Preview the frontend build:

```bash
npm run preview
```

## Troubleshooting

### Backend reports that a table does not exist

The default profile preserves existing data and does not initialize SQL automatically.
For a new local database, run the seed profile once as described in Quick Start.

### Backend reports password authentication failed

Update `DB_USERNAME` and `DB_PASSWORD` in `backend/.env`, then restart the backend.

Verify the connection manually:

```bash
psql -h localhost -U postgres -d db -c "SELECT version();"
```

### Port 8080 is already in use

macOS/Linux:

```bash
lsof -i :8080
kill <PID>
```

PowerShell:

```powershell
$processId = (Get-NetTCPConnection -LocalPort 8080).OwningProcess
Stop-Process -Id $processId -Force
```

### Frontend cannot reach the backend

- Confirm the backend is running on port `8080`.
- Confirm the frontend is running through `npm run dev`.
- Check `VITE_API_BASE_URL` if using a custom backend URL.
- Check `CORS_ALLOWED_ORIGINS` if the frontend uses a different origin.

### AI Insights do not contain a real model response

Set a valid `OPENAI_API_KEY` in `backend/.env` and restart the backend.
Normal complaint management and database analytics do not require OpenAI.

## Detailed Documentation

See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for architecture, database
tables, workflow rules, frontend routes, API details, and implementation notes.
