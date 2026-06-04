# Resolution Center Frontend

React + Vite frontend for a complaint resolution portal with two roles:
`CUSTOMER` submits complaints and `ADMIN` handles the full resolution flow.

## Requirements

- Node.js 18 or newer
- npm

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build

```bash
npm run build
```

## Demo Accounts

All test accounts use the password `password123`.

> Load seed data first: `cd backend && mvn spring-boot:run "-Dspring-boot.run.profiles=seed"`

| Role | Email | Notes |
|------|-------|-------|
| Admin | `admin@test.com` | Full admin access |
| Customer | `customer001@gmail.com` | Sample customer |
| Customer | `customer002@gmail.com` | Sample customer |
| Customer | `customer003@gmail.com` | Sample customer |
| Customer | `customer001@gmail.com` → `customer100@gmail.com` | 100 accounts total |

## Main Routes

```txt
/login
/register
/customer/dashboard
/customer/complaints/new
/customer/complaints
/customer/notifications
/customer/profile
/admin/dashboard
/admin/analysis
/admin/users
/admin/receive
/admin/validate
/admin/process
/admin/response
/admin/complaints/all
/admin/complaints/pending
/admin/complaints/resolved
/admin/complaints/rejected
```

Authentication, complaints, attachments, workflow transitions, account listing,
and customer notifications are connected to the backend APIs under `src/services/`.
