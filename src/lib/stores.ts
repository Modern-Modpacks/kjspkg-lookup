import { localStorageStore } from '@skeletonlabs/skeleton';
import { writable } from 'svelte/store';

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

export const userPreferencesStore = localStorageStore<{
	sortBy: '' | 'name' | 'author' | 'downloads' | 'views';
	theme: string;
	lightMode: boolean;
	compact: boolean;
	alreadyVisited: boolean;
}>('preferences', {
	sortBy: 'name',
	theme: 'kjspkg',
	lightMode: false,
	compact: false,
	alreadyVisited: true
});
