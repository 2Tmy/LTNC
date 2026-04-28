import { USER_ROLES } from "../routes/routePaths.js";

export const mockUsers = [
  {
    id: "customer-001",
    name: "Demo Customer",
    email: "my@gmail.com",
    password: "12345678",
    role: USER_ROLES.customer,
  },
  {
    id: "admin-001",
    name: "Demo Admin",
    email: "admin@gmail.com",
    password: "87654321",
    role: USER_ROLES.admin,
  },
];

export const authenticateMockUser = ({ email, password, role }) =>
  mockUsers.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password &&
      user.role === role
  );
