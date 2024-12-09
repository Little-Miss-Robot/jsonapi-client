import antfu from '@antfu/eslint-config';

export default antfu({
    ignores: ['node_modules', '**/node_modules/**', 'build', '**/build/**'],
    jsonc: false,
    rules: {
        'import/order': ['warn'],
        'style/semi': ['warn', 'always'],
        'symbol-description': ['off'],
        'vue/custom-event-name-casing': ['off'],
    },
    stylistic: {
        indent: 4,
        quotes: 'single',
    },
    yaml: false,
});
