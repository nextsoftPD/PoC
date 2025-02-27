"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../config.json');
const apiUrl = config.apiUrl + '/analyzeRequirement';
async function analyzeRequirement(body) {
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
    }
    catch (error) {
        console.error('Error while analyzing requirement:', error);
        throw error;
    }
}
exports.default = analyzeRequirement;
//# sourceMappingURL=analyzeRequirement.js.map