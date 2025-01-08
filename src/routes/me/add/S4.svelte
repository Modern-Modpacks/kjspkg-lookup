<script lang="ts">
	import { langKeyStore } from '$lib/stores';
	import { Step } from '@skeletonlabs/skeleton';

	type FileTree = { [key: string]: ArrayBuffer | FileTree };
	export let files: FileTree;

	$: file = files['README.md'] as ArrayBuffer;
</script>

<Step>
	<svelte:fragment slot="header">{$langKeyStore['new.4.header']}</svelte:fragment>

	<textarea
		value={new TextDecoder().decode(file)}
		on:input={({ currentTarget: ct }) => {
			const v = ct.value;
			if (v === '') delete files['README.md'];
			files['README.md'] = new TextEncoder().encode(v).buffer;
			files = files;
		}}
		class="textarea variant-form-material"
		rows="12"
		placeholder={$langKeyStore['new.4.no']}
	/>
</Step>
