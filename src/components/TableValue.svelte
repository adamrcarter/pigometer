<script>
import { LAMPORTS_PER_SOL } from "@solana/web3.js";


    export let value = []
    export let isLoading = true
    let formatted_val = 0;
    $: formatted_val = Math.round((value / LAMPORTS_PER_SOL) *100) /100
</script>

<div class="row_val">
    {#if value !== null}
        ◎ {formatted_val}
    {/if}
</div>

<style>
    .row_val{
        width: 25%;
    }
</style>