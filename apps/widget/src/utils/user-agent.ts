const getIsMobile = () => {
    return window.matchMedia('(pointer:coarse)').matches;
};

export { getIsMobile };
