# Pangu-Markdown

## What is it?

Pangu-Markdown is a VS Code extension that help format your markdown documents appropriately when writing with VS Code as your text editor and with Chinese Mandarin as your primary editing language.

## What it does?

1. Add a whitespace between Chinese and English, for instance, converting from “中文English中文” alike to “中文 English 中文”
2. Add a whitespace between Chinese and Digit, for instance, conveting from “中文123中文” alike to “中文 123 中文”
3. Add a whitespace between Chinese and Inline Code, converting from “中文文字和`行内代码`之间” alike to “中文文字和 `行内代码` 之间”
4. Add a whitespace between Chinese and Bold, converting from “中文文字和**粗体文字**之间” alike to “中文文字和 **粗体文字** 之间”
5. Add a whitespace before and after a Superlink, converting from “超链接样式[点击这里](https://wiki.marapython.com/)有很多种” alike to “超链接样式 [点击这里](https://wiki.marapython.com/) 有很多种”
6. Convert `, \ . : ; ? !` after Chinese characters to `，、。：；？！` respectively
7. Convert `()` around Chinese characters to `（）`
   - `[] <> ` remains untouched
8. Convert repeated `。` to `......`, e.g. from `。。。` to `......`
9. Truncate repeated `？` and `！` to just one single mark respectively
10. Truncate repeated `。，；：、“”『』〖〗《》` to just one

## How to use it?

1. Search and Install Pangu-Markdown from Marketplace
2. Replace file `C:\Users\Your-User-Name\.vscode\extensions\xlthu.pangu-markdown-0.0.6\extension.js` with the `exension.js` that you download from this repository `https://github.com/Alowree/pangu-markdown.git`
3. Restart VS Code
4. Create a new Markdown file or open an existing file
5. Key in some content, hopefully with Chinese and English in between


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


