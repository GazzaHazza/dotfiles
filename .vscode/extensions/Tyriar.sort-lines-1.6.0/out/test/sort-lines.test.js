"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
// The module 'assert' provides assertion methods from node
const assert = require("assert");
const path = require("path");
const fs = require("fs");
const vscode_1 = require("vscode");
function selectAllText(editor) {
    const selection = new vscode_1.Selection(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).text.length);
    editor.selection = selection;
}
function getAllText(document) {
    return document.getText(new vscode_1.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length));
}
const fixtureDir = path.join(__dirname, '..', '..', 'fixtures');
const fixtures = fs.readdirSync(fixtureDir).filter(v => v.search('_fixture$') !== -1).map(f => f.replace('_fixture', ''));
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));
const nonDeterministicCommands = ['sortLinesShuffle'];
const extCommands = packageJson.contributes.commands.map(c => c.command.replace('sortLines.', '')).filter(c => nonDeterministicCommands.indexOf(c) === -1);
const expectedExists = {};
suite('Sort Lines', () => {
    suite('All command fixtures exist', () => {
        fixtures.forEach(fixture => {
            test(fixture, () => {
                expectedExists[fixture] = {};
                extCommands.forEach(extCommand => {
                    const exists = fs.existsSync(path.join(fixtureDir, `${fixture}_expected/${extCommand}`));
                    expectedExists[fixture][extCommand] = exists;
                    assert.ok(exists, `Expected result of fixture ${fixture} for command ${extCommand} does not exist. Create the expected result in fixtures/${fixture}_expected/${extCommand}.`);
                });
            });
        });
    });
    extCommands.forEach(extCommand => {
        suite(extCommand, () => {
            fixtures.forEach(fixture => {
                test(fixture, done => {
                    if (!expectedExists[fixture][extCommand]) {
                        done(new Error(`Could not find expected text for fixture ${fixture}`));
                        return;
                    }
                    vscode_1.commands.executeCommand('workbench.action.closeActiveEditor').then(() => {
                        return vscode_1.window.showTextDocument(vscode_1.Uri.file(path.join(fixtureDir, `${fixture}_fixture`))).then(editor => {
                            selectAllText(editor);
                            vscode_1.commands.executeCommand(`sortLines.${extCommand}`).then(() => {
                                const expectedPath = path.join(fixtureDir, `${fixture}_expected/${extCommand}`);
                                const expected = fs.readFileSync(expectedPath, 'utf8');
                                const actual = getAllText(editor.document);
                                if (actual !== expected) {
                                    done(Error(`Command output is not expected\n\nExpected:\n${expected}\n\nActual:\n${actual}`));
                                }
                                else {
                                    done();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=sort-lines.test.js.map