import { ToastTheme, toast as toastInstance } from 'vue3-toastify';

export const toast = (message: string, theme = 'light', autoClose: number, onClose: () => void) => {
    return toastInstance(`<i class="fas fa-exclamation-circle me-2"></i> ${message}`, {
        theme: theme as ToastTheme,
        dangerouslyHTMLString: true,
        closeOnClick: false,
        autoClose,
        position: toastInstance.POSITION.BOTTOM_RIGHT,
        pauseOnHover: false,
        onClose,
    });
};

export function parseAxiosError(response: any) {
    return response && response.error // Axios error
        ? response.error.message
        : response.message;
}
