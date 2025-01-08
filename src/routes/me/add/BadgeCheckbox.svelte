<script lang="ts">
	export let array: any[] = [];
	export let badge: any;
	export let display: any = badge;
</script>

<button
	class="{array.includes(badge)
		? 'variant-filled-primary'
		: 'variant-soft-primary'} badge select-text hover:brightness-110 active:scale-95"
	on:click={() =>
		(array = array.includes(badge) ? array.filter((b) => b !== badge) : [...array, badge])}
>
	{display}
</button>
