import { defineConfig } from 'orval';

export default defineConfig({
  bff: {
    input: {
      target: 'https://bffproyecto.juanandresdeveloper.com/bff/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/models',
      client: 'react-query',
      mock: false,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: 'src/api/client.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'eslint --fix',
    },
  },
});
