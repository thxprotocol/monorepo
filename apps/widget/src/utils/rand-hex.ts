export const randHex = (size: number) =>
    [...Array(size)].map(() => Math.floor(Math.random() * size).toString(size)).join('');
