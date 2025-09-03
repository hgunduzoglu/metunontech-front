import { useEffect } from "react";

export default function ThemeSwitcher() {
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark-theme", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <div className="theme-switcher" id="themeSwitcher" onClick={toggleTheme}>
      <i className="icon fas fa-sun" />
      <div className="switch" />
      <i className="icon fas fa-moon" />
    </div>
  );
}
