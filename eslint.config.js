/**
 * ESLint Configuration (Flat Config Format for ESLint 10+)
 */

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'readonly',
        require: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        SpeechRecognition: 'readonly',
        webkitSpeechRecognition: 'readonly',
        speechSynthesis: 'readonly',
        SpeechSynthesisUtterance: 'readonly'
      }
    },
    rules: {
      // Error Prevention
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'off', // Disabled for browser globals detection issues
      'no-console': ['warn', { allow: ['log', 'error', 'warn'] }],
      
      // Best Practices
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'error',
      
      // Code Style - Relaxed for existing code
      'indent': 'off',
      'quotes': 'off',
      'semi': 'off',
      'comma-dangle': 'off',
      'no-trailing-spaces': 'warn',
      'eol-last': 'warn',
      
      // Security
      'no-path-concat': 'error',
      
      // ES6+
      'prefer-const': 'warn',
      'no-var': 'warn',
      'prefer-arrow-callback': 'warn'
    }
  },
  {
    files: ['server/**/*.js'],
    rules: {
      'no-console': 'off' // Allow console in server code for logging
    }
  },
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-unused-vars': 'off' // Allow unused vars in tests
    }
  }
];
