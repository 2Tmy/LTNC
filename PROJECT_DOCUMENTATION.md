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

---

## 2. Technology Stack

### 2.1 Backend

| Layer | Technology | Version |
|---|---|---|
| Framework | Spring Boot | 3.4.5 |
| Language | Java | 17 |
| Security | Spring Security 6, JJWT | 6.x / 0.12.3 |
| Password hashing | BCrypt | (via Spring Security) |
| Persistence | Spring Data JPA, Hibernate | (via Spring Boot) |
| Bean validation | Spring Boot Validation | (via Spring Boot) |
| Database driver | PostgreSQL JDBC | (via Spring Boot) |
| HTTP client (AI) | OkHttp3 | 4.12.0 |
| API documentation | SpringDoc OpenAPI | 2.8.3 |
| Code generation | Lombok | (via Spring Boot) |
| Env file loading | spring-dotenv | 4.0.0 |
| Build tool | Maven | 3.6+ |

### 2.2 Frontend

| Layer | Technology | Version |
|---|---|---|
| UI framework | React | ^19.0.0 |
| Routing | React Router DOM | ^7.1.1 |
| Build tool | Vite | ^6.0.7 |
| Styling | Tailwind CSS | ^3.4.17 |
| HTTP client | Axios | ^1.7.9 |
| Charts | Recharts | ^3.8.1 |
| CSS processor | PostCSS + Autoprefixer | 8.4.49 / 10.4.20 |
| React plugin | @vitejs/plugin-react | ^4.3.4 |

### 2.3 Database

| Layer | Technology |
|---|---|
| Database | PostgreSQL 14+ (local) |

---

## 3. Repository Structure

```text
complaints/
├── .github/modernize/             # GitHub Actions / Dependabot config
├── .vscode/                       # VS Code workspace settings
├── backend/
│   ├── database/
│   │   └── add-complaint-feedbacks.sql   # Non-destructive one-time migration
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/company/complaints/
│   │   │   │   ├── config/        # SecurityConfig, OpenApiConfig
│   │   │   │   ├── controller/    # REST API controllers (6 files)
│   │   │   │   ├── dto/           # Request and response DTOs
│   │   │   │   │   ├── request/   # Input DTOs (9+ files)
│   │   │   │   │   └── response/  # Output DTOs (8+ files)
│   │   │   │   ├── entity/        # JPA entities (6 files)
│   │   │   │   ├── enums/         # Domain enumerations (7 files)
│   │   │   │   ├── exception/     # CustomExceptions, GlobalExceptionHandler
│   │   │   │   ├── repository/    # Spring Data JPA repositories (6 files)
│   │   │   │   ├── security/      # JwtTokenProvider, JwtAuthenticationFilter, UserDetailsServiceImpl
│   │   │   │   ├── service/       # Business logic (6 files)
│   │   │   │   └── ComplaintsApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties       # Main config (local PostgreSQL)
│   │   │       ├── application-seed.properties  # Seed profile overrides
│   │   │       ├── schema.sql                   # Destructive DDL (6 tables)
│   │   │       └── data.sql                     # Demo seed data
│   │   └── test/java/com/company/complaints/
│   │       ├── auth/AuthServiceTest.java
│   │       ├── AnalysisServiceTest.java
│   │       └── ComplaintFeedbackServiceTest.java
│   ├── uploads/                   # Evidence file storage (local filesystem)
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── assets/styles/         # Global CSS files
│   │   ├── components/
│   │   │   ├── admin/             # AdminComplaintsTable, AdminMetricCard, PipelineStatusChart, WorkflowComplaintsList
│   │   │   ├── auth/              # LoginForm, RegisterForm
│   │   │   ├── complaint/         # ComplaintStatusBadge, ComplaintStepper, ComplaintTable, EvidenceFileList
│   │   │   ├── customer/          # StatCard
│   │   │   ├── notifications/     # NotificationItem, NotificationList
│   │   │   └── profile/           # AccountInfoCard, ProfileForm
│   │   ├── context/               # (reserved, currently empty)
│   │   ├── constants/             # (reserved, currently empty)
│   │   ├── hooks/
│   │   │   └── useCurrentUser.js  # Custom hook — fetches and caches user profile
│   │   ├── layouts/
│   │   │   ├── Sidebar.jsx        # Customer sidebar navigation
│   │   │   ├── AdminSidebar.jsx   # Admin sidebar navigation
│   │   │   ├── TopBar.jsx         # Customer header with user menu
│   │   │   └── AdminTopBar.jsx    # Admin header
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AnalysisPage.jsx
│   │   │   │   ├── complaints/    # AdminComplaintsListPage
│   │   │   │   ├── customer-service/ # ReceiveComplaintsPage, AdminComplaintDetailPage
│   │   │   │   ├── dashboard/     # AdminDashboardPage
│   │   │   │   ├── process/       # ValidateComplaintsPage, ProcessComplaintsPage, ResponseComplaintsPage
│   │   │   │   └── users/         # AdminUsersPage
│   │   │   ├── auth/              # LoginPage, RegisterPage
│   │   │   ├── customer/          # CustomerDashboardPage, MyComplaintsPage, SubmitComplaintPage, CustomerComplaintDetailPage
│   │   │   ├── errors/            # NotFoundPage, UnauthorizedPage
│   │   │   ├── notifications/     # NotificationsPage (shared by customer and admin)
│   │   │   └── profile/           # ProfilePage
│   │   ├── routes/
│   │   │   ├── AppRouter.jsx      # Main router with lazy-loaded pages
│   │   │   ├── protectedRoutes.jsx # ProtectedRoute + RoleRedirect guards
│   │   │   └── routePaths.js      # Route path constants and role constants
│   │   ├── services/
│   │   │   ├── apiClient.js       # Axios instance with JWT interceptor
│   │   │   ├── authService.js     # Auth API calls
│   │   │   ├── complaintService.js # Complaint API calls
│   │   │   └── notificationService.js
│   │   ├── utils/
│   │   │   └── demoAuth.js        # Demo authentication utilities
│   │   ├── App.jsx                # Root component
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind CSS base
│   ├── dist/                      # Vite production build output
│   ├── public/                    # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── PROJECT_DOCUMENTATION.md
└── README.md
```

---

## 4. Runtime Architecture

```text
Browser
  │
  │  React SPA — http://localhost:5173
  │  JWT token stored in localStorage
  │  Axios adds "Authorization: Bearer <token>" on every request
  │
  ▼
Vite Dev Proxy  /api  →  http://localhost:8080      (local development only)
  │
  ▼
Spring Boot REST API — http://localhost:8080
  │  JwtAuthenticationFilter reads and validates JWT
  │  Spring Security enforces role-based access
  │  Spring Data JPA / Hibernate maps entities
  │
  ▼
PostgreSQL — localhost:5432

Optional external call:
Spring Boot → OpenAI API  (only when ADMIN clicks "Generate" on the Analysis page)
```

In production, set `VITE_API_BASE_URL` in the frontend so Axios calls the deployed backend
directly without a proxy.

---

## 5. Environment Configuration

### 5.1 Backend environment

Create `backend/.env`. The `spring-dotenv` dependency loads this file at startup.

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
| `JWT_EXPIRATION` | `86400000` | Token lifetime in milliseconds (24 h) |
| `OPENAI_API_KEY` | Empty | Optional OpenAI key |
| `OPENAI_API_URL` | OpenAI chat completions URL | AI endpoint |
| `OPENAI_MODEL` | `gpt-5-mini` | AI model |
| `OPENAI_MAX_TOKENS` | `2500` | Maximum completion tokens |
| `CORS_ALLOWED_ORIGINS` | Local frontend origins | Comma-separated allowed origins |
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

---

## 6. Database Initialization

### 6.1 Create the database

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/db
spring.datasource.username=postgres
spring.datasource.password=your-postgres-password
```

Create the database:

```bash
psql -h localhost -U postgres -c "CREATE DATABASE db;"
```

#### Configuration files

`application.properties` — sets `spring.sql.init.mode=never` and
`spring.jpa.hibernate.ddl-auto=update` by default. Normal startup preserves all data.

`application-seed.properties` — activated by `-Dspring-boot.run.profiles=seed`. Overrides
`spring.sql.init.mode=always` and `spring.jpa.defer-datasource-initialization=true`.
`schema.sql` drops all tables with CASCADE and recreates them. `data.sql` truncates users and
inserts the full demo dataset.

### 6.2 Seed profile for a new environment

Run once to reset the database:

```bash
# macOS/Linux
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=seed

# PowerShell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=seed"
```

The seed profile runs:

1. `schema.sql` — drops and recreates all application tables.
2. `data.sql` — inserts demo users, complaints, validations, and feedback.

Stop the seeded backend after startup and restart without the seed profile.

> The seed profile is destructive. Never use it against a database whose data must be
> preserved.

### 6.3 Normal startup

```bash
cd backend
mvn clean compile spring-boot:run
```

`init.mode=never` — no SQL scripts run on startup.
`ddl-auto=update` — Hibernate only adds new columns or tables when entities change. Existing
data and schema remain untouched.

### 6.4 Existing database migration

Databases created before the customer feedback feature need this one-time migration:

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

---

## 7. Seed Data

The demo dataset contains:

- 1 administrator.
- 100 customers.
- 100 complaints across all workflow stages.
- Validation records for valid and rejected complaints.
- Sample feedback for successfully resolved complaints.
- Intentionally overdue complaints for SLA dashboards.

All seeded accounts use:

```text
password123
```

| Role | Email |
|---|---|
| ADMIN | `admin@test.com` |
| CUSTOMER | `customer001@gmail.com` through `customer100@gmail.com` |

---

## 8. Authentication and Authorization

### 8.1 Login flow

```text
1. User submits credentials  →  POST /api/auth/login
2. Backend authenticates via UserDetailsServiceImpl (BCrypt password check)
3. Backend returns signed JWT containing: sub (email), role (CUSTOMER/ADMIN), exp (expiry)
4. Frontend stores JWT in localStorage["token"]
5. Axios request interceptor reads token and adds "Authorization: Bearer <token>" header
6. ProtectedRoute (client-side) decodes JWT payload (no library) to check role and expiry
7. Spring JwtAuthenticationFilter validates JWT on every protected request
8. Controllers use @PreAuthorize for method-level role enforcement
```

Example request header:

```http
Authorization: Bearer eyJ...
```

JWT expiration defaults to 24 hours (86,400,000 ms).

### 8.2 Client-side route protection

`ProtectedRoute` in `protectedRoutes.jsx` decodes the JWT payload without any library:

```text
1. Read token from localStorage
2. Split JWT by "." and base64-decode the middle segment (payload)
3. Check payload.role exists and payload.exp * 1000 > Date.now()
4. If invalid → redirect to /login
5. If role not in allowedRoles → redirect to /unauthorized
6. If valid → render child routes via <Outlet />
```

`RoleRedirect` on the root path `/` sends ADMIN to `/admin/dashboard` and CUSTOMER to
`/customer/dashboard`.

### 8.3 localStorage keys

The frontend caches user information in localStorage to avoid repeated API calls:

| Key | Purpose |
|---|---|
| `token` | JWT access token |
| `demoName` | Cached display name |
| `demoEmail` | Cached email |
| `demoPhone` | Cached phone number |
| `demoBackendRole` | Cached role string (`CUSTOMER` / `ADMIN`) |
| `demoCreatedAt` | Cached account creation date |
| `demoRole` | Legacy role key (cleared on 401) |

All keys are cleared when the backend returns `401 Unauthorized`, then the user is redirected
to `/login`.

### 8.4 Roles

| Role | Permissions |
|---|---|
| `CUSTOMER` | Own complaints, own feedback, own notifications |
| `ADMIN` | All complaints, workflow actions, user management, analytics |

Public registration always creates a `CUSTOMER`. Administrator accounts come from seed data or
controlled database provisioning.

### 8.5 Public endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- Swagger/OpenAPI resources

All other application endpoints require a valid JWT. Controllers use `@PreAuthorize` for
role-specific operations.

---

## 9. Backend Package Architecture

### 9.1 Package overview

```text
com.company.complaints/
├── ComplaintsApplication.java     # Spring Boot entry point
├── config/
│   ├── SecurityConfig.java        # JWT filter chain, CORS, public endpoints, BCrypt bean
│   └── OpenApiConfig.java         # Swagger JWT scheme and API metadata
├── controller/
│   ├── AuthController.java        # /api/auth/**
│   ├── ComplaintController.java   # /api/complaints/**
│   ├── ComplaintAttachmentController.java  # /api/attachments/**
│   ├── NotificationController.java # /api/notifications/**
│   ├── AnalysisController.java    # /api/analysis/**
│   └── AdminUserController.java   # /api/admin/users
├── service/
│   ├── AuthService.java           # Registration, login, JWT issuance
│   ├── ComplaintService.java      # Complaint lifecycle and workflow transitions
│   ├── ComplaintAttachmentService.java  # File upload/download/storage
│   ├── NotificationService.java   # Notification creation for workflow events
│   ├── AnalysisService.java       # Metrics aggregation and SLA calculation
│   └── OpenAiService.java         # Optional AI insights via OkHttp3
├── repository/
│   ├── UserRepository.java
│   ├── ComplaintRepository.java
│   ├── ComplaintValidationRepository.java
│   ├── ComplaintFeedbackRepository.java
│   ├── ComplaintAttachmentRepository.java
│   └── NotificationRepository.java
├── entity/
│   ├── User.java
│   ├── Complaint.java
│   ├── ComplaintValidation.java
│   ├── ComplaintFeedback.java
│   ├── ComplaintAttachment.java
│   └── Notification.java
├── dto/
│   ├── request/                   # LoginRequest, RegisterRequest, CreateComplaintRequest,
│   │                              #   ValidateComplaintRequest, RejectValidationRequest,
│   │                              #   ProposeResolutionRequest, SubmitFeedbackRequest, …
│   └── response/                  # ApiResponse, AuthResponse, ComplaintResponse,
│                                  #   ComplaintFeedbackResponse, NotificationResponse, …
├── enums/
│   ├── Role.java                  # CUSTOMER, ADMIN
│   ├── ComplaintStatus.java       # PENDING, VALIDATING, RESOLVING, RESOLVED
│   ├── Priority.java              # LOW, MEDIUM, HIGH, URGENT
│   ├── Category.java              # PRODUCT, SERVICE, DELIVERY, BILLING, OTHER
│   ├── ValidationStatus.java      # VALID, INVALID
│   ├── NotificationType.java      # COMPLAINT_RECEIVED, VALIDATION_VALID, … CUSTOMER_FEEDBACK
│   └── ActionType.java            # Action audit types
├── security/
│   ├── JwtTokenProvider.java      # Token creation and validation (JJWT 0.12.x)
│   ├── JwtAuthenticationFilter.java  # OncePerRequestFilter: extracts and validates JWT
│   └── UserDetailsServiceImpl.java   # Loads User by email for BCrypt comparison
└── exception/
    ├── CustomExceptions.java      # Domain-specific exception classes
    └── GlobalExceptionHandler.java   # @ControllerAdvice: maps exceptions to HTTP responses
```

### 9.2 Request-response flow

```text
HTTP Request
    │
    ▼
JwtAuthenticationFilter
    │  reads Authorization header
    │  validates JWT via JwtTokenProvider
    │  sets SecurityContext
    │
    ▼
Spring Security (SecurityConfig)
    │  checks endpoint access rules
    │  @PreAuthorize on controller methods
    │
    ▼
Controller  (thin layer: validates DTO, calls service)
    │
    ▼
Service     (business logic, workflow rules, validation)
    │
    ▼
Repository  (Spring Data JPA query methods)
    │
    ▼
PostgreSQL  (via Hibernate/JDBC)
    │
    ▼
Service     (maps entity → response DTO)
    │
    ▼
Controller  (wraps in ApiResponse envelope)
    │
    ▼
HTTP Response  { "success": true, "message": "...", "data": {...} }
```

---

## 10. Frontend Architecture

### 10.1 State management

The frontend has no Redux, Zustand, or React Context store. All state is managed through:

| Mechanism | What it stores |
|---|---|
| `localStorage` | JWT token, cached user profile fields |
| React `useState` / `useEffect` | Component-local data fetched from the API |
| `useCurrentUser` hook | Shared user profile (reads localStorage, syncs with `/api/auth/me`) |

### 10.2 Component hierarchy

```text
main.jsx
└── App.jsx
    └── AppRouter.jsx  (BrowserRouter + Suspense)
        ├── /login                → LoginPage
        │     └── LoginForm
        ├── /register             → RegisterPage
        │     └── RegisterForm
        │
        ├── ProtectedRoute [CUSTOMER]
        │   ├── Sidebar + TopBar  (layout wrapping Outlet)
        │   ├── /customer/dashboard        → CustomerDashboardPage
        │   │     └── StatCard (×n)
        │   ├── /customer/complaints/new   → SubmitComplaintPage
        │   ├── /customer/complaints       → MyComplaintsPage
        │   │     └── ComplaintTable
        │   │           └── ComplaintStatusBadge
        │   ├── /customer/complaints/:id   → CustomerComplaintDetailPage
        │   │     ├── ComplaintStepper
        │   │     ├── ComplaintStatusBadge
        │   │     └── EvidenceFileList
        │   ├── /customer/notifications    → NotificationsPage
        │   │     └── NotificationList → NotificationItem (×n)
        │   └── /customer/profile          → ProfilePage
        │         ├── AccountInfoCard
        │         └── ProfileForm
        │
        └── ProtectedRoute [ADMIN]
            ├── AdminSidebar + AdminTopBar  (layout wrapping Outlet)
            ├── /admin/dashboard           → AdminDashboardPage
            │     ├── AdminMetricCard (×n)
            │     └── PipelineStatusChart
            ├── /admin/receive             → ReceiveComplaintsPage
            │     └── WorkflowComplaintsList
            ├── /admin/validate            → ValidateComplaintsPage
            │     └── WorkflowComplaintsList
            ├── /admin/process             → ProcessComplaintsPage
            │     └── WorkflowComplaintsList
            ├── /admin/response            → ResponseComplaintsPage
            │     └── WorkflowComplaintsList
            ├── /admin/complaints/all      → AdminComplaintsListPage (type="all")
            │     └── AdminComplaintsTable
            ├── /admin/complaints/pending  → AdminComplaintsListPage (type="pending")
            ├── /admin/complaints/resolved → AdminComplaintsListPage (type="resolved")
            ├── /admin/complaints/rejected → AdminComplaintsListPage (type="rejected")
            ├── /admin/complaints/:id      → AdminComplaintDetailPage
            │     ├── ComplaintStepper
            │     └── ComplaintStatusBadge
            ├── /admin/users               → AdminUsersPage
            ├── /admin/notifications       → NotificationsPage (shared)
            │     └── NotificationList → NotificationItem (×n)
            └── /admin/analysis            → AnalysisPage
                  └── Recharts charts (bar, line, pie)
```

All pages are lazy-loaded with `React.lazy()` and wrapped in `<Suspense>`. A spinner is shown
while the chunk loads.

### 10.3 Service layer

```text
apiClient.js
    Axios instance: baseURL = VITE_API_BASE_URL || ""
    Request interceptor: reads localStorage["token"] → adds Bearer header
    Response interceptor: on 401 → clears all localStorage keys → redirects to /login

authService.js          → /api/auth/**
complaintService.js     → /api/complaints/**, /api/attachments/**
notificationService.js  → /api/notifications/**
(Analysis calls are made directly inside AnalysisPage using apiClient)
```

### 10.4 Lazy loading and routing

`AppRouter.jsx` uses `React.lazy()` for every page component. This splits the bundle into
per-page chunks that are only downloaded when that route is first visited.

```text
/ (root)
└── RoleRedirect
      ├── ADMIN  → /admin/dashboard
      └── CUSTOMER → /customer/dashboard
      └── no token → /login
```

Redirect aliases:
- `/admin/complaints` → `/admin/complaints/all`
- `/admin/complaint-status` → `/admin/process`
- `*` → `NotFoundPage`

---

## 11. Database Schema and Entity Relationships

### 11.1 Entity relationship overview

```text
users (1) ──< complaints (N)          customer_id FK → users.id  (CASCADE DELETE)
users (1) ──< complaints (N)          validated_by FK → users.id
users (1) ──< complaints (N)          assigned_to  FK → users.id
users (1) ──< complaints (N)          approved_by  FK → users.id

complaints (1) ──< complaint_validations (1)   complaint_id FK (UNIQUE, CASCADE DELETE)
complaints (1) ──< complaint_feedbacks   (1)   complaint_id FK (UNIQUE, CASCADE DELETE)
complaints (1) ──< complaint_attachments (N)   complaint_id FK (CASCADE DELETE)
complaints (1) ──< notifications         (N)   complaint_id FK (CASCADE DELETE)

users (1) ──< complaint_feedbacks   (N)        customer_id FK → users.id (CASCADE DELETE)
users (1) ──< complaint_attachments (N)        uploaded_by FK → users.id
users (1) ──< notifications         (N)        user_id     FK → users.id (CASCADE DELETE)
complaint_validations (N) ──> users (1)        validated_by FK → users.id
```

### 11.2 Tables and columns

**users**

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGSERIAL | PK |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `phone` | VARCHAR(50) | nullable |
| `password` | VARCHAR(255) | BCrypt hash |
| `role` | VARCHAR(50) | CHECK IN ('CUSTOMER','ADMIN') |
| `enabled` | BOOLEAN | DEFAULT TRUE |
| `created_at`, `updated_at` | TIMESTAMP | DEFAULT NOW() |

**complaints**

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGSERIAL | PK |
| `complaint_code` | VARCHAR(50) | UNIQUE — format `RC-YYYYMMDD-XXXX` |
| `customer_id` | BIGINT | FK → users.id (CASCADE DELETE) |
| `title` | VARCHAR(500) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `order_id`, `phone` | VARCHAR | nullable |
| `category` | VARCHAR(100) | CHECK (PRODUCT/SERVICE/DELIVERY/BILLING/OTHER) |
| `priority` | VARCHAR(50) | CHECK (LOW/MEDIUM/HIGH/URGENT) — set by admin |
| `status` | VARCHAR(50) | DEFAULT 'PENDING', CHECK (PENDING/VALIDATING/RESOLVING/RESOLVED) |
| `investigation_summary`, `root_cause`, `resolution` | TEXT | nullable |
| `validated_by`, `assigned_to`, `approved_by` | BIGINT | FK → users.id |
| `submitted_at`, `validated_at`, `assigned_at`, `resolved_at` | TIMESTAMP | workflow timestamps |
| `edit_count`, `last_edited_at`, `edit_deadline` | | pending-edit tracking |

**complaint_validations**

| Column | Type | Notes |
|---|---|---|
| `complaint_id` | BIGINT | UNIQUE FK — one validation per complaint |
| `validated_by` | BIGINT | FK → users.id |
| `validation_status` | VARCHAR(50) | VALID or INVALID |
| `is_information_complete` … `is_evidence_valid` | BOOLEAN | 5-item checklist |
| `rejection_reason`, `missing_information`, `validation_notes` | TEXT | nullable |

**complaint_feedbacks**

| Column | Type | Notes |
|---|---|---|
| `complaint_id` | BIGINT | UNIQUE FK — one feedback per complaint |
| `customer_id` | BIGINT | FK → users.id |
| `rating` | INTEGER | CHECK BETWEEN 1 AND 5 |
| `comment` | TEXT | optional, max 1000 chars |

**complaint_attachments**

| Column | Type | Notes |
|---|---|---|
| `complaint_id` | BIGINT | FK — multiple files per complaint |
| `uploaded_by` | BIGINT | FK → users.id |
| `file_name`, `file_type`, `file_size`, `file_path` | | file metadata |
| `is_evidence`, `is_initial_upload` | BOOLEAN | upload classification |

**notifications**

| Column | Type | Notes |
|---|---|---|
| `user_id` | BIGINT | FK → users.id (CASCADE DELETE) |
| `complaint_id` | BIGINT | FK → complaints.id (CASCADE DELETE) |
| `type` | VARCHAR(50) | see NotificationType enum |
| `action_url` | VARCHAR(500) | deep link to the complaint detail page |
| `is_read`, `read_at` | BOOLEAN / TIMESTAMP | read tracking |

### 11.3 Database indexes

| Table | Indexes |
|---|---|
| users | email, role |
| complaints | complaint_code (unique), customer_id, status, priority, category, (status+priority), submitted_at, resolved_at |
| complaint_validations | complaint_id, validated_by, validation_status |
| complaint_feedbacks | (customer_id + updated_at) |
| complaint_attachments | complaint_id, uploaded_by |
| notifications | (user_id + created_at), (user_id + is_read) |

---

## 12. Main Domain Model

### 12.1 Users

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

### 12.2 Complaints

| Column | Purpose |
|---|---|
| `id` | Internal primary key |
| `complaint_code` | Public code — format `RC-YYYYMMDD-XXXX` |
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

### 12.3 Complaint validations

The validation record stores:

- Checklist results (5 boolean fields).
- `VALID` or `INVALID` outcome.
- Rejection reason and missing information.
- Validation notes and timestamp.

Rejected complaints are represented as:

```text
complaints.status = RESOLVED
complaint_validations.validation_status = INVALID
```

### 12.4 Evidence attachments

Evidence metadata is stored in `complaint_attachments`.
File bytes are stored under `COMPLAINTS_UPLOAD_DIR` on the local filesystem.

Rules:

- At least one evidence file is required during complaint submission.
- Supported types: JPG, PNG, WEBP, PDF.
- Maximum file size: 10 MB per file.
- Maximum multipart request size: 30 MB.

### 12.5 Complaint feedback

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
- The complaint status is `RESOLVED`.
- A non-empty final resolution has been sent.
- The complaint was not rejected during validation (`validation_status != INVALID`).

Submitting again updates the existing feedback record.

### 12.6 Notifications

Notifications are stored per user and always reference a complaint.

| `NotificationType` | Trigger |
|---|---|
| `COMPLAINT_RECEIVED` | Admin receives PENDING complaint |
| `VALIDATION_VALID` | Complaint passes validation |
| `VALIDATION_REJECTED` | Complaint fails validation |
| `VALIDATION_NEED_INFO` | Admin requests more information |
| `STATUS_CHANGE` | Complaint moves to RESOLVING or RESOLVED |
| `ASSIGNED` | Complaint assigned to admin |
| `CUSTOMER_FEEDBACK` | Customer submits a rating |
| `EDIT_REMINDER` | Reminder to edit pending complaint |
| `EDIT_DEADLINE_PASSED` | Edit window has closed |
| `NEW_COMMENT` | New comment added |

`action_url` links the customer to the customer complaint detail page, or links the handling
admin to the admin complaint detail page.

---

## 13. Complaint Workflow

### 13.1 Successful flow

```text
PENDING  →  VALIDATING  →  RESOLVING  →  RESOLVED
```

| Stage | Actors | Main actions |
|---|---|---|
| `PENDING` | CUSTOMER submits; ADMIN receives | Customer submits with files; Admin clicks Receive |
| `VALIDATING` | ADMIN validates | Checks 5-item checklist, assigns priority, sets validated_by |
| `RESOLVING` | ADMIN investigates | Records root cause, investigation summary, prepares resolution |
| `RESOLVED` | ADMIN sends final response | Sends customer-facing resolution; customer can now submit feedback |

### 13.2 Rejected flow

```text
PENDING  →  VALIDATING  →  RESOLVED  (validation_status = INVALID)
```

Rejection is a validation result, not a fifth complaint status.
The customer sees the rejection reason and cannot submit feedback for that complaint.

### 13.3 Customer edit rule

Customers can edit `title` and `description` only while the complaint is still `PENDING`
and any configured edit deadline has not passed.

---

## 14. Customer Feedback Flow

```text
Admin sends final response
        │
        ▼
Customer sees resolution on complaint detail page
        │
        ▼
Customer submits 1–5 stars and optional comment
        │
        ├─▶ Feedback stored in complaint_feedbacks (PostgreSQL)
        │
        ├─▶ Handling admin receives CUSTOMER_FEEDBACK notification
        │
        └─▶ Rating appears in:
              - Admin complaint detail view
              - Admin resolved complaint list
              - Admin notifications
              - Analysis page (Customer Feedback section)
```

---

## 15. Analysis and SLA

### 15.1 Database statistics

`GET /api/analysis/stats` aggregates:

- Total complaints.
- Counts by status and category.
- Monthly volume trends.
- SLA breaches and warnings.
- Average resolution time.
- Rejection rate.
- Customer statistics.
- Total feedback responses, average rating, response rate, low-rating count, 1–5 star distribution.

This endpoint does not call OpenAI.

### 15.2 Optional AI Insights

AI generation happens only through:

```text
POST /api/analysis/ai
```

The frontend calls this endpoint only when an administrator clicks **Generate** on the Analysis
page. The request uses current database statistics to produce:

- Six-month trend summary.
- Root-cause observations.
- Next-month prediction.
- Immediate, short-term, and weekly action recommendations.

Without a valid `OPENAI_API_KEY`, the rest of the application continues to run and database
statistics remain available.

### 15.3 SLA business rule

```text
SLA_DAYS = 15
WARNING_WINDOW = final 3 days (days 12–15)
```

- Open for more than 15 days → SLA breach.
- Open from day 12 through day 15 → SLA warning.

Operational health:

| Health | Rule |
|---|---|
| `HEALTHY` | No SLA breaches and average resolution time below 10 days |
| `WARNING` | At least one breach, or average resolution time 10–15 days |
| `CRITICAL` | More than 5 breaches, or average resolution time above 15 days |

The 15-day value is declared in backend analysis logic and referenced in frontend complaint
display logic.

---

## 16. API Reference

All API responses use the application response envelope:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

### 16.1 Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer and return JWT |
| `POST` | `/api/auth/login` | Public | Authenticate and return JWT |
| `GET` | `/api/auth/me` | Authenticated | Current user profile |
| `GET` | `/api/auth/check-role` | Authenticated | Role information |
| `GET` | `/api/auth/customer-only` | CUSTOMER | Role test |
| `GET` | `/api/auth/admin-only` | ADMIN | Role test |

### 16.2 Complaints

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/complaints` | CUSTOMER | Submit multipart complaint with evidence files |
| `GET` | `/api/complaints/my` | CUSTOMER | Customer's own complaints |
| `GET` | `/api/complaints` | ADMIN | All complaints |
| `GET` | `/api/complaints/submitted` | ADMIN | Pending receive queue |
| `GET` | `/api/complaints/{code}` | CUSTOMER or ADMIN | Complaint detail by code |
| `GET` | `/api/complaints/statistics/monthly-volume` | ADMIN | Monthly volume data |
| `PUT` | `/api/complaints/{id}` | CUSTOMER | Edit a PENDING complaint |
| `PUT` | `/api/complaints/{id}/receive` | ADMIN | Move to VALIDATING |
| `PUT` | `/api/complaints/{id}/validate` | ADMIN | Validate and assign priority |
| `PUT` | `/api/complaints/{id}/reject-validation` | ADMIN | Reject and complete |
| `PUT` | `/api/complaints/{id}/resolution` | ADMIN | Save root cause and resolution |
| `PUT` | `/api/complaints/{id}/send-response` | ADMIN | Send final response → RESOLVED |
| `PUT` | `/api/complaints/{code}/feedback` | CUSTOMER | Create or update feedback |

Feedback request body:

```json
{
  "rating": 5,
  "comment": "The resolution was clear and helpful."
}
```

### 16.3 Attachments

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/attachments/{id}/content` | Authorized user | View or download evidence file |

### 16.4 Notifications

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/notifications/my` | Authenticated | Current user's notifications |
| `PUT` | `/api/notifications/{id}/read` | Notification owner | Mark one notification as read |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read |

### 16.5 Analysis and users

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/analysis/stats` | ADMIN | Database statistics (no AI) |
| `POST` | `/api/analysis/ai` | ADMIN | Generate AI insights via OpenAI |
| `GET` | `/api/admin/users` | ADMIN | List all users |

Interactive API documentation:

```text
http://localhost:8080/swagger-ui.html
http://localhost:8080/v3/api-docs
```

---

## 17. Frontend Routes

### 17.1 Customer routes

| Route | Page |
|---|---|
| `/customer/dashboard` | Complaint dashboard with stats |
| `/customer/complaints/new` | Submit a new complaint |
| `/customer/complaints` | Customer complaint list |
| `/customer/complaints/:complaintId` | Complaint detail, resolution, and feedback form |
| `/customer/notifications` | Customer notifications |
| `/customer/profile` | Account information |

### 17.2 Administrator routes

| Route | Page |
|---|---|
| `/admin/dashboard` | Admin overview with pipeline chart |
| `/admin/receive` | Receive `PENDING` complaints |
| `/admin/validate` | Validate `VALIDATING` complaints |
| `/admin/process` | Investigate `RESOLVING` complaints |
| `/admin/response` | View successfully resolved complaints |
| `/admin/complaints/all` | All complaints list |
| `/admin/complaints/pending` | Unfinished complaints |
| `/admin/complaints/resolved` | Successfully resolved complaints |
| `/admin/complaints/rejected` | Validation-rejected complaints |
| `/admin/complaints/:complaintId` | Admin complaint detail with workflow actions |
| `/admin/users` | User management |
| `/admin/notifications` | Admin notifications and feedback alerts |
| `/admin/analysis` | Operational and feedback analytics |

---

## 18. Running the Application

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

---

## 19. Testing and Build Verification

Backend unit tests:

```bash
cd backend
mvn test
```

Test coverage:

| File | Scope |
|---|---|
| `AuthServiceTest.java` | Login, registration, JWT issuance |
| `AnalysisServiceTest.java` | Statistics aggregation and SLA calculation |
| `ComplaintFeedbackServiceTest.java` | Feedback submission rules |

Backend package:

```bash
mvn clean package
```

Frontend production build:

```bash
cd frontend
npm install
npm run build
npm run preview
```

---

## 20. New Developer Verification Checklist

After setup, verify these flows:

1. Sign in as `customer001@gmail.com`.
2. Submit a complaint with at least one evidence file.
3. Sign in as `admin@test.com`.
4. Receive the complaint (moves to VALIDATING).
5. Validate it and assign priority.
6. Record root cause and resolution (moves to RESOLVING).
7. Send the final response (moves to RESOLVED).
8. Sign in again as the customer.
9. Open the resolved complaint and submit a star rating.
10. Sign in as admin and confirm the CUSTOMER_FEEDBACK notification.
11. Open Analysis and confirm Customer Feedback metrics are updated.
12. Click **Generate** only when testing AI Insights (requires `OPENAI_API_KEY`).

---

## 21. Operational Notes

- `schema.sql` is destructive when SQL initialization is enabled.
- Normal startup preserves all data: `spring.sql.init.mode=never`.
- `ddl-auto=update` — Hibernate adds missing columns or tables; existing data is preserved.
- Evidence files are stored on the local filesystem under `uploads/`, not in PostgreSQL.
- The default database password and JWT secret are for local convenience only.
- Production deployments must provide secure environment variables.
- Production frontend deployments must set `VITE_API_BASE_URL` when no reverse proxy is used.
- Production CORS origins must be provided through `CORS_ALLOWED_ORIGINS`.
- AI Insights are optional and do not block complaint operations when `OPENAI_API_KEY` is empty.
