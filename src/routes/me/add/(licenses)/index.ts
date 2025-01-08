const globResult = import.meta.glob('./*.txt', { eager: true, as: 'raw' });
const entries = Object.entries(globResult);

export const licenses = (year: string, fullname: string) => {
	const pairs = entries.map(([name, content]) => [
		name.slice(2, -4),
		content.replace('[year]', year).replace('[fullname]', fullname)
	]);
	return Object.fromEntries(pairs) as Record<string, string>;
};
