type RequirementRequest = {
    requirement: string;
    id: string;
    code: string;
};

const apiUrl = 'http://localhost:4000/api/ollama/analyzeRequirement';

async function analyzeRequirement(body: RequirementRequest): Promise<any> {
    try {
        const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        });

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error while analyzing requirement:', error);
        throw error;
    }
}

export default analyzeRequirement;
