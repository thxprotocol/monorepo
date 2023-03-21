import Color from 'https://cdn.jsdelivr.net/npm/color@4.2.3/+esm';

const sheet = new CSSStyleSheet();
const { elements, colors } = JSON.parse(new URLSearchParams(window.location.search).get('theme'));
const theme = {
    elements: {
        btnText: elements['btnText'].color,
        btnBg: elements['btnBg'].color,
        btnBgDark: Color(elements['btnBg'].color).darken(0.2),
        btnBgDarker: Color(elements['btnBg'].color).darken(0.3),
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
const styles = {
    '#main': {
        '--bs-body-bg': theme.elements.bodyBg,
        '--bs-text-opacity': 1,
    },
    'body': {
        '--bs-body-color': theme.elements.text,
    },
    'blockquote': {
        '--thx-blockquote-bg': theme.elements.btnBgDarker,
        '--thx-blockquote-border-color': theme.elements.btnBg,
        '--thx-blockquote-link-hover': theme.elements.text,
    },
    '.modal': {
        '--bs-modal-bg': theme.elements.navbarBg,
        '--bs-modal-color': theme.elements.text,
        '--bs-modal-border-color': theme.elements.btnBg,
    },
    '.form-control,.form-control:focus': {
        '--bs-body-bg': theme.elements.bodyBg,
        '--bs-btn-bg': theme.elements.btnBg,
    },
    '.dropdown-menu': {
        '--bs-dropdown-bg': theme.elements.navbarBg,
        '--bs-dropdown-link-hover-bg': theme.elements.navbarBgDarker,
        '--bs-dropdown-link-hover-color': theme.elements.text,
        '--bs-dropdown-link-active-bg': theme.elements.navbarBgDarker,
        '--bs-dropdown-link-active-color': theme.elements.text,
    },
    '.card': {
        '--bs-card-bg': theme.elements.cardBg,
        '--bs-card-color': theme.elements.text,
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
    '.navbar': {
        '--thx-navbar-bg': theme.elements.navbarBg,
        '--thx-navbar-btn-color': theme.elements.btnText,
        '--thx-navbar-btn-active-bg': theme.elements.btnBg,
        '--thx-navbar-bottom-border-color': theme.elements.navbarBgDarker,
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

for (const selector in styles) {
    let rule = `${selector} { `;
    for (const name in styles[selector]) {
        rule += `${name}: ${styles[selector][name]};`;
    }
    rule += '}';
    sheet.insertRule(rule);
}

document.adoptedStyleSheets = [sheet];
