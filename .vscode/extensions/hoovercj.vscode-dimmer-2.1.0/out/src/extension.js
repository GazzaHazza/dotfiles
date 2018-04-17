'use strict';
const vscode = require('vscode');
const utils = require('./utils');
let enabled = false;
let context = 0;
let opacity = 50;
let delay = 200;
let commandScope = true;
let when = "always";
let dimDecoration;
let normalDecoration = vscode.window.createTextEditorDecorationType({
    textDecoration: 'none; opacity: 1'
});
let delayers = Object.create(null);
function activate(context) {
    let configRegistration = vscode.workspace.onDidChangeConfiguration(initialize);
    let selectionRegistration = vscode.window.onDidChangeTextEditorSelection((e) => updateIfEnabled(e.textEditor));
    let textEditorChangeRegistration = vscode.window.onDidChangeActiveTextEditor((textEditor) => updateIfEnabled(textEditor));
    let commandRegistration = vscode.commands.registerCommand('dimmer.ToggleDimmer', () => {
        vscode.workspace.getConfiguration('dimmer').update("enabled", !enabled, commandScope);
    });
    initialize();
    context.subscriptions.push(selectionRegistration, configRegistration, commandRegistration, textEditorChangeRegistration);
}
exports.activate = activate;
function updateIfEnabled(textEditor) {
    if (enabled) {
        setDecorations(textEditor);
    }
}
function initialize() {
    resetAllDecorations();
    readConfig();
    createDimDecorator();
    setAllDecorations();
}
function readConfig() {
    let config = vscode.workspace.getConfiguration('dimmer');
    enabled = config.get('enabled', false);
    commandScope = config.get('toggleDimmerCommandScope', 'user') === 'user';
    when = config.get('when', 'always');
    opacity = config.get('opacity', 50);
    context = config.get('context', 0);
    delay = config.get('delay', 200);
    delay = delay < 0 ? 0 : delay;
}
function resetAllDecorations() {
    vscode.window.visibleTextEditors.forEach(textEditor => {
        resetDecorations(textEditor);
    });
}
function resetDecorations(textEditor) {
    highlightSelections(textEditor, []);
    undimEditor(textEditor);
}
function setAllDecorations() {
    vscode.window.visibleTextEditors.forEach(updateIfEnabled);
}
function setDecorations(textEditor) {
    let filename = textEditor.document.fileName;
    let delayer = delayers[filename];
    if (!delayer) {
        delayer = new utils.ThrottledDelayer(delay);
        delayers[filename] = delayer;
    }
    delayer.trigger(() => {
        return Promise.resolve().then(() => {
            let selections = textEditor.selections;
            if (when === "selection") {
                selections = selections.filter(s => !s.isEmpty);
            }
            if (selections.length === 0) {
                undimEditor(textEditor);
            }
            else {
                dimEditor(textEditor);
                highlightSelections(textEditor, selections);
            }
        });
    }, delay);
}
function highlightSelections(editor, selections) {
    if (!normalDecoration)
        return;
    let ranges = [];
    selections.forEach(s => {
        if (context < 0) {
            ranges.push(s);
        }
        else {
            ranges.push(new vscode.Range(new vscode.Position(Math.max(s.start.line - context, 0), 0), new vscode.Position(s.end.line + context, Number.MAX_VALUE)));
        }
    });
    editor.setDecorations(normalDecoration, ranges);
}
function createDimDecorator() {
    if (dimDecoration) {
        dimDecoration.dispose();
    }
    dimDecoration = vscode.window.createTextEditorDecorationType({
        textDecoration: `none; opacity: ${opacity / 100}`
    });
}
function undimEditor(editor) {
    if (!dimDecoration)
        return;
    editor.setDecorations(dimDecoration, []);
}
function dimEditor(editor) {
    if (!dimDecoration)
        return;
    let startPosition = new vscode.Position(0, 0);
    let endPosition = new vscode.Position(editor.document.lineCount, Number.MAX_VALUE);
    editor.setDecorations(dimDecoration, [new vscode.Range(startPosition, endPosition)]);
}
function deactivate() {
    resetAllDecorations();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map