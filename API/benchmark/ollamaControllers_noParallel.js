const ollamaService = require('../services/ollamaService');
const constants = require('../helpers/constants.js');

exports.analyzeRequirements = async (req, res) => {
  try {
    console.log("ollamaController.analyzeRequirements");

    const { requirements } = req.body;

    if (!Array.isArray(requirements)) {
      return res.status(400).json({ error: 'Requirements must be an array' });
    }

    const results = [];

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

      const requirementModel = constants.requirementModel;
      const requirementContext = constants.requirementContext;

      let requirementAnalysisObj;
      try {
        const requirementAnalysis = await ollamaService.sendMessageToOllama(requirementModel, requirement, requirementContext);
        requirementAnalysisObj = JSON.parse(requirementAnalysis.response || '{}');
      } catch (err) {
        console.error(`Error analyzing requirement ID ${id}:`, err.message);
        requirementAnalysisObj = { passed: false, suggestions: ["Error analyzing requirement"], parseError: true };
      }

      const codeModel = constants.codeModel;
      const codeContext = constants.codeContext;
      const codePrompt = constants.codePrompt;

      let codeAnalysisObj;
      try {
        const codeAnalysis = await ollamaService.sendMessageToOllama(codeModel, codePrompt(requirement, code), codeContext);
        codeAnalysisObj = JSON.parse(codeAnalysis.response || '{}');
      } catch (err) {
        console.error(`Error analyzing code for ID ${id}:`, err.message);
        codeAnalysisObj = { quality_score: 0, issues: ["Error analyzing code"], suggestions: [] };
      }

      const finalScore = codeAnalysisObj?.quality_score || 0;
      const requirementPassed = requirementAnalysisObj?.passed || false;
      const finalPassed = requirementPassed && finalScore >= 80;

      const finalIssues = requirementPassed
        ? codeAnalysisObj?.issues || []
        : ["Il requisito è ambiguo, poco chiaro o incompleto", ...(codeAnalysisObj?.issues || [])];

      const finalSuggestions = [
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

  } catch (error) {
    console.error('Error analyzing requirements:', error.message);
    res.status(500).json({ error: 'Failed to analyze requirements' });
  }
};
