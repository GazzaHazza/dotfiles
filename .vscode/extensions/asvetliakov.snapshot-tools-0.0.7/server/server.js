"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const ConfigurationManager_1 = require("./ConfigurationManager");
const DocumentManager_1 = require("./DocumentManager");
const LinkedDocumentsMap_1 = require("./LinkedDocumentsMap");
const ServerManager_1 = require("./ServerManager");
const SnapshotChecker_1 = require("./SnapshotChecker");
// Create a connection for the server. The connection uses Node's IPC as a transport
const connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
const confManager = new ConfigurationManager_1.ConfigurationManager();
const linkedDocumentsMap = new LinkedDocumentsMap_1.LinkedDocumentsMap();
const textDocuments = new vscode_languageserver_1.TextDocuments();
const documentManager = new DocumentManager_1.DocumentManager(textDocuments, confManager, linkedDocumentsMap);
const snapshotChecker = new SnapshotChecker_1.SnapshotChecker(confManager);
const serverManager = new ServerManager_1.ServerManager(connection, documentManager, snapshotChecker, confManager);
serverManager.listen();
//# sourceMappingURL=server.js.map