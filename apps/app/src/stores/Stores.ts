import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
    state: () => ({
        currentTheme: 'dark',
    }),
    actions: {
        setTheme(theme: string) {
            this.currentTheme = theme;
        },
    },
});
