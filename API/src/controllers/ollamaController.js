const ollamaService = require('../services/ollamaService');
const constants = require('../helpers/constants.js')

exports.analyzeRequirement = async (req, res) => {
  try {
    console.log("ollamaController.analyzeRequirement");
 
    const { id, requirement, code } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID is required and must be a string' });
    }
    else if (!requirement || typeof requirement !== 'string') {
      return res.status(400).json({ error: 'Requirement is required and must be a string' });
    }
    else if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required and must be a string' });
    }


    console.log("Pre Prompt Requirement");

    const requirementModel = constants.requirementModel;
    const requirementContext = constants.requirementContext

    const requirementAnalysis = await ollamaService.sendMessageToOllama(requirementModel, requirement, requirementContext);
    console.log("Risposta 1:"+requirementAnalysis.response);

    let requirementAnalysisObj = {};
    try {
      requirementAnalysisObj = JSON.parse(requirementAnalysis.response || '{}');

    } catch (parseErr) {
      console.error('Error parsing requirementAnalysis JSON:', parseErr);
      requirementAnalysisObj = { parseError: true };
    }

    const codeModel = constants.codeModel;
    const codeContext = constants.codeContext;
    const codePrompt = constants.codePrompt;

    const codeAnalysis = await ollamaService.sendMessageToOllama(codeModel, codePrompt(requirement, code), codeContext);
    console.log("Risposta 2:"+codeAnalysis.response);

    let codeAnalysisObj = {};
    try {
      codeAnalysisObj = JSON.parse(codeAnalysis.response || '{}');

    } catch (parseErr) {
      console.error('Error parsing codeAnalysis JSON:', parseErr);
      codeAnalysisObj = { parseError: true };
    }
  
    const finalScore = codeAnalysisObj?.quality_score || 0;
    const requirementPassed = requirementAnalysisObj?.passed || false;
    const finalPassed = (requirementPassed) && (finalScore>=80);

    const codeIssues = codeAnalysisObj?.issues || [];
    let finalIssues = [];
    if (!requirementPassed) {
      finalIssues = [
        "Il requisito è ambiguo, poco chiaro o incompleto",
        ...codeIssues
      ];
    } else {
      finalIssues = codeIssues;
    }

    const requirementSuggestions = requirementAnalysisObj?.suggestions || [];
    const codeSuggestions = codeAnalysisObj?.suggestions || [];
    const finalSuggestions = [
      ...requirementSuggestions,
      ...codeSuggestions
    ];
      
    const finalAnalysis = {
      id,
      finalPassed,
      finalScore,
      finalIssues,         
      finalSuggestions
    };
    
    console.log('Valutazione finale:', finalAnalysis);

    res.status(200).json(finalAnalysis);
    
  } catch (error) {
    console.error('Error analyzing requirement:', error.message);
    res.status(500).json({ error: 'Failed to analyze requirement' });
  }
};
