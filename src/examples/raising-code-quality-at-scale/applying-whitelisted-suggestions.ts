import {
  Core,
  type ESLintOptions,
  type SuggestionFilter,
} from 'eslint-interactive';

const core = new Core({
  patterns: ['src', 'spec'],
  eslintOptions: {
    type: 'flat',
  } as ESLintOptions,
});

const results = await core.lint();

for (const result of results) {
  for (const message of result.messages.filter((message) =>
    Boolean(message.suggestions),
  )) {
    console.log(message.ruleId, message.message);
    for (const suggestion of message.suggestions ?? []) {
      console.log(suggestion.fix);
    }
  }
}

const suggestionFilter: SuggestionFilter = (
  suggestions,
  _message,
  _context,
) => {
  // The rule may return multiple suggestions. Pick the first one.
  return suggestions[0];
};

// Whitelist rules with suggestions that should be applied automatically
const ESLINT_RULE_WHITELIST = [
  '@typescript-eslint/require-await',
  'unicorn/text-encoding-identifier-case',
  'no-useless-escape',
  'unicorn/prefer-number-properties',
];

await core.applySuggestions(results, ESLINT_RULE_WHITELIST, suggestionFilter);
