module.exports = {
  api: {
    input: './api.json',
    output: {
      mode: 'split',
      target: './src/services/generated/apiEndpoints.ts',
      schemas: './src/services/generated/apiTypes',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/services/api.ts',
          name: 'customInstance',
        },
      },
    },
  },
};