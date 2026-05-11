import { createSlice } from "@reduxjs/toolkit";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { theme: "light" } as ThemeState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
      applyTheme(state.theme);
    },
    loadTheme: (state) => {
      state.theme = getInitialTheme();
      applyTheme(state.theme);
    },
  },
});

export const { toggleTheme, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;
