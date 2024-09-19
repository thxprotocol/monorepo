import Color from 'color';

export const DEFAULT_ELEMENTS = {
    btnBg: {
        label: 'Button',
        color: '#5942c1',
    },
    btnText: {
        label: 'Button Text',
        color: '#FFFFFF',
    },
    text: {
        label: 'Text',
        color: '#FFFFFF',
    },
    bodyBg: {
        label: 'Background',
        color: '#241956',
    },
    cardBg: {
        label: 'Card',
        color: '#31236d',
    },
    cardText: {
        label: 'Card Text',
        color: '#FFFFFF',
    },
    navbarBg: {
        label: 'Navigation',
        color: '#31236d',
    },
    navbarBtnBg: {
        label: 'Navigation Button',
        color: '#5942c1',
    },
    navbarBtnText: {
        label: 'Navigation Button Text',
        color: '#FFFFFF',
    },
    launcherBg: {
        label: 'Launcher',
        color: '#5942c1',
    },
    launcherIcon: {
        label: 'Launcher Icon',
        color: '#ffffff',
    },
};

export const DEFAULT_COLORS = {
    accent: {
        label: 'Accent',
        color: '#98D80D',
    },
    success: {
        label: 'Success',
        color: '#28a745',
    },
    warning: {
        label: 'Warning',
        color: '#ffe500',
    },
    danger: {
        label: 'Danger',
        color: '#dc3545',
    },
    info: {
        label: 'Info',
        color: '#17a2b8',
    },
    glow: {
        label: 'Glow',
        color: '#a200ff',
    },
};

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
            glow: colors['glow'] ? colors['glow'].color : colors['accent'].color,
        },
    };
    const styles: any = {
        '.text-accent': {
            '--thx-accent': theme.colors.accent,
        },
        '.text-primary': {
            '--bs-primary-rgb': theme.elements.btnBg,
        },
        'body,.bg-splash,.card-header-bg': {
            '--bs-secondary-bg': theme.elements.bodyBg,
            '--bs-body-bg': theme.elements.bodyBg,
            '--bs-body-color': theme.elements.text,
            '--bs-btn-bg': theme.elements.btnBg,
        },
        'blockquote': {
            '--thx-blockquote-bg': theme.elements.bodyBg,
            '--thx-blockquote-border-color': theme.elements.btnBg,
            '--thx-blockquote-link': theme.elements.text,
            '--thx-blockquote-link-hover': theme.elements.text,
        },
        '.list-group-item': {
            '--bs-list-group-bg': theme.elements.bodyBg,
            '--bs-list-group-color': theme.elements.text,
        },
        '.modal': {
            '--bs-modal-bg': theme.elements.bodyBg,
            '--bs-modal-color': theme.elements.text,
            '--bs-modal-border-color': theme.elements.btnBg,
        },
        '.form-control,.form-control:focus,.form-select': {
            '--bs-border-color': theme.elements.btnBg,
            '--bs-body-bg': theme.elements.bodyBg,
            '--bs-btn-bg': theme.elements.btnBg,
        },
        '.dropdown-menu': {
            '--bs-dropdown-bg': theme.elements.btnBg,
            '--bs-dropdown-header-color': theme.elements.btnText,
            '--bs-dropdown-link-hover-bg': theme.elements.btnBgDarker,
            '--bs-dropdown-link-hover-color': theme.elements.btnText,
            '--bs-dropdown-link-active-bg': theme.elements.btnBgDarker,
            '--bs-dropdown-link-active-color': theme.elements.btnText,
        },
        '.card, .card .badge': {
            '--bs-card-bg': theme.elements.cardBg,
            '--bs-card-color': theme.elements.cardText,
            '--bs-card-cap-color': theme.elements.cardText,
            '--bs-badge-bg': theme.elements.btnBg,
            '--bs-badge-color': theme.elements.btnText,
            '--thx-card-header-hover-bg': theme.elements.cardHeaderHoverBg,
        },
        '.btn-outline-primary,.btn-primary': {
            '--bs-btn-color': theme.elements.btnText,
            '--bs-btn-border-color': theme.elements.btnBg,
        },
        '.tooltip-inner,.tooltip-arrow': {
            '--bs-primary': theme.elements.btnBg,
            '--bs-body-color': theme.elements.btnText,
        },
        '.alert.alert-primary': {
            '--bs-alert-bg': Color(theme.elements.btnBg).lighten(0.7),
            '--bs-alert-color': Color(theme.elements.btnBg).darken(0.5),
            '--bs-alert-border-color': theme.elements.btnBg,
        },
        '.btn-primary': {
            '--bs-btn-bg': theme.elements.btnBg,
            '--bs-btn-border-color': Color(theme.elements.btnBg).darken(0.5),
            '--bs-btn-hover-color': theme.elements.btnText,
            '--bs-btn-hover-bg': theme.elements.btnBgDark,
            '--bs-btn-hover-border-color': Color(theme.elements.btnBgDark).darken(0.2),
            '--bs-btn-focus-color': theme.elements.btnText,
            '--bs-btn-focus-bg': theme.elements.btnBgDark,
            '--bs-btn-focus-border-color': Color(theme.elements.btnBgDark).darken(0.2),
            '--bs-btn-active-color': theme.elements.btnText,
            '--bs-btn-active-bg': theme.elements.btnBgDarker,
            '--bs-btn-active-border-color': Color(theme.elements.btnBgDarker).darken(0.2),
            '--bs-btn-disabled-color': theme.elements.btnText,
            '--bs-btn-disabled-bg': theme.elements.btnBg,
            '--bs-btn-disabled-border-color': theme.elements.btnBg,
        },
        '.input-group .btn-primary': {
            '--bs-btn-border-color': theme.elements.btnBg,
            '--bs-btn-hover-border-color': theme.elements.btnBg,
            '--bs-btn-active-border-color': theme.elements.btnBg,
            '--bs-btn-focus-border-color': theme.elements.btnBg,
        },
        '.navbar-top,.navbar-bottom,.sidebar': {
            '--thx-navbar-bg': theme.elements.navbarBg,
            '--thx-navbar-btn-bg': theme.elements.navbarBtnBg,
            '--thx-navbar-btn-color': theme.elements.navbarBtnText,
            '--thx-navbar-border-color': theme.elements.navbarBgDarker,
        },
        '.nav-pills': {
            '--bs-nav-pills-link-active-bg': theme.elements.btnBg,
        },
        '.nav-link': {
            '--bs-nav-link-color': theme.elements.text,
        },
        '.nav-tabs': {
            '--bs-nav-tabs-border-color': theme.elements.btnBg,
            '--bs-nav-link-color': theme.elements.text,
            '--bs-nav-link-hover-color': theme.elements.text,
        },
        '.nav-tabs .nav-link.active, .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-item .nav-link:hover': {
            '--bs-nav-tabs-link-active-color': theme.elements.text,
            '--bs-nav-tabs-link-active-bg': theme.elements.bodyBg,
            '--bs-nav-tabs-link-active-border-color': theme.elements.btnBg,
        },
        '.gradient-border-xl': {
            '--thx-linear-gradient-border': `linear-gradient(-45deg, ${theme.colors.accent}, ${theme.elements.btnBgDark}, ${theme.colors.glow})`,
        },
        '.gradient-border-xl, .gradient-shadow:before, .gradient-shadow-xl': {
            '--thx-linear-gradient-shadow': `linear-gradient(-45deg, ${theme.colors.glow}, ${theme.elements.btnBg}, ${theme.elements.btnBgDarker})`,
        },
    };

    const sheet = document.createElement('style');

    for (const selector in styles) {
        let rule = `${selector} { `;
        for (const name in styles[selector]) {
            rule += `${name}: ${styles[selector][name]};`;
        }
        rule += '}';
        sheet.innerText += rule;
    }

    return sheet;
}
