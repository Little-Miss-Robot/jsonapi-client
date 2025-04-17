import antfu from '@antfu/eslint-config';

export default antfu({
    ignores: ['node_modules', '**/node_modules/**', 'build', '**/build/**'],
    jsonc: false,
    rules: {
        'import/order': ['warn'],
        'style/semi': ['warn', 'always'],
        'symbol-description': ['off'],
        'vue/custom-event-name-casing': ['off'],
        '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    },
    stylistic: {
        indent: 4,
        quotes: 'single',
    },
    yaml: false,
});
