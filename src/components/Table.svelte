<script lang="ts">
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { LazyResult } from "postcss";

import { createConnection, getParsedTransactions, getTotalSOLBalance, getTransactionsSigToDate, getUSDSOLPrice, poll } from "src/api/api";
import App from "src/App.svelte";
import { ALPHA_GOV_PUBKEY, ALPHA_PUBKEY, ALPHA_TAKEOVER_TIMESTAMP, DAO, ROYALTIES_PUBKEY } from "src/const";
import { alphaVolume, earningsPer24hrs, getEarnings } from "src/metrics";
    import { calculateAverageSOLPerDay, calculateAverageSOLPerPig, calculateSOLPerPig, calculateUSDPerPig, LAMPORT_SOL_FACTOR } from "src/util/calculations";
    import { onDestroy, onMount } from "svelte";
import Spinner from "./Spinner.svelte";
import Row from "./Row.svelte";
import axios from "axios";
import { delay } from "src/util";
import ListRow from "./ListRow.svelte";

    let volume = 0;
    let averageAlpha24hr = 0;
    let totalAlphaEarnings = 0;
    let averageRoyalties24hr = 0;
    let totalRoyaltiesEarnings = 0;
    let loading = false;
    let poller ;

    let total = 0;

    interface Row {
        num_cols : number,
        column_values : number[],
        pubkey : PublicKey,
        last_tx: string,
        last_usdc_tx : string,
        name : string
    }

    let connection 

    export let lamports = 0
    export let usdcPrice
    export let floor = 0
    export let numListedAlpha = 0;    

    let rows = []

   const fetchAlpha = async () =>{
       
        // const sigs = await getTransactionsSigToDate(ALPHA_PUBKEY, connection, ALPHA_TAKEOVER_TIMESTAMP)
        // const txs = await getParsedTransactions(connection, sigs, ALPHA_TAKEOVER_TIMESTAMP)
        const alpha_index = (await axios.get(`${ALPHA_PUBKEY.toBase58()}.json`)).data as any
        const alphaVolLamports = alpha_index.volume;
        const _alphaEarnings = alpha_index.earnings_lamports;
        volume = Math.round(alphaVolLamports / LAMPORT_SOL_FACTOR) 
        const now = Math.floor(Date.now() / 1000)
        averageAlpha24hr = Math.round(earningsPer24hrs(_alphaEarnings, now, ALPHA_TAKEOVER_TIMESTAMP))
        totalAlphaEarnings = Math.round(_alphaEarnings / LAMPORT_SOL_FACTOR)
        const row : Row = {
            name: "Alpha.art",
            num_cols : 5,
            column_values: [alphaVolLamports, _alphaEarnings, await getTotalSOLBalance(connection, ALPHA_PUBKEY, usdcPrice)],
            pubkey: ALPHA_PUBKEY,
            last_tx: alpha_index.lastTx,
            last_usdc_tx: alpha_index.last_usdc_tx
        }
        rows[0] =  row
    }

    const fetchRoyalties = async () => {
        const royal_index = (await axios.get(`${ROYALTIES_PUBKEY.toBase58()}.json`)).data as any
        const royaltiesEarnings= royal_index.earnings_lamports;
        totalRoyaltiesEarnings = Math.round(royaltiesEarnings / LAMPORT_SOL_FACTOR)
        const row : Row = {
            name: "Royalties",
            num_cols : 5,
            column_values: [null, royaltiesEarnings, await getTotalSOLBalance(connection, ROYALTIES_PUBKEY, usdcPrice)],
            pubkey: ROYALTIES_PUBKEY,
            last_tx: royal_index.lastTx,
            last_usdc_tx: royal_index.last_usdc_tx
        }
        rows[1] =  row
    }

    const fetchPiggyDAO = async () =>{

        const row: Row = {
            name: "Piggy DAO",
            num_cols: 5,
            column_values: [null, null,await getTotalSOLBalance(connection, DAO, usdcPrice) ],
            pubkey: DAO,
            last_tx: null,
            last_usdc_tx: null
        }

        rows[3] =  row

    }

    const sumTotal = (rows : Row[]) =>{
        let _total = 0
        for(const row of rows){
            if(row){
                _total = _total + row.column_values[row.column_values.length -1]

            }
        }
        total = _total
    }

    const fetchGov = async () =>{
        // const sigs = await getTransactionsSigToDate(ALPHA_GOV_PUBKEY, connection, ALPHA_TAKEOVER_TIMESTAMP);
        // const txs = await getParsedTransactions(connection, sigs, ALPHA_TAKEOVER_TIMESTAMP);
        
        const gov_index = (await axios.get(`${ALPHA_GOV_PUBKEY.toBase58()}.json`)).data as any
        const gov_lamports= gov_index.earnings_lamports; 
        const gov_usdc = gov_index.earnings_usdc
        const now = Math.floor(Date.now() / 1000)
        const gov_total_earnings = gov_lamports + ((gov_usdc / usdcPrice) * LAMPORT_SOL_FACTOR)
        averageRoyalties24hr = Math.round(earningsPer24hrs(gov_total_earnings, now, ALPHA_TAKEOVER_TIMESTAMP))
        totalRoyaltiesEarnings = Math.round(gov_total_earnings / LAMPORT_SOL_FACTOR)

        const row : Row = {
            name: "Alpha Gov",
            num_cols : 5,
            column_values: [null, gov_total_earnings, await getTotalSOLBalance(connection, ALPHA_GOV_PUBKEY, usdcPrice)],
            pubkey: ALPHA_GOV_PUBKEY,
            last_tx: gov_index.lastTx,
            last_usdc_tx: gov_index.last_usdc_tx
        }
        rows[2] = row


    }
    const setState = async (usdcPrice) =>{
        console.log("setting state")

        if(usdcPrice !== 0){
            fetchAlpha();
            fetchRoyalties();
            fetchGov();
            fetchPiggyDAO();
        }

    }
    $: sumTotal(rows);
    $: setState(usdcPrice)

    // $: solPerPig = Math.round(calculateSOLPerPig(lamports) * 100000) / 100000
    // $: usdPerPig = Math.round(calculateUSDPerPig(lamports, usdtPrice) * 100000) / 100000
    // $: piggybankSOL = Math.round((lamports/LAMPORT_SOL_FACTOR) * 100) / 100
    // $: averageSOLperDay = Math.round(calculateAverageSOLPerPig(lamports, new Date().getTime()/1000) * 1000) /1000
    // $: averageUSDperDay = averageSOLperDay * usdtPrice
    // $: maleFloor = Math.round(( floor / LAMPORT_SOL_FACTOR) * 100) / 100

    onMount(async () =>{
        connection =  createConnection();
        await delay(100)
  
        poller = poll(async () =>{
            fetchAlpha()
            fetchRoyalties()
            fetchGov()
            fetchPiggyDAO()
        }, 10000)

        // loading = false;

    })

    onDestroy(() => {
        clearInterval(poller)
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
<!--         
        {#each rows as row}
            <Row usdcPrice={usdcPrice} {...row} connection={connection}/>
        {/each} -->

        <ListRow {usdcPrice} {rows} {connection}/>

    {:else}
        <div class="loader">  
            <Spinner/> 
            <div>Loading</div>    
        </div>
    {/if}
     <div class="total row border-btm-none">
        <div class="table-title weight-hv"></div>
        <div class="table-title weight-hv"></div>
         <div class="table-title weight-hv">
            Total
         </div>
         <div class="table-title weight-hv">
            ◎ {Math.round((total / LAMPORTS_PER_SOL) * 100 ) /100}
         </div>
     </div>

</div>


<style>

    /* .centerself{
        justify-self: center;
    } */
    .table-title{
        width: 25%;
        font-weight: 300;
    }

    .total{
        margin-top: 30px;
    }


    .weight-hv{
        font-weight: 800;
    }

    .total{
        display: flex;
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
        height: 90%;
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
        max-height: 550px;
        border-radius: 15px;
        height: 85vh;
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


    .border-btm-none{
        border-bottom: none;
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