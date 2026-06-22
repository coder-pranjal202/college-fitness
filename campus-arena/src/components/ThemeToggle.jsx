import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-200 bg-white/[0.04] hover:bg-white/[0.1] ring-1 ring-white/[0.06] hover:ring-[#39ff78]/20"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun size={16} className="text-yellow-400/80 hover:text-yellow-300 transition-colors" />
      ) : (
        <Moon size={16} className="text-slate-600 hover:text-slate-700 transition-colors" />
      )}
    </button>
  );
}
