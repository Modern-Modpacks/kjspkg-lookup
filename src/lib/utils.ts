import { partial_ratio } from 'fuzzball';
import markdownit from 'markdown-it';
import { get } from 'svelte/store';
import consts from './consts';
import { packageListStore, packageStatStore } from './stores';

// @ts-expect-error full exists, thanks crappy types
import { full as emoji } from 'markdown-it-emoji';

const md = markdownit({
	html: false,
	xhtmlOut: false,
	breaks: false,
	langPrefix: 'hljs-',
	linkify: true,
	typographer: true,
	quotes: '“”‘’',
	highlight: function (/*str, lang*/) {
		return '';
	}
}).use(emoji);

export function filterObjectByKey(
	obj: { [key: string]: string },
	searchString: string
): { [key: string]: string } {
	const filteredObj: { [key: string]: string } = {};
	for (const [key, value] of Object.entries(obj)) {
		if (partial_ratio(searchString, key) > 80) {
			filteredObj[key] = value;
		}
	}
	return filteredObj;
}

export async function initPackageList(): Promise<boolean> {
	if (get(packageListStore) == undefined) {
		setTimeout(async () => {
			try {
				for (const k of ['views', 'downloads']) {
					const res = await fetch(consts.AUTOMATIN_URL + `?stat=${k}`);
					const json = await res.json();
					packageStatStore.update((stat) => {
						stat[k as 'views' | 'downloads'] = json;
						return stat;
					});
				}
			} catch (err) {
				console.error(err);
			}
		});

		try {
			const res = await fetch(consts.PACKAGES);
			const json = await res.json();
			packageListStore.set(json);
			return true;
		} catch {
			return false;
		}
	}

	return true;
}

export function capitalizeFirstLetter(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function packageNameToReadableFormat(str: string): string {
	const words = str.split('-');
	const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
	let result = capitalizedWords.join(' ');

	const replacers = {
		kjspkg: 'KJSPKG',
		js: 'JS'
	};

	for (const [key, value] of Object.entries(replacers)) {
		const regex = new RegExp(key, 'ig');
		result = result.replaceAll(regex, value);
	}

	return result;
}

export function markdownInline(str: string): string {
	return md.renderInline(str);
}

export function markdown(str: string): string {
	return md.render(str);
}

import { generateInputString, parseInputString } from './argparse';
export { generateInputString, parseInputString };

export function removeBase(target: string, base: string): string {
	return target.replace(base, '');
}
