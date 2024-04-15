<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { IconBlank } from '$lib';
	import { AppBar } from '@skeletonlabs/skeleton';
	import { IconCheck, IconColorSwatch, IconSearch, IconWorld } from '@tabler/icons-svelte';
	import consts from './consts';
	import { contextMenu, type ContextMenuItem } from './overlays/contextMenu';
	import { currentScrollPosition, currentSearchStore, langKeyStore, userPreferencesStore } from './stores';
	import { getLangKeys, getLangs, parseInputString } from './utils';
	import { fly } from 'svelte/transition';
	import IconLogin from './IconLogin.svelte';

	function getQuery(): string {
		return $page.route.id == '/s' ? $page.url.searchParams.get('q') ?? '' : '';
	}

	let searched = getQuery();
	let langs = getLangs();

	let inputElement: HTMLInputElement;

	afterNavigate(() => (searched = getQuery()));

	$: langContextMenu = {
		initiator: 'left' as const,
		items: [
			{ type: 'SEPARATOR', header: $langKeyStore['menu.language'] },

			...Object.keys(langs).map(lang => {
				return {
					type: 'ITEM' as const,
					label: langs[lang],
					icon: $userPreferencesStore.locale == lang ? IconCheck : IconBlank,
					action: () => {
						$userPreferencesStore.locale = lang;
						$langKeyStore = getLangKeys();
					}
				};
			})
		] as ContextMenuItem[]
	};
	$: themeContextMenu = {
		initiator: 'left' as const,
		items: [
			{ type: 'SEPARATOR', header: $langKeyStore['menu.theme'] },

			...[
				{ label: 'KJSPKG', name: 'kjspkg' },
				{ label: '(lighter)', name: 'kjspkg-lighter' },
				{ label: '(G_cat)', name: 'kjspkg-gcat' },
				{},
				{ label: 'Wintry', name: 'wintry' },
				{ label: 'Crimson', name: 'crimson' },
				{ label: 'Serenity', name: 'serenity' }
			].map(({ label, name }) => {
				if (!label || !name) return { type: 'SEPARATOR' };

				return {
					type: 'ITEM' as const,
					label,
					icon: $userPreferencesStore.theme == name ? IconCheck : IconBlank,
					action: () => {
						document.documentElement.classList.add('color-animated');
						$userPreferencesStore.theme = name;
						document.body.dataset.theme = $userPreferencesStore.theme ?? 'kjspkg';
						// location.reload();
					}
				};
			})

			/* { type: 'SEPARATOR' },

			{
				type: 'ITEM',
				label: 'Light mode',
				icon: $userPreferencesStore.lightMode ? IconCheck : IconBlank,
				action: () => {
					if (!$userPreferencesStore.lightMode) {
						modalStore.trigger({
							type: 'confirm',
							body:
								"You're about to enable light mode. Light mode is not supported and your" +
								' experience may be degraded. Are you sure?',
							buttonTextConfirm: 'Enable',
							response(r) {
								if (r) $userPreferencesStore.lightMode = true;
								location.reload();
							}
						});
						return;
					}

					$userPreferencesStore.lightMode = false;
					location.reload();
				}
			} */
		] as ContextMenuItem[]
	};

	$: queryParams = parseInputString(searched);
</script>

<svelte:window
	on:keypress={(event) => {
		if (
			(event.keyCode >= 48 && event.keyCode <= 57) ||
			(event.keyCode >= 65 && event.keyCode <= 90) ||
			(event.keyCode >= 97 && event.keyCode <= 122)
		)
			inputElement.focus();
	}}
/>

<AppBar
	gridColumns="lg:grid-cols-3 grid-cols-[auto_1fr_auto]"
	slotDefault="place-self-center"
	slotTrail="place-self-end"
	class="vt-none transition-colors"
	background={$currentScrollPosition.y > 16 ? 'bg-surface-800/75' : 'bg-transparent'}
>
	<svelte:fragment slot="lead">
		<a class="flex items-center gap-2" href="{base}/">
			<img src={consts.LOGO} alt="logo" class="aspect-square w-8 min-w-8 rounded-token" />
			<span class="hidden lg:inline">KJSPKG Lookup</span>
		</a>
	</svelte:fragment>

	{#if !$page.route.id || !consts.NO_SEARCH.includes($page.route.id)}
		<div
			class="input-group input-group-divider w-full grid-cols-[1fr] lg:w-fit lg:grid-cols-[auto_1fr]"
			transition:fly={{ y: -40 }}
		>
			<div class="hidden text-surface-400 lg:inline">
				<IconSearch class="hidden lg:block" />
			</div>

			<input
				type="search"
				placeholder={$langKeyStore['search.placeholder']}
				bind:this={inputElement}
				bind:value={searched}
				on:input={() => ($currentSearchStore = searched)}
				on:change={() => {
					const query = encodeURIComponent(searched || '');
					// if (query) $userPreferencesStore.lastSearched = query;
					goto(base + `/s?q=${query}`);
				}}
			/>
		</div>
	{/if}

	<svelte:fragment slot="trail">
		<button
			class="btn-icon hover:variant-soft-primary"
			use:contextMenu={langContextMenu}
		>
			<IconWorld />
		</button>
		<button
			class="btn-icon hover:variant-soft-primary"
			use:contextMenu={themeContextMenu}
		>
			<IconColorSwatch />
		</button>
		<IconLogin />
	</svelte:fragment>
</AppBar>
