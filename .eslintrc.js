module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
    },
    'extends': [
        'google',
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module',
    },
    'plugins': [
        '@typescript-eslint',
    ],
    'rules': {
        'require-jsdoc': 0,
        'indent': [ 2, 4 ],
        'array-bracket-spacing': 0,
        'max-len': 0,
        'object-curly-spacing': [ 'error', 'always', { 'arraysInObjects': true } ],
        'semi': 'off',
        '@typescript-eslint/semi': ['error'],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        'no-multi-spaces': 'off',
    },
};
