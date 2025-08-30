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

  buildPrompt(codeContent, language, additionalContext) {
    return `
You are an expert technical interviewer and code reviewer. Please analyze the following code and generate a comprehensive coding interview report using the exact format provided below. Add the code snippets where improvement could be made as well.

**Code to Analyze:**
\`\`\`
${codeContent}
\`\`\`

**Additional Context:**
${additionalContext || 'No additional context provided.'}

**Required Report Format:**

You are an expert code evaluator. Analyze the following ${language} code and provide a comprehensive evaluation with scores.

CODE TO EVALUATE:
\`\`\`${language}
${codeContent}
\`\`\`

Please provide your evaluation in the following EXACT format:

# 🔍 Code Evaluation Report

## 📊 Score Summary
**Overall Score: X/100**

### Detailed Breakdown:
| Criteria | Score | Max | Grade |
|----------|-------|-----|-------|
| 📝 Code Quality | X/20 | 20 | A/B/C/D/F |
| ⚡ Algorithm Efficiency | X/20 | 20 | A/B/C/D/F |
| ✅ Best Practices | X/20 | 20 | A/B/C/D/F |
| 🛡️ Error Handling | X/15 | 15 | A/B/C/D/F |
| 📚 Documentation | X/15 | 15 | A/B/C/D/F |
| 🔧 Maintainability | X/10 | 10 | A/B/C/D/F |

**Final Grade: [A+/A/B+/B/C+/C/D/F]**

---

## ✅ Strengths
- **[Category]**: Brief description
- **[Category]**: Brief description
- **[Category]**: Brief description

## 🔄 Areas for Improvement  
- **[Category]**: Specific issue and why it matters
- **[Category]**: Specific issue and why it matters
- **[Category]**: Specific issue and why it matters

## 💡 Recommendations
### High Priority:
1. **[Action]**: Detailed explanation with code example if applicable
2. **[Action]**: Detailed explanation with code example if applicable

### Medium Priority:
1. **[Action]**: Brief explanation
2. **[Action]**: Brief explanation

### Low Priority:
1. **[Action]**: Brief explanation

---

## 📈 Performance Analysis
- **Time Complexity**: O(?)
- **Space Complexity**: O(?)
- **Scalability**: [Excellent/Good/Fair/Poor]

## 🎯 Summary
Brief 2-3 sentence summary of the code's overall quality and main takeaways.

Keep your feedback constructive, specific, and actionable. Use concrete examples when possible.
`;
  }

  async analyzeFileContent(fileContent, filename, problemStatement = '') {
    try {
      const contextualPrompt = `
File: ${ filename }
Problem Statement: ${ problemStatement || 'Not provided' }
Code Content: ${ fileContent }
`;
      
      return await this.generateReport(fileContent, contextualPrompt);
    } catch (error) {
      throw error;
    }
  }
}

export default new GeminiService();
