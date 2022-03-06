import { AccountInfo, clusterApiUrl, ConfirmedSignatureInfo, ConfirmedSignaturesForAddress2Options, Connection, ParsedAccountData, ParsedInnerInstruction, ParsedTransaction, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { ALPHA_TAKEOVER_TIMESTAMP, USDC_MINT_ADDRESS, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from "src/const";
import { delay, sliceIntoChunks } from "src/util";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LAMPORT_SOL_FACTOR } from "src/util/calculations";
export interface ParsedInstruction{

    "programId": number,
    "program": string,
    "type": string

}
export interface AccountTransactionsResponse{
        "blockTime": number,
        "slot": number,
        "txHash": string,
        "fee": number,
        "status": string,
        "lamport": number,
        "signer": string[],
        "parsedInstruction": ParsedInstruction[]
}
export type changetype = "inc" | "dec"

export interface SPLTransactionsSolscan{

        "_id": string,
        "address": string,
        "signature": string[],
        "changeType": changetype,
        "changeAmount": number,
        "decimals": number,
        "postBalance": string,
        "preBalance": string,
        "tokenAddress": string,
        "symbol": string,
        "blockTime": number,
        "slot": number,
        "fee": number,
        "owner": string,
        "balance": {
          "amount": string,
          "decimals": number
        }
      
}

export interface SPLResponse {
    total : number,
    data : SPLTransactionsSolscan[]

}
export const poll = (apiFunc : Function, ms = 4000) =>{
    apiFunc()
    return setInterval(apiFunc, ms);

}

const getTransactionsSigToSig = async (pubkey , connection , toSig)  =>{

    let transactions = []

    while (true){
        const config = {
            before: transactions.length ? transactions[transactions.length - 1].signature : undefined,
            until : toSig
        };

        console.log(`getting tx starting at ${config.before}`);

        try{
            const txs = await connection.getConfirmedSignaturesForAddress2(pubkey, config);
            transactions = transactions.concat(txs); 
            
            if( txs.length === 0  || (toSig && txs[txs.length -1].signature === toSig)){
                break;
            }
        }
        catch(e){
            console.error("Error getting signatures for ", pubkey.toBase58())
        }


        await delay(10)
    }

    return transactions

}

export const get_sigs_until_solscan = async (pubkey : PublicKey, to_tx : string, sigs : AccountTransactionsResponse[]  = []) 
    : Promise<AccountTransactionsResponse[]> =>{
        const pubkey_string =  pubkey.toBase58()
        const params = {
        account: pubkey.toBase58(),
        before : sigs.length > 0 ? sigs[sigs.length -1].txHash : undefined,
        limit : 100
    }
    try{
        const res = await axios.get('https://public-api.solscan.io/account/transactions', {params})
        const transactions : AccountTransactionsResponse[] = res.data
        
        const index = transactions.findIndex(tx => tx.txHash === to_tx);
        console.log(index, pubkey.toBase58())

        if(index === -1){
            return get_sigs_until_solscan(pubkey, to_tx, sigs.concat(transactions))
        }

        if(index === 0 && sigs.length === 0){
            console.log(`txs sol length for ${pubkey_string}`, sigs.length, index)
            return []
        }
        // console.log('returning delta sigs for ', pubkey.toBase58())
        return transactions.slice(0, index)

    }
    catch(e){
        console.error(`Error fetching sigs for ${pubkey.toBase58()}`)
        console.log(e)

    }

}

export const iterate_over_sisg = (sigs : any[], pubkey) : Promise<any[]> => new Promise((resolve, rej) =>{
    let transactions = []
    if(sigs === null || sigs === undefined){
        return []
    }
    sigs.forEach(async (sig, i) => {
        try{
            const res = await axios.get(`https://public-api.solscan.io/transaction/${sig.txHash}`)
            const tx  = res.data as any
            console.log("sss ", sig.txHash, tx)
            let include = false;

            for (const inst of tx.innerInstructions as any){

                for(const i of inst.parsedInstructions){

                    if(i.type = "sol-transfer" && i.params?.destination === pubkey.toBase58()){
                        include = true;
                        break;
                    }

                }
                if(include) break;
            }
            if(include){
                transactions = [...transactions, tx]
            }
            console.log(i, sig.length)
            if(i === sigs.length -1 ){
                console.log(`resolving ${pubkey.toBase58()}`)
                resolve(transactions)
            }
        }

        catch(e){
            console.error(`Error fetching txs for ${pubkey.toBase58()}`)
            console.log(e)

        }

    });

})

export const get_txs_until_solscan = async(pubkey : PublicKey, to_tx : string) =>{
    const sigs = await get_sigs_until_solscan(pubkey, to_tx);
    console.log(`fetching for ${pubkey.toBase58()} txs untill ${to_tx}`, sigs)

    let transactions : any[] = await iterate_over_sisg(sigs, pubkey); 
 
    console.log("including txs for ", pubkey.toBase58(), transactions)

    return transactions;

}


export const get_usdc_txs_solscan = async (pubkey: PublicKey, to_tx : string, txs : SPLTransactionsSolscan[] = []) =>{
    // console.log('before ', txs || undefined)
    const params = {
        account: pubkey.toBase58(),
        offset : txs.length > 0 ? txs.length : undefined,
        limit : 100
    }
    try{
        const res = await axios.get('https://public-api.solscan.io/account/splTransfers', {params})
        // console.log(res)
        let transactions : SPLTransactionsSolscan[] = (res.data as SPLResponse).data

        const filteredTransactions = transactions.filter(x => x.tokenAddress === USDC_MINT_ADDRESS.toBase58())    
        const index = filteredTransactions.findIndex(tx => tx.signature[0] === to_tx);
        // console.log(index, pubkey.toBase58())

        if(transactions.length < 100 && index === -1){
            return filteredTransactions
        }
        if(index === -1){
            return get_usdc_txs_solscan(pubkey, to_tx, txs.concat(transactions))
        }

        if(index === 0 && txs.length === 0){
            console.log('txs length', txs.length, index)
            return []
        }
        
        return txs.filter(x => x.tokenAddress === USDC_MINT_ADDRESS.toBase58()).concat(filteredTransactions.slice(0, index -1))

    }
    catch(e){
        console.error(`Error fetching sigs for ${pubkey.toBase58()}`)
        console.log(e)
    }

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
        console.log(`${amount} USDC - wallet ${ownerPubkey.toBase58()}`)
        return amount
    }
    catch(e){
        console.log(`No USDC token account found in wallet ${ownerPubkey.toBase58()}`)
        return 0
    }


}

export const getSOLBalance = async (conn: Connection, pubkey : PublicKey) : Promise<number> => {

    return conn.getBalance(pubkey)

}

export const getTotalSOLBalance = async (conn : Connection, pubkey : PublicKey, usdcPrice : number) : Promise<number> =>{

    const lamports = await getSOLBalance(conn, pubkey);
    const usdc = await getUSDCBalance(conn, pubkey);
    console.log(`USDC to sol ${usdc} x ${usdcPrice} = ${usdc / usdcPrice}`)
    const totalLamports = lamports + ((usdc / usdcPrice) * LAMPORT_SOL_FACTOR)

    return totalLamports

}

export const getParsedTransactions = async (conn : Connection, sigs : ConfirmedSignatureInfo[], timestamp = 0)  : Promise<ParsedTransactionWithMeta[]> =>{

    let txPromises = [];
    let combined_txs = []

    for (var chunk of sliceIntoChunks(sigs, 700)){

    
        for(var i = 0; i< chunk.length; i++){

            if(sigs[i].blockTime > timestamp && sigs[i].err === null){
                txPromises.push(conn.getParsedTransaction(sigs[i].signature).catch(x => console.log(x)));
                // await delay(10)
            }
        }
        
        
        const resolvedTransasctions : ParsedTransactionWithMeta[] = await Promise.all(txPromises).catch(x => console.log(x)) as ParsedTransactionWithMeta[];
        combined_txs = [...combined_txs, ...resolvedTransasctions.filter(x => x !== undefined)]
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

        try{
            const txs = await connection.getConfirmedSignaturesForAddress2(pubkey, config);
            transactions =transactions.concat(txs); 
            
            if( txs.length === 0  || (toTimestamp && txs[txs.length -1].blockTime < toTimestamp)){
                break;
            }
        }
        catch(e){
            console.error("Error getting signatures for ", pubkey.toBase58())
        }


        await delay(10)
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