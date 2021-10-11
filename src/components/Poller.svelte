<script lang="ts">
    import { getPiggyBankLamports, getUSDSOLPrice, poll } from "src/api/api";
    import { onDestroy, onMount } from "svelte";

    export let ms = 4000;
    let lamports = 0
    let poller;
    let usdtPrice = 0;

    const apiFunc = async () =>{
        console.log(lamports, usdtPrice)
        lamports = await getPiggyBankLamports();
        usdtPrice = await getUSDSOLPrice();
    }

    onMount(() =>{
        poller = poll(apiFunc, ms)
    })

    onDestroy(() =>{
        clearInterval(poller)
    })

</script>

<slot {lamports} {usdtPrice}></slot>