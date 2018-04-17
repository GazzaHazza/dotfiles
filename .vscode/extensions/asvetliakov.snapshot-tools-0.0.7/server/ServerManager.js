"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const vscode_languageserver_1 = require("vscode-languageserver");
const core_decorators_1 = require("core-decorators");
const DocumentManager_1 = require("./DocumentManager");
class ServerManager {
    /**
     * Creates an instance of ServerManager.
     *
     * @param {IConnection} connection
     * @param {DocumentManager} documentManager
     * @param {SnapshotChecker} snapshotChecker
     * @param {ConfigurationManager} configuration
     *
     * @memberOf ServerManager
     */
    constructor(connection, documentManager, snapshotChecker, configuration) {
        this.connection = connection;
        this.documentManager = documentManager;
        this.snapshotChecker = snapshotChecker;
        this.configurationManager = configuration;
        this.documentManager.onDocumentNeedValidation(this.onDocumentNeedValidation);
        this.connection.onInitialize(this.onInitializeConnection);
        this.connection.onDidChangeWatchedFiles(this.onExternalFileChanges);
        this.connection.onHover(this.onHover);
        this.connection.onDefinition(this.onDefinition);
        this.connection.onDocumentSymbol(this.onDocumentSymbol);
        this.connection.onRequest("snapshotTools/navigateToDefinition", this.onDefinition);
        this.connection.onDidChangeConfiguration(this.onDidChangeConfiguration);
    }
    /**
     * Start listening
     *
     *
     * @memberOf ServerManager
     */
    listen() {
        this.documentManager.listen(this.connection);
        this.connection.listen();
    }
    /**
     * Validate document
     *
     * @protected
     * @param {TextDocument} openedDocument
     * @param {DocumentType} type
     *
     * @memberOf ServerManager
     */
    onDocumentNeedValidation(openedDocument, type) {
        let diagnostic;
        if (type === DocumentManager_1.DocumentType.SNAPSHOT) {
            const testSource = this.documentManager.getLinkedTest(openedDocument.uri);
            diagnostic = this.snapshotChecker.getDiagnosticForSnapshot(openedDocument.getText(), testSource);
        }
        else {
            const snapshotSource = this.documentManager.getLinkedSnapshot(openedDocument.uri);
            diagnostic = this.snapshotChecker.getDiagnosticForTest(openedDocument.getText(), snapshotSource);
        }
        if (diagnostic) {
            // send diagnostic
            this.connection.sendDiagnostics({
                uri: openedDocument.uri,
                diagnostics: diagnostic
            });
        }
    }
    /**
     * Initialize connection
     *
     * @protected
     * @param {InitializeParams} params
     * @returns {InitializeResult}
     *
     * @memberOf ServerManager
     */
    onInitializeConnection(params) {
        if (params.rootPath) {
            this.configurationManager.workspaceRoot = params.rootPath;
        }
        const settings = params.initializationOptions;
        if (settings) {
            this.configurationManager.setSettings(settings);
        }
        return {
            capabilities: {
                textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Full,
                definitionProvider: true,
                hoverProvider: true,
                documentSymbolProvider: true
            }
        };
    }
    /**
     * Watching file changes
     *
     * @protected
     * @param {FileEvent[]} changes
     *
     * @memberOf ServerManager
     */
    onExternalFileChanges(change) {
        this.documentManager.loadExternalChanges(change.changes);
    }
    /**
     * Hover request handler
     * @protected
     * @param {TextDocumentPositionParams} param
     * @returns {(Hover | ResponseError<void>)}
     *
     * @memberOf ServerManager
     */
    onHover(param) {
        const docPath = vscode_languageserver_1.Files.uriToFilePath(param.textDocument.uri);
        const testDocument = this.documentManager.getMostRecentContentByUri(param.textDocument.uri);
        if (!docPath || !testDocument) {
            return null;
        }
        const documentType = this.documentManager.getDocumentType(path.extname(docPath));
        if (documentType !== DocumentManager_1.DocumentType.TEST) {
            return null;
        }
        const snapshotSource = this.documentManager.getLinkedSnapshot(param.textDocument.uri);
        if (!snapshotSource) {
            return null;
        }
        const snapshotInfo = this.snapshotChecker.getSnapshotForTestPosition(testDocument, snapshotSource, param.position.line, param.position.character);
        if (!snapshotInfo) {
            return null;
        }
        return {
            contents: {
                language: "snapshot",
                value: snapshotInfo.source
            }
        };
    }
    /**
     * Definition request handler
     * @protected
     * @param {TextDocumentPositionParam} param
     * @returns {Promise<Location> | ResponseError<void> | null}
     *
     * @memberOf ServerManager
     */
    onDefinition(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const docPath = vscode_languageserver_1.Files.uriToFilePath(param.textDocument.uri);
            const document = this.documentManager.getMostRecentContentByUri(param.textDocument.uri);
            if (!docPath || !document) {
                return null;
            }
            const extname = path.extname(docPath);
            const documentType = this.documentManager.getDocumentType(path.extname(docPath));
            if (documentType === DocumentManager_1.DocumentType.NONE) {
                return null;
            }
            if (documentType === DocumentManager_1.DocumentType.TEST) {
                const snapshotSource = this.documentManager.getLinkedSnapshot(param.textDocument.uri);
                if (!snapshotSource) {
                    return null;
                }
                const snapshotInfo = this.snapshotChecker.getSnapshotForTestPosition(document, snapshotSource, param.position.line, param.position.character);
                if (!snapshotInfo) {
                    return null;
                }
                return vscode_languageserver_1.Location.create(this.documentManager.getLinkedSnapshotUri(param.textDocument.uri), {
                    start: {
                        line: snapshotInfo.line,
                        character: snapshotInfo.character
                    },
                    end: {
                        line: snapshotInfo.line,
                        character: snapshotInfo.character
                    }
                });
            }
            else {
                const testSource = this.documentManager.getLinkedTest(param.textDocument.uri);
                if (!testSource) {
                    return null;
                }
                const testSnapshotCallInfo = this.snapshotChecker.getTestForSnapshotPosition(testSource, document, param.position.line, param.position.character);
                if (!testSnapshotCallInfo) {
                    return null;
                }
                return vscode_languageserver_1.Location.create(this.documentManager.getLinkedTestUri(param.textDocument.uri), {
                    start: {
                        line: testSnapshotCallInfo.line,
                        character: testSnapshotCallInfo.character
                    },
                    end: {
                        line: testSnapshotCallInfo.line,
                        character: testSnapshotCallInfo.character
                    }
                });
            }
        });
    }
    /**
     * On document symbol request
     *
     * @protected
     * @param {DocumentSymbolParams} param
     * @returns {(SymoblInformation[] | ResponseError<void> | null)}
     *
     * @memberOf ServerManager
     */
    onDocumentSymbol(param) {
        const docPath = vscode_languageserver_1.Files.uriToFilePath(param.textDocument.uri);
        const document = this.documentManager.getMostRecentContentByUri(param.textDocument.uri);
        if (!docPath || !document) {
            return null;
        }
        const extname = path.extname(docPath);
        if (extname !== this.configurationManager.snapshotExt) {
            return null;
        }
        const allSnapshots = this.snapshotChecker.getAllSnapshots(document);
        return allSnapshots.map(snapshot => {
            return {
                name: snapshot.name,
                kind: vscode_languageserver_1.SymbolKind.Constant,
                location: vscode_languageserver_1.Location.create(param.textDocument.uri, {
                    start: {
                        line: snapshot.line,
                        character: snapshot.character
                    },
                    end: {
                        line: snapshot.line,
                        character: snapshot.character
                    }
                })
            };
        });
    }
    onDidChangeConfiguration(param) {
        if (param.settings && param.settings.snapshotTools) {
            this.configurationManager.setSettings(param.settings.snapshotTools);
        }
    }
}
__decorate([
    core_decorators_1.autobind
], ServerManager.prototype, "onDocumentNeedValidation", null);
__decorate([
    core_decorators_1.autobind
], ServerManager.prototype, "onInitializeConnection", null);
__decorate([
    core_decorators_1.autobind
], ServerManager.prototype, "onExternalFileChanges", null);
__decorate([
    core_decorators_1.autobind
], ServerManager.prototype, "onHover", null);
__decorate([
    core_decorators_1.autobind
], ServerManager.prototype, "onDefinition", null);
__decorate([
    core_decorators_1.autobind
], ServerManager.prototype, "onDocumentSymbol", null);
__decorate([
    core_decorators_1.autobind
], ServerManager.prototype, "onDidChangeConfiguration", null);
exports.ServerManager = ServerManager;
//# sourceMappingURL=ServerManager.js.map