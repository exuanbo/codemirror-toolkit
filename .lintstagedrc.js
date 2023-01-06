module.exports = {
  '!*.{js,mjs,ts,tsx}': 'prettier --write --ignore-unknown --cache',
  '*.{js,mjs,ts,tsx}': ['eslint --cache --fix', 'prettier --write --cache'],
}
