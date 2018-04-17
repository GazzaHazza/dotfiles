"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const vscode_uri_1 = require("vscode-uri");
const core_decorators_1 = require("core-decorators");
const vscode_languageserver_1 = require("vscode-languageserver");
/**
 * Document type
 *
 * @export
 * @enum {number}
 */
var DocumentType;
(function (DocumentType) {
    DocumentType[DocumentType["SNAPSHOT"] = 0] = "SNAPSHOT";
    DocumentType[DocumentType["TEST"] = 1] = "TEST";
    DocumentType[DocumentType["NONE"] = 2] = "NONE";
})(DocumentType = exports.DocumentType || (exports.DocumentType = {}));
/**
 * Manages opened text documents and establishes links to corresponding snapshot/test file
 * Calls onDocumentNeedsValidation delegate when any opened document need to be validated
 *
 * @export
 * @class DocumentManager
 */
class DocumentManager {
    /**
     * Creates an instance of DocumentManager.
     *
     * @param {TextDocuments} textDocumentManager
     * @param {ConfigurationManager} configurationManager
     *
     * @memberOf DocumentManager
     */
    constructor(textDocumentManager, configurationManager, linkedDocumentsMap) {
        this.openedDocumentsManager = textDocumentManager;
        this.configurationManager = configurationManager;
        this.linkedDocuments = linkedDocumentsMap;
        this.openedDocumentsManager.onDidChangeContent(this.onDidChangeContent);
        this.openedDocumentsManager.onDidClose(this.onDidClose);
    }
    /**
     * Listen to document changes
     *
     * @param {IConnection} connection
     *
     * @memberOf DocumentManager
     */
    listen(connection) {
        this.openedDocumentsManager.listen(connection);
    }
    /**
     * Sets callback for document validation
     *
     * @param {DocumentNeedValidation} callback
     *
     * @memberOf DocumentManager
     */
    onDocumentNeedValidation(callback) {
        this.documentNeedValidationCallback = callback;
    }
    /**
     * Return linked test for given snapshot uri
     *
     * @param {string} snapshotUri
     * @returns {string}
     *
     * @memberOf DocumentManager
     */
    getLinkedTest(snapshotUri) {
        const testUri = this.getLinkedTestUri(snapshotUri);
        if (!testUri) {
            return;
        }
        return this.getMostRecentContentByUri(testUri);
    }
    getLinkedTestUri(snapshotUri) {
        const testPath = this.configurationManager.resolveTestFilePath(snapshotUri);
        if (!testPath) {
            return;
        }
        return this.absolutePathToUri(testPath);
    }
    /**
     * Return linked snapshot for given test uri
     *
     * @param {string} testUri
     * @returns {string}
     *
     * @memberOf DocumentManager
     */
    getLinkedSnapshot(testUri) {
        const snapshotUri = this.getLinkedSnapshotUri(testUri);
        if (!snapshotUri) {
            return;
        }
        return this.getMostRecentContentByUri(snapshotUri);
    }
    getLinkedSnapshotUri(testUri) {
        const snapshotPath = this.configurationManager.resolveSnapshotFilePath(testUri);
        if (!snapshotPath) {
            return;
        }
        return this.absolutePathToUri(snapshotPath);
    }
    /**
     * External file changes (snapshot was updated, git branch switching, etc...)
     *
     * @param {FileEvent[]} changes
     *
     * @memberOf DocumentManager
     */
    loadExternalChanges(changes) {
        for (const change of changes) {
            // skip for opened documents - these will get document event instead
            if (this.openedDocumentsManager.get(change.uri)) {
                continue;
            }
            switch (change.type) {
                case vscode_languageserver_1.FileChangeType.Created:
                case vscode_languageserver_1.FileChangeType.Changed: {
                    // update cache if exist
                    if (this.linkedDocuments.get(change.uri)) {
                        this.loadUriFromFile(change.uri);
                    }
                    this.revalidateUriIfNeeded(change.uri);
                    break;
                }
                case vscode_languageserver_1.FileChangeType.Deleted: {
                    if (this.linkedDocuments.get(change.uri)) {
                        this.linkedDocuments.delete(change.uri);
                    }
                    this.cleanupUriAndRevalidateLinked(change.uri);
                    break;
                }
            }
        }
    }
    /**
     * Document was opened/content changed
     *
     * @param {TextDocumentChangeEvent} change
     *
     * @memberOf DocumentManager
     */
    onDidChangeContent(change) {
        this.revalidateUriIfNeeded(change.document.uri);
    }
    /**
     * Document was closed
     *
     * @param {TextDocumentChangeEvent} change
     *
     * @memberOf DocumentManager
     */
    onDidClose(change) {
        this.cleanupUriAndRevalidateLinked(change.document.uri);
    }
    /**
     * Return most actual source of document by given uri
     *
     * @param {string} uri
     * @returns {(string | undefined)}
     *
     * @memberOf DocumentManager
     */
    getMostRecentContentByUri(uri) {
        if (this.openedDocumentsManager.get(uri)) {
            // If we have opened document, return it
            return this.openedDocumentsManager.get(uri).getText();
        }
        else if (this.linkedDocuments.has(uri)) {
            // If we have already stored source, return it
            return this.linkedDocuments.get(uri);
        }
        else {
            return this.loadUriFromFile(uri);
        }
    }
    /**
     * Return document type for given extension. If extension is not snapshot extension or any of test file extension, then return DocumentType.NONE
     *
     * @param {string} extension
     * @returns {boolean}
     *
     * @memberOf DocumentManager
     */
    getDocumentType(extension) {
        if (extension === this.configurationManager.snapshotExt) {
            return DocumentType.SNAPSHOT;
        }
        else if (this.configurationManager.testFileExt.includes(extension)) {
            return DocumentType.TEST;
        }
        return DocumentType.NONE;
    }
    /**
     * Cleanup given URI from manager and revalidate linked test/snapshot
     *
     * @private
     * @param {string} uri
     *
     * @memberOf DocumentManager
     */
    cleanupUriAndRevalidateLinked(uri) {
        const documentPath = vscode_languageserver_1.Files.uriToFilePath(uri);
        if (documentPath) {
            // we closed real file document.
            // We could make few changes but didn't save it, so revalidate affected test/snapshot
            // delete linked file from cache
            const [linkedFilePath,] = this.getLinkedFilePathByUri(uri);
            if (linkedFilePath) {
                const linkedUri = this.absolutePathToUri(linkedFilePath);
                this.linkedDocuments.delete(linkedUri);
            }
            // will skip documentUri but requests validation for linked document if needed
            this.revalidateUriIfNeeded(uri);
        }
    }
    /**
     * Sends validation request for given URI if we have opened document with such URI and it's test file/snapshot.
     * Also sends validation request for linked snapshot/test if we have it opened too
     *
     * @private
     * @param {string} currentUri
     *
     * @memberOf DocumentManager
     */
    revalidateUriIfNeeded(currentUri) {
        if (this.documentNeedValidationCallback) {
            // request validation for current uri if we have opened document with such uri
            const uriPath = vscode_languageserver_1.Files.uriToFilePath(currentUri);
            if (uriPath) {
                const currentType = this.getDocumentType(path.extname(uriPath));
                const currentUriExt = path.extname(uriPath);
                if (currentType !== DocumentType.NONE) {
                    if (this.openedDocumentsManager.get(currentUri)) {
                        const currentUriType = currentUriExt === this.configurationManager.snapshotExt ? DocumentType.SNAPSHOT : DocumentType.TEST;
                        this.documentNeedValidationCallback(this.openedDocumentsManager.get(currentUri), currentUriType);
                    }
                    // revalidate linked URI if it we have document opened
                    const [linkedFilePath, linkedType] = this.getLinkedFilePathByUri(currentUri);
                    if (linkedFilePath && linkedType !== DocumentType.NONE) {
                        const linkedFileUri = this.absolutePathToUri(linkedFilePath);
                        if (this.openedDocumentsManager.get(linkedFileUri)) {
                            this.documentNeedValidationCallback(this.openedDocumentsManager.get(linkedFileUri), linkedType);
                        }
                    }
                }
            }
        }
    }
    /**
     * Read file with given URI and cache it. Overwrites cached value if exist
     *
     * @private
     * @param {string} uri
     * @returns {(string | undefined)}
     *
     * @memberOf DocumentManager
     */
    loadUriFromFile(uri) {
        // Read source and cache
        try {
            const filePath = vscode_languageserver_1.Files.uriToFilePath(uri);
            if (!filePath) {
                return;
            }
            const source = fs.readFileSync(filePath, "utf8");
            this.linkedDocuments.set(uri, source);
            return source;
        }
        catch (e) {
            return;
        }
    }
    /**
     * Return absolute path of linked test/snapshot for given uri and type of linked path
     *
     * @private
     * @param {string} uri
     * @returns {([string | undefined, DocumentType])}
     *
     * @memberOf DocumentManager
     */
    getLinkedFilePathByUri(uri) {
        const uriPath = vscode_languageserver_1.Files.uriToFilePath(uri);
        if (uriPath) {
            const currentUriType = this.getDocumentType(path.extname(uriPath));
            if (currentUriType === DocumentType.SNAPSHOT) {
                return [this.configurationManager.resolveTestFilePath(uri), DocumentType.TEST];
            }
            else if (currentUriType === DocumentType.TEST) {
                return [this.configurationManager.resolveSnapshotFilePath(uri), DocumentType.SNAPSHOT];
            }
        }
        return [undefined, DocumentType.NONE];
    }
    /**
     * Convert absolute path to uri-like path
     *
     * @private
     * @param {string} path
     * @returns {string}
     *
     * @memberOf DocumentManager
     */
    absolutePathToUri(path) {
        const uri = vscode_uri_1.default.file(path);
        return uri.toString();
    }
}
__decorate([
    core_decorators_1.autobind,
    core_decorators_1.debounce(400)
], DocumentManager.prototype, "onDidChangeContent", null);
__decorate([
    core_decorators_1.autobind
], DocumentManager.prototype, "onDidClose", null);
exports.DocumentManager = DocumentManager;
//# sourceMappingURL=DocumentManager.js.map