import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateReport(codeContent, additionalContext = '') {
    try {
      const prompt = this.buildPrompt(codeContent, additionalContext);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        report: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  buildPrompt(codeContent, additionalContext) {
    return `
You are an expert technical interviewer and code reviewer. Please analyze the following code and generate a comprehensive coding interview report using the exact format provided below. Add the code snippets where improvement could be made as well.

**Code to Analyze:**
\`\`\`
${codeContent}
\`\`\`

**Additional Context:**
${additionalContext || 'No additional context provided.'}

**Required Report Format:**
Please generate a report following this EXACT structure and format:

# AI Coding Interview Report

## 📝 Overview

This report provides a comprehensive evaluation of the candidate's coding interview performance. It includes detailed assessments of technical skills, problem-solving abilities, and communication effectiveness. Below you'll find a structured analysis with scores, specific strengths, areas for improvement, and a final recommendation.

---

## 📊 Score Summary

| Skill/Area          | Max Score | Candidate Score | Rating    |
|---------------------|-----------|----------------|-----------|
| Problem Solving     | 10        | [SCORE]        | [RATING]  |
| Code Quality        | 10        | [SCORE]        | [RATING]  |
| Algorithmic Thinking| 10        | [SCORE]        | [RATING]  |
| Debugging           | 10        | [SCORE]        | [RATING]  |
| Communication       | 10        | [SCORE]        | [RATING]  |

**Total Score:** [TOTAL]/50  
**Result:** [OVERALL_RESULT]

---

## ✅ Strengths

[List 3-5 specific strengths based on the code analysis]

---

## 🔄 Improvements & Suggestions

[List 3-5 specific areas for improvement with actionable suggestions]

---

## 💬 Detailed Feedback

**Coding Style:**  
[Detailed analysis of code readability, formatting, and best practices]

**Approach:**  
[Analysis of the approach taken, logic applied, and creativity]

**Mistakes/Errors:**  
[Detailed analysis of any mistakes or misconceptions]

**Collaboration/Communication:**  
[Assessment based on code comments, variable naming, and overall clarity]

---

**Instructions:**
1. Replace all [SCORE] placeholders with actual numbers (0-10)
2. Replace [RATING] with: Excellent (9-10), Good (7-8), Fair (5-6), Poor (0-4)
3. Replace [TOTAL] with the sum of all scores
4. Replace [OVERALL_RESULT] with: Strong (40-50), Moderate (25-39), Needs Improvement (0-24)
5. Provide specific, actionable feedback based on the actual code
6. Be constructive and professional in your assessment
7. Focus on technical accuracy, code quality, and best practices
`;
  }

  async analyzeFileContent(fileContent, filename, problemStatement = '') {
    try {
      const contextualPrompt = `
File: ${filename}
Problem Statement: ${problemStatement || 'Not provided'}
Code Content: ${fileContent}
      `;
      
      return await this.generateReport(fileContent, contextualPrompt);
    } catch (error) {
      throw error;
    }
  }
}

export default new GeminiService();
