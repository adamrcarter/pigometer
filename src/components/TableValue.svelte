<script>
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Spinner from "./Spinner.svelte";


    export let value;
    let loading = true
    
    let formatted_val = 0;
    $: (isNaN(value) || !Number.isFinite(value)) && formatted_val !== 0 ? loading = true : loading = false
    $: (!isNaN(value) || Number.isFinite(value)) ? formatted_val = Math.round((value / LAMPORTS_PER_SOL) *100) /100 : null
</script>

<div class="row_val">
    {#if value !== null}
        {#if loading}
            <Spinner/>
        {:else}
        ◎ {formatted_val}
        {/if}
    {/if}
</div>

<style>
    .row_val{
        width: 25%;
    }
</style>