import { Request, Response } from 'express';
import * as ollamaService from '../services/ollamaService';
import * as constants from '../helpers/constants';

export const analyzeRequirement = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('ollamaController.analyzeRequirement');

    const { id, requirement, code }: { id: string; requirement: string; code: string } = req.body;

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'ID is required and must be a string' });
      return;
    } else if (!requirement || typeof requirement !== 'string') {
      res.status(400).json({ error: 'Requirement is required and must be a string' });
      return;
    } else if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Code is required and must be a string' });
      return;
    }

    console.log('Pre Prompt Requirement');

    const requirementModel: string = constants.requirementModel;
    const requirementContext: string = constants.requirementContext;

    const requirementAnalysis = await ollamaService.sendMessageToOllama(
      requirementModel,
      requirement,
      requirementContext
    );
    console.log('Risposta 1:', requirementAnalysis.response);

    let requirementAnalysisObj: { passed?: boolean; suggestions?: string[]; parseError?: boolean } = {};
    try {
      requirementAnalysisObj = JSON.parse(requirementAnalysis.response || '{}');
    } catch (parseErr) {
      console.error('Error parsing requirementAnalysis JSON:', parseErr);
      requirementAnalysisObj = { parseError: true };
    }

    const codeModel: string = constants.codeModel;
    const codeContext: string = constants.codeContext;
    const codePrompt = constants.codePrompt;

    const codeAnalysis = await ollamaService.sendMessageToOllama(
      codeModel,
      codePrompt(requirement, code),
      codeContext
    );
    console.log('Risposta 2:', codeAnalysis.response);

    let codeAnalysisObj: { quality_score?: number; issues?: string[]; suggestions?: string[]; parseError?: boolean } = {};
    try {
      codeAnalysisObj = JSON.parse(codeAnalysis.response || '{}');
    } catch (parseErr) {
      console.error('Error parsing codeAnalysis JSON:', parseErr);
      codeAnalysisObj = { parseError: true };
    }

    const finalScore: number = codeAnalysisObj?.quality_score || 0;
    const requirementPassed: boolean = requirementAnalysisObj?.passed || false;
    const finalPassed: boolean = requirementPassed && finalScore >= 80;

    const codeIssues: string[] = codeAnalysisObj?.issues || [];
    let finalIssues: string[] = [];

    if (!requirementPassed) {
      finalIssues = ['Il requisito è ambiguo, poco chiaro o incompleto', ...codeIssues];
    } else {
      finalIssues = codeIssues;
    }

    const requirementSuggestions: string[] = requirementAnalysisObj?.suggestions || [];
    const codeSuggestions: string[] = codeAnalysisObj?.suggestions || [];
    const finalSuggestions: string[] = [...requirementSuggestions, ...codeSuggestions];

    const finalAnalysis = {
      id,
      finalPassed,
      finalScore,
      finalIssues,
      finalSuggestions,
    };

    console.log('Valutazione finale:', finalAnalysis);

    res.status(200).json(finalAnalysis);
  } catch (error: any) {
    console.error('Error analyzing requirement:', error.message);
    res.status(500).json({ error: 'Failed to analyze requirement' });
  }
};
