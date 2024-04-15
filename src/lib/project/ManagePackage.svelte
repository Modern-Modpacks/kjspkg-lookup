<script lang="ts">
	import consts from '$lib/consts';
	import { langKeyStore } from '$lib/stores';
	import { markdownInline } from '$lib/utils';
	import { clipboard, getToastStore, popup } from '@skeletonlabs/skeleton';
	import { vsprintf } from 'sprintf-js';

	const toastStore = getToastStore();

	export let name = 'no-name';

	const options = [
		'install',
		'remove',
		'update',
		null,
		'pkg'
	];
</script>

{#each options as o}
	{#if o}
		<button
			class="code pt-1 text-left hover:brightness-110 active:scale-95"
			use:popup={{ event: 'click', placement: 'right', target: 'copy/' + o }}
			use:clipboard={`kjspkg ${o} ${name}`}
			on:click={() =>
				toastStore.trigger({
					message: 'Copied to clipboard!',
					hideDismiss: true,
					timeout: 1000,
					background: 'variant-filled-success'
				})}
		>
			kjspkg {o}
			{name}
		</button>
	{:else}
		<hr />
	{/if}
{/each}
