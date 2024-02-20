import { ToastTheme, toast as toastInstance } from 'vue3-toastify';

export const toast = (message: string, theme = 'dark', autoClose: number, onClose: () => void) => {
    return toastInstance(`<i class="fas fa-clock me-2"></i> ${message}`, {
        theme: theme as ToastTheme,
        dangerouslyHTMLString: true,
        closeOnClick: false,
        autoClose,
        position: toastInstance.POSITION.BOTTOM_CENTER,
        pauseOnHover: false,
        onClose,
    });
};
