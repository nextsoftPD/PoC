import { Request, Response } from 'express';
import * as ollamaService from '../src/services/ollamaService';
import * as constants from '../src/helpers/constants';

interface Requirement {
  id: string;
  requirement: string;
  code: string;
}

interface AnalysisResult {
  id: string;
  finalPassed: boolean;
  finalScore: number;
  finalIssues: string[];
  finalSuggestions: string[];
}

export const analyzeRequirements = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("ollamaController.analyzeRequirements");

    const { requirements }: { requirements: Requirement[] } = req.body;

    if (!Array.isArray(requirements)) {
      res.status(400).json({ error: 'Requirements must be an array' });
      return;
    }

    const results: AnalysisResult[] = [];

    for (const requirementObj of requirements) {
      const { id, requirement, code } = requirementObj;

      if (!id || typeof id !== 'string' || !requirement || typeof requirement !== 'string' || !code || typeof code !== 'string') {
        console.log(`Skipping invalid requirement: ${JSON.stringify(requirementObj)}`);
        results.push({
          id: id || 'UNKNOWN',
          finalPassed: false,
          finalScore: 0,
          finalIssues: ['Invalid input format'],
          finalSuggestions: []
        });
        continue; 
      }

      console.log(`Processing requirement ID: ${id}`);

      const requirementModel: string = constants.requirementModel;
      const requirementContext: string = constants.requirementContext;

      let requirementAnalysisObj: { passed?: boolean; suggestions?: string[]; parseError?: boolean } = {};
      try {
        const requirementAnalysis = await ollamaService.sendMessageToOllama(requirementModel, requirement, requirementContext);
        requirementAnalysisObj = JSON.parse(requirementAnalysis.response || '{}');
      } catch (err: any) {
        console.error(`Error analyzing requirement ID ${id}:`, err.message);
        requirementAnalysisObj = { passed: false, suggestions: ["Error analyzing requirement"], parseError: true };
      }

      const codeModel: string = constants.codeModel;
      const codeContext: string = constants.codeContext;
      const codePrompt = constants.codePrompt;

      let codeAnalysisObj: { quality_score?: number; issues?: string[]; suggestions?: string[]; parseError?: boolean } = {};
      try {
        const codeAnalysis = await ollamaService.sendMessageToOllama(codeModel, codePrompt(requirement, code), codeContext);
        codeAnalysisObj = JSON.parse(codeAnalysis.response || '{}');
      } catch (err: any) {
        console.error(`Error analyzing code for ID ${id}:`, err.message);
        codeAnalysisObj = { quality_score: 0, issues: ["Error analyzing code"], suggestions: [] };
      }

      const finalScore: number = codeAnalysisObj?.quality_score || 0;
      const requirementPassed: boolean = requirementAnalysisObj?.passed || false;
      const finalPassed: boolean = requirementPassed && finalScore >= 80;

      const finalIssues: string[] = requirementPassed
        ? codeAnalysisObj?.issues || []
        : ["Il requisito è ambiguo, poco chiaro o incompleto", ...(codeAnalysisObj?.issues || [])];

      const finalSuggestions: string[] = [
        ...(requirementAnalysisObj?.suggestions || []),
        ...(codeAnalysisObj?.suggestions || [])
      ];

      results.push({
        id,
        finalPassed,
        finalScore,
        finalIssues,
        finalSuggestions
      });
    }

    console.log('Final results:', results);
    res.status(200).json({ results });

  } catch (error: any) {
    console.error('Error analyzing requirements:', error.message);
    res.status(500).json({ error: 'Failed to analyze requirements' });
  }
};
