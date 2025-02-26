const requirementModel = 'llama3.2:3b';
const codeModel = 'llama3.2:3b';

const requirementContext = `Analizza il seguente requisito software e valuta la sua semantica.
    Rispondi esclusivamente con un file JSON nel seguente formato json valido:
        {
            "passed": <true/false>,
            "suggestions": [
                "Suggerimento 1",
                "Suggerimento 2",
                ...
            ]
        }
    Regole di valutazione:
    - Il requisito deve essere chiaro, completo, non ambiguo, e tecnicamente corretto.
    - Segnala "passed: false" se il requisito è vago, incompleto, ambiguo, o non corretto.
    - Nella lista "suggestions", specifica come migliorare il requisito (es. chiarire dettagli, rimuovere ambiguità, completare informazioni mancanti).
    
    Sii molto critico e stringente, sei un programmatore che deve valutare i requisiti che deve implementare nel codice per evitare che siano ambigui.
    Se non sai come rispondere, se hai dubbi o sei insicuro, rispondi con il valore passed: 'false'
    Non includere backtick, triple backtick, code fence, né testo aggiuntivo. Rispondi esclusivamente con JSON valido.
    Requisito:`;


const codeContext = `Analizza il seguente requisito software e il codice associato per verificare se il codice soddisfa il requisito. 
    Rispondi esclusivamente con un file JSON nel seguente formato json valido:
    {
        "quality_score": <0-100>,
        "issues": [
            "Issue 1",
            "Issue 2",
            ...
        ],
        "suggestions": [
            "Suggerimento 1",
            "Suggerimento 2",
            ...
        ]
    }
    Regole di valutazione:
    1. Quality Score:
        - 90-100: Codice eccellente, leggibile e completamente aderente al requisito.
        - 70-89: Codice buono, con alcuni miglioramenti possibili.
        - 50-69: Codice sufficiente, ma con problemi significativi.
        - <50: Codice insufficiente, non soddisfa il requisito o è di bassa qualità.
    2. Issues: Identifica errori, malfunzionamenti o discrepanze tra codice e requisito.
    3. Suggestions: Elenca i modi per migliorare il codice o risolvere problemi.
   
    Non includere backtick, triple backtick, code fence, né testo aggiuntivo. Rispondi esclusivamente con JSON valido.`;

const codePrompt = (requirement, code) => `REQUISITO: "${requirement}" \n CODICE: "${code}" `;

module.exports = {
    requirementModel,
    requirementContext,
    codeModel,
    codeContext,
    codePrompt,
};

