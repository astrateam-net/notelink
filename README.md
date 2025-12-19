# NoteLink

Instantly share / publish a note. Notes are shared with your full theme and should look identical to how they look in your Obsidian vault.

---

## Acknowledgments

This project is built on top of the original [Share Note](https://github.com/alangrainger/obsidian-share-note) plugin by **Alan Grainger**. Many thanks to him for his incredible work and contribution to the Obsidian community.

---

To share a note, choose `NoteLink` from the command palette, or click the `⋮` menu in any note and choose `Share note on the web`

<img width="340" src="https://github.com/user-attachments/assets/457721d9-3226-429e-b1c0-050b0370045e" />

---

## Full theme support

Uploads using your current theme, along with all your options and custom CSS snippets.

Supports all Obsidian content types:

### Images!

<img width="320" src="docs/wow5.png">

### Dataview queries!

Here's an example inline Dataview query. It will be correctly rendered when sharing:

```
The answer is `= 7 + 8`!
```

The answer is 15!

### Callouts!

<img width="600" src="docs/callouts.png">

### Links between notes!

If your shared note links to another note which is also shared, that link will also function on the shared webpage.

### Code blocks!

```javascript
function doYouEven(haveToAsk) {
  return 'Of course we can do it!'
}
```

### Checkboxes! Tags!

**Project Manhattan:** #in-progress #behind-schedule

- [x] Start project
- [x] Procrastinate
- [ ] Finish project

### Internal links

Share a table of contents and jump around your document.

---

## Usage

Use the `NoteLink` command from the Command Palette. You can map it to a hotkey to make things faster.

The first time a file is shared, the plugin will automatically upload all your theme styles. The next time you share a file, it will use the previously uploaded theme files.

If you want to force the theme CSS to update, use the command `Force re-upload of all data for this note`.

---

## Encryption

The content of your note is encrypted by default. What this means is that you can read the note, and the person you send it to can read the note, but nobody else can read the content - not even the hosting server.

> 🛈 **Encryption is optional, and can be turned on/off for individual notes, or for all notes, whatever you prefer.**

> 🛈 Encryption applies to the note text content. It does not apply to attachments, which are stored unencrypted. NoteLink is not a file sharing service, it's a **note** sharing service. If you want encrypted file sharing, it's not the right tool for you.

### 🧑‍💻 How it works 

When you share an encrypted note, you'll get a share link that looks like this:

`https://share.note.sx/4earajc8#PtC3oQDjDQK9VP7fljmQkLBA/rIMb2tbFsGoG44VdFY`

This part is the link to the file:

`https://share.note.sx/4earajc8`

If you click on it, you'll see a message that says "*Encrypted note*", because you haven't provided the decryption key.

The decryption key is the second part of the share link after the `#` symbol:

`#PtC3oQDjDQK9VP7fljmQkLBA/rIMb2tbFsGoG44VdFY`

When you combine those two things together, the note is able to be decrypted and you can see the content.

The decryption key **only** exists inside your vault, and is only known to you and whoever you send the link to. Nobody else can read the content.

You may optionally share an unencrypted version of a note by using the frontmatter checkbox property `share_unencrypted` = ✅.

If you decide you want to share most notes unencrypted by default, then you can encrypt an individual note by using a frontmatter checkbox called `share_encrypted`.
