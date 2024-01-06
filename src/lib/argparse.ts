export function parseInputString(input: string) {
	let result: { ROOT: string; [key: string]: string | undefined } = { ROOT: '' };
	let splitInput = input.split(' ');

	for (let i = 0; i < splitInput.length; i++) {
		if (!splitInput[i].startsWith('@')) {
			result['ROOT'] += splitInput[i] + ' ';
			continue;
		}

		if (!splitInput[i].includes(':')) {
			result['_' + splitInput[i].slice(1)] = 'i';
			continue;
		}

		let [key, value] = splitInput[i].split(':');
		if (key == 'ROOT' || key.startsWith('_')) continue;
		key = key.slice(1);

		if (value.startsWith('"') && !value.endsWith('"')) {
			for (let j = i + 1; j < splitInput.length; j++) {
				value += ' ' + splitInput[j];
				i++;

				if (splitInput[j].endsWith('"')) break;
			}
			value = value.slice(1, -1);
		}

		if (!result[key]) result[key] = '';
		result[key] += value + ' ';
	}

	for (const [key, value] of Object.entries(result)) {
		if (!value) continue;

		delete result[key];
		result[key == 'ROOT' ? 'ROOT' : key.toLowerCase()] = value.trim();
	}

	console.info('Parsed input: ', result);

	return result;
}

export function generateInputString(inputObject: {
	ROOT: string;
	[key: string]: string | undefined;
}) {
	let result = '';

	// Add ROOT value
	result += inputObject.ROOT.trim() + ' ';

	// Add other key-value pairs
	for (const [key, value] of Object.entries(inputObject)) {
		if (key === 'ROOT') continue;
		if (!value) continue;

		let formattedValue = value;

		// Check if quotes are needed for the value
		if (formattedValue.includes(' ') || formattedValue.includes(':')) {
			formattedValue = `"${formattedValue}"`;
		}

		// Check if the key starts with an underscore
		if (key.startsWith('_')) {
			result += `@${key.slice(1)} `;
		} else {
			result += `@${key}:${formattedValue} `;
		}
	}

	result.replaceAll(/\s+/g, ' ');

	console.info('Generated input string: ', result.trim());

	return result.trim();
}
