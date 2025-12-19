import { App, Modal, Setting } from 'obsidian'
import { t } from './i18n'

class ConfirmDialog extends Modal {
  app: App
  onConfirm: () => void
  title?: string
  body?: string

  constructor (app: App, onConfirm: () => void) {
    super(app)
    this.onConfirm = onConfirm
  }

  onOpen () {
    const { contentEl } = this

    if (this.title) {
      contentEl.createEl('h2', { text: this.title })
    }
    if (this.body) {
      contentEl.createEl('p', { text: this.body })
    }

    new Setting(contentEl)
      .addButton(btn =>
        btn
          .setButtonText(t('dialog_yes_delete'))
          .setCta()
          .onClick(() => {
            this.close()
            this.onConfirm()
          }))
      .addButton(btn =>
        btn
          .setButtonText(t('dialog_no_cancel'))
          .onClick(() => {
            this.close()
          }))
  }
}

export default class UI {
  app: App

  constructor (app: App) {
    this.app = app
  }

  confirmDialog (title = '', body = '', onConfirm: () => void) {
    const dialog = new ConfirmDialog(this.app, onConfirm)
    dialog.title = title
    dialog.body = body
    dialog.open()
    return dialog
  }
}
