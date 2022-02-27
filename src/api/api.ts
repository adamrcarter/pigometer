import { AccountInfo, clusterApiUrl, ConfirmedSignatureInfo, ConfirmedSignaturesForAddress2Options, Connection, ParsedAccountData, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { ALPHA_TAKEOVER_TIMESTAMP, USDC_MINT_ADDRESS, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from "src/const";
import { delay, sliceIntoChunks } from "src/util";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LAMPORT_SOL_FACTOR } from "src/util/calculations";


export const poll = (apiFunc : Function, ms = 4000) =>{
    apiFunc()
    return setInterval(apiFunc, ms);

}
export const createConnection = () =>{
    return new Connection("https://winter-lively-breeze.solana-mainnet.quiknode.pro/d9be0db6fdd2fc011a961940b4c2cb18acfc2fa3/");

}

export const getUSDCBalance = async (conn : Connection, ownerPubkey : PublicKey)  : Promise<number> =>{

    // const res = await conn.getParsedTokenAccountsByOwner(ownerPubkey, {mint : USDC_MINT_ADDRESS});
    const account = await PublicKey.findProgramAddress([
        ownerPubkey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        USDC_MINT_ADDRESS.toBuffer()
    ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
    try{
        const usdcInfo =  await conn.getTokenAccountBalance(account[0]);
        const amount = usdcInfo.value.uiAmount 
        return amount
    }
    catch(e){
        return 0
    }


}

export const getSOLBalance = async (conn: Connection, pubkey : PublicKey) : Promise<number> => {

    return conn.getBalance(pubkey)

}

export const getTotalSOLBalance = async (conn : Connection, pubkey : PublicKey, usdcPrice : number) : Promise<number> =>{

    const lamports = await getSOLBalance(conn, pubkey);
    const usdc = await getUSDCBalance(conn, pubkey);
    const totalLamports = lamports + (usdc * usdcPrice)

    return Math.round((totalLamports / LAMPORT_SOL_FACTOR) *100) /100

}

export const getParsedTransactions = async (conn : Connection, sigs : ConfirmedSignatureInfo[], timestamp = 0)  : Promise<ParsedTransactionWithMeta[]> =>{

    let txPromises = [];
    let combined_txs = []

    for (var chunk of sliceIntoChunks(sigs, 700)){

    
        for(var i = 0; i< chunk.length; i++){

            if(sigs[i].blockTime > timestamp && sigs[i].err === null){
                txPromises.push(conn.getParsedTransaction(sigs[i].signature));
                // await delay(10)
            }
        }

        console.log(txPromises)
        
        const resolvedTransasctions : ParsedTransactionWithMeta[] = await Promise.all(txPromises).catch(x => console.log(x)) as ParsedTransactionWithMeta[];
        combined_txs = [...combined_txs, ...resolvedTransasctions]
        console.log(resolvedTransasctions)
    }

    return combined_txs;

}

export const getTransactionsSigToDate = async (pubkey : PublicKey, connection : Connection, toTimestamp? : number) : Promise<ConfirmedSignatureInfo[]> =>{

    let transactions: ConfirmedSignatureInfo[] = []

    while (true){
        const config : ConfirmedSignaturesForAddress2Options = {
            before: transactions.length ? transactions[transactions.length - 1].signature : undefined
        };

        console.log(`getting tx starting at ${config.before}`);


        const txs = await connection.getConfirmedSignaturesForAddress2(pubkey, config);
        console.log(txs)
        transactions =transactions.concat(txs); 
        
        if( txs.length === 0  || (toTimestamp && txs[txs.length -1].blockTime < toTimestamp)){
            break;
        }

        await delay(100)
    }

    return transactions

}

export const getPiggyBankLamports = async () =>{
    try{
        console.log('Fetching account details for piggybank')
        const accountDetails = await axios.get("https://api.solscan.io/account?address=DaoSrx3wBdRM8oATwYwfD8BTkHwBibVVv2SLR8LMDnLP")
        if(accountDetails.status === 200){
            console.log(accountDetails)
            const data : any = accountDetails.data 
            return data.data.lamports;
        }
        else{
             console.error(`Error account details fetching from solscan. Responseded with status ${accountDetails.status}`)
        }
    }
    catch(e){
        console.error(`Error account details fetching from solscan.\n${e.message}`)
    }
}

export const getUSDSOLPrice = async () =>{
    console.log('Fetching usdsol price')

    const solUSD : any= await axios.get("https://api.solscan.io/market?symbol=SOL");
    try{
        if(solUSD.status === 200){
            console.log(solUSD)
            return solUSD.data.data.priceUsdt;
        }
        else{
            console.error(`Error fetching usdt price  from solscan. Responseded with status ${solUSD.status}`)
    }
    }
    catch(e){
        console.error(`Error etching usdt price from solscan.\n${e.message}`)
    }
}

export const getFloorMale = async () =>{
    console.log('Fetching male floor price')

    const floorLamports : any = await axios.get("https://apis.alpha.art/api/v1/collection/piggy-sol-gang");
    try{
        if(floorLamports.status === 200){
            console.log(floorLamports)
            return floorLamports.data.floorPrice;
        }
        else{
            console.error(`Error fetching floor price from solscan. Responseded with status ${floorLamports.status}`)
    }
    }
    catch(e){
        console.error(`Error etching floor price price from solscan.\n${e.message}`)
    }

}

export const getNumListings = async () =>{
    const json = {collectionId: "piggy-sol-gang", orderBy: "PRICE_LOW_TO_HIGH", status: ["BUY_NOW"], traits: []}
    const result : any = await axios.post('https://apis.alpha.art/api/v1/collection', json)
    try{
        if(result.status === 200){
            return result.data.total;
        }
        else{
            console.error(`Error fetching floor price from solscan. Responseded with status ${result.status}`)
    }
    }
    catch(e){
        console.error(`Error etching floor price price from solscan.\n${e.message}`)
    }

}