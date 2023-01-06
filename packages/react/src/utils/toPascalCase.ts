export function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')
}
