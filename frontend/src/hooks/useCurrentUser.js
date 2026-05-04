import { useEffect, useState } from "react";
import { getMe } from "../services/authService.js";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCILdE8Jy3Lovzgf3qbggg6eMbkGXFMM0_IlYPeo47SssEUV8gxncDTDjX9AtQFqHLTwCmIZQ0hK6va9wvaiQM9lXBXTf63pZbGLzVDLMrt-4rO-cy-N-Nd9E80RfKk0uB0rkRsKHr52jdXzUnjEFj0CCykfJxZqtiin5iSCKPj6DfclgYRJGcvXQUwH4EmHkQ-e1ltK7_wJwrJ4LF4vMAOW4vxt6x7ZhunDPDJ1pdciokKBkOX2emCM48Z0eOTTzKFf9ra6mRlRBc7";

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
  const savedRole = localStorage.getItem("demoBackendRole") || null;
  const savedCreatedAt = localStorage.getItem("demoCreatedAt") || "";

  const [user, setUser] = useState({
    name: savedName,
    email: savedEmail,
    firstName: savedName.split(" ")[0],
    userId: null,
    role: savedRole,
    createdAt: savedCreatedAt,
    memberSince: formatMemberSince(savedCreatedAt),
    avatarUrl: DEFAULT_AVATAR,
  });

  useEffect(() => {
    getMe()
      .then((res) => {
        const { name, email, userId, role, createdAt } = res.data.data;
        localStorage.setItem("demoName", name);
        localStorage.setItem("demoEmail", email);
        localStorage.setItem("demoBackendRole", role);
        if (createdAt) {
          localStorage.setItem("demoCreatedAt", createdAt);
        }
        setUser({
          name,
          email,
          firstName: name.split(" ")[0],
          userId,
          role,
          createdAt,
          memberSince: formatMemberSince(createdAt),
          avatarUrl: DEFAULT_AVATAR,
        });
      })
      .catch(() => {
        // Keep localStorage values if token is invalid or request fails
      });
  }, []);

  return user;
}
