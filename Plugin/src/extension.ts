import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import parseCsv from "./parseCsv";
import parseCode from "./parseCode";
import analyzeRequirement from "./analyzeRequirement";

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new RequirementsTreeDataProvider();
  vscode.window.registerTreeDataProvider("requirementsTree", treeDataProvider);

  // Comando per avviare l'analisi
  context.subscriptions.push(
    vscode.commands.registerCommand("requirementsTree.analyze", async () => {
      vscode.window.showInformationMessage("Analysis started...");
      try {
        await treeDataProvider.analyzeRequirements();
        vscode.window.showInformationMessage("Analysis completed.");
      } catch (error) {
        vscode.window.showErrorMessage(`Error during analysis: ${error}`);
      }
    })
  );

  // Comando per il filtro
  context.subscriptions.push(
    vscode.commands.registerCommand("requirementsTree.filter", async () => {
      const searchTerm = await vscode.window.showInputBox({
        prompt: "Enter a term to filter requirements",
        placeHolder: "Example: Fibonacci, file.c, line 4",
      });
      treeDataProvider.filter(searchTerm || "");
    })
  );

  // Comando per analizzare un singolo requisito
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "requirementsTree.analyzeRequirement",
      async (req) => { await treeDataProvider.analyzeRequirementById(req.label); }
    )
  );

  // comando per l'apertura del file
  vscode.commands.registerCommand(
    "requirementsTree.openFileAtLine",
    async (filePath: string, lineNumber: number) => {
      const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder opened.");
        return;
      }

      const absolutePath = path.resolve(workspaceFolder, filePath);

      try {
        const document = await vscode.workspace.openTextDocument(absolutePath);
        const editor = await vscode.window.showTextDocument(document);
        const range = new vscode.Range(lineNumber - 1, 0, lineNumber - 1, 0);
        editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
        editor.selection = new vscode.Selection(range.start, range.start);
      } catch (error) {
        vscode.window.showErrorMessage(`Error opening file: ${absolutePath}`);
      }
    }
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("requirementsTree.load", async () => {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: false,
        openLabel: "Select a CSV file",
        filters: {
          "CSV Files": ["csv"],
          "All Files": ["*"],
        },
      });

      if (fileUri && fileUri[0]) {
        const filePath = fileUri[0].fsPath;
        vscode.window.showInformationMessage(`File selected: ${filePath}`);
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            vscode.window.showErrorMessage(
              `Error reading the file: ${err.message}`
            );
            return;
          }
          try {
            const parsedData = parseCsv(data);
            vscode.window.showInformationMessage(
              "CSV file successfully loaded."
            );
            treeDataProvider.setRequirements(parsedData);
          } catch (parseError) {
            vscode.window.showErrorMessage(
              `Error during parsing: ${parseError}`
            );
          }
        });
      } else {
        vscode.window.showInformationMessage("No file selected.");
      }
    })
  );

  const searchProvider = new SearchSidebarProvider(
    context.extensionUri,
    treeDataProvider
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "requirementsSearch",
      searchProvider
    )
  );
}

class RequirementsTreeDataProvider
  implements vscode.TreeDataProvider<RequirementItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    RequirementItem | undefined | void
  > = new vscode.EventEmitter<RequirementItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    RequirementItem | undefined | void
  > = this._onDidChangeTreeData.event;

  private requirements: any[] = [];
  private analyzedRequirements: { [key: string]: any } = {};
  private filteredRequirements: any[] = [];

  getTreeItem(element: RequirementItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RequirementItem): RequirementItem[] {
    if (!element) {
      return this.getRequirementsDetails();
    }

    return element.details || [];
  }

  setRequirements(requirements: any[]): void {
    this.requirements = requirements;
    this.analyzedRequirements = {};
    this.filteredRequirements = [...this.requirements];
    this._onDidChangeTreeData.fire();
  }

  async analyzeRequirements() {
    if (this.requirements.length === 0) {
      vscode.window.showWarningMessage("No requirements loaded to analyze.");
      return;
    }

    this.analyzedRequirements = {};

    for (const req of this.requirements) {
      try {
        const dati = {
          requirement: req.requirement,
          id: req.id,
          code: await parseCode(req.traceability[0]),
        };
        const analysisResult = await analyzeRequirement(dati);
        

        this.analyzedRequirements[req.id] = {
          ...req,
          text: req.requirement,
          finalPassed: analysisResult.finalPassed,
          issues: analysisResult.finalIssues,
          suggestions: analysisResult.finalSuggestions,
          quality_score: analysisResult.finalScore,
        };
      } catch (error: any) {
        this.analyzedRequirements[req.id] = {
          ...req,
          text: req.requirement,
          issues: [`Error in analysis: ${error.message || error}`],
          suggestions: [],
          quality_score: 0,
        };
        vscode.window.showErrorMessage(
          `Error with requirement ${req.id}: ${error.message || error}`
        );
      }
    }
    this.filteredRequirements = Object.values(this.analyzedRequirements);
    this._onDidChangeTreeData.fire();
  }

  async analyzeRequirementById(id: string): Promise<void> {
    const requirement = this.requirements.find((req) => req.id === id);
  
    if (!requirement) {
      vscode.window.showErrorMessage(`Requirement with ID ${id} not found.`);
      return;
    }
  
    try {
      vscode.window.showInformationMessage(`Analysis start for requirement ${id}.`);
      const dati = {
        requirement: requirement.requirement,
        id: requirement.id,
        code: await parseCode(requirement.traceability[0]),
      };
  
      const analysisResult = await analyzeRequirement(dati);
  
      this.analyzedRequirements[requirement.id] = {
        ...requirement,
        text: requirement.requirement,
        finalPassed: analysisResult.finalPassed,
        issues: analysisResult.finalIssues,
        suggestions: analysisResult.finalSuggestions,
        quality_score: analysisResult.finalScore,
      };
  
      vscode.window.showInformationMessage(`Analysis completed for requirement ${id}.`);
      this._onDidChangeTreeData.fire();
    } catch (error: any) {
      vscode.window.showErrorMessage(
        `Error analyzing requirement ${id}: ${error.message || error}`
      );
    }
  }
  

  filter(term: string): void {
    if (!term) {
      this.filteredRequirements = this.requirements.map(
        (req) => this.analyzedRequirements[req.id] || req
      );
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredRequirements = this.requirements
        .filter(
          (req) =>
            req.requirement.toLowerCase().includes(lowerTerm) ||
            (req.traceability &&
              req.traceability.some((t: any) =>
                t.file.toLowerCase().includes(lowerTerm)
              ) || 
            req.id.toLowerCase().includes(lowerTerm))
        )
    }
    this._onDidChangeTreeData.fire();
  }

  private getRequirementsDetails(): RequirementItem[] {
    return this.filteredRequirements.map((req: any, reqIndex: number) => {
      const analyzedReq = this.analyzedRequirements[req.id];
      const displayRequirement = analyzedReq || req;

      return new RequirementItem(
        `requirement-${displayRequirement.id}-${reqIndex}`,
        displayRequirement.id,
        vscode.TreeItemCollapsibleState.Collapsed,
        [
          new RequirementItem(
            `requirement-${displayRequirement.id}-data`,
            "Requirement",
            vscode.TreeItemCollapsibleState.Collapsed,
            [
              new RequirementItem(
                `requirement-${displayRequirement.id}-description`,
                displayRequirement.text || displayRequirement.requirement,
                vscode.TreeItemCollapsibleState.None
              ),
              ...(displayRequirement.traceability
              ? displayRequirement.traceability.map(
                  (trace: any, traceIndex: number) =>
                    new RequirementItem(
                      `requirement-${displayRequirement.id}-traceability-${traceIndex}`,
                      `traceability: ${trace.file}`,
                      vscode.TreeItemCollapsibleState.Collapsed,
                      trace.lines.map(
                        (line: number, lineIndex: number) =>
                          new RequirementItem(
                            `requirement-${displayRequirement.id}-traceability-${traceIndex}-line-${lineIndex}`,
                            `Line: ${line}`,
                            vscode.TreeItemCollapsibleState.None,
                            [],
                            "",
                            "pathItem",
                            trace.file,
                            line
                          )
                      ),
                      "",
                      "pathItem",
                      trace.file,
                      1
                    )
                )
              : [])],
          ),
          new RequirementItem(
            `requirement-${displayRequirement.id}-result`,
            `Result`,
            vscode.TreeItemCollapsibleState.Collapsed,
            analyzedReq ? [
              new RequirementItem(
                `requirement-${displayRequirement.id}-passed`,
                analyzedReq
                  ? `Result: ${analyzedReq.finalPassed ? "Passed" : "Not Passed"}`
                  : "Result: N/A",
                vscode.TreeItemCollapsibleState.None
              ),
              new RequirementItem(
                `requirement-${displayRequirement.id}-quality`,
                analyzedReq
                  ? `Code compliance: ${analyzedReq.quality_score}/100`
                  : "Code compliance: N/A",
                vscode.TreeItemCollapsibleState.None
              ),
              new RequirementItem(
                `requirement-${displayRequirement.id}-issues`,
                `Issues`,
                vscode.TreeItemCollapsibleState.Collapsed,
                analyzedReq && analyzedReq.issues
                  ? analyzedReq.issues.map(
                      (issue: string, index: number) =>
                        new RequirementItem(
                          `requirement-${displayRequirement.id}-issue-${index}`,
                          `${index + 1}: ${issue}`,
                          vscode.TreeItemCollapsibleState.None
                        )
                    )
                  : []
              ),
              new RequirementItem(
                `requirement-${displayRequirement.id}-suggestions`,
                `Suggestions`,
                vscode.TreeItemCollapsibleState.Collapsed,
                analyzedReq && analyzedReq.suggestions
                  ? analyzedReq.suggestions.map(
                      (suggestion: string, index: number) =>
                        new RequirementItem(
                          `requirement-${displayRequirement.id}-suggestion-${index}`,
                          `${index + 1}: ${suggestion}`,
                          vscode.TreeItemCollapsibleState.None
                        )
                    )
                  : []
              )
            ] : []
          )
        ],
        "",
        "requirement"
      );
    });
  }
}

class RequirementItem extends vscode.TreeItem {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly details?: RequirementItem[],
    public readonly description?: string,
    public readonly contextValue?: string,
    public readonly filePath?: string,
    public readonly lineNumber?: number
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.contextValue = contextValue;
    this.filePath = filePath;
    this.lineNumber = lineNumber;
    if (filePath) {
      this.command = {
        command: "requirementsTree.openFileAtLine",
        title: "Open File",
        arguments: [this.filePath, this.lineNumber],
      };
    }
  }
}

class SearchSidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly treeDataProvider: RequirementsTreeDataProvider
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "filter":
          const searchTerm = message.text || "";
          this.treeDataProvider.filter(searchTerm);
          break;

        case "analyze":
          vscode.commands.executeCommand("requirementsTree.analyze");
          break;

        case "load":
          vscode.commands.executeCommand("requirementsTree.load");
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
    );

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Requirements Analysis</title>
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
        </head>
        <body>
          <button id="loadButton">Load Requirements</button>
          <button id="analyzeButton">Analyze Requirements</button>
          <input type="text" id="searchBox" placeholder="Search requirements..." style="width: 100%; padding: 5px; margin-bottom: 10px;" />
          <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('analyzeButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'analyze' });
            });
            document.getElementById('loadButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'load' });
            });
            document.getElementById('searchBox').addEventListener('input', (e) => {
                    vscode.postMessage({ command: 'filter', text: e.target.value });
            });
          </script>
        </body>
        </html>
    `;
  }
}

export function deactivate() {}
