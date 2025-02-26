"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const ignoredPaths = [];
async function parseCode(traceability) {
    const { file, lines } = traceability;
    const excludePattern = ignoredPaths.length > 0 ? `{${ignoredPaths.join(',')}}` : '';
    const files = await vscode.workspace.findFiles(`**/${file}`, excludePattern, 1);
    if (files.length === 0) {
        throw new Error(`File non trovato nell'Explorer di VS Code: ${file}`);
    }
    const document = await vscode.workspace.openTextDocument(files[0]);
    const [start, end] = lines;
    if (start < 1 || end < start || end > document.lineCount) {
        throw new Error(`Range di linee non valido: ${start}-${end} per il file ${file}`);
    }
    const code = document.getText(new vscode.Range(start - 1, 0, end - 1, document.lineAt(end - 1).text.length));
    return code;
}
exports.default = parseCode;
//# sourceMappingURL=parseCode.js.map