# Custom Instructions

## Strict Code Transparency Rule
Before and during code execution, the agent must strictly adhere to the following reporting format:
1. **Modified Files List**: Clearly state the path of every file modified or created (e.g., `src/components/...`).
2. **Detailed Changelog**: Provide a bulleted list or table detailing:
   - What was deleted and why.
   - What was specifically modified.
   - What new functions/components were added.
3. **No Truncated Code**: Never use comments like `// ... existing code ...` or truncate functions in explanations or logic. The agent must understand and handle the complete code blocks.
4. **Visual Verification Step**: Clearly explain where and how these modifications appear to the user within the UI after the update.
