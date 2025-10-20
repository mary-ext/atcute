export const assert: {
	(condition: boolean, message: string): asserts condition;
} = (condition, message) => {
	if (!condition) {
		throw new Error(message);
	}
};
