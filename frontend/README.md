# Resolution Center Frontend

React + Vite frontend for a complaint resolution portal with customer and staff/admin workflows.

## Requirements

- Node.js 18 or newer
- npm

## Setup

Install dependencies from this project folder:

```bash
npm install
```

## Run Locally

Start the Vite development server:

```bash
npm run dev
```

Then open the local URL printed by Vite, usually:

```txt
http://localhost:5173
```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Demo Accounts

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

## Main Routes

```txt
/login
/register
/customer/dashboard
/customer/complaints/new
/customer/notifications
/customer/profile
/admin/dashboard
/admin/complaints
/admin/complaint-status
/admin/staff
/admin/users
```

## Backend Integration Notes

The UI currently uses temporary mock/localStorage data for frontend development. When the backend is ready, move API calls into the files under `src/services/` and replace direct mock/localStorage usage with service calls.

Recommended service entry points:

- `src/services/authService.js`
- `src/services/complaintService.js`
- `src/services/notificationService.js`
- `src/services/staffService.js`
- `src/services/customerService.js`
- `src/services/fileUploadService.js`

## Project Structure

```txt
src/
  components/   Reusable UI components
  layouts/      Customer and admin layouts
  pages/        Route pages
  routes/       React Router configuration
  services/     Backend API integration layer
  mocks/        Temporary frontend seed data
  utils/        Shared helpers
```
