import * as vscode from 'vscode';

interface Traceability {
    file: string;
    lines: number[];
}

const ignoredPaths: string[] = [];

async function parseCode(traceability: Traceability): Promise<string> {
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

    const code = document.getText(new vscode.Range(
        start - 1, 0,
        end - 1, document.lineAt(end - 1).text.length
    ));
    
    return code;
}

export default parseCode;
