import { localStorageStore } from '@skeletonlabs/skeleton';
import { writable } from 'svelte/store';
import { getLangKeys, getLangs } from './utils';
import { browser } from '$app/environment';

export const packageListStore = writable<{ [key: string]: string } | undefined>();
export const packageStatStore = writable<{
	[key in 'views' | 'downloads']: { [key: string]: number };
}>({
	downloads: {},
	views: {}
});
export const packageStatusStore = writable<{
	[key: string]: { d: [string, string][]; v: boolean; hidePaths: string[] };
}>({
	// back: { d: [], v: true, hidePaths: [] },
	search: { d: [], v: false, hidePaths: ['/s'] }
});
export const currentAuthorStore = writable<string>('');
export const currentSearchStore = writable<string>('');

export const currentScrollPosition = writable<{ x: number; y: number }>({ x: 0, y: 0 });

export const ghApiKeyStore = writable<string | null>(null);
export const ghApiLoginStore = writable<string | null>(null);

export const userPreferencesStore = localStorageStore<{
	sortBy: '' | 'name' | 'author' | 'downloads' | 'views';
	locale: string;
	theme: string;
	lightMode: boolean;
	compact: boolean;
	alreadyVisited: boolean;
}>('preferences', {
	sortBy: 'name',
	locale: browser && Object.keys(getLangs()).includes(navigator.language) ? navigator.language : 'en-US',
	theme: 'kjspkg',
	lightMode: false,
	compact: false,
	alreadyVisited: true
});

export const langKeyStore = writable<{ [key: string]: string }>(getLangKeys());