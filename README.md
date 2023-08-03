# Pangu-Markdown

## What is this?

Pangu-Markdown is a VS Code extension that help format your markdown documents appropriately when writing with VS Code as your text editor and with Chinese Mandarin as your primary editing language.

This code is a Visual Studio Code (VSCode) extension for formatting Markdown documents, specifically for handling Chinese characters and punctuation. The original extension is named `Pangu-Markdown` and available in Marketplace. `extension.js` in this repository is a rewrite, based on two existing extensions, primarily `Pangu-Markdown` and partially `Pangu-Markdown-VSCode`.

## What does this do?

If you are a developer of VS Code extensions, sometimes editing other's extension code to suit your own workflow, here's a breakdown of what the code does:

- `activate(context)`: This function is called when the extension is activated. It registers a command `pangu.format` that can be called by the user to format the current document. It also stars a `Watcher` that listens for the `onWillSaveTextDocument` event to automatically format the document before saving, if the `auto_format_on_save` configuration is set to `true`.

- `deactivate()`: This function is called when the extension is deactivated. It currently does nothing.
- The `exports.activate = activate` and `exports.deactivate = deactivate` lines make the `activate` and `deactivate` functions available to VSCode, which calls them when the extension is activated or deactivated.

- `DocumentFormatter` class: This class contains methods for formatting a Markdown document. The `updateDocument()` method retrieves the current document and applies various formatting rules if the document is a Markdown file. These rules include replacing full-width numbers and English characters with their half-width counterparts, inserting spaces between Chinese and English characters or numbers, replacing certain punctuation marks within Chinese text with their full-width counterparts, and more.

- `Watcher`: This class listens for the `onWillSaveTextDocument` event and calls the `updateDocument()` method of the `DocumentFormatter` class when the event is triggered. This allows the document to be automatically formatted before it is saved.

- The `getConfig()` method in the `Watcher` class retrieves the configuration settings for the extension from VSCode's workspace settings.

- The `dispose()` method in the `Watcher` class disposes of the resources used by the `Watcher` instance.

- The `current_document_range(doc)` method in the `DocumentFormatter` class returns a range that covers the entire document.

- The `replaceFullNums(content)`, `replaceFullChars(content)`, `insertSpace(content)`, `deleteSpaces(content)`, `condenseContent(content)`, and `replacePunctuations(content)` methods in the `DocumentFormatter` class are helper methods used by `updateDocument()` to apply specific formatting rules to the document.

In summary, this extension helps to format Markdown documents, especially those containing Chinese characters, according to certain rules. It can format documents manually when the user runs the `pangu.format` command, or automatically before the document is saved if the `auto_format_on_save` configuration is set to `true`.

## What does this do?

If you are a user of VS Code, often writing Markdown files in Chinese Mandarin, here's a breakdown of what the code does:

1. Add a whitespace between Chinese and English, for instance, converting from “中文 English 中文” alike to “中文 English 中文”
2. Add a whitespace between Chinese and Digit, for instance, conveting from “中文 123 中文” alike to “中文 123 中文”
3. Add a whitespace between Chinese and Inline Code, converting from “中文文字和`行内代码`之间” alike to “中文文字和 `行内代码` 之间”
4. Add a whitespace between Chinese and Bold, converting from “中文文字和**粗体文字**之间” alike to “中文文字和 **粗体文字** 之间”
5. Add a whitespace before and after a Superlink, converting from “超链接样式[点击这里](https://wiki.marapython.com/)有很多种” alike to “超链接样式 [点击这里](https://wiki.marapython.com/) 有很多种”
6. Convert `, \ . : ; ? !` after Chinese characters to `，、。：；？！` respectively
7. Convert `()` around Chinese characters to `（）`
   - `[] <> ` remains untouched
8. Convert repeated `。` to `......`, e.g. from `。。。` to `......`
9. Truncate repeated `？` and `！` to just one single mark respectively
10. Truncate repeated `。，；：、“”『』〖〗《》` to just one

## How to use this?

1. Search and Install Pangu-Markdown from Marketplace
2. Download the JavaScript file `extension.js` from this repository `https://github.com/Alowree/pangu-markdown.git`
3. Copy and Paste your new download `extension.js` to path `C:\Users\Your-User-Name\.vscode\extensions\xlthu.pangu-markdown-0.0.6\extension.js`
4. Restart VS Code
5. Create a new Markdown file or open an existing file
6. Key in some content, hopefully with Chinese and English in between

```
Ctrl+Shift+P -> Pangu Format
```

Or

```
Right Click -> Pangu Format
```

## Setting

| Name                      | Description                     |
| :------------------------ | :------------------------------ |
| pangu.auto_format_on_save | Auto apply Pangu format on save |

## Thanks
