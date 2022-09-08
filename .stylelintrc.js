module.exports = {
  extends: ['stylelint-config-prettier', 'stylelint-prettier/recommended'],
  customSyntax: 'postcss-syntax', // Give a stupid "Error: Cannot find module 'postcss-html/extract'", so ignore is used.
  ignoreFiles: ['**/*.svg', '**/*.html', '**/*.ico', '**/*.txt', '**/*.json', '**/*.png', '**/*.webp']
}
