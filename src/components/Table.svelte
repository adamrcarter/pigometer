<script lang="ts">
import { PublicKey } from "@solana/web3.js";

import { LazyResult } from "postcss";

import { createConnection, getParsedTransactions, getTotalSOLBalance, getTransactionsSigToDate, getUSDSOLPrice } from "src/api/api";
import App from "src/App.svelte";
import { ALPHA_GOV_PUBKEY, ALPHA_PUBKEY, ALPHA_TAKEOVER_TIMESTAMP, DAO, ROYALTIES_PUBKEY } from "src/const";
import { alphaVolume, earningsPer24hrs, getEarnings } from "src/metrics";
    import { calculateAverageSOLPerDay, calculateAverageSOLPerPig, calculateSOLPerPig, calculateUSDPerPig, LAMPORT_SOL_FACTOR } from "src/util/calculations";
    import { onMount } from "svelte";
import Spinner from "./Spinner.svelte";
import Row from "./Row.svelte";

    let solPerPig = 0
    let piggybankSOL = 0
    let usdPerPig
    let averageSOLperDay = 0
    let averageUSDperDay = 0;
    let volume = 0;
    let averageAlpha24hr = 0;
    let totalAlphaEarnings = 0;
    let averageRoyalties24hr = 0;
    let totalRoyaltiesEarnings = 0;
    let loading = true;

    interface Row {
        num_cols : number,
        column_values : number[],
        pubkey : PublicKey,
        lastTX: string,
        name : string
    }

    let connection 

    export let lamports = 0
    export let usdtPrice = 0
    export let floor = 0
    export let numListedAlpha = 0;    

    let rows = []

   const initAlphaStatsRPC = async () =>{
       
        const sigs = await getTransactionsSigToDate(ALPHA_PUBKEY, connection, ALPHA_TAKEOVER_TIMESTAMP)
        const txs = await getParsedTransactions(connection, sigs, ALPHA_TAKEOVER_TIMESTAMP)
        const alphaVolLamports = alphaVolume(txs);
        const _alphaEarnings = getEarnings(txs, ALPHA_PUBKEY);
        volume = Math.round(alphaVolLamports / LAMPORT_SOL_FACTOR) 
        const now = Math.floor(Date.now() / 1000)
        averageAlpha24hr = Math.round(earningsPer24hrs(_alphaEarnings, now, ALPHA_TAKEOVER_TIMESTAMP))
        totalAlphaEarnings = Math.round(_alphaEarnings / LAMPORT_SOL_FACTOR)
        const row : Row = {
            name: "Alpha.art",
            num_cols : 5,
            column_values: [volume, totalAlphaEarnings, await getTotalSOLBalance(connection, ALPHA_PUBKEY, await getUSDSOLPrice())],
            pubkey: ALPHA_PUBKEY,
            lastTX: ""
        }
        rows = [...rows, row]
    }

    const initRoyalties = async () => {
        const sigs = await getTransactionsSigToDate(ROYALTIES_PUBKEY, connection, ALPHA_TAKEOVER_TIMESTAMP);
        const txs = await getParsedTransactions(connection, sigs, ALPHA_TAKEOVER_TIMESTAMP);
        const royaltiesEarnings = getEarnings(txs, ROYALTIES_PUBKEY);
        const now = Math.floor(Date.now() / 1000)
        averageRoyalties24hr = Math.round(earningsPer24hrs(royaltiesEarnings, now, ALPHA_TAKEOVER_TIMESTAMP))
        totalRoyaltiesEarnings = Math.round(royaltiesEarnings / LAMPORT_SOL_FACTOR)
        const row : Row = {
            name: "Royalties",
            num_cols : 5,
            column_values: [null, totalRoyaltiesEarnings, await getTotalSOLBalance(connection, ROYALTIES_PUBKEY, await getUSDSOLPrice())],
            pubkey: ALPHA_PUBKEY,
            lastTX: ""
        }
        rows = [...rows, row]
    }

    const initPiggyDAO = async () =>{

        const row: Row = {
            name: "Piggy DAO",
            num_cols: 5,
            column_values: [null, null,await getTotalSOLBalance(connection, DAO, await getUSDSOLPrice()) ],
            pubkey: DAO,
            lastTX : ""
        }

        rows = [...rows, row]

    }

    const initGov = async () =>{
        const sigs = await getTransactionsSigToDate(ALPHA_GOV_PUBKEY, connection, ALPHA_TAKEOVER_TIMESTAMP);
        const txs = await getParsedTransactions(connection, sigs, ALPHA_TAKEOVER_TIMESTAMP);
        const royaltiesEarnings = getEarnings(txs, ALPHA_GOV_PUBKEY);
        const now = Math.floor(Date.now() / 1000)
        averageRoyalties24hr = Math.round(earningsPer24hrs(royaltiesEarnings, now, ALPHA_TAKEOVER_TIMESTAMP))
        totalRoyaltiesEarnings = Math.round(royaltiesEarnings / LAMPORT_SOL_FACTOR)
        const row : Row = {
            name: "Alpha Gov",
            num_cols : 5,
            column_values: [null, totalRoyaltiesEarnings, await getTotalSOLBalance(connection, ALPHA_GOV_PUBKEY, await getUSDSOLPrice())],
            pubkey: ALPHA_PUBKEY,
            lastTX: ""
        }
        rows = [...rows, row]


    }


    // $: solPerPig = Math.round(calculateSOLPerPig(lamports) * 100000) / 100000
    // $: usdPerPig = Math.round(calculateUSDPerPig(lamports, usdtPrice) * 100000) / 100000
    // $: piggybankSOL = Math.round((lamports/LAMPORT_SOL_FACTOR) * 100) / 100
    // $: averageSOLperDay = Math.round(calculateAverageSOLPerPig(lamports, new Date().getTime()/1000) * 1000) /1000
    // $: averageUSDperDay = averageSOLperDay * usdtPrice
    // $: maleFloor = Math.round(( floor / LAMPORT_SOL_FACTOR) * 100) / 100

    onMount(async () =>{
        connection =  createConnection();
        await initAlphaStatsRPC();
        await initRoyalties();
        await initGov();
        await initPiggyDAO();

        loading = false;

    })

</script>
<div class="dashboard-con">

    <div class="break"></div>

    <div class ="table-title-con">
        <div class="table-title"></div>
        <div class="table-title"></div>
        <div class="table-title">
            Performance
        </div>
        <div class="table-title">
            Position
        </div>

    </div>

    <div class="row">
        <div class="col-title">
            Wallet
        </div>
        <div class="col-title">
            Volume
        </div>
        <div class="col-title">
            Earnings
        </div>
        <div class="col-title">
            Balance
        </div>
    </div>

    {#if !loading}
        
        {#each rows as row}
            <Row {...row} connection={connection}/>
        {/each}

    {:else}
        <div class="loader">  
            <Spinner/> 
            <div>Loading</div>    
        </div>
    {/if}
</div>


<style>

    /* .centerself{
        justify-self: center;
    } */
    .table-title{
        width: 25%;
        font-weight: 300;
    }

    .loader{
        position: fixed;
        width: 100vw;
        height: 100vh;
        margin: auto;
        background-color: #f0ededa3;
        left:0px;
        top:0px;
    }

    .break{
        position: absolute;
        right: 25%;
        border-left: 1px solid #f0eded;
        height: 400px;
    }

    .table-title-con{

        width: 100%;
        height: 50px;
        display: flex;

    }
    .col-title{
        width:25%;
    }
    .loader{
        /* height:80%; */
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 13px;

    }

    .dashboard-con{
        max-width: 800px;
        /* overflow-y: scroll; */
        padding-top: 30px;
        padding-left: 29px;
        padding-right: 29px;
        -ms-overflow-style: none;
        height: 50px;
        scrollbar-width: none;
        margin: auto;
        background-color: #fff;
        max-height: 500px;
        border-radius: 15px;
        height: 80vh;
        margin-top: 32px;
        position: relative;
    }

    .row{
        flex-direction: row;
        height: 50px;
        padding-top: 10px;
        border-bottom: 1px #f0eded solid;
        display: flex;
    }

    .dashboard-con::-webkit-scrollbar{
        display: none;
    }

    .flex{
        display: flex;
        flex-wrap: wrap;
    }

    /* .mid{
        width:70%;
        margin: auto;
    } */

    .center{
        justify-content: center;
        align-items: center;
    }

    .even{
        justify-content: space-evenly;
        align-items: center;
        padding-bottom: 60px;
    }


    .card{
        padding:10px;
        border: 1px solid #fff;
        border-radius: 10px;
        background-color: rgb(238, 238, 238);
        width: 500px;
        /* margin: auto; */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 300px;
        -webkit-box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);
        -moz-box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);
        box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);
        margin-top: 38px;
        z-index: 100;

    }


    .sm{
        width: 300px;
        height: 100px;

    }


    .col{
        flex-direction: column;
    }

    .row{
        flex-direction: row;
    }

    .lg{
        width:30vw;
        min-width: 300px;
    }

    .paddmd{
        padding-top: 50px;
    }

    .center{
        justify-content: center;
        align-items: center;
    }

    .item{
        padding: 10px;
        padding-bottom: 5px;
        color:rgb(37, 37, 37);
        
    }
    .item-lg{
        font-size: 100px;
    }

    .item-md{
        font-size: 30px;
    }
    .cont{
        height: 80%;
        z-index: 100;
		position: relative;
    }
    @media (max-width: 640px) {
       .item-lg{
           font-size: 50px;
       }
       .card{
            width: 90vw;
            height: 200px;
            margin-top: 10px;

       }



       .sm{
           width: 90vw;
           height: 100px;
       }
       
       
    }




</style>