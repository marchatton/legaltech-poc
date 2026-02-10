(() => {
  try {
    const t = localStorage.getItem("orbital-theme");
    if (t === "dark") document.documentElement.classList.add("dark");
    else if (t !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {
    // best-effort: avoid blocking first paint due to storage access issues
  }
})();

