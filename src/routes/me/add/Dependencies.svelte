<script lang="ts">
	import Dependency from '$lib/project/Dependency.svelte';
	import { langKeyStore, packageListStore } from '$lib/stores';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { IconPlus } from '@tabler/icons-svelte';

	export let dependencies: string[] = [];
	let dependencyText = '';

	const toastStore = getToastStore();
</script>

<dl class="list-dl w-full">
	{#each dependencies as t}
		<Dependency {t} ondelete={() => (dependencies = dependencies.filter((d) => d !== t))} />
	{/each}
</dl>
<div class="input-group input-group-divider grid-cols-[1fr_auto]">
	<input placeholder="slug / mod:id" bind:value={dependencyText} />
	<button
		class="variant-filled-primary"
		on:click={() => {
			if (!dependencyText) return;
			if (!dependencyText.startsWith('mod:') && !$packageListStore?.[dependencyText])
				return toastStore.trigger({
					message: $langKeyStore['new.2.err_does_not_exist'],
					hideDismiss: true,
					timeout: 5000,
					background: 'variant-filled-error'
				});

			if (dependencies.includes(dependencyText)) return (dependencyText = '');
			dependencies = [...dependencies, dependencyText];
			dependencyText = '';
		}}
	>
		<IconPlus />
	</button>
</div>
