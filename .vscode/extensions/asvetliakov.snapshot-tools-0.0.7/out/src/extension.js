"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
function activate(context) {
    // The server is implemented in node
    let serverModule = context.asAbsolutePath(path.join("server", "server.js"));
    // The debug options for the server
    let debugOptions = { execArgv: ["--nolazy", "--debug=6005"] };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions },
    };
    const configuration = vscode_1.workspace.getConfiguration("snapshotTools");
    const snapshotFileExt = configuration.get("snapshotExt");
    let testFileExt = configuration.get("testFileExt");
    if (typeof testFileExt === "string") {
        testFileExt = [testFileExt];
    }
    // Options to control the language client
    let clientOptions = {
        // Register the server for plain text documents
        documentSelector: ["javascript", "typescript", "javascriptreact", "typescriptreact", "snapshot"],
        synchronize: {
            // Synchronize the setting section 'languageServerExample' to the server
            configurationSection: "snapshotTools",
            // Notify the server about file changes to '.clientrc files contain in the workspace
            fileEvents: [
                vscode_1.workspace.createFileSystemWatcher(`**/*${snapshotFileExt}`),
                ...testFileExt.map(val => vscode_1.workspace.createFileSystemWatcher(`**/*${val}`))
            ]
        }
    };
    // Create the language client and start the client.
    // const client = new LanguageClient("languageServerExample", "Language server example", serverOptions, clientOptions);
    const client = new vscode_languageclient_1.LanguageClient("SnapshotToolsServer", "Snapshot tools server", serverOptions, clientOptions);
    const commandDisposable = vscode_1.commands.registerTextEditorCommand("snapshotTools.navigateToDefinition", (editor) => __awaiter(this, void 0, void 0, function* () {
        const position = editor.selection.active;
        const param = {
            position: position,
            textDocument: {
                uri: editor.document.uri.toString()
            }
        };
        try {
            const response = yield client.sendRequest("snapshotTools/navigateToDefinition", param);
            if (response) {
                const document = yield vscode_1.workspace.openTextDocument(vscode_1.Uri.parse(response.uri));
                const editor = yield vscode_1.window.showTextDocument(document);
                const startPosition = response.range.start;
                const endPosition = response.range.end;
                vscode_1.window.activeTextEditor.selection = new vscode_1.Selection(new vscode_1.Position(startPosition.line, startPosition.character), new vscode_1.Position(endPosition.line, endPosition.character));
                vscode_1.window.activeTextEditor.revealRange(new vscode_1.Range(startPosition.line, startPosition.character, endPosition.line, endPosition.character), vscode_1.TextEditorRevealType.InCenter);
            }
        }
        catch (e) {
        }
    }));
    const clientDisposable = client.start();
    // Push the disposable to the context's subscriptions so that the 
    // client can be deactivated on extension deactivation
    context.subscriptions.push(clientDisposable);
    context.subscriptions.push(commandDisposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map