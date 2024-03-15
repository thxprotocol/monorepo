import { UserConfigExport, defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert';
import Components from 'unplugin-vue-components/vite';

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || '';
const config: UserConfigExport = {
    plugins: [
        mkcert(),
        vue(),
        nodePolyfills({ protocolImports: true }),
        Components({
            resolvers: [BootstrapVueNextResolver()],
        }),
    ],
    server: {
        https: {
            key: './certs/localhost.key',
            cert: './certs/localhost.crt',
        },
        // host: '192.168.178.12',
        host: 'localhost',
        port: 8080,
    },
    resolve: {
        alias: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext',
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis',
            },
        },
    },
    build: {
        outDir: 'build',
        target: ['esnext'],
        sourcemap: true,
        // used for "Graph" is undefined error with Dagre package https://github.com/vitejs/vite/issues/5759
        commonjsOptions: {
            ignoreTryCatch: false,
        },
    },
};

if (config.plugins && SENTRY_AUTH_TOKEN) {
    // Put the Sentry vite plugin after all other plugins
    config.plugins.push(
        sentryVitePlugin({
            org: 'thx-network',
            project: 'campaign',
            authToken: SENTRY_AUTH_TOKEN,
        }),
    );
}

export default defineConfig(config);
