<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import consts from '$lib/consts';
	import { ghApiKeyStore, ghApiLoginStore, langKeyStore } from '$lib/stores';
	import { getGhInfo, initPackageList, postGhInfo } from '$lib/utils';
	import { ProgressRadial, Step, Stepper } from '@skeletonlabs/skeleton';
	import { IconAlertTriangle, IconCheck } from '@tabler/icons-svelte';
	import { vsprintf } from 'sprintf-js';
	import { onMount } from 'svelte';
	import S2 from '../S2.svelte';

	let manifest = {
		author: '' as string | null,
		description: '',
		versions: [] as number[],
		modloaders: [] as string[],
		dependencies: [] as string[],
		incompatibilities: [] as string[]
	};
	let id = 'example-package';
	let output = '';

	onMount(async () => await initPackageList());
</script>

<svelte:head>
	<title>New manifest - KJSPKG Lookup</title>
</svelte:head>

{#if !output}
	<Stepper
		buttonBackLabel={$langKeyStore['new.button.back']}
		buttonNextLabel={$langKeyStore['new.button.next']}
		buttonCompleteLabel={'Generate'}
		stepTerm={$langKeyStore['new.button.step']}
		on:complete={() => (output = JSON.stringify(manifest, null, 4))}
	>
		<Step>
			<svelte:fragment slot="header">this is experimental</svelte:fragment>
			<p>
				Please visit parent route <a href={base + '/me/add'}>{base + '/me/add'}</a> if you want a sane
				experience.
			</p>
		</Step>
		<S2
			bind:id
			bind:author={manifest.author}
			bind:description={manifest.description}
			bind:versions={manifest.versions}
			bind:modloaders={manifest.modloaders}
			bind:dependencies={manifest.dependencies}
			bind:incompatibilities={manifest.incompatibilities}
		/>
	</Stepper>
{:else}
	<pre class="w-full select-text overflow-x-scroll">{output}</pre>
{/if}
