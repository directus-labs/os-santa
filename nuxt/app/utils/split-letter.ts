/**
 * Splits a letter into main content and postscript
 */
export function splitLetterContent(content: string) {
	const psMatch = content.match(/(\n[P]\.?[S]\.?:?\s+[\s\S]*?)$/i);

	if (!psMatch) {
		return {
			mainContent: content,
			postScript: null,
		};
	}

	const mainContent = content.slice(0, psMatch.index);
	const postScript = psMatch[1]?.trim();

	return {
		mainContent,
		postScript,
	};
}
