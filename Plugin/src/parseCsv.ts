interface Traceability {
    file: string;
    lines: number[];
}

interface ParsedRequirement {
    id: string;
    requirement: string;
    traceability: Traceability[];
}

function splitCsvLine(line: string): string[] {
    const regex = /(".*?"|[^"$\s]+)(?=\s*\$|\s*$)/g;
    const matches = line.match(regex);
    return matches ? matches.map(field => field.replace(/^"|"$/g, '').trim()) : [];
}

function parseCsv(data: string): ParsedRequirement[] {
    const lines = data.trim().split('\n');
    const headers = splitCsvLine(lines[0]);
    const result: ParsedRequirement[] = [];

    const idIndex = headers.findIndex(h => h.toLowerCase() === 'id');
    const requirementIndex = headers.findIndex(h => h.toLowerCase() === 'requirement');
    const fileIndex = headers.findIndex(h => h.toLowerCase() === 'file');
    const rangeIndex = headers.findIndex(h => h.toLowerCase() === 'range');

    if (idIndex === -1 || requirementIndex === -1 || fileIndex === -1 || rangeIndex === -1) {
        throw new Error("CSV headers are missing or incorrect. Required headers: ID, Requirement, File, Range");
    }

    for (let i = 1; i < lines.length; i++) {
        const fields = splitCsvLine(lines[i]);
        if (fields.length < headers.length) {
            throw new Error(`Line ${i + 1} has missing fields.`);
        }

        const rangeStr = fields[rangeIndex];
        const [startStr, endStr] = rangeStr.split('-').map(s => s.trim());
        const start = Number(startStr);
        const end = Number(endStr);

        if (isNaN(start) || isNaN(end)) {
            throw new Error(`Invalid range values on line ${i + 1}: "${rangeStr}". Start and end must be numbers.`);
        }

        if (start > end) {
            throw new Error(`Invalid range values on line ${i + 1}: "${rangeStr}". Start must be ≤ end.`);
        }

        result.push({
            id: fields[idIndex],
            requirement: fields[requirementIndex],
            traceability: [{ file: fields[fileIndex], lines: [start, end] }]
        });
    }

    return result;
}

export default parseCsv;