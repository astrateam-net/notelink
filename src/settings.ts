import { App, PluginSettingTab, Setting, TextComponent } from 'obsidian'
import NoteLinkPlugin from './main'
import { t, setLocale, initI18n } from './i18n'

export enum ThemeMode {
  'Same as theme',
  Dark,
  Light
}

export enum TitleSource {
  'Note title',
  'First H1',
  'Frontmatter property'
}

export enum YamlField {
  link,
  updated,
  encrypted,
  unencrypted,
  title,
  expires
}

export interface NoteLinkSettings {
  server: string;
  uid: string;
  apiKey: string;
  yamlField: string;
  noteWidth: string;
  theme: string; // The name of the theme stored on the server
  themeMode: ThemeMode;
  titleSource: TitleSource;
  removeYaml: boolean;
  removeBacklinksFooter: boolean;
  removeElements: string;
  expiry: string;
  clipboard: boolean;
  shareUnencrypted: boolean;
  authRedirect: string | null;
  debug: number;
  language: string;
}

export const DEFAULT_SETTINGS: NoteLinkSettings = {
  server: 'https://api.notelink.app',
  uid: '',
  apiKey: '',
  yamlField: 'notelink',
  noteWidth: '',
  theme: '',
  themeMode: ThemeMode['Same as theme'],
  titleSource: TitleSource['Note title'],
  removeYaml: true,
  removeBacklinksFooter: true,
  removeElements: '',
  expiry: '',
  clipboard: true,
  shareUnencrypted: false,
  authRedirect: null,
  debug: 0,
  language: 'auto'
}

export class NoteLinkSettingsTab extends PluginSettingTab {
  plugin: NoteLinkPlugin
  apikeyEl: TextComponent

  constructor (app: App, plugin: NoteLinkPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    const { containerEl } = this

    containerEl.empty()

    // Language override
    new Setting(containerEl)
      .setName(t('settings_language'))
      .setDesc(t('settings_language_desc'))
      .addDropdown(dropdown => {
        dropdown
          .addOption('auto', t('settings_language_auto'))
          .addOption('en', 'English')
          .addOption('ru', 'Русский')
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value
            await this.plugin.saveSettings()
            if (value === 'auto') {
              initI18n()
            } else {
              setLocale(value)
            }
            // Re-render settings with new language
            this.display()
          })
      })

    // Server URL
    new Setting(containerEl)
      .setName(t('settings_server_url'))
      .setDesc(t('settings_server_url_desc'))
      .addText(text => text
        .setPlaceholder(DEFAULT_SETTINGS.server)
        .setValue(this.plugin.settings.server)
        .onChange(async (value) => {
          this.plugin.settings.server = value || DEFAULT_SETTINGS.server
          await this.plugin.saveSettings()
        }))

    // API key
    new Setting(containerEl)
      .setName(t('settings_api_key'))
      .setDesc(t('settings_api_key_desc'))
      .addButton(btn => btn
        .setButtonText(t('settings_api_key_btn'))
        .setCta()
        .onClick(() => {
          window.open(this.plugin.settings.server + '/v1/account/get-key?id=' + this.plugin.settings.uid)
        }))
      .addText(inputEl => {
        this.apikeyEl = inputEl // so we can update it with the API key during the URI callback
        inputEl
          .setPlaceholder(t('settings_api_key_placeholder'))
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value
            await this.plugin.saveSettings()
          })
      })

    // Local YAML field
    new Setting(containerEl)
      .setName(t('settings_frontmatter_prefix'))
      .setDesc(t('settings_frontmatter_prefix_desc'))
      .addText(text => text
        .setPlaceholder(DEFAULT_SETTINGS.yamlField)
        .setValue(this.plugin.settings.yamlField)
        .onChange(async (value) => {
          this.plugin.settings.yamlField = value || DEFAULT_SETTINGS.yamlField
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName(t('settings_upload_options'))
      .setHeading()

    const themeName = this.plugin.settings.theme || t('settings_theme_default')
    new Setting(containerEl)
      .setName(t('settings_theme_info', { theme: themeName }))
      .setDesc(t('settings_theme_desc'))
      .then(setting => addDocs(setting, 'https://docs.notelink.app/notes/theme'))

    // Choose light/dark theme mode
    new Setting(containerEl)
      .setName(t('settings_light_dark'))
      .setDesc(t('settings_light_dark_desc'))
      .addDropdown(dropdown => {
        dropdown
          .addOption('Same as theme', t('settings_same_as_theme'))
          .addOption('Dark', t('settings_dark'))
          .addOption('Light', t('settings_light'))
          .setValue(ThemeMode[this.plugin.settings.themeMode])
          .onChange(async value => {
            this.plugin.settings.themeMode = ThemeMode[value as keyof typeof ThemeMode]
            await this.plugin.saveSettings()
          })
      })

    // Copy to clipboard
    new Setting(containerEl)
      .setName(t('settings_copy_clipboard'))
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.clipboard)
          .onChange(async (value) => {
            this.plugin.settings.clipboard = value
            await this.plugin.saveSettings()
          })
      })

    new Setting(containerEl)
      .setName(t('settings_note_options'))
      .setHeading()

    // Title source
    const defaultTitleDesc = t('settings_title_source_desc')
    const titleSetting = new Setting(containerEl)
      .setName(t('settings_title_source'))
      .setDesc(defaultTitleDesc)
      .addDropdown(dropdown => {
        dropdown
          .addOption('Note title', t('settings_title_note'))
          .addOption('First H1', t('settings_title_h1'))
          .addOption('Frontmatter property', t('settings_title_frontmatter'))
          .setValue(TitleSource[this.plugin.settings.titleSource])
          .onChange(async value => {
            this.plugin.settings.titleSource = TitleSource[value as keyof typeof TitleSource]
            if (this.plugin.settings.titleSource === TitleSource['Frontmatter property']) {
              titleSetting.setDesc(t('settings_title_source_frontmatter_desc', { field: this.plugin.field(YamlField.title) }))
            } else {
              titleSetting.setDesc(defaultTitleDesc)
            }
            await this.plugin.saveSettings()
          })
      })

    // Note reading width
    new Setting(containerEl)
      .setName(t('settings_note_width'))
      .setDesc(t('settings_note_width_desc'))
      .addText(text => text
        .setValue(this.plugin.settings.noteWidth)
        .onChange(async (value) => {
          this.plugin.settings.noteWidth = value
          await this.plugin.saveSettings()
        }))

    // Strip frontmatter
    new Setting(containerEl)
      .setName(t('settings_remove_yaml'))
      .setDesc(t('settings_remove_yaml_desc'))
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.removeYaml)
          .onChange(async (value) => {
            this.plugin.settings.removeYaml = value
            await this.plugin.saveSettings()
          })
      })

    // Strip backlinks footer
    new Setting(containerEl)
      .setName(t('settings_remove_backlinks'))
      .setDesc(t('settings_remove_backlinks_desc'))
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.removeBacklinksFooter)
          .onChange(async (value) => {
            this.plugin.settings.removeBacklinksFooter = value
            await this.plugin.saveSettings()
          })
      })

    // Strip elements by selector
    new Setting(containerEl)
      .setName(t('settings_remove_custom'))
      .setDesc(t('settings_remove_custom_desc'))
      .addTextArea(text => {
        text
          .setPlaceholder(t('settings_remove_custom_placeholder'))
          .setValue(this.plugin.settings.removeElements)
          .onChange(async (value) => {
            this.plugin.settings.removeElements = value
            await this.plugin.saveSettings()
          })
      })

    // Share encrypted by default
    new Setting(containerEl)
      .setName(t('settings_encrypted_default'))
      .setDesc(t('settings_encrypted_default_desc'))
      .addToggle(toggle => {
        toggle
          .setValue(!this.plugin.settings.shareUnencrypted)
          .onChange(async (value) => {
            this.plugin.settings.shareUnencrypted = !value
            await this.plugin.saveSettings()
          })
      })
      .then(setting => addDocs(setting, 'https://docs.notelink.app/notes/encryption'))

    // Default note expiry
    new Setting(containerEl)
      .setName(t('settings_expiry'))
      .setDesc(t('settings_expiry_desc'))
      .addText(text => text
        .setValue(this.plugin.settings.expiry)
        .onChange(async (value) => {
          this.plugin.settings.expiry = value
          await this.plugin.saveSettings()
        }))
      .then(setting => addDocs(setting, 'https://docs.notelink.app/notes/self-deleting-notes'))
  }
}

function addDocs (setting: Setting, url: string) {
  setting.descEl.createEl('br')
  setting.descEl.createEl('a', {
    text: t('settings_docs'),
    href: url
  })
}
