"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
var DiagnosticCodes;
(function (DiagnosticCodes) {
    DiagnosticCodes[DiagnosticCodes["NO_TEST_FILE"] = 0] = "NO_TEST_FILE";
    DiagnosticCodes[DiagnosticCodes["SNAPSHOT_REDUNANT"] = 1] = "SNAPSHOT_REDUNANT";
    DiagnosticCodes[DiagnosticCodes["SNAPSHOT_DOESNT_EXIST"] = 2] = "SNAPSHOT_DOESNT_EXIST";
})(DiagnosticCodes = exports.DiagnosticCodes || (exports.DiagnosticCodes = {}));
class SnapshotChecker {
    /**
     * Creates an instance of ValidationManager.
     *
     * @param {ConfigurationManager} configuration
     *
     * @memberOf ValidationManager
     */
    constructor(configuration) {
        this.configuration = configuration;
    }
    /**
     * Return diagnostic for snapshot file
     *
     * @param {string} snapshotSource
     * @param {string} [testSource]
     * @returns {(Diagnostic[] | undefined)}
     *
     * @memberOf ValidationManager
     */
    getDiagnosticForSnapshot(snapshotSource, testSource) {
        // means we have snapshot file but not corresponding test file
        const snapshotLines = snapshotSource.split(/\r?\n/g);
        if (!testSource) {
            const diagnostic = {
                severity: 2,
                message: "There is no corresponding test file for this snapshot",
                source: "snapshot-tools",
                code: DiagnosticCodes.NO_TEST_FILE,
                range: {
                    start: {
                        line: 0,
                        character: 0
                    },
                    end: {
                        line: snapshotLines.length - 1,
                        character: Number.MAX_VALUE
                    }
                }
            };
            return [diagnostic];
        }
        try {
            // get information
            const snapshotSourceStore = this.parseSnapshotFile(snapshotSource);
            const snapshotCallsStore = this.parseTestFileAndGetSnapshotCalls(testSource);
            const testSnapshotNames = snapshotCallsStore.snapshotCalls.map(snapshotCall => snapshotCall.name);
            const redunantSnapshots = snapshotSourceStore.snapshotSource.filter(snapshotExport => !testSnapshotNames.includes(snapshotExport.name));
            const diagnostics = [];
            // Loop through left snapshot names, these are redunant
            if (redunantSnapshots.length > 0) {
                for (const redunantSnapshot of redunantSnapshots) {
                    diagnostics.push({
                        message: "The snapshot is redunant",
                        severity: 2,
                        source: "snapshot-tools",
                        code: DiagnosticCodes.SNAPSHOT_REDUNANT,
                        range: {
                            start: { line: redunantSnapshot.line, character: 0 },
                            end: { line: redunantSnapshot.line, character: Number.MAX_VALUE }
                        }
                    });
                }
            }
            return diagnostics;
        }
        catch (e) {
            // don't return diagnostic in case of eval error
            return;
        }
    }
    /**
     * Return diagnostic for test file
     *
     * @param {string} testSource
     * @param {string} [snapshotSource]
     * @returns {(Diagnostic[] | undefined)}
     *
     * @memberOf SnapshotChecker
     */
    getDiagnosticForTest(testSource, snapshotSource) {
        // We need to send diagnostic for test file without snapshot file.
        // In case if there is no snapshot check calls in test we'll send empty diagnostic
        if (!snapshotSource) {
            snapshotSource = "";
        }
        try {
            const diagnostics = [];
            const snapshotSourceStore = this.parseSnapshotFile(snapshotSource);
            const snapshotCallsStore = this.parseTestFileAndGetSnapshotCalls(testSource);
            const snapshotExportNames = snapshotSourceStore.snapshotSource.map(snapshotExport => snapshotExport.name);
            for (const testSnapshotCall of snapshotCallsStore.snapshotCalls) {
                if (!snapshotExportNames.includes(testSnapshotCall.name)) {
                    diagnostics.push({
                        message: "Corresponding snapshot doesn't exist",
                        severity: 2,
                        source: "snapshot-tools",
                        code: DiagnosticCodes.SNAPSHOT_DOESNT_EXIST,
                        range: {
                            start: { line: testSnapshotCall.line, character: 0 },
                            end: { line: testSnapshotCall.line, character: Number.MAX_VALUE }
                        }
                    });
                }
            }
            return diagnostics;
        }
        catch (e) {
            return;
        }
    }
    /**
     * Return snapshot information for requested position in test file or undefined if not found
     *
     * @param {string} testSource
     * @param {string} snapshotSource
     * @param {number} line
     * @param {number} character
     * @returns {(SnapshotSourceInfo | undefined)}
     *
     * @memberOf SnapshotChecker
     */
    getSnapshotForTestPosition(testSource, snapshotSource, line, character) {
        try {
            const snapshotSourceStore = this.parseSnapshotFile(snapshotSource);
            const testSnapshotStore = this.parseTestFileAndGetSnapshotCalls(testSource);
            if (!snapshotSourceStore.sourceFile || !testSnapshotStore.sourceFile) {
                return;
            }
            const position = typescript_1.getPositionOfLineAndCharacter(testSnapshotStore.sourceFile, line, character);
            const testSnapshotCall = testSnapshotStore.snapshotCalls.find(snapshotCallInfo => position >= snapshotCallInfo.posStart && position <= snapshotCallInfo.posEnd);
            // No snapshot call for request position
            if (!testSnapshotCall) {
                return;
            }
            const matchedSnapshot = snapshotSourceStore.snapshotSource.find(snap => snap.name === testSnapshotCall.name);
            return matchedSnapshot;
        }
        catch (e) {
            return undefined;
        }
    }
    /**
     * Return snapshot call in test file information for given position in test file
     *
     * @param {string} testSource
     * @param {string} snapshotSource
     * @param {number} line
     * @param {number} character
     * @returns {(TestSnapshotsCall | undefined)}
     *
     * @memberOf SnapshotChecker
     */
    getTestForSnapshotPosition(testSource, snapshotSource, line, character) {
        try {
            const snapshotSourceStore = this.parseSnapshotFile(snapshotSource);
            const testSnapshotStore = this.parseTestFileAndGetSnapshotCalls(testSource);
            if (!snapshotSourceStore.sourceFile || !testSnapshotStore.sourceFile) {
                return;
            }
            const position = typescript_1.getPositionOfLineAndCharacter(snapshotSourceStore.sourceFile, line, character);
            const matchedSnapshot = snapshotSourceStore.snapshotSource.find(snapshotInfo => position >= snapshotInfo.posStart && position <= snapshotInfo.posEnd);
            // No snapshot call for request position
            if (!matchedSnapshot) {
                return;
            }
            const matchedTest = testSnapshotStore.snapshotCalls.find(snapshotCall => snapshotCall.name === matchedSnapshot.name);
            return matchedTest;
        }
        catch (e) {
            return undefined;
        }
    }
    getAllSnapshots(snapshotSource) {
        try {
            const snapshotStore = this.parseSnapshotFile(snapshotSource);
            return snapshotStore.snapshotSource;
        }
        catch (e) {
            return [];
        }
    }
    /**
     * Analyze test file and return all snapshot call information if exist
     *
     * @private
     * @param {string} source
     * @returns {TestSnapshots[]}
     *
     * @memberOf SnapshotChecker
     */
    parseTestFileAndGetSnapshotCalls(source) {
        const snapshots = [];
        let tsSourceFile;
        try {
            tsSourceFile = typescript_1.createSourceFile("inline.tsx", source, typescript_1.ScriptTarget.ES2015, true, typescript_1.ScriptKind.TSX);
            const firstNode = tsSourceFile.getChildAt(0);
            for (const node of firstNode.getChildren()) {
                // walk only for expressions
                if (node.kind === typescript_1.SyntaxKind.ExpressionStatement) {
                    this.parseExpressionStatement(node, snapshots, "");
                }
            }
        }
        catch (e) {
            console.error("Error when parsing test file");
        }
        return {
            snapshotCalls: snapshots,
            sourceFile: tsSourceFile
        };
    }
    /**
     * Parse snapshot file and return snapshot export information
     *
     * @private
     * @param {string} source
     * @returns {SnapshotSourceInfo[]}
     *
     * @memberOf SnapshotChecker
     */
    parseSnapshotFile(source) {
        const snapshotInfo = [];
        let tsSourceFile;
        try {
            tsSourceFile = typescript_1.createSourceFile("inline.js", source, typescript_1.ScriptTarget.Latest, true);
            const firstNode = tsSourceFile.getChildAt(0);
            for (const node of firstNode.getChildren()) {
                if (node.kind === typescript_1.SyntaxKind.ExpressionStatement && node.expression.kind === typescript_1.SyntaxKind.BinaryExpression) {
                    const exp = node.expression;
                    let snapshotSource = "";
                    if (exp.right.kind === typescript_1.SyntaxKind.NoSubstitutionTemplateLiteral || exp.right.kind === typescript_1.SyntaxKind.StringLiteral) {
                        snapshotSource = exp.right.text;
                    }
                    if (exp.left.kind === typescript_1.SyntaxKind.ElementAccessExpression) {
                        const nameExp = exp.left;
                        if (nameExp.argumentExpression &&
                            (nameExp.argumentExpression.kind === typescript_1.SyntaxKind.NoSubstitutionTemplateLiteral || nameExp.argumentExpression.kind === typescript_1.SyntaxKind.StringLiteral)) {
                            const lineAndCharacter = typescript_1.getLineAndCharacterOfPosition(tsSourceFile, exp.getStart());
                            snapshotInfo.push({
                                name: nameExp.argumentExpression.text,
                                character: lineAndCharacter.character,
                                line: lineAndCharacter.line,
                                source: snapshotSource,
                                posStart: exp.getStart(),
                                posEnd: exp.getEnd()
                            });
                        }
                    }
                }
            }
        }
        catch (e) {
            console.error("Error when parsing snapshot file");
        }
        return {
            snapshotSource: snapshotInfo,
            sourceFile: tsSourceFile
        };
    }
    /**
     * Parse expression node
     *
     * @private
     * @param {ExpressionStatement} node
     * @param {TestSnapshots[]} snapshots
     * @param {string} initialSuiteName
     * @returns {*}
     *
     * @memberOf SnapshotChecker
     */
    parseExpressionStatement(node, snapshots, initialSuiteName) {
        const suiteValidIdentifiers = this.configuration.suiteMethods;
        const testValidIdentifiers = this.configuration.testMethods;
        if (node.expression.kind === typescript_1.SyntaxKind.CallExpression) {
            const callExpression = node.expression;
            if (this.isCallExpressionMatchIdentifiers(callExpression, suiteValidIdentifiers)) {
                // It's suite start
                let name = this.getFirstStringLiteralInFuncCallArgs(callExpression);
                if (!name) {
                    name = "";
                }
                for (const arg of callExpression.arguments) {
                    if (arg.kind === typescript_1.SyntaxKind.ArrowFunction || arg.kind === typescript_1.SyntaxKind.FunctionExpression) {
                        const func = arg;
                        this.parseSuiteFunctionBody(func.body, snapshots, initialSuiteName === "" ? name : `${initialSuiteName} ${name}`);
                    }
                }
            }
            else if (this.isCallExpressionMatchIdentifiers(callExpression, testValidIdentifiers)) {
                let testName = this.getFirstStringLiteralInFuncCallArgs(callExpression);
                if (!testName) {
                    testName = "";
                }
                for (const arg of callExpression.arguments) {
                    if (arg.kind === typescript_1.SyntaxKind.ArrowFunction || arg.kind === typescript_1.SyntaxKind.FunctionExpression) {
                        const func = arg;
                        const testSnapshots = this.parseTestFunctionBody(func.body);
                        if (testSnapshots.length > 0) {
                            snapshots.push(...testSnapshots.map((snapshotInfo, index) => {
                                const fullName = snapshotInfo.ownName ? `${snapshotInfo.ownName} 1` :
                                    initialSuiteName === "" ? `${testName} ${index + 1}` : `${initialSuiteName} ${testName} ${index + 1}`;
                                return {
                                    name: fullName,
                                    line: snapshotInfo.line,
                                    character: snapshotInfo.character,
                                    posStart: snapshotInfo.posStart,
                                    posEnd: snapshotInfo.posEnd
                                };
                            }));
                        }
                    }
                }
            }
        }
    }
    /**
     * Parse function body for suite
     *
     * @private
     * @param {Node} node
     * @param {TestSnapshots[]} snapshots
     * @param {string} initialSuiteName
     * @returns {*}
     *
     * @memberOf SnapshotChecker
     */
    parseSuiteFunctionBody(node, snapshots, initialSuiteName) {
        // Only valid for blocks
        if (node.kind !== typescript_1.SyntaxKind.Block) {
            return;
        }
        const block = node;
        for (let statement of block.statements) {
            if (statement.kind === typescript_1.SyntaxKind.ExpressionStatement) {
                this.parseExpressionStatement(statement, snapshots, initialSuiteName);
            }
        }
    }
    /**
     * Parse function body for test (it(), fit(), test()...) function
     *
     * @private
     * @param {Node} node
     * @returns {SnapshotInfo[]}
     *
     * @memberOf SnapshotChecker
     */
    parseTestFunctionBody(node) {
        const snapshotInfos = [];
        // it("test", () => expect().toMatchSnapshot())
        if (node.kind === typescript_1.SyntaxKind.CallExpression) {
            if (this.isCallExpressionIsSnapshotCall(node)) {
                const ownName = this.getFirstStringLiteralInFuncCallArgs(node);
                const characterAndPosition = typescript_1.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
                snapshotInfos.push({
                    character: characterAndPosition.character,
                    line: characterAndPosition.line,
                    ownName: ownName,
                    posStart: node.getStart(),
                    posEnd: node.getEnd()
                });
            }
        }
        else if (node.kind === typescript_1.SyntaxKind.Block) {
            const block = node;
            for (let statement of block.statements) {
                // snapshot calls are always expression kind
                if (statement.kind === typescript_1.SyntaxKind.ExpressionStatement) {
                    const exp = statement;
                    if (exp.expression.kind === typescript_1.SyntaxKind.CallExpression && this.isCallExpressionIsSnapshotCall(exp.expression)) {
                        const characterAndPosition = typescript_1.getLineAndCharacterOfPosition(node.getSourceFile(), exp.getStart());
                        const ownName = this.getFirstStringLiteralInFuncCallArgs(exp.expression);
                        snapshotInfos.push({
                            character: characterAndPosition.character,
                            line: characterAndPosition.line,
                            ownName: ownName,
                            posStart: exp.getStart(),
                            posEnd: exp.getEnd()
                        });
                    }
                }
            }
        }
        return snapshotInfos;
    }
    /**
     * Return first string literal in function call or undefined
     *
     * @private
     * @param {CallExpression} node
     * @returns {(string | undefined)}
     *
     * @memberOf SnapshotChecker
     */
    getFirstStringLiteralInFuncCallArgs(node) {
        for (const argument of node.arguments) {
            if (argument.kind === typescript_1.SyntaxKind.StringLiteral) {
                return argument.text;
            }
        }
        return;
    }
    /**
     * Check if given call expression matches any of provided identifiers.
     * For property access experssions it checks the left side
     *
     * @private
     * @param {CallExpression} node
     * @param {string[]} identifiers
     * @returns {boolean}
     *
     * @memberOf SnapshotChecker
     */
    isCallExpressionMatchIdentifiers(node, identifiers) {
        // test() / it() // snapshot() / describe()
        if (node.expression.kind === typescript_1.SyntaxKind.Identifier) {
            return identifiers.includes(node.expression.text);
        }
        // test.skip() / it.only() / expect().toMatchSnapshot() / t.snapshot()
        if (node.expression.kind === typescript_1.SyntaxKind.PropertyAccessExpression) {
            const propertyAcccessExpression = node.expression;
            // check left side if it's identifier (identifier.func())
            if (propertyAcccessExpression.expression.kind === typescript_1.SyntaxKind.Identifier) {
                return identifiers.includes(propertyAcccessExpression.expression.text);
            }
        }
        return false;
    }
    /**
     * Check if given call expression is snapshot call
     *
     * @private
     * @param {CallExpression} node
     * @returns {boolean}
     *
     * @memberOf SnapshotChecker
     */
    isCallExpressionIsSnapshotCall(node) {
        const snapshotIdentifiers = this.configuration.snapshotMethods;
        // snapshots calls can be only like identifier.call() or func().call()
        if (node.expression.kind === typescript_1.SyntaxKind.PropertyAccessExpression) {
            const propertyAcccessExpression = node.expression;
            if (propertyAcccessExpression.name.kind === typescript_1.SyntaxKind.Identifier) {
                return snapshotIdentifiers.includes(propertyAcccessExpression.name.text);
            }
        }
        return false;
    }
}
exports.SnapshotChecker = SnapshotChecker;
//# sourceMappingURL=SnapshotChecker.js.map