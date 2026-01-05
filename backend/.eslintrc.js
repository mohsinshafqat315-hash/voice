// ESLint configuration for backend
// Node.js/Express linting rules, code quality standards

module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Error prevention
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'error',
    
    // Code quality
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Best practices
    'no-return-await': 'error',
    'require-await': 'warn',
    'no-async-promise-executor': 'error',
    'prefer-promise-reject-errors': 'error',
    
    // Style
    'indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'max-len': ['warn', { 
      code: 120,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }],
    
    // Node.js specific
    'no-process-exit': 'warn',
    'handle-callback-err': 'error',
    'no-path-concat': 'error'
  },
  globals: {
    process: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    Buffer: 'readonly',
    console: 'readonly',
    require: 'readonly',
    module: 'readonly',
    exports: 'readonly',
    global: 'readonly'
  }
};
