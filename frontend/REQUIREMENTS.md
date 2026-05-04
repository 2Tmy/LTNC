# Requirements

## Environment

- Node.js 18 or newer
- npm 9 or newer
- Modern browser such as Chrome, Edge, Firefox, or Safari

## Frontend Stack

- React 19
- Vite 6
- Tailwind CSS 3
- React Router
- Axios

## Installation

Install dependencies from the frontend project directory:

```bash
npm install
```

## Running

Development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Demo Login Accounts

Customer:

```txt
Email: my@gmail.com
Password: password123
```

Staff/Admin:

```txt
Email: admin@gmail.com
Password: 87654321
```

## Backend Requirements

The frontend is currently using temporary mock and localStorage data. A backend should provide these API groups:

```txt
Auth:
POST /auth/login
POST /auth/register
GET  /auth/me

Complaints:
GET    /complaints
POST   /complaints
GET    /complaints/:id
PATCH  /complaints/:id/status
PATCH  /complaints/:id/assign

Notifications:
GET   /notifications
PATCH /notifications/read

Admin:
GET /admin/dashboard
GET /staff
GET /users

Files:
POST /uploads
```

## Notes

- File uploads should use `FormData`.
- Auth should return a token or session and the user role.
- Protected routes require customer/admin role information.
- Mock files under `src/mocks/` should be removed after service files are connected to the backend.
