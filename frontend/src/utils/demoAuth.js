export const clearDemoAuth = () => {
  window.localStorage.removeItem("demoRole");
  window.localStorage.removeItem("demoEmail");
  window.localStorage.removeItem("demoName");
};
