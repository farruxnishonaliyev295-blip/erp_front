import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";

const getInitialDark = () => {
  const saved = localStorage.getItem("learnix-theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDark);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("learnix-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Mavzuni almashtirish"
      className="p-2.5 rounded-xl hover:bg-muted transition-colors"
    >
      {dark ? <Sun className="w-5 h-5 text-foreground/70" /> : <Moon className="w-5 h-5 text-foreground/70" />}
    </button>
  );
}