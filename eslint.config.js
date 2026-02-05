import antfu from '@antfu/eslint-config';

export default antfu({
    ignores: ['node_modules', '**/node_modules/**', 'build', '**/build/**'],
    jsonc: false,
    rules: {
        'import/order': ['warn'],
        'style/semi': ['warn', 'always'],
        'symbol-description': ['off'],
        '@typescript-eslint/consistent-type-definitions': ['warn'],
        'antfu/no-top-level-await': ['off'],
        'no-console': ['off'],
    },
    stylistic: {
        indent: 4,
        quotes: 'single',
    },
    yaml: false,
});
