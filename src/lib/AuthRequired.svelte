<script lang="ts">
	import { page } from "$app/stores";
	import { PUBLIC_CLIENT_ID } from "$env/static/public";
	import { IconAlertTriangle, IconBrandGithub } from "@tabler/icons-svelte";
	import { fly } from "svelte/transition";
</script>

<svelte:head>
    <title>Authentication Required - KJSPKG Lookup</title>
</svelte:head>

<div class="flex-1 flex flex-col items-center justify-center" transition:fly={{ y: 40 }}>
    <IconAlertTriangle class="text-[rgb(var(--color-primary-500))] h-36 lg:h-60 w-auto" />
    <h1 class="h3 text-center w-64 lg:w-96">To access this page, you have to first authenticate yourself through GitHub.</h1>

    <a class="card flex gap-2 mt-4 py-3 px-5 hover:variant-soft-primary" href="https://github.com/login/oauth/authorize?client_id={PUBLIC_CLIENT_ID}&redirect_uri={$page.url}">
        <IconBrandGithub />
        Log In
    </a>
</div>