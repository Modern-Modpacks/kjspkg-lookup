<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_GITHUB_CLIENT_ID } from '$env/static/public';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import IconLoginPlaceholder from './IconLoginPlaceholder.svelte';
	import { base } from '$app/paths';
	import { ghApiKeyStore, ghApiLoginStore } from './stores';
	import { getGhInfo } from './utils';

	let toastStore = getToastStore();

	async function getGhKey(): Promise<string | null> {
		let ghCode: string | null = $page.url.searchParams.get('code');
		if (ghCode == null) return localStorage.getItem('gh_key');

		let r = await fetch(`${base}/api/exchangeGithubCode?code=${ghCode}`, {
			headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
		});
		if (r.status != 200) {
			toastStore.trigger({
				message: 'Error while trying to log in: ' + (await r.text()),
				hideDismiss: true,
				timeout: 4500,
				background: 'variant-filled-error'
			});
			return null;
		}

		let key = (await r.json())['access_token'];
		localStorage.setItem('gh_key', key);

		let newQ = new URLSearchParams($page.url.searchParams.toString());
		newQ.delete('code');
		goto(`?${newQ.toString()}`);

		toastStore.trigger({
			message: 'Logged in successfully!',
			hideDismiss: true,
			timeout: 3000,
			background: 'variant-filled-success'
		});

		return key;
	}

	if ($page.url.searchParams.get('logout') == 'true') {
		toastStore.trigger({
			message: 'Logged out successfully!',
			hideDismiss: true,
			timeout: 1500,
			background: 'variant-filled-success'
		});
	}
</script>

{#await getGhKey()}
	<IconLoginPlaceholder />
{:then ghKey}
	{#if ghKey == null}
		<IconLoginPlaceholder
			link="https://github.com/login/oauth/authorize?{new URLSearchParams({
				client_id: PUBLIC_GITHUB_CLIENT_ID,
				redirect_uri: $page.url.href,
				scope: 'public_repo'
			}).toString()}"
		/>
	{:else}
		{#await getGhInfo('user', ghKey)}
			<IconLoginPlaceholder />
		{:then user}
			{(() => {
				$ghApiKeyStore = ghKey;
				$ghApiLoginStore = user['login'];
				return '';
			})()}
			<a class="btn-icon duration-300 hover:scale-110 hover:brightness-100" href="{base}/me">
				<img class="rounded-full" src={user['avatar_url']} alt="avatar" />
			</a>
		{/await}
	{/if}
{/await}
