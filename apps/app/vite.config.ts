import { UserConfigExport, defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert';
import eslintPlugin from 'vite-plugin-eslint';
import Components from 'unplugin-vue-components/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || '';

const config: UserConfigExport = {
    plugins: [
        mkcert(),
        tsconfigPaths(),
        eslintPlugin({
            fix: true,
            extensions: ['.ts', '.vue'],
        }),
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
    },
    resolve: {
        alias: [
            { find: '@thxnetwork/app', replacement: path.resolve(__dirname, './src') },
            { find: '@thxnetwork/common', replacement: path.resolve(__dirname, '../../libs/common/src/lib') },
            { find: '@thxnetwork/sdk', replacement: path.resolve(__dirname, '../../libs/sdk/src/lib') },
        ],
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
        manifest: true,
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
