# Project Documentation

## 1. Project Overview

VISHIPEL is a full-stack Customer Complaint Management System with two roles:

- `CUSTOMER`: submits complaints, tracks progress, receives resolutions, and rates results.
- `ADMIN`: receives, validates, processes, resolves, and analyzes complaints.

The system includes:

- JWT authentication and role-based authorization.
- Complaint submission with evidence files.
- A four-stage complaint workflow.
- Validation rejection and successful resolution flows.
- Customer and administrator notifications.
- Customer feedback with 1-5 star ratings and comments.
- Operational, SLA, user, and feedback analytics.
- Optional OpenAI-generated insights triggered by an administrator.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS |
| Charts | Recharts |
| HTTP client | Axios |
| Backend | Spring Boot 3.4.5, Java 17 |
| Security | Spring Security 6, JWT, BCrypt |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL 14+ |
| API documentation | SpringDoc OpenAPI 2.8.3 |
| Backend build | Maven |
| Frontend build | npm and Vite |

## 3. Repository Structure

```text
LTNC/
|-- backend/
|   |-- database/
|   |   `-- add-complaint-feedbacks.sql
|   |-- src/main/java/com/company/complaints/
|   |   |-- config/          Security and application configuration
|   |   |-- controller/      REST API controllers
|   |   |-- dto/             Request and response DTOs
|   |   |-- entity/          JPA entities
|   |   |-- enums/           Domain enumerations
|   |   |-- exception/       API exception handling
|   |   |-- repository/      Spring Data repositories
|   |   |-- security/        JWT filter and token provider
|   |   `-- service/         Business rules
|   |-- src/main/resources/
|   |   |-- application.properties
|   |   |-- application-seed.properties
|   |   |-- schema.sql
|   |   `-- data.sql
|   `-- src/test/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   |-- .env.example
|   `-- vite.config.js
|-- README.md
`-- PROJECT_DOCUMENTATION.md
```

## 4. Runtime Architecture

```text
Browser
  |
  | React SPA on http://localhost:5173
  | JWT in Authorization: Bearer <token>
  v
Spring Boot REST API on http://localhost:8080
  |
  | Spring Data JPA / Hibernate
  v
PostgreSQL on localhost:5432

Optional:
Spring Boot -> OpenAI API when ADMIN requests AI Insights
```

During local development, Vite proxies `/api` to `http://localhost:8080`.
The production frontend can use `VITE_API_BASE_URL` to call a separately hosted backend.

## 5. Environment Configuration

### 5.1 Backend environment

Create `backend/.env`. The `spring-dotenv` dependency loads this file locally.

```env
DB_URL=jdbc:postgresql://localhost:5432/db
DB_USERNAME=postgres
DB_PASSWORD=your-postgres-password


JWT_SECRET=replace-this-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRATION=86400000

OPENAI_API_KEY=
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-5-mini
OPENAI_MAX_TOKENS=2500

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
COMPLAINTS_UPLOAD_DIR=uploads

JPA_SHOW_SQL=false
JPA_FORMAT_SQL=false
```

Supported backend settings:

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/db` | JDBC connection |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | `1` | Local database password |
| `JWT_SECRET` | Development fallback | JWT signing secret |
| `JWT_EXPIRATION` | `86400000` | Token lifetime in milliseconds |
| `OPENAI_API_KEY` | Empty | Optional OpenAI key |
| `OPENAI_API_URL` | OpenAI chat completions URL | AI endpoint |
| `OPENAI_MODEL` | `gpt-5-mini` | AI model |
| `OPENAI_MAX_TOKENS` | `2500` | Maximum completion tokens |
| `CORS_ALLOWED_ORIGINS` | Local frontend origins | Comma-separated origins |
| `COMPLAINTS_UPLOAD_DIR` | `uploads` | Evidence storage directory |
| `JPA_SHOW_SQL` | `false` | SQL logging |
| `JPA_FORMAT_SQL` | `false` | Formatted SQL logging |

Real credentials must never be committed.

### 5.2 Frontend environment

`frontend/.env.example` contains:

```env
VITE_API_BASE_URL=
```

An empty value uses the Vite proxy in local development. For a separately hosted backend:

```env
VITE_API_BASE_URL=https://api.example.com
```

Vite environment variables are read at startup and build time.

## 6. Database Initialization

### 6.1 Create the database
#### Local PostgreSQL

Default configuration for development. Connection properties reference localhost:6543 for faster database insfrastructure.
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/db
spring.datasource.username=postgres
spring.datasource.password=your-postgres-password
```

Create the database:
bashpsql -h localhost -U postgres -c "CREATE DATABASE db;"
#### Supabase (Online PostgreSQL)

The project can connect to a Supabase-hosted PostgreSQL instance via Transaction Pooler.

```properties
spring.datasource.url=jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
spring.datasource.username=postgres.<project-ref>
spring.datasource.password=<supabase-password>
```
Credentials are found at Supabase Dashboard → Settings → Database → Connection Pooling → Session mode.
Performance considerations:


Some networks resolve DNS to IPv6 first, which causes connection failures. Add -Djava.net.preferIPv4Stack=true to the JVM arguments to force IPv4. Never commit real Supabase credentials; use environment variables or .env files.

```bash
-Djava.net.preferIPv4Stack=true
```
#### Configuration file
File: application.properties:
 Sets spring.sql.init.mode=never and spring.jpa.hibernate.ddl-auto=update by default.

File: application-seed.properties
Activated by -Dspring-boot.run.profiles=seed. Overrides spring.sql.init.mode=always and spring.jpa.defer-datasource-initialization=true.schema.sql
Drops all tables with CASCADE and recreates them from scratch.data.sqlTruncates users and inserts the full demo dataset.

### 6.2 Seed profile for a new local environment

`application-seed.properties` enables SQL initialization:

```properties
spring.sql.init.mode=never
```
```seed-properties
spring.sql.init.mode=always
```
Run:

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

The seed profile runs:

1. `schema.sql`, which drops and recreates application tables.
2. `data.sql`, which inserts demo users, complaints, validations, and feedback.

Stop the seeded backend after startup and restart without the seed profile.

> The seed profile is destructive. Never use it against a database whose data must be
> preserved.

### 6.3 Normal startup
```bash
cd backend
mvn clean compile spring-boot:run                              # local
mvn clean compile spring-boot:run \
  -Dspring-boot.run.jvmArguments="-Djava.net.preferIPv4Stack=true"  # supabase
```
init.mode=never: no SQL scripts run. 
ddl-auto=update: Hibernate only adds new columns or tables when entities change. Existing data and schema remain untouched.

### 6.4 Existing database migration

Databases created before customer feedback need this one-time migration:

```bash
cd backend
PGPASSWORD=your-postgres-password \
psql -h localhost -U postgres -d db -v ON_ERROR_STOP=1 \
  -f database/add-complaint-feedbacks.sql
```

The migration:

- Creates `complaint_feedbacks` if missing.
- Adds feedback ownership and rating constraints.
- Extends notification types with `CUSTOMER_FEEDBACK`.
- Preserves existing complaints and users.

## 7. Seed Data

The demo dataset contains:

- 1 administrator.
- 100 customers.
- 100 complaints across all workflow stages.
- Validation records for valid and rejected complaints.
- Sample feedback for successful resolved complaints.
- Intentionally overdue complaints for SLA dashboards.

All seeded accounts use:

```text
password123
```

| Role | Email |
|---|---|
| ADMIN | `admin@test.com` |
| CUSTOMER | `customer001@gmail.com` through `customer100@gmail.com` |

## 8. Authentication and Authorization

### 8.1 Login flow

1. The user sends credentials to `POST /api/auth/login`.
2. The backend authenticates with the configured `UserDetailsService`.
3. The backend returns a signed JWT containing the backend role.
4. The frontend stores the token in local storage.
5. Axios sends the token on protected requests.
6. The route guard decodes the JWT role and expiration before rendering protected pages.

Example header:

```http
Authorization: Bearer eyJ...
```

JWT expiration defaults to 24 hours.

### 8.2 Roles

| Role | Permissions |
|---|---|
| `CUSTOMER` | Own complaints, own feedback, own notifications |
| `ADMIN` | All complaints, workflow actions, users, notifications, analysis |

Public registration always creates a `CUSTOMER`.
Administrator accounts come from seed data or controlled database provisioning.

### 8.3 Public endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- Swagger/OpenAPI resources

All other application endpoints require authentication.
Controllers use `@PreAuthorize` for role-specific operations.

## 9. Main Domain Model

### 9.1 Users

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `name` | Display name |
| `email` | Unique login email |
| `phone` | Contact number |
| `password` | BCrypt password hash |
| `role` | `CUSTOMER` or `ADMIN` |
| `enabled` | Account status |
| `created_at`, `updated_at` | Audit timestamps |

### 9.2 Complaints

| Column | Purpose |
|---|---|
| `id` | Internal primary key |
| `complaint_code` | Public code such as `RC-YYYYMMDD-XXXX` |
| `customer_id` | Complaint owner |
| `title`, `description` | Customer complaint content |
| `order_id`, `phone` | Related order and contact data |
| `category` | `PRODUCT`, `SERVICE`, `DELIVERY`, `BILLING`, `OTHER` |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `status` | Workflow status |
| `investigation_summary` | Internal handling summary |
| `root_cause` | Root cause recorded by admin |
| `resolution` | Customer-facing final response |
| `validated_by`, `assigned_to`, `approved_by` | Handling administrators |
| `submitted_at`, `validated_at`, `assigned_at`, `resolved_at` | Workflow timestamps |
| `edit_count`, `last_edited_at`, `edit_deadline` | Pending-edit tracking |

Priority is assigned by an administrator during validation, not by the customer.

### 9.3 Complaint validations

The validation record stores:

- Checklist results.
- `VALID` or `INVALID` outcome.
- Rejection reason.
- Validation notes and timestamp.

Rejected complaints are represented as:

```text
complaints.status = RESOLVED
complaint_validations.validation_status = INVALID
```

### 9.4 Evidence attachments

Evidence metadata is stored in `complaint_attachments`.
File bytes are stored under `COMPLAINTS_UPLOAD_DIR`.

Rules:

- At least one evidence file is required during complaint submission.
- Supported types: JPG, PNG, WEBP, PDF.
- Maximum file size: 10 MB per file.
- Maximum multipart request size: 30 MB.

### 9.5 Complaint feedback

`complaint_feedbacks` stores one feedback record per complaint.

| Column | Purpose |
|---|---|
| `complaint_id` | Unique complaint reference |
| `customer_id` | Feedback author |
| `rating` | Integer from 1 to 5 |
| `comment` | Optional text, maximum 1000 characters |
| `created_at`, `updated_at` | Submission timestamps |

Feedback is allowed only when:

- The authenticated customer owns the complaint.
- The complaint is `RESOLVED`.
- A non-empty final resolution has been sent.
- The complaint was not rejected during validation.

Submitting again updates the existing complaint feedback.

### 9.6 Notifications

Notifications are stored per user and can reference a complaint.

Relevant notification events include:

- Complaint received.
- Validation accepted or rejected.
- Status changes.
- Customer feedback received.

Customer notifications link to the customer complaint detail page.
Feedback notifications link the handling administrator to the admin complaint detail page.

## 10. Complaint Workflow

### 10.1 Successful flow

```text
PENDING -> VALIDATING -> RESOLVING -> RESOLVED
```

| Stage | Main action |
|---|---|
| `PENDING` | Customer submits; admin receives |
| `VALIDATING` | Admin checks scope, evidence, and order data |
| `RESOLVING` | Admin investigates and prepares a resolution |
| `RESOLVED` | Admin sends the final response |

### 10.2 Rejected flow

```text
PENDING -> VALIDATING -> RESOLVED
```

Rejection is a validation result, not a fifth complaint status.
The customer sees the rejection reason and cannot submit feedback for that complaint.

### 10.3 Customer edit rule

Customers can edit title and description only while the complaint is still `PENDING`
and any configured edit deadline has not passed.

## 11. Customer Feedback Flow

```text
Admin sends final response
        |
        v
Customer sees resolution
        |
        v
Customer submits 1-5 stars and optional comment
        |
        +--> Feedback stored in PostgreSQL
        |
        +--> Handling admin receives CUSTOMER_FEEDBACK notification
        |
        +--> Rating appears in admin complaint views and Analysis
```

The feedback feature is available from the customer complaint detail page.
Administrators can review the result in:

- Resolved complaint lists.
- Admin complaint detail.
- Admin Notifications.
- Customer Feedback analytics.

## 12. Analysis and SLA

### 12.1 Database statistics

`GET /api/analysis/stats` aggregates:

- Total complaints.
- Counts by status and category.
- Monthly trends.
- SLA breaches and warnings.
- Average resolution time.
- Rejection rate.
- Customer statistics.
- Total feedback responses.
- Average rating.
- Feedback response rate.
- Low-rating count.
- 1-5 star distribution.

This endpoint does not call OpenAI.

### 12.2 Optional AI Insights

AI generation happens only through:

```text
POST /api/analysis/ai
```

The frontend calls this endpoint only when an administrator clicks **Generate**.
The request uses the current database statistics to produce:

- Six-month trend summary.
- Root-cause observations.
- Next-month prediction.
- Immediate actions.
- Short-term actions.
- Weekly actions.

Without a valid `OPENAI_API_KEY`, the rest of the application still runs and database
statistics remain available.

### 12.3 SLA business rule

The current project policy is:

```text
SLA_DAYS = 15
WARNING_WINDOW = final 3 days
```

- Open for more than 15 days: SLA breach.
- Open from day 12 through day 15: SLA warning.

Operational health is calculated from database data, not from OpenAI:

| Health | Rule |
|---|---|
| `HEALTHY` | No SLA breaches and average resolution time below 10 days |
| `WARNING` | At least one breach, or average resolution time from 10 to 15 days |
| `CRITICAL` | More than five breaches, or average resolution time above 15 days |

The 15-day value is an application business rule and not an external legal requirement.
It is currently declared in backend analysis logic and frontend complaint display logic.

## 13. API Reference

All API responses use the application response envelope:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

### 13.1 Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer and return JWT |
| `POST` | `/api/auth/login` | Public | Authenticate and return JWT |
| `GET` | `/api/auth/me` | Authenticated | Current user profile |
| `GET` | `/api/auth/check-role` | Authenticated | Role information |
| `GET` | `/api/auth/customer-only` | CUSTOMER | Role test |
| `GET` | `/api/auth/admin-only` | ADMIN | Role test |

### 13.2 Complaints

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/complaints` | CUSTOMER | Submit multipart complaint |
| `GET` | `/api/complaints/my` | CUSTOMER | Customer's complaints |
| `GET` | `/api/complaints` | ADMIN | All complaints |
| `GET` | `/api/complaints/submitted` | ADMIN | Pending receive queue |
| `GET` | `/api/complaints/{code}` | CUSTOMER or ADMIN | Complaint detail |
| `GET` | `/api/complaints/statistics/monthly-volume` | ADMIN | Monthly volume |
| `PUT` | `/api/complaints/{id}` | CUSTOMER | Edit pending complaint |
| `PUT` | `/api/complaints/{id}/receive` | ADMIN | Move to validation |
| `PUT` | `/api/complaints/{id}/validate` | ADMIN | Validate and prioritize |
| `PUT` | `/api/complaints/{id}/reject-validation` | ADMIN | Reject and complete |
| `PUT` | `/api/complaints/{id}/resolution` | ADMIN | Save handling result |
| `PUT` | `/api/complaints/{id}/send-response` | ADMIN | Send final response |
| `PUT` | `/api/complaints/{code}/feedback` | CUSTOMER | Create or update feedback |

Feedback request:

```json
{
  "rating": 5,
  "comment": "The resolution was clear and helpful."
}
```

### 13.3 Attachments

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/attachments/{id}/content` | Authorized user | View evidence content |

### 13.4 Notifications

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/notifications/my` | Authenticated | Current user's notifications |
| `PUT` | `/api/notifications/{id}/read` | Notification owner | Mark one as read |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all as read |

### 13.5 Analysis and users

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/analysis/stats` | ADMIN | Database statistics |
| `POST` | `/api/analysis/ai` | ADMIN | Generate AI insights |
| `GET` | `/api/admin/users` | ADMIN | List users |

Interactive schemas are available at:

```text
http://localhost:8080/swagger-ui.html
```

## 14. Frontend Routes

### 14.1 Customer routes

| Route | Page |
|---|---|
| `/customer/dashboard` | Complaint dashboard |
| `/customer/complaints/new` | Submit complaint |
| `/customer/complaints` | Customer complaint list |
| `/customer/complaints/:complaintId` | Complaint detail, resolution, feedback |
| `/customer/notifications` | Customer notifications |
| `/customer/profile` | Account information and local preferences |

### 14.2 Administrator routes

| Route | Page |
|---|---|
| `/admin/dashboard` | Complaint dashboard |
| `/admin/receive` | Receive `PENDING` complaints |
| `/admin/validate` | Validate `VALIDATING` complaints |
| `/admin/process` | Process `RESOLVING` complaints |
| `/admin/response` | Successfully resolved complaints |
| `/admin/complaints/all` | All complaints |
| `/admin/complaints/pending` | Unfinished complaints |
| `/admin/complaints/resolved` | Successfully resolved complaints |
| `/admin/complaints/rejected` | Validation-rejected complaints |
| `/admin/complaints/:complaintId` | Admin complaint detail |
| `/admin/users` | User management |
| `/admin/notifications` | Admin notifications and customer feedback alerts |
| `/admin/analysis` | Operational and feedback analytics |

## 15. Running the Application

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Local URLs

| URL | Purpose |
|---|---|
| `http://localhost:5173` | Frontend |
| `http://localhost:8080` | Backend |
| `http://localhost:8080/swagger-ui.html` | Swagger UI |
| `http://localhost:8080/v3/api-docs` | OpenAPI JSON |

## 16. Testing and Build Verification

Backend tests:

```bash
cd backend
mvn test
```

Backend package:

```bash
mvn clean package
```

Frontend production build:

```bash
cd frontend
npm install
npm run build
```

Frontend preview:

```bash
npm run preview
```

## 17. New Developer Verification Checklist

After setup, verify these flows:

1. Sign in as `customer001@gmail.com`.
2. Submit a complaint with at least one evidence file.
3. Sign in as `admin@test.com`.
4. Receive the complaint.
5. Validate it and assign priority.
6. Record root cause and resolution.
7. Send the final response.
8. Sign in again as the customer.
9. Open the resolved complaint and submit a rating.
10. Sign in as admin and confirm the feedback notification.
11. Open Analysis and confirm Customer Feedback metrics.
12. Click **Generate** only when testing AI Insights.

## 18. Operational Notes

- `schema.sql` is destructive when SQL initialization is enabled.
- Normal startup preserves data because `spring.sql.init.mode=never`.
- Hibernate uses `ddl-auto=validate`; schema mismatches prevent startup.
- Evidence files are stored on the local filesystem, not in PostgreSQL.
- The default database password and JWT secret are for local convenience only.
- Production deployments must provide secure environment variables.
- Production frontend deployments must set `VITE_API_BASE_URL` when no reverse proxy is used.
- Production CORS origins must be provided through `CORS_ALLOWED_ORIGINS`.
- AI Insights are optional and should not block complaint operations.
