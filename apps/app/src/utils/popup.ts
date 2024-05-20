export function createPopupWindow(width: number, height: number) {
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;

    return `width=${width},height=${height},left=${left},top=${top},""`;
}
