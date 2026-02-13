(() => {
  try {
    const t = localStorage.getItem("orbital-theme");
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      root.dataset.theme = "dark";
    } else if (t === "light") {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.dataset.theme = "light";
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      root.dataset.theme = "system";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.dataset.theme = "system";
    }
  } catch (e) {
    // best-effort: avoid blocking first paint due to storage access issues
  }
})();
