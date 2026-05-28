/** @type {import('prettier').Config} */
export default {
  tabWidth: 2,
  semi: false,
  trailingComma: 'all',
  singleQuote: true,
  arrowParens: 'always',
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
}
