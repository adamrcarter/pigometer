<script lang="ts">
import { PublicKey } from "@solana/web3.js";

import { getUSDSOLPrice, get_txs_until_solscan, get_usdc_txs_solscan, poll, SPLTransactionsSolscan } from "src/api/api";
import { LAMPORT_SOL_FACTOR } from "src/util/calculations";
import { onDestroy, onMount } from "svelte";

import TableValue from "./TableValue.svelte";


    export let name;
    export let num_cols;
    export let column_values;
    export let pubkey : PublicKey;
    export let connection;
    export let last_tx;
    export let last_usdc_tx;
    export let usdcPrice;


    let poller


    const apiFunc = async (_usdcPrice) =>{

        const usdc_txs : SPLTransactionsSolscan[] = await get_usdc_txs_solscan(pubkey, last_usdc_tx)
        // console.log(usdc_txs)
        const usdc_delta = usdc_txs.reduce((total : number, current : SPLTransactionsSolscan ) =>{
            if(current.changeType === "inc"){
                return total + (current.changeAmount / current.decimals)

            }
            return total
        }, 0)
        console.log("usdc delta for ", pubkey.toBase58(), usdc_delta, last_usdc_tx ,usdc_txs)
        if(usdc_txs.length > 0){
            last_usdc_tx = usdc_txs[0].signature[0]
        }

        const txs = await get_txs_until_solscan(pubkey, last_tx);
        console.log(`resturned sol txs from ${pubkey.toBase58()}`, txs)
        const sol_delta = txs.reduce((total : number, current  ) =>{
                const index = current.inputAccount.findIndex(acc => acc.account === pubkey.toBase58())
                if(index !== -1){
                    console.log(index, "for ", pubkey.toBase58(), "tott ", current.inputAccount[index].postBalance,current.inputAccount[index].preBalance )

                    return total + (current.inputAccount[index].postBalance - current.inputAccount[index].preBalance)
                }

            return total
        }, 0)
        console.log("sol delta for ", pubkey.toBase58(), sol_delta)

        if(txs.length > 0){
            last_tx = txs[0].txHash
        }

        const delta = sol_delta + ((usdc_delta / usdcPrice) * LAMPORT_SOL_FACTOR)


        if(column_values[1] !== null){

            column_values[1] = column_values[1] + delta

        }

    }
    
    onMount(() =>{
        poller = poll(apiFunc, 10000)
    })

    onDestroy(() =>{
        clearInterval(poller)
    })

</script>

<div class="row">

    <div style="width: 25%;">{name}</div>
    {#each column_values as val }
            <TableValue value={val} isLoading={false}/>
    {/each}

</div>

<style>

    .row{
        flex-direction: row;
        height: 50px;
        padding-top: 30px;
        border-bottom: 1px #f0eded solid;
        display: flex;

    }

</style>