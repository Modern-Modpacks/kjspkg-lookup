<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { PUBLIC_GH_LOGIN_URL, PUBLIC_CLIENT_ID, PUBLIC_CLIENT_SECRET } from "$env/static/public";
	import { getToastStore } from "@skeletonlabs/skeleton";
	import IconLoginPlaceholder from "./IconLoginPlaceholder.svelte";
	import { base } from "$app/paths";
	import { ghApiKeyStore, ghApiLoginStore } from "./stores";
	import { getGhInfo } from "./utils";

	let toastStore = getToastStore();

    async function getGhKey(): Promise<string | null> {
		let ghCode : string | null = $page.url.searchParams.get('code');
		if (ghCode==null) return localStorage.getItem('gh_key');

		let oauthUrl = PUBLIC_CLIENT_SECRET ? `${PUBLIC_GH_LOGIN_URL}?client_id=${PUBLIC_CLIENT_ID}&client_secret=${PUBLIC_CLIENT_SECRET}&code=${ghCode}` : PUBLIC_GH_LOGIN_URL+'/'+ghCode;
		
		let r : Response = await fetch(oauthUrl, {
			method: PUBLIC_CLIENT_SECRET ? 'POST' : 'GET',
			headers: {'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded'}
		})
		if (r.status!=200) {
			toastStore.trigger({
				message: 'Error while trying to log in: '+(await r.text()),
				hideDismiss: true,
				timeout: 4500,
				background: 'variant-filled-error'
			})
			return null;
		}

		let key : string = (await r.json())[PUBLIC_CLIENT_SECRET ? 'access_token' : 'token'];
		localStorage.setItem('gh_key', key);

		let newQ = new URLSearchParams($page.url.searchParams.toString());
		newQ.delete('code');
		goto(`?${newQ.toString()}`);

		toastStore.trigger({
			message: 'Logged in successfully!',
			hideDismiss: true,
			timeout: 3000,
			background: 'variant-filled-success'
		})

		return key;
	}

	if ($page.url.searchParams.get('logout')=='true') {
		toastStore.trigger({
			message: 'Logged out successfully!',
			hideDismiss: true,
			timeout: 1500,
			background: 'variant-filled-success'
		})
	}
</script>

{#await getGhKey()}
    <IconLoginPlaceholder />
{:then ghKey}
    {#if ghKey==null}
        <IconLoginPlaceholder link="https://github.com/login/oauth/authorize?client_id={PUBLIC_CLIENT_ID}&redirect_uri={$page.url}" />
    {:else}
        {#await getGhInfo('user', ghKey)} 
            <IconLoginPlaceholder />
        {:then user}
            {(() => {
                $ghApiKeyStore = ghKey;
                $ghApiLoginStore = user['login']
                return '';
            })()}
            <a
                class="btn-icon hover:scale-110 hover:brightness-100 duration-300"
                href="{base}/me"
            >
                <img class="rounded-full" src={user['avatar_url']} alt="avatar">
            </a>
        {/await}
    {/if}
{/await}