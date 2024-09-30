import path from 'node:path';
import type { ESLint } from 'eslint';
import { Core, type ESLintOptions } from 'eslint-interactive';
import { $ } from 'zx';

const core = new Core({
  patterns: ['src', 'spec'],
  eslintOptions: {
    type: 'flat',
  } as ESLintOptions,
});

const results = await core.lint();

/**
 * Converts an absolute file path to a relative file path from the current working directory.
 * @param absolutePath - The absolute file path to convert.
 * @returns The relative file path from the current working directory.
 */
function convertToRelativePath(absolutePath: string): string {
  const currentWorkingDirectory = process.cwd();
  return path.relative(currentWorkingDirectory, absolutePath);
}

const ruleToBasePromptGuidance: Record<string, string> = {
  'unicorn/no-await-expression-member':
    'This means that we need to await the promise and then destructure on a separate line.',
};

const createPromptWithRelativeFilePaths = ({
  eslintResults,
  ruleId,
}: { eslintResults: ESLint.LintResult[]; ruleId: string }) => {
  return eslintResults
    .filter((result) =>
      result.messages.some((message) => message.ruleId === ruleId),
    )
    .map((result) => {
      const relativeFilePath = convertToRelativePath(result.filePath);
      const basePrompt = `The file ${relativeFilePath} has the ESLint issue: ${ruleId}. ${ruleToBasePromptGuidance[ruleId]} Specific information about
    where the issues occur are as follows:`;
      const messageIssues = result.messages
        .filter((message) => message.ruleId === ruleId)
        .map((message) => {
          return `${message.message} at line ${message.line} and column ${message.column}`;
        });
      return {
        prompt: `${basePrompt}\n${messageIssues.join('\n')}`,
        relativeFilePath,
      };
    });
};

const promptWithRelativeFilePaths = createPromptWithRelativeFilePaths({
  eslintResults: results,
  ruleId: 'unicorn/no-await-expression-member',
});

for await (const { prompt, relativeFilePath } of promptWithRelativeFilePaths) {
  console.log('User:', prompt);
  const response =
    await $`OLLAMA_API_BASE=http://127.0.0.1:11434 aider ${relativeFilePath} --message "${prompt}" --model ollama/llama3.1 --no-auto-commits --yes --subtree-only`;
  console.log('AI:', response.stdout);
}
