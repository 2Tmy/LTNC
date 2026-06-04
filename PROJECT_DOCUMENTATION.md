# Project Documentation

## 1. Project Overview

This project is a full-stack Customer Complaint Management System.

It supports:
- Customer registration and login.
- Customer complaint submission with evidence files.
- Admin complaint intake, validation, resolving, response, user management, and analysis.
- JWT-based authentication and role-based authorization.

Main stack:

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 6, Tailwind CSS |
| Backend | Spring Boot 3.4.5, Java 17+ |
| Security | Spring Security 6, JWT, BCrypt |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| API docs | SpringDoc Swagger UI |

## 2. Repository Structure

```text
complaints/
|-- backend/
|   |-- src/main/java/com/company/complaints/
|   |   |-- config/          Security and OpenAPI configuration
|   |   |-- controller/      REST controllers
|   |   |-- dto/             Request and response DTOs
|   |   |-- entity/          JPA entities
|   |   |-- enums/           Domain enums
|   |   |-- exception/       Exception handling
|   |   |-- repository/      Spring Data repositories
|   |   |-- security/        JWT authentication
|   |   `-- service/         Business logic
|   `-- src/main/resources/
|       |-- application.properties
|       |-- application-seed.properties
|       |-- schema.sql
|       `-- data.sql
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|-- README.md
`-- PROJECT_DOCUMENTATION.md
```

## 3. Roles and Permissions

| Role | Description |
|------|-------------|
| `CUSTOMER` | External user who submits complaints and tracks their own complaints. |
| `ADMIN` | Internal user who receives, validates, resolves complaints, manages users, and views analysis. |

Public registration always creates a `CUSTOMER`.
Admin users are created through seed data or direct database insertion.

Role checks are enforced in backend controllers with `@PreAuthorize`.

Common examples:
- `POST /api/complaints` requires `CUSTOMER`.
- `GET /api/complaints` requires `ADMIN`.
- `PUT /api/complaints/{id}/validate` requires `ADMIN`.
- `GET /api/admin/users` requires `ADMIN`.

## 4. Authentication and User Information

Authentication uses JWT.

Login flow:
1. User submits email and password to `POST /api/auth/login`.
2. Backend validates credentials.
3. Backend returns a signed JWT.
4. Frontend stores the token in local storage.
5. `apiClient` sends the token as a Bearer token on protected requests.

Registration flow:
1. Customer submits name, email, password, and phone to `POST /api/auth/register`.
2. Backend creates a `CUSTOMER` account.
3. Backend returns a JWT immediately.

User table:

| Column | Purpose |
|--------|---------|
| `id` | Internal user ID. |
| `name` | User display name. |
| `email` | Login email, unique. |
| `phone` | Contact phone. |
| `password` | BCrypt password hash. |
| `role` | `CUSTOMER` or `ADMIN`. |
| `enabled` | Account active flag. |
| `created_at` | Creation timestamp. |
| `updated_at` | Last update timestamp. |

Auth endpoints:

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| `POST` | `/api/auth/register` | Public | Create a customer account. |
| `POST` | `/api/auth/login` | Public | Login and receive JWT. |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile. |
| `GET` | `/api/auth/check-role` | Authenticated | Return role flags. |
| `GET` | `/api/auth/customer-only` | CUSTOMER | Role test endpoint. |
| `GET` | `/api/auth/admin-only` | ADMIN | Role test endpoint. |

Admin user endpoint:

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| `GET` | `/api/admin/users` | ADMIN | Return all users for User Management. |

The frontend User Management page separates admin accounts and customer accounts, and lets admins open a user detail panel.

## 5. Complaint Domain Object

The main complaint entity is `Complaint`.

Important fields:

| Field | Meaning |
|-------|---------|
| `id` | Internal complaint ID. |
| `complaintCode` | Public complaint code, format `RC-YYYYMMDD-XXXX`. |
| `customer` | User who submitted the complaint. |
| `title` | Short complaint title. |
| `description` | Full complaint description. |
| `orderId` | Related order or tracking ID. |
| `phone` | Contact phone for the complaint. |
| `category` | `PRODUCT`, `SERVICE`, `DELIVERY`, `BILLING`, or `OTHER`. |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, or `URGENT`; null until admin validation. |
| `status` | Complaint lifecycle status: `PENDING`, `VALIDATING`, `RESOLVING`, or `RESOLVED`. |
| `validatedBy` | Admin who received/validated the complaint. |
| `assignedTo` | Admin assigned to resolving. |
| `approvedBy` | Admin who sent final response or completed rejection. |
| `investigationSummary` | Internal investigation and handling summary. |
| `rootCause` | Root cause found by admin. |
| `resolution` | Customer-facing solution/response. |
| `createdAt` | Creation timestamp. |
| `submittedAt` | Submission timestamp. |
| `validatedAt` | Validation timestamp. |
| `assignedAt` | Resolving assignment timestamp. |
| `resolvedAt` | Completion timestamp. |
| `editCount` | Number of customer edits while the complaint is still pending. |
| `editDeadline` | Optional deadline for customer edit. |

Priority rule:
- Customers do not set priority when submitting a complaint.
- Priority is assigned only by admin during validation.
- Complaints in `PENDING` or `VALIDATING` normally have `priority = null`.
- Complaints in `RESOLVING` or successful `RESOLVED` normally have priority.

Evidence:
- Customers must upload at least one evidence file when creating a complaint.
- Allowed file types: JPG, PNG, WEBP, PDF.
- Max file size: 10 MB per file.
- Files are stored under the configured upload directory.

## 6. Complaint Status Model

Complaints now have exactly four lifecycle statuses.

| Status | Meaning |
|--------|---------|
| `PENDING` | Customer submitted the complaint; admin has not received it yet. |
| `VALIDATING` | Admin received the complaint and checks whether it is valid. If invalid, admin can reject it. |
| `RESOLVING` | Complaint is validated and admin is handling it, including investigation, root cause, and solution. |
| `RESOLVED` | Complaint is completed. This includes successful resolutions and validation rejections. |

Rejection is not a complaint status.
Rejected complaints are stored as:
- `complaints.status = 'RESOLVED'`
- `complaint_validations.validation_status = 'INVALID'`
- `complaint_validations.rejection_reason` contains the rejection reason.

Frontend status display uses the same four labels:

| Backend Status | Display Status |
|----------------|----------------|
| `PENDING` | `Pending` |
| `VALIDATING` | `Validating` |
| `RESOLVING` | `Resolving` |
| `RESOLVED` | `Resolved` |

Admin rejected pages filter by `validationStatus = INVALID`, while the status badge remains `Resolved`.

## 7. Complaint Workflow

Successful workflow:

```text
PENDING -> VALIDATING -> RESOLVING -> RESOLVED
```

Rejected workflow:

```text
PENDING -> VALIDATING -> RESOLVED
```

Admin workflow pages:

| Step | Route | Data shown |
|------|-------|------------|
| Receive | `/admin/receive` | `PENDING` complaints. |
| Validate | `/admin/validate` | `VALIDATING` complaints with validation actions. |
| Process | `/admin/process` | `RESOLVING` complaints. |
| Response | `/admin/response` | Successfully `RESOLVED` complaints. |

Other admin complaint list routes:

| Route | Purpose |
|-------|---------|
| `/admin/complaints/all` | All complaints. |
| `/admin/complaints/pending` | Unfinished complaints: `PENDING`, `VALIDATING`, `RESOLVING`. |
| `/admin/complaints/resolved` | Successfully `RESOLVED` complaints. |
| `/admin/complaints/rejected` | Complaints completed through validation rejection. |

Validation actions:
- Valid complaint: admin sets checklist and priority, then complaint moves to `RESOLVING`.
- Invalid complaint: admin stores rejection reason and the complaint moves to `RESOLVED`.

Resolving actions:
- Admin records root cause and solution while complaint is `RESOLVING`.
- Admin sends final response.
- Complaint moves to `RESOLVED` and `resolvedAt` is set.

Resolution SLA:
- Every complaint must be completed within 15 days from `submittedAt`.
- A complaint is overdue when it is still not `RESOLVED` after 15 days.
- Admin dashboard and analysis pages highlight overdue complaints so they can be handled immediately.

## 8. Complaint API Reference

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| `POST` | `/api/complaints` | CUSTOMER | Submit complaint with evidence files. |
| `GET` | `/api/complaints/my` | CUSTOMER | Get current customer's complaints. |
| `GET` | `/api/complaints` | ADMIN | Get all complaints. |
| `GET` | `/api/complaints/submitted` | ADMIN | Get `PENDING` complaints for receive step. |
| `GET` | `/api/complaints/{code}` | CUSTOMER or ADMIN | Get complaint detail. |
| `GET` | `/api/complaints/statistics/monthly-volume` | ADMIN | Monthly complaint counts. |
| `PUT` | `/api/complaints/{id}/receive` | ADMIN | Move `PENDING` to `VALIDATING`. |
| `PUT` | `/api/complaints/{id}/validate` | ADMIN | Validate complaint, set priority, move to `RESOLVING`. |
| `PUT` | `/api/complaints/{id}/reject-validation` | ADMIN | Reject during validation and complete as `RESOLVED`. |
| `PUT` | `/api/complaints/{id}/resolution` | ADMIN | Save investigation/root cause/solution while `RESOLVING`. |
| `PUT` | `/api/complaints/{id}/send-response` | ADMIN | Send response and move to `RESOLVED`. |
| `PUT` | `/api/complaints/{id}` | CUSTOMER | Edit complaint while status is `PENDING`. |

## 9. Frontend Routes

Customer routes:

| Route | Page |
|-------|------|
| `/customer/dashboard` | Customer dashboard. |
| `/customer/complaints/new` | Submit complaint form. |
| `/customer/complaints` | Current customer's complaints. |
| `/customer/complaints/:complaintId` | Complaint detail. |
| `/customer/notifications` | Notifications. |
| `/customer/profile` | Profile. |

Admin routes:

| Route | Page |
|-------|------|
| `/admin/dashboard` | Admin dashboard. |
| `/admin/analysis` | Complaint analysis charts. |
| `/admin/users` | User management. |
| `/admin/receive` | Receive pending complaints. |
| `/admin/validate` | Validate complaints. |
| `/admin/process` | Resolve complaints. |
| `/admin/response` | Successfully resolved complaint listing. |
| `/admin/complaints/all` | All complaints. |
| `/admin/complaints/pending` | Unfinished complaints. |
| `/admin/complaints/resolved` | Successfully resolved complaints. |
| `/admin/complaints/rejected` | Validation-rejected complaints. |
| `/admin/complaints/:complaintId` | Admin complaint detail. |

## 10. Database and Seed Data

The schema is managed by:

```text
backend/src/main/resources/schema.sql
```

Seed data is managed by:

```text
backend/src/main/resources/data.sql
```

Default startup does not run SQL init:

```properties
spring.sql.init.mode=never
```

The seed profile runs schema and seed scripts:

```properties
spring.sql.init.mode=always
```

Seed data includes:
- 1 admin account.
- 100 customer accounts.
- 100 demo complaints distributed across `PENDING`, `VALIDATING`, `RESOLVING`, and `RESOLVED`.
- Validation records for validated and rejected demo complaints.

All seed accounts use:

```text
password123
```

Seed accounts:

| Email | Role |
|-------|------|
| `admin@test.com` | ADMIN |
| `customer001@gmail.com` through `customer100@gmail.com` | CUSTOMER |

Priority in seed:
- `PENDING` and `VALIDATING` complaints have no priority.
- `RESOLVING` and successful `RESOLVED` complaints have priority.
- Rejected complaints are `RESOLVED` with `validation_status = INVALID` and no priority.

## 11. Local Environment Setup

Required tools:

| Tool | Version |
|------|---------|
| Java JDK | 17 or higher |
| Maven | 3.6 or higher |
| PostgreSQL | 14 or higher |
| Node.js | 18 or higher |

Default backend database settings:

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `db` |
| Username | `postgres` |
| Password | `1` |

Create database:

```sql
CREATE DATABASE db;
```

Override database values with environment variables:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

## 12. Running the Project

Backend normal startup:

```powershell
cd backend
mvn spring-boot:run
```

Backend with reset seed:

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=seed"
```

Use quotes around `-Dspring-boot.run.profiles=seed` in PowerShell.

Backend URLs:

| URL | Purpose |
|-----|---------|
| `http://localhost:8080` | API base. |
| `http://localhost:8080/swagger-ui.html` | Swagger UI. |
| `http://localhost:8080/v3/api-docs` | OpenAPI JSON. |

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 13. Build and Verification

Backend tests:

```powershell
cd backend
mvn test
```

Frontend build:

```powershell
cd frontend
npm run build
```

## 14. Key Implementation Notes

Security:
- JWT is signed with HMAC-SHA256.
- JWT expiration defaults to 24 hours.
- Passwords use BCrypt.
- Public routes are limited to login/register and API documentation.

Backend initialization:
- `schema.sql` recreates tables when SQL init runs.
- `data.sql` truncates and seeds local demo data.
- Use seed profile only when intentionally resetting local data.

Frontend API:
- `frontend/src/services/apiClient.js` is the central Axios client.
- Auth APIs are in `frontend/src/services/authService.js`.
- Complaint APIs and status mapping are in `frontend/src/services/complaintService.js`.

Status handling:
- Use `rawStatus` when admin logic depends on backend workflow state.
- Use `status` for display labels.
- Use `validationStatus === "INVALID"` or `isRejected` when filtering rejected complaints.

Priority:
- Do not send priority from customer complaint submit forms.
- Only validation requests should include priority.

## 15. Rebuild Checklist for a New Developer

1. Install Java, Maven, PostgreSQL, and Node.js.
2. Create PostgreSQL database `db`.
3. Confirm backend DB credentials in `application.properties`.
4. Run backend seed profile:

   ```powershell
   cd backend
   mvn spring-boot:run "-Dspring-boot.run.profiles=seed"
   ```

5. Stop backend after seed startup completes.
6. Start backend normally:

   ```powershell
   mvn spring-boot:run
   ```

7. Start frontend:

   ```powershell
   cd ../frontend
   npm install
   npm run dev
   ```

8. Login with:

   ```text
   admin@test.com / password123
   ```

   or

   ```text
   customer001@gmail.com / password123
   ```

9. Validate the app:
   - Customer can submit a complaint.
   - Admin can receive, validate, resolve, and complete complaints.
   - Admin can view rejected complaints as validation-invalid resolved records.
   - Admin can view user management and analysis pages.
