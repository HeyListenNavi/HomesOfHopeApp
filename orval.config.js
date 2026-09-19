module.exports = {
  api: {
    input: './api.json',
    output: {
      mode: 'split',
      target: './src/services/generated/apiEndpoints.ts',
      schemas: './src/services/generated/apiTypes',
      clean: true,
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/services/api.ts',
          name: 'customInstance',
        },
        query: {
          useInfinite: true,
          useInfiniteQueryParam: 'page',
          options: {
            staleTime: 10000,
          },
        },
      },
    },
  },
};