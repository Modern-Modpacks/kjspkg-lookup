<script lang="ts">
	import { base } from '$app/paths';
	import consts from '$lib/consts';
	import { ghApiKeyStore, ghApiLoginStore } from '$lib/stores';
	import { IconBrandGithub, IconLogout } from '@tabler/icons-svelte';

	export let author : string;
	export let c: number = 0;
	export let showAvatar = true;
	export let showGit = true;
</script>

<div class="card flex p-4">
	{#if showAvatar}
		<img
			src={consts.AVATARS + author}
			alt="author's profile avatar"
			class="my-auto mr-4 aspect-square h-8 rounded-token"
		/>
	{/if}
	<dl class="grow">
		<dt class="font-bold select-text">{author}</dt>
		<dd class="text-sm opacity-50">
			{#if author!=$ghApiLoginStore}
				owns {c}
				{c == 1 ? 'package' : 'packages'}
			{:else if author==$ghApiLoginStore}
				is you!
			{/if}
		</dd>
	</dl>
	{#if showGit}
		<a class="variant-filled-secondary btn-icon" href={`https://github.com/${author}`} target="_blank">
			<IconBrandGithub />
		</a>
	{/if}
	{#if author==$ghApiLoginStore}
		<button class="variant-filled-secondary btn-icon ml-2" on:click={() => {
			$ghApiKeyStore = null;
			localStorage.removeItem('gh_key');
			
			location.replace(base+'?logout=true');
		}}>
			<IconLogout />
		</button>
	{/if}
</div>
