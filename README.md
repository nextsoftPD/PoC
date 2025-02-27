# PoC: API, Estensione VS Code e Progetto di Test

Questo Proof of Concept (PoC) include tre componenti principali:

1. **Server API** sviluppato in Node.js  
2. **Estensione per VS Code** che si connette all'API  
3. **Progetto di test** da aprire con l'estensione  

---

## Struttura del progetto
```
├── API/                  # Server API in Node.js
├── Plugin/               # Estensione per VS Code
└── TestProject/          # Progetto di test
```

---

## Requisiti
Sono necessarie le seguenti tecnologie installate:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [TypeScript](https://www.typescriptlang.org/) (installabile con `npm install -g typescript`)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Ollama](https://ollama.com/) attivo sulla porta standard

---

## Avvio del Server API
1. Apri il terminale e spostati nella cartella `API`:
   ```bash
   cd API
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server:
   ```bash
   node server.js
   ```

 **Nota:** Il server sarà attivo sulla porta `4000`.

---

## Setup dell'Estensione per VS Code
1. Apri una nuova finestra di VS Code nella cartella dell'estensione
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Compila il TypeScript per generare la cartella `out`:
   ```bash
   npx tsc
   ```
4. Avvia la modalità di debug in VS Code per testare l'estensione.

---

## Progetto di Test
Apri la cartella `TestProject` in VS Code con l'estensione attiva per testare l'analisi dei requisiti.

---

## Configurazioni varie
I modelli di Ollama utilizzati sono configurabili tramite un file dedicato: [config.json](./API/config.json).
**Modello di default:** `llama3.2:3b`

Assicurati che Ollama sia attivo sulla porta `11434` prima di utilizzare l'estensione e che i relativi modelli siano disponibili. 

La porta diversa da quella di default si puo' specificare nel file: [.env](./API/.env) insieme alla porta dell'API. 

Nel file [config.json](./Plugin/config.json) del plugin si puo' modificare l'url del server node.
