<script lang="ts">
	import { langKeyStore } from '$lib/stores';
	import { Step } from '@skeletonlabs/skeleton';
	import { licenses as licensesGen } from './(licenses)';
	import { IconListSearch, IconPencil } from '@tabler/icons-svelte';

	type FileTree = { [key: string]: ArrayBuffer | FileTree };
	export let files: FileTree;
	export let author = '';

	$: licenses = licensesGen(`${new Date().getFullYear()}`, author);
	$: mitBuffer = new TextEncoder().encode(licenses['MIT License']).buffer;

	$: file = (() => {
		files['LICENSE'] ??= mitBuffer;
		return files['LICENSE'];
	})() as ArrayBuffer;
	$: selected = new TextDecoder().decode(file);
	$: isCustom = !Object.values(licenses).includes(selected);
</script>

<Step regionHeader="flex justify-between items-center" locked={!selected}>
	<svelte:fragment slot="header">
		<p>{$langKeyStore['new.5.header']}</p>

		{#if !isCustom}
			<button
				class="variant-soft btn-icon btn-icon-sm"
				on:click={() => (files['LICENSE'] = new ArrayBuffer(0))}
			>
				<IconPencil />
			</button>
		{:else}
			<button
				class="variant-soft btn-icon btn-icon-sm"
				on:click={() => (files['LICENSE'] = mitBuffer)}
			>
				<IconListSearch />
			</button>
		{/if}
	</svelte:fragment>

	{#if !isCustom}
		<div class="grid grid-cols-2 gap-2">
			{#each Object.entries(licenses) as [k, v]}
				<button
					on:click={() => (files['LICENSE'] = new TextEncoder().encode(v).buffer)}
					role="option"
					aria-selected={v === selected}
					class="card p-2 text-left aria-selected:variant-filled-primary"
				>
					{k}
				</button>
			{/each}
		</div>
	{:else}
		<textarea
			value={new TextDecoder().decode(file)}
			on:input={({ currentTarget: ct }) => {
				const v = ct.value;
				if (v === '') delete files['LICENSE'];
				files['LICENSE'] = new TextEncoder().encode(v).buffer;
				files = files;
			}}
			class="textarea variant-form-material col-span-2"
			rows="12"
			placeholder={$langKeyStore['new.5.custom']}
		/>
	{/if}
</Step>
