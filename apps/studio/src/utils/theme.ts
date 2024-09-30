export function getColor(colors: any[], label: string) {
    return Object.values(colors).find((color) => color.label === label)?.color;
}

export function getElement(elements: any[], label: string) {
    return Object.values(elements).find((element) => element.label === label)?.color;
}
