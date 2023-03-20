import Color from 'color';

export const parseThemeData = (themeData: string) => {
    const { elements, colors } = JSON.parse(themeData);
    return {
        elements: {
            btnText: elements['btnText'].color,
            btnBg: elements['btnBg'].color,
            btnBgDark: Color(elements['btnBg'].color).darken(0.4),
            btnBgDarker: Color(elements['btnBg'].color).darken(0.6),
            text: elements['text'].color,
            bodyBg: elements['bodyBg'].color,
            cardBg: elements['cardBg'].color,
            navbarBg: elements['navbarBg'].color,
            navbarBgDarker: Color(elements['navbarBg'].color).darken(0.4),
        },
        colors: {
            success: colors['success'].color,
            warning: colors['warning'].color,
            danger: colors['danger'].color,
            info: colors['info'].color,
        },
    };
};
