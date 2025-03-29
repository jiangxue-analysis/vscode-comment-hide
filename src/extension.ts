/* !!!
    HAHA ദ്ദി˶>𖥦<)✧, My use comment-hide.
    If you don’t believe it, look .gitignore file ദ്ദി˶>𖥦<)✧
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
      const filePath = document.uri.fsPath;
      const fileContent = document.getText();

      
      const exclusionBlockRegex = /\/\*\s*!!![\s\S]*?\*\//g;
      const exclusionRanges: { start: number; end: number }[] = [];
      let exclusionMatch;
      while (
        (exclusionMatch = exclusionBlockRegex.exec(fileContent)) !== null
      ) {
        exclusionRanges.push({
          start: exclusionMatch.index,
          end: exclusionBlockRegex.lastIndex,
        });
      }

      
      const commentRegex =
        /(['"`])(?:\\.|(?!\1).)*?\1|\/(?:\\.|[^\/\r\n])+\/[gimsuy]*|\/\/.*|\/\*[\s\S]*?\*\//gm;

      const comments: { text: string; line: number; column: number }[] = [];
      const uncommentedCode = fileContent.replace(
        commentRegex,
        (match, _, offset) => {
          const position = document.positionAt(offset);
          
          const isExcluded = exclusionRanges.some(
            (range) => offset >= range.start && offset < range.end
          );
          if (isExcluded) {
            return match; 
          }
          
          if (
            match.startsWith("//") || 
            match.startsWith("/*") || 
            match.startsWith("<!--") || 
            match.startsWith("#") 
          ) {
            comments.push({
              text: match,
              line: position.line,
              column: position.character,
            });
            return ""; 
          }
          return match; 
        }
      );

      
      const relativePath = path.relative(workspaceRoot, filePath);
      const commentFilePath = path.join(
        commentStorePath,
        `${relativePath}.json`
      );

      ensureDirectoryExistence(commentFilePath);

      const commentData = {
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

      vscode.window.showInformationMessage("Comments saved locally.");
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
      const comments = commentData.comments;

      const fileContent = document.getText();
      const edit = new vscode.WorkspaceEdit();

      
      for (const comment of comments) {
        const position = new vscode.Position(comment.line, comment.column);
        edit.insert(document.uri, position, comment.text);
      }

      vscode.workspace.applyEdit(edit);

      vscode.window.showInformationMessage("Comments restored.");
    }
  );
  context.subscriptions.push(saveCommentsCommand, restoreCommentsCommand);
}
