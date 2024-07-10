import { UserConfigExport, defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert';
import eslintPlugin from 'vite-plugin-eslint';
import Components from 'unplugin-vue-components/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

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
        sourcemap: !isProd,
        manifest: true,
        // used for "Graph" is undefined error with Dagre package https://github.com/vitejs/vite/issues/5759
        commonjsOptions: {
            ignoreTryCatch: false,
        },
    },
};

export default defineConfig(config);
