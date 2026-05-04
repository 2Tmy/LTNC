export const clearDemoAuth = () => {
  window.localStorage.removeItem("demoRole");
  window.localStorage.removeItem("demoBackendRole");
  window.localStorage.removeItem("demoEmail");
  window.localStorage.removeItem("demoName");
  window.localStorage.removeItem("demoCreatedAt");
  window.localStorage.removeItem("token");
};
