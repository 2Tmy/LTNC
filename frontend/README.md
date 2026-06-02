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

| Role | Email |
|------|-------|
| Admin | `admin@test.com` |
| Admin | `agent@test.com` |
| Customer | `alice@test.com` |
| Customer | `bob@test.com` |
| Customer | `charlie@test.com` |
| Customer | `diana@test.com` |
| Customer | `edward@test.com` |
| Customer | `fiona@test.com` |
| Customer | `george@test.com` |
| Customer | `hannah@test.com` |
| Customer | `ivan@test.com` |
| Customer | `julia@test.com` |

## Main Routes

```txt
/login
/register
/customer/dashboard
/customer/complaints/new
/customer/notifications
/customer/profile
/admin/dashboard
/admin/tiep-nhan
/admin/xem-xet
/admin/xu-ly
/admin/phan-hoi
/admin/users
```

Authentication, complaints, attachments, workflow transitions, account listing,
and customer notifications are connected to the backend APIs under `src/services/`.
