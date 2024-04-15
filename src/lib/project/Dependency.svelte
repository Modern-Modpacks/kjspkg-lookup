<script lang="ts">
	import { base } from '$app/paths';
	import { contextMenu } from '$lib/overlays/contextMenu';
	import { langKeyStore, packageListStore } from '$lib/stores';
	import { packageNameToReadableFormat } from '$lib/utils';
	import { popup } from '@skeletonlabs/skeleton';
	import { IconPackage, IconPuzzle } from '@tabler/icons-svelte';
	import PackagePreview from './PackagePreview.svelte';

	export let t: string;

	let name = t.substring(4).replaceAll('_', ' ');

	$: l = ($packageListStore ?? {})[t];
</script>

{#if t.startsWith('mod:')}
	<button
		class="flex w-full items-center gap-2 p-2 text-left rounded-container-token hover:variant-soft-primary"
		use:contextMenu={{
			initiator: 'left',
			items: [
				{ type: 'SEPARATOR', header: $langKeyStore['package.dependency.mod_open_in'] },
				{
					type: 'ITEM',
					label: 'Modrinth',
					action: () => window.open('https://modrinth.com/mods?q=' + name)
				},
				{
					type: 'ITEM',
					label: 'CurseRinth',
					action: () => window.open('https://curserinth-tizu.vercel.app/mods?q=' + name)
				},
				{
					type: 'ITEM',
					label: 'CurseForge',
					action: () => window.open('https://www.curseforge.com/minecraft/search?category=mods&class=mc-mods&search=' + name)
				}
			]
		}}
	>
		<IconPuzzle />
		<span class="flex-auto">
			<dt class="select-text font-bold">{t.split(':')[1]}</dt>
			<dd class="text-sm opacity-50">{$langKeyStore['package.dependency.external_mod']}</dd>
		</span>
	</button>
{:else}
	<a
		class="flex w-full items-center gap-2 p-2 rounded-container-token hover:variant-soft-primary *:pointer-events-none"
		href={base + `/p?id=${encodeURIComponent(t)}`}
		target="_blank"
		use:popup={{ event: 'hover', placement: 'top', target: 'dependency/' + t }}
	>
		<IconPackage />
		<span class="flex-auto">
			<dt class="select-text font-bold">{packageNameToReadableFormat(t)}</dt>
			<dd class="text-sm opacity-50">{$langKeyStore['package.dependency.kjs_package']}</dd>
		</span>
	</a>

	<PackagePreview popupId="dependency/{t}" locator={l} name={t} />
{/if}
