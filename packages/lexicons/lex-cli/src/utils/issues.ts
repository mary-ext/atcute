import * as v from 'valibot';

/** prints a list of valibot issues to stderr in the lex-cli's standard format. */
export const printValibotIssues = (issues: readonly v.BaseIssue<unknown>[]): void => {
	for (const issue of issues) {
		const dotPath = v.getDotPath(issue) ?? '';
		console.log(`- ${issue.type} at .${dotPath}: ${issue.message}`);
	}
};
