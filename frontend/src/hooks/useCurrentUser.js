import { useEffect, useState } from "react";
import { getMe } from "../services/authService.js";

const formatMemberSince = (createdAt) => {
  if (!createdAt) return "Not available";

  return new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

export function useCurrentUser() {
  const savedName = localStorage.getItem("demoName") || "User";
  const savedEmail = localStorage.getItem("demoEmail") || "";
  const savedPhone = localStorage.getItem("demoPhone") || "";
  const savedRole = localStorage.getItem("demoBackendRole") || null;
  const savedCreatedAt = localStorage.getItem("demoCreatedAt") || "";

  const [user, setUser] = useState({
    name: savedName,
    email: savedEmail,
    phone: savedPhone,
    firstName: savedName.split(" ")[0],
    userId: null,
    role: savedRole,
    createdAt: savedCreatedAt,
    memberSince: formatMemberSince(savedCreatedAt),
  });

  useEffect(() => {
    getMe()
      .then((res) => {
        const { name, email, phone, userId, role, createdAt } = res.data.data;
        localStorage.setItem("demoName", name);
        localStorage.setItem("demoEmail", email);
        localStorage.setItem("demoPhone", phone || "");
        localStorage.setItem("demoBackendRole", role);
        if (createdAt) {
          localStorage.setItem("demoCreatedAt", createdAt);
        }
        setUser({
          name,
          email,
          phone: phone || "",
          firstName: name.split(" ")[0],
          userId,
          role,
          createdAt,
          memberSince: formatMemberSince(createdAt),
        });
      })
      .catch(() => {
        // Keep localStorage values if token is invalid or request fails
      });
  }, []);

  return user;
}
