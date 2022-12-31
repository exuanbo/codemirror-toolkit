module.exports = {
  '!*.{js,cjs,ts,tsx}': 'prettier --ignore-unknown --write',
  '*.{js,cjs,ts,tsx}': ['eslint --cache --fix', 'prettier --write'],
}
