// utils/themeHelpers.ts
export function resolveStyles<T extends Record<string, any>>(
  baseStyles: T,
  themedFactory: (theme: any) => T,
  enabled: boolean,
  theme: any
): T {
  return enabled ? themedFactory(theme) : baseStyles;
}
