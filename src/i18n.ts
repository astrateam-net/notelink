import { moment } from 'obsidian'
import en from '../locales/en.json'
import ru from '../locales/ru.json'

const locales: Record<string, Record<string, string>> = { en, ru }

let currentLocale = 'en'

/**
 * Initialise the i18n system by detecting the user's locale from Obsidian.
 */
export function initI18n (): void {
  // moment.locale() returns the current locale Obsidian is using
  const obsidianLocale = moment.locale()
  if (obsidianLocale.startsWith('ru')) {
    currentLocale = 'ru'
  } else {
    currentLocale = 'en'
  }
}

/**
 * Set the locale manually (e.g., from plugin settings override).
 */
export function setLocale (locale: string): void {
  if (locales[locale]) {
    currentLocale = locale
  }
}

/**
 * Get the current locale code.
 */
export function getLocale (): string {
  return currentLocale
}

/**
 * Translate a key, optionally interpolating variables.
 * Variables are replaced using {{varName}} placeholders.
 */
export function t (key: string, vars?: Record<string, string | number>): string {
  let str = locales[currentLocale]?.[key] ?? locales.en[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v))
    }
  }
  return str
}
