import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("preferred-Theme") || "forest",
    setTheme: (theme) => {
        localStorage.setItem("preferredTheme", theme);
        set({ theme });
    },
}))