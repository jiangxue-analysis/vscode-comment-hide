/* >>>
    HAHA ദ്ദി˶>𖥦<)✧, My use comment-hide.
    If you don't believe it, look .gitignore file ദ്ദി˶>𖥦<)✧
*/

import * as vscode from "vscode"; 
import * as fs from "fs"; 
import * as path from "path"; 

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true }); 
  }
}

export function activate(context: vscode.ExtensionContext) {

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const commentStorePath = path.join(workspaceRoot, ".annotations");

  if (!fs.existsSync(commentStorePath)) {
    fs.mkdirSync(commentStorePath);
  }

  const saveCommentsCommand = vscode.commands.registerCommand(
    "extension.saveComments",
    () => {

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const document = editor.document;
      const fileContent = document.getText();

      const stringAndRegexRanges: { start: number; end: number }[] = [];

      const stringAndRegexRegex =
        /(['"`])(?:\\.|(?!\1).)*?\1|\/(?![*/])(?:\\.|[^\/\r\n])+\/(?:[gimsuy]*)/g;
      let match: RegExpExecArray | null;
      while ((match = stringAndRegexRegex.exec(fileContent)) !== null) {
        stringAndRegexRanges.push({
          start: match.index,
          end: stringAndRegexRegex.lastIndex,
        });
      }

      const exclusionBlockRegex = /\/\*\s*>>>\s*[\s\S]*?\*\//g;
      const exclusionRanges: { start: number; end: number }[] = [];
      while ((match = exclusionBlockRegex.exec(fileContent)) !== null) {
        exclusionRanges.push({
          start: match.index,
          end: exclusionBlockRegex.lastIndex,
        });
      }

      const commentRegex = /\/\/.*|\/\*[\s\S]*?\*\/|#.*|<!--[\s\S]*?-->/g;
      const comments: {
        text: string;
        line: number;
        start: number;
        end: number;
      }[] = [];
      let lastIndex = 0;
      let uncommentedParts: string[] = [];

      while ((match = commentRegex.exec(fileContent)) !== null) {

        const isInProtectedRange = stringAndRegexRanges.some(
          (range) =>
            match !== null &&
            match.index >= range.start &&
            match.index < range.end
        );

        const isExcluded = exclusionRanges.some(
          (range) =>
            match !== null &&
            match.index >= range.start &&
            match.index < range.end
        );

        if (!isInProtectedRange && !isExcluded) {

          uncommentedParts.push(fileContent.substring(lastIndex, match.index));

          const startPos = document.positionAt(match.index);
          comments.push({
            text: match[0],
            line: startPos.line,
            start: match.index,
            end: commentRegex.lastIndex,
          });

          lastIndex = commentRegex.lastIndex;
        }
      }

      uncommentedParts.push(fileContent.substring(lastIndex));

      let uncommentedCode = uncommentedParts.join("");

      const lines = uncommentedCode.split("\n");
      const processedLines: string[] = [];
      let lastLineWasEmpty = false;

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed === "") {

          if (!lastLineWasEmpty) {
            processedLines.push("");
            lastLineWasEmpty = true;
          }
        } else {
          processedLines.push(line);
          lastLineWasEmpty = false;
        }
      });

      while (processedLines.length > 0 && processedLines[0].trim() === "") {
        processedLines.shift();
      }
      while (
        processedLines.length > 0 &&
        processedLines[processedLines.length - 1].trim() === ""
      ) {
        processedLines.pop();
      }

      uncommentedCode = processedLines.join("\n");

      const relativePath = path.relative(workspaceRoot, document.uri.fsPath);
      const commentFilePath = path.join(
        commentStorePath,
        `${relativePath}.json`
      );
      ensureDirectoryExistence(commentFilePath);

      const commentData = {
        originalContent: fileContent, 
        comments: comments, 
        filePath: relativePath, 
      };

      fs.writeFileSync(commentFilePath, JSON.stringify(commentData, null, 2));

      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fileContent.length)
      );
      edit.replace(document.uri, fullRange, uncommentedCode);
      vscode.workspace.applyEdit(edit);

      vscode.window.showInformationMessage(
        "Comments removed with precise handling."
      );
    }
  );

  const restoreCommentsCommand = vscode.commands.registerCommand(
    "extension.restoreComments",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const document = editor.document;
      const filePath = document.uri.fsPath;

      const relativePath = path.relative(workspaceRoot, filePath);
      const commentFilePath = path.join(
        commentStorePath,
        `${relativePath}.json`
      );

      if (!fs.existsSync(commentFilePath)) {
        vscode.window.showErrorMessage("No comments found for this file.");
        return;
      }

      const commentData = JSON.parse(fs.readFileSync(commentFilePath, "utf-8"));

      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
      );
      edit.replace(document.uri, fullRange, commentData.originalContent);
      vscode.workspace.applyEdit(edit);

      vscode.window.showInformationMessage(
        "Comments and original formatting restored."
      );
    }
  );

  context.subscriptions.push(saveCommentsCommand, restoreCommentsCommand);
}