import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`w-10 h-10 rounded-full border border-white/10 bg-white/5 text-sm font-black text-[var(--saga-text)] hover:border-red-500/50 hover:bg-red-500/10 transition-all focus-ring ${className}`}
    >
      {theme === "dark" ? "☾" : "☼"}
    </button>
  );
}
