<script lang="ts">
    import { getFloorMale, getNumListings, getPiggyBankLamports, getUSDSOLPrice, poll } from "src/api/api";
    import { onDestroy, onMount } from "svelte";

    export let ms = 8000;
    let lamports = 0
    let poller;
    let usdtPrice = 0;
    let floor = 0
    let numListedAlpha = 0

    const apiFunc = async () =>{
        const _lamports = await getPiggyBankLamports()
        lamports = lamports > _lamports ? lamports : _lamports;
        usdtPrice = await getUSDSOLPrice();
        floor = await getFloorMale()
        numListedAlpha = await getNumListings()

    }

    onMount(() =>{
        poller = poll(apiFunc, ms)
    })

    onDestroy(() =>{
        clearInterval(poller)
    })

</script>

<slot {lamports} {usdtPrice} {floor} {numListedAlpha}></slot>