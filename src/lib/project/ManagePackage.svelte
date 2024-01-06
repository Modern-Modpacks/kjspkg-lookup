<script lang="ts">
	import consts from '$lib/consts';
	import { markdownInline } from '$lib/utils';
	import { clipboard, getToastStore, popup } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let name = 'no-name';
	export let link = '';

	const options = [
		// name, text
		{
			n: 'install',
			t: `In case you aren't aware, you need the [KJSPKG](${consts.KJSPKG_README}) tool to install this package!`
		},
		{
			n: 'remove',
			t: `Got an issue? Need help? Use this packages [issue tracker](${link}) to let us know!`
		},
		{ n: 'update' },
		null,
		{ n: 'pkg' }
	];
</script>

{#each options as o}
	{#if o}
		<button
			class="code pt-1 text-left hover:brightness-110 active:scale-95"
			use:popup={{ event: 'click', placement: 'right', target: 'copy/' + o.n }}
			use:clipboard={`kjspkg ${o.n} ${name}`}
			on:click={() =>
				toastStore.trigger({
					message: 'Copied to clipboard!',
					hideDismiss: true,
					timeout: 1000,
					background: 'variant-filled-success'
				})}
		>
			kjspkg {o.n}
			{name}
		</button>

		{#if o.t}
			<div
				class="card variant-glass-surface max-w-96 p-4 !rounded-container-token style-markdown"
				data-popup="copy/{o.n}"
				style="opacity: 0;"
			>
				{@html markdownInline(o.t)}
			</div>
		{/if}
	{:else}
		<hr />
	{/if}
{/each}
