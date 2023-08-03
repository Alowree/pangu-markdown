// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");

function activate(context) {
  console.log(
    'Congratulations, your extension "Pangu-Markdown" is now active!'
  );

  let format = vscode.commands.registerCommand("pangu.format", () => {
    new DocumentFormatter().updateDocument();
  });
  context.subscriptions.push(format);
  context.subscriptions.push(new Watcher());
}
exports.activate = activate;

// 方法去激活时调用的函数
function deactivate() {}
exports.deactivate = deactivate;

class DocumentFormatter {
  updateDocument() {
    let editor = vscode.window.activeTextEditor;
    let doc = editor.document;
    // Only update status if an Markdown file
    if (doc.languageId === "markdown") {
      // 全局替换
      // 注意：全局更替使用\s时要小心，避免将回车更替了
      vscode.window.activeTextEditor.edit((editorBuilder) => {
        let content = doc.getText(this.current_document_range(doc));
        // 在全文最后增加两个回车，结束文档整理前再删除最后一个回车，就可以满足Markdown的要求了
        content = content + "\n\n";

        // 替换所有的 全角数字 为 半角数字
        content = this.replaceFullNums(content);
        // 替换所有的 全角英文字母和@标点 为 半角的英文字母和@标点
        content = this.replaceFullChars(content);
        // 删除多余的内容（回车）
        content = this.condenseContent(content);

        // 每行操作
        content = content
          .split("\n")
          .map((line) => {
            // 中文内部使用全角标点
            line = this.replacePunctuations(line);
            // 中文和英文、数字之间需要增加空格
            line = this.insertSpace(line);
            // 中文和粗体文本之间需要增加空格
            line = this.insertSpaceBold(line);
            // 中文和行内代码之间需要增加空格
            line = this.insertSpaceInline(line);
            // 中文和超链接之间需要增加空格
            line = this.insertSpaceSuperlink(line);

            // 将有序列表的“1.  ”点号后面 2 个及以上的空格 改成 “1.  ”点号后面 1 个空格
            line = line.replace(/^(\s*)(\d\.)\s+(\S)/, "$1$2 $3");
            // 将无编号列表的“* ”改成 “-   ”
            // 将无编号列表的“- ”改成 “-   ”
            line = line.replace(/^(\s*)[-\*]\s+(\S)/, "$1- $2");

            // 再次补充空格，将被删除的但是是必须的空格补齐
            // 在标题的 # 后面需要增加空格
            line = line.replace(/^(#{1,})\s*(\S)/g, "$1 $2");

            return line;
          })
          .join("\n");

        // 结束文档整理前再删除最后一个回车
        content = content.replace(/(\n){2,}$/g, "$1");
        content = content.replace(/(\r\n){2,}$/g, "$1");

        editorBuilder.replace(this.current_document_range(doc), content);
      });
    } else {
      vscode.window.showErrorMessage("不能处理非 Markdown 的文件!");
    }
  }

  // This method is NOT called and used. To be deleted. 2023/08/03.
  deleteSpaces(content) {
    // 半角标点「()[]{}<>'":」前后仅保留一个空格
    content = content.replace(/\s+([\(\)\[\]\{\}<>'":])\s+/g, " $1 ");

    // 去掉连续括号增加的空格，例如：「` ( [ { <  > } ] ) `」
    content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, "$1$2 ");
    content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, "$1$2 ");
    content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, "$1$2 ");
    content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, "$1$2 ");
    content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, " $1$2");
    content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, " $1$2");
    content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, " $1$2");
    content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, " $1$2");

    // 去掉 「`$ () $`」, 「`$ [] $`」, 「`$ {} $`」 里面增加的空格
    // 去掉开始 $ 后面增加的空格，结束 $ 前面增加的空格
    // 去掉包裹代码的符号里面增加的空格
    // 去掉开始 ` 后面增加的空格，结束 ` 前面增加的空格
    content = content.replace(
      /([`\$])\s*([<\(\[\{])([^\$]*)\s*([`\$])/g,
      "$1$2$3$4"
    );
    content = content.replace(
      /([`\$])\s*([^\$]*)([>\)\]\}])\s*([`\$])/g,
      "$1$2$3$4"
    );

    // 去掉「`) _`」、「`) ^`」增加的空格
    content = content.replace(/\)\s([_\^])/g, ")$1");

    // 去掉 [^footnote,2002] 中的空格
    content = content.replace(/\[\s*\^([^\]\s]*)\s*\]/g, "[^$1]");

    // 将链接的格式中文括号“[]（）”改成英文括号“[]()”，去掉增加的空格
    content = content.replace(
      /\s*\[\s*([^\]]+)\s*\]\s*[（(]\s*([^\s\)]*)\s*[)）]\s*/g,
      " [$1]($2) "
    );

    // 将图片链接的格式中的多余空格“! []()”去掉，变成“![]()”
    content = content.replace(
      /!\s*\[\s*([^\]]+)\s*\]\s*[（(]\s*([^\s\)]*)\s*[)）]\s*/g,
      "![$1]($2) "
    );

    // 将网络地址中“ : // ”符号改成“://”
    content = content.replace(/\s*:\s*\/\s*\/\s*/g, "://");

    // 去掉行末空格
    content = content.replace(/(\S*)\s*$/g, "$1");

    // 去掉「123 °」和 「15 %」中的空格
    content = content.replace(/([0-9])\s*([°%])/g, "$1$2");

    // 去掉 2020 - 04 - 20, 08 : 00 : 00 这种日期时间表示的数字内的空格
    content = content.replace(/([0-9])\s*-\s*([0-9])/g, "$1-$2");
    content = content.replace(/([0-9])\s*:\s*([0-9])/g, "$1:$2");

    // 去掉 1 , 234 , 567 这种千分位表示的数字内的空格
    content = content.replace(/([0-9])\s*,\s*([0-9])/g, "$1,$2");

    // 全角標點與其他字符之間不加空格
    // 将无序列表的-后面的空格保留
    // 将有序列表的-后面的空格保留
    content = content.replace(
      /^(?<![-|\d.]\s*)\s*([，。、《》？『』「」；∶【】｛｝—！＠￥％…（）])\s*/g,
      "$1"
    );
    return content;
  }

  insertSpace(content) {
    // 在 “中文English” 之间增加空格，变成：“中文 English”
    // 在 “中文123” 之间增加空格，变成：“中文 123”
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF])([a-zA-Z0-9])/g,
      "$1 $2"
    );

    // 在 “English中文” 之间增加空格，变成：“English 中文”
    // 在 “123中文” 之间加入空格，变成：“123 中文”
    content = content.replace(
      /([a-zA-Z0-9%])([*]*[\u4e00-\u9fa5\u3040-\u30FF])/g,
      "$1 $2"
    );

    // 在 「100Gbps」之间加入空格「100 Gbps」（只有手工做，不能自动做，会破坏密码网址等信息）

    // 在 「I said:it's a good news」的冒号与英文之间加入空格 「I said: it's a good news」
    content = content.replace(/([:])\s*([a-zA-z])/g, "$1 $2");

    return content;
  }

  insertSpaceBold(content) {
    // **粗体文字**前面无内容、为空格，后面有中文时
    content = content.replace(
      /(^|\s*)(\*{2,3})([\u4e00-\u9fa5\u3040-\u30FF]+)\2([\u4e00-\u9fa5\u3040-\u30FF]+?)/g,
      "$1$2$3$2 $4"
    );

    // ！**粗体文字**前面为全角标点符号，后面有中文时
    content = content.replace(
      /([\uFF00-\uFFEF])(\*{2,3})([\u4e00-\u9fa5\u3040-\u30FF]+)\2([\u4e00-\u9fa5\u3040-\u30FF]+?)/g,
      "$1$2$3$2 $4"
    );

    // 正文**粗体文字** 前面有中文，后面无内容、为空格时
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF]+?)(\*{2,3})([\u4e00-\u9fa5\u3000-\u30FF]+)\2($|\s*)/g,
      "$1 $2$3$2$4"
    );

    // 正文**粗体文字**（前面有中文，后面为全角标点符号时）
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF]+?)(\*{2,3})([\u4e00-\u9fa5\u3000-\u30FF]+)\2([\u3000-\u303F\uFF00-\uFFEF])/g,
      "$1 $2$3$2$4"
    );

    return content;
  }

  insertSpaceInline(content) {
    // `行内代码` 前面无内容、为空格，后面有中文时
    content = content.replace(
      /(^|\s*)(`|`{2})([^`]+)\2([\u4e00-\u9fa5\u3040-\u30FF]+?)/g,
      "$1$2$3$2 $4"
    );
    // `行内代码` 前面有中文，后面无内容、为空格时
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF]+?)(`|`{2})([^`]+)\2($|\s*)/g,
      "$1 $2$3$2$4"
    );

    // 在“中文和<code>行内代码</code>之间”，<code>的左边加入空格： “中文和 <code>行内代码</code>之间之间”
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF]+?)(<code>)([^<]+)(<\/code>)/g,
      "$1 $2$3$4"
    );
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF]+?)(<kbd>)([^<]+)(<\/kbd>)/g,
      "$1 $2$3$4"
    );

    // 在“中文和 <code>行内代码</code>之间”，</code>的右边加入空格： “中文和 <code>行内代码</code> 之间”
    content = content.replace(
      /(<code>)([^<]+)(<\/code>)([\u4e00-\u9fa5\u3040-\u30FF]+?)/g,
      "$1$2$3 $4"
    );
    content = content.replace(
      /(<kbd>)([^<]+)(<\/kbd>)([\u4e00-\u9fa5\u3040-\u30FF]+?)/g,
      "$1$2$3 $4"
    );
    return content;
  }

  insertSpaceSuperlink(content) {
    // 把超链接中的全角圆括号，更换成半角圆括号
    content = content.replace(/\[([^\]]+)\][（(]([^)]+)[）)]/g, "[$1]($2)");

    // [点击这里](superlink)方括号前面无内容、为空格，圆括号后面紧跟中文时
    content = content.replace(
      /(^|\s*)\[([^\]]+)\]\(([^)]+)\)([\u4e00-\u9fa5\u3040-\u30FF]+?)/g,
      "[$2]($3) $4"
    );

    // 。[点击这里](superlink)方括号前面为全角标点，圆括号后面紧跟中文时
    content = content.replace(
      /([\u3000-\u303F\uFF00-\uFFEF])\[([^\]]+)\]\(([^)]+)\)([\u4e00-\u9fa5\u3040-\u30FF]+?)/g,
      "[$2]($3) $4"
    );

    // 正文[点击这里](superlink) 前面有中文，后面无内容、为空格时
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF]+?)\[([^\]]+)\]\(([^)]+)\)(^|\s*)/g,
      "$1 [$2]($3)$4"
    );

    // 正文[点击这里](superlink)，前面有中文，后面为全角标点时
    content = content.replace(
      /([\u4e00-\u9fa5\u3040-\u30FF]+?)\[([^\]]+)\]\(([^)]+)\)([\u3000-\u303F\uFF00-\uFFEF])/g,
      "$1 [$2]($3)$4"
    );
    return content;
  }

  // 获取可编辑文档的全部内容
  current_document_range(doc) {
    let start = new vscode.Position(0, 0);
    let end = new vscode.Position(
      doc.lineCount - 1,
      doc.lineAt(doc.lineCount - 1).text.length
    );
    let range = new vscode.Range(start, end);
    return range;
  }

  // 处理空格和空行
  condenseContent(content) {
    // 将 制表符 Tab 改成 两个空格
    content = content.replace(/\t/g, "  ");
    // 删除超过 2 个的回车
    // Unix 的只有 LF，Windows 的需要 CR LF
    content = content.replace(/(\n){3,}/g, "$1$1");
    content = content.replace(/(\r\n){3,}/g, "$1$1");
    return content;
  }

  replacePunctuations(content) {
    // `, \ . : ; ? !` 改成 `，、。：；？！`
    // 必须在结尾或者有空格的点才被改成句号
    // content = content.replace(
    //   /([\u4e00-\u9fa5\u3040-\u30FF])\.($|\s*)/g,
    //   "$1。"
    // );

    // content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]),\s*/g, "$1，");
    // content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]);\s*/g, "$1；");
    // content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])!\s*/g, "$1！");
    // content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\?\s*/g, "$1？");
    // content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\\\s*/g, "$1、");

    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\.$/g, "$1。");

    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]),/g, "$1，");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]);/g, "$1；");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])!/g, "$1！");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\?/g, "$1？");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\\/g, "$1、");

    // content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]):\s*/g, "$1：");
    // content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])＼s*\:/g, "$1：");

    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]):/g, "$1：");

    // 中文内部的 半角括号 转 全角括号
    content = content.replace(/\(([\u4e00-\u9fa5\u3040-\u30FF])/g, "（$1");
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\)/g, "$1）");

    // 全角、半角括号 统一处理成 半角括号 且括号前后若有2个以上空格，仅各保留一个空格
    // content = content.replace(/\s*[（(]\s*/g, " ( ");
    // content = content.replace(/\s*[）)]\s*/g, " ) ");

    // content = content.replace(/。\{3,}/g, "......");
    // content = content.replace(/([！？])$1{3,}/g, "$1$1$1");
    // content = content.replace(/([。，；：、“”『』〖〗《》])\1{1,}/g, "$1");

    // 连续三个以上的 `。` 改成 `......`
    content = content.replace(/[。]{3,}/g, "……");
    // 截断连续超过一个的 ？和！ 为一个，「！？」也算一个
    content = content.replace(/([！？]+)\1{1,}/g, "$1");
    // 截断连续超过一个的 。，；：、“”『』〖〗《》 为一个
    content = content.replace(/([。，；：、“”『』〖〗《》【】])\1{1,}/g, "$1");

    // 簡體中文使用直角引號
    // content = content.replace(/‘/g, "『");
    // content = content.replace(/’/g, "』");
    // content = content.replace(/“/g, "「");
    // content = content.replace(/”/g, "」");

    return content;
  }

  replaceFullNums(content) {
    " 全角数字。";
    content = content.replace("０", "0");
    content = content.replace("１", "1");
    content = content.replace("２", "2");
    content = content.replace("３", "3");
    content = content.replace("４", "4");
    content = content.replace("５", "5");
    content = content.replace("６", "6");
    content = content.replace("７", "7");
    content = content.replace("８", "8");
    content = content.replace("９", "9");
    return content;
  }

  replaceFullChars(content) {
    " 全角英文和标点。";
    content = content.replace("Ａ", "A");
    content = content.replace("Ｂ", "B");
    content = content.replace("Ｃ", "C");
    content = content.replace("Ｄ", "D");
    content = content.replace("Ｅ", "E");
    content = content.replace("Ｆ", "F");
    content = content.replace("Ｇ", "G");
    content = content.replace("Ｈ", "H");
    content = content.replace("Ｉ", "I");
    content = content.replace("Ｊ", "J");
    content = content.replace("Ｋ", "K");
    content = content.replace("Ｌ", "L");
    content = content.replace("Ｍ", "M");
    content = content.replace("Ｎ", "N");
    content = content.replace("Ｏ", "O");
    content = content.replace("Ｐ", "P");
    content = content.replace("Ｑ", "Q");
    content = content.replace("Ｒ", "R");
    content = content.replace("Ｓ", "S");
    content = content.replace("Ｔ", "T");
    content = content.replace("Ｕ", "U");
    content = content.replace("Ｖ", "V");
    content = content.replace("Ｗ", "W");
    content = content.replace("Ｘ", "X");
    content = content.replace("Ｙ", "Y");
    content = content.replace("Ｚ", "Z");
    content = content.replace("ａ", "a");
    content = content.replace("ｂ", "b");
    content = content.replace("ｃ", "c");
    content = content.replace("ｄ", "d");
    content = content.replace("ｅ", "e");
    content = content.replace("ｆ", "f");
    content = content.replace("ｇ", "g");
    content = content.replace("ｈ", "h");
    content = content.replace("ｉ", "i");
    content = content.replace("ｊ", "j");
    content = content.replace("ｋ", "k");
    content = content.replace("ｌ", "l");
    content = content.replace("ｍ", "m");
    content = content.replace("ｎ", "n");
    content = content.replace("ｏ", "o");
    content = content.replace("ｐ", "p");
    content = content.replace("ｑ", "q");
    content = content.replace("ｒ", "r");
    content = content.replace("ｓ", "s");
    content = content.replace("ｔ", "t");
    content = content.replace("ｕ", "u");
    content = content.replace("ｖ", "v");
    content = content.replace("ｗ", "w");
    content = content.replace("ｘ", "x");
    content = content.replace("ｙ", "y");
    content = content.replace("ｚ", "z");
    content = content.replace("＠", "@");
    return content;
  }
}

class Watcher {
  getConfig() {
    this._config = vscode.workspace.getConfiguration("pangu");
  }
  constructor() {
    this.getConfig();
    if (this._config.get("auto_format_on_save", false)) {
      let subscriptions = [];
      this._disposable = vscode.Disposable.from(...subscriptions);
      vscode.workspace.onWillSaveTextDocument(
        this._onWillSaveDoc,
        this,
        subscriptions
      );
    }
  }
  dispose() {
    this._disposable.dispose();
  }
  _onWillSaveDoc(e) {
    new DocumentFormatter().updateDocument();
  }
}
//# sourceMappingURL=extension.js.map
