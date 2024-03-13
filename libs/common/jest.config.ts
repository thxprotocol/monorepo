module.exports = {
    displayName: 'common',
    preset: '../../jest.preset.js',
    transform: {
        '^.+.vue$': 'vue3-jest',
        '.+.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'libs/common/tsconfig.spec.json',
                babelConfig: 'libs/common/babel.config.js',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'vue', 'js', 'json'],
    coverageDirectory: '../../coverage/libs/common',
    snapshotSerializers: ['jest-serializer-vue'],
    globals: {
        'vue-jest': {
            tsConfig: 'libs/common/tsconfig.spec.json',
            babelConfig: 'libs/common/babel.config.js',
        },
    },
};
