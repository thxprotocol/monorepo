import Color from 'color';

export function getStyles(elements: any, colors: any) {
    const theme = {
        elements: {
            bodyBg: elements['bodyBg'].color,
            text: elements['text'].color,
            btnBg: elements['btnBg'].color,
            btnBgDark: Color(elements['btnBg'].color).darken(0.2),
            btnBgDarker: Color(elements['btnBg'].color).darken(0.3),
            btnText: elements['btnText'].color,
            cardBg: elements['cardBg'].color,
            cardHeaderHoverBg: Color(elements['cardBg'].color).lighten(0.1),
            cardText: elements['cardText'].color,
            navbarBg: elements['navbarBg'].color,
            navbarBgDarker: Color(elements['navbarBg'].color).darken(0.4),
            navbarBtnBg: elements['navbarBtnBg'] ? elements['navbarBtnBg'].color : elements['btnBg'].color,
            navbarBtnText: elements['navbarBtnText'] ? elements['navbarBtnText'].color : elements['btnText'].color,
        },
        colors: {
            accent: colors['accent'].color,
            success: colors['success'].color,
            warning: colors['warning'].color,
            danger: colors['danger'].color,
            info: colors['info'].color,
        },
    };
    return {
        '.text-accent': {
            '--thx-accent': theme.colors.accent,
        },
        'body,.bg-splash': {
            '--bs-body-bg': theme.elements.bodyBg,
            '--bs-body-color': theme.elements.text,
        },
        'blockquote': {
            '--thx-blockquote-bg': theme.elements.bodyBg,
            '--thx-blockquote-border-color': theme.elements.btnBg,
            '--thx-blockquote-link-hover': theme.elements.text,
        },
        '.modal': {
            '--bs-modal-bg': theme.elements.navbarBg,
            '--bs-modal-color': theme.elements.btnText,
            '--bs-modal-border-color': theme.elements.btnBg,
        },
        '.form-control,.form-control:focus': {
            '--bs-body-bg': theme.elements.bodyBg,
            '--bs-btn-bg': theme.elements.btnBg,
        },
        '.dropdown-menu': {
            '--bs-dropdown-bg': theme.elements.btnBg,
            '--bs-dropdown-link-hover-bg': theme.elements.btnBgDarker,
            '--bs-dropdown-link-hover-color': theme.elements.btnText,
            '--bs-dropdown-link-active-bg': theme.elements.btnBgDarker,
            '--bs-dropdown-link-active-color': theme.elements.btnText,
        },
        '.card': {
            '--bs-card-bg': theme.elements.cardBg,
            '--bs-card-color': theme.elements.cardText,
            '--bs-card-cap-color': theme.elements.cardText,
            '--thx-card-header-hover-bg': theme.elements.cardHeaderHoverBg,
        },
        '.btn-primary': {
            '--bs-btn-color': theme.elements.btnText,
            '--bs-btn-bg': theme.elements.btnBg,
            '--bs-btn-border-color': theme.elements.btnBg,
            '--bs-btn-hover-color': theme.elements.btnText,
            '--bs-btn-hover-bg': theme.elements.btnBgDark,
            '--bs-btn-hover-border-color': theme.elements.btnBgDark,
            '--bs-btn-focus-color': theme.elements.btnText,
            '--bs-btn-focus-bg': theme.elements.btnBgDark,
            '--bs-btn-focus-border-color': theme.elements.btnBgDark,
            '--bs-btn-active-color': theme.elements.btnText,
            '--bs-btn-active-bg': theme.elements.btnBgDarker,
            '--bs-btn-active-border-color': theme.elements.btnBgDarker,
            '--bs-btn-disabled-color': theme.elements.btnText,
            '--bs-btn-disabled-bg': theme.elements.btnBg,
            '--bs-btn-disabled-border-color': theme.elements.btnBg,
        },
        '.navbar-top,.navbar-bottom': {
            '--thx-navbar-bg': theme.elements.navbarBg,
            '--thx-navbar-btn-bg': theme.elements.navbarBtnBg,
            '--thx-navbar-btn-color': theme.elements.navbarBtnText,
            '--thx-navbar-border-color': theme.elements.navbarBgDarker,
        },
        '.nav-tabs': {
            '--bs-nav-tabs-border-color': theme.elements.btnBgDark,
            '--bs-nav-link-color': theme.elements.btnBgDark,
            '--bs-nav-link-hover-color': theme.elements.btnBg,
        },
        '.nav-tabs .nav-link.active, .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-item .nav-link:hover': {
            '--bs-nav-tabs-link-active-color': theme.elements.text,
            '--bs-nav-tabs-link-active-bg': theme.elements.bodyBg,
            '--bs-nav-tabs-link-active-border-color': theme.elements.btnBgDark,
        },
    };
}
