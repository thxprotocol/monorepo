declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    // eslint-disable-next-line
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module 'vue3-clipboard';
declare module 'promise-poller';
