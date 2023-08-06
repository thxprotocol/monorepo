import { toast as toastInstance } from 'vue3-toastify';

export const toast = (message: string, autoClose: number, onOpen: () => void, onClose: () => void) => {
    return toastInstance(`<i class="fas fa-clock me-2"></i> ${message}`, {
        theme: 'dark',
        dangerouslyHTMLString: true,
        closeOnClick: false,
        autoClose,
        position: toastInstance.POSITION.BOTTOM_CENTER,
        pauseOnHover: false,
        onOpen,
        onClose,
    });
};