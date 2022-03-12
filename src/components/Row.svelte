<script lang="ts">
import { PublicKey } from "@solana/web3.js";

import { getTotalSOLBalance, getUSDSOLPrice, get_txs_until_solscan, get_usdc_txs_solscan, poll, SPLTransactionsSolscan } from "src/api/api";
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

    $: link = `https://solscan.io/account/${pubkey?.toBase58()}`


    const apiFunc = async (_usdcPrice) =>{
        try{
            const usdc_txs : SPLTransactionsSolscan[] = await get_usdc_txs_solscan(pubkey, last_usdc_tx)
        const usdc_delta = usdc_txs.reduce((total : number, current : SPLTransactionsSolscan ) =>{
            if(current.changeType === "inc"){
                return total + (current.changeAmount / current.decimals)

            }
            return total
        }, 0)
        if(usdc_txs.length > 0){
            last_usdc_tx = usdc_txs[0].signature[0]
        }

        const txs = await get_txs_until_solscan(pubkey, last_tx);
        const sol_delta = txs.reduce((total : number, current  ) =>{
                const index = current.inputAccount.findIndex(acc => acc.account === pubkey.toBase58())
                if(index !== -1){
                    console.log(index, "for ", pubkey.toBase58(), "tott ", current.inputAccount[index].postBalance,current.inputAccount[index].preBalance )

                    return total + (current.inputAccount[index].postBalance - current.inputAccount[index].preBalance)
                }

            return total
        }, 0)

        if(txs.length > 0){
            last_tx = txs[0].txHash
        }

        const delta = sol_delta + ((usdc_delta / usdcPrice) * LAMPORT_SOL_FACTOR)


        if(column_values[1] !== null){

            column_values[1] = column_values[1] + delta

        }

        column_values[2] = await getTotalSOLBalance(connection, pubkey, usdcPrice)
        }
        catch(e){
            console.log("Error polling for updates ", pubkey.toBase58())
            console.log(e)
        }
    
       

    }

</script>

<div class="row">

    <div style="width: 25%;">
        {#if name}
        <a href={link} target="_blank">{name}</a>
        {/if}
    </div>
    {#if column_values}
        {#each column_values as val }
            <TableValue value={val}/>
        {/each}
    {/if}

</div>

<style>

    .row{
        flex-direction: row;
        height: 50px;
        padding-top: 30px;
        border-bottom: 1px #f0eded solid;
        display: flex;

    }

    a {
        color: black;
    }

</style>