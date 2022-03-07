
/**
 * 
 * {
    timestamp
    lastTx
    volume
    earnings
    startedDate
    }
 * 
 */

    const { Connection }= require("@solana/web3.js");
    const fs = require("fs/promises")
    
    const { PublicKey }  = require("@solana/web3.js");
    const { TOKEN_PROGRAM_ID }= require("@solana/spl-token");
    
    
    const path = require("path")
    
    const ALPHA_PUBKEY = new PublicKey("4Ueko5sCk5WhPmY9VGeKJSYwdKW7nru3zWcbmoMxtbV2")
    const ALPHA_GOV_PUBKEY = new PublicKey("59TwQVuAPeJ7sjVdKCVANT32AapDgNLpVrmy7HnofAWQ")
    const ROYALTIES_PUBKEY = new PublicKey("7NsngNMtXJNdHgeK4znQDZ5xVzT2nkGoGRGhMWApejCV")
    const DAO = new PublicKey("DaoSrx3wBdRM8oATwYwfD8BTkHwBibVVv2SLR8LMDnLP")
    const LAMPORT_SOL_FACTOR = 1000000000
    
     const ALPHA_TAKEOVER_TIMESTAMP = 1645354800
    
    const USDC_MINT_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
    const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    
    const args = process.argv.slice(2)
    console.log(args)
    const rpc_endpoint = args[0]
    const addresses = args.slice(1)
    console.log(addresses)
    
    if(rpc_endpoint === undefined || addresses === undefined){
        throw "Not all arguments provided. Please provide rpc endpoint and addresses to pull transactions from"
    }
    
    const connection = new Connection(rpc_endpoint);
    
     const delay = (ms ) => new Promise((res, rej) =>{
        setTimeout(() =>res(""), ms )
    })
     const sliceIntoChunks =(arr, chunkSize) => {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res
    }
    
    const loadJson = async (wallet_address) =>{
    
        try{
            return await fs.readFile(path.join(process.cwd(), 'public', `${wallet_address}.json`))
        }
        catch(e){
            return null
        }
    
    }
    
    const writeFile = async (wallet_address, json) =>{
    
        try{
            fs.writeFile(path.join(process.cwd(), 'public', `${wallet_address}.json`), JSON.stringify(json, null, 4))
        }
        catch(e){
            console.log(e)
        }
    
    }
    
    const getTransactionsSigToDate = async (pubkey , connection , toTimestamp)  =>{
    
        let transactions = []
    
        while (true){
            const config = {
                before: transactions.length ? transactions[transactions.length - 1].signature : undefined
            };
    
            console.log(`getting tx starting at ${config.before}`);
    
            try{
                const txs = await connection.getConfirmedSignaturesForAddress2(pubkey, config);
    
                transactions = transactions.concat(txs); 
                console.log(transactions[0], transactions[transactions.length -1])
                
                if( txs.length === 0  || (toTimestamp && txs[txs.length -1].blockTime < toTimestamp)){
                    break;
                }
            }
            catch(e){
                console.error("Error getting signatures for ", pubkey.toBase58())
            }
    
    
            await delay(10)
        }
        console.log('finish', transactions[0], transactions[transactions.length -1])
        // transactions.forEach(x => console.log(x.blockTime))
        return transactions
    
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
                console.log(e)
                console.error("Error getting signatures for ", pubkey.toBase58())
            }
    
    
            await delay(10)
        }

        return transactions
    
    }
    const _getParsedTransactions = async (conn, sigs, timestamp =0 ) => {return new Promise(async (res, rej) =>{
        const chunks = sliceIntoChunks(sigs, 700)
        // console.log("sigss", chunks.length, sigs.length)
        // console.log(chunks)

        if(sigs.length === 0){
            res([])
        }
        let combined_txs = []
        for(let index = 0; index <chunks.length; index++){
            let chunk = chunks[index]
            console.log(`Getting parsed tx's...`)
            let txPromises = []
            for(let i = 0; i< chunk.length; i++){
    
                if(chunk[i].blockTime > timestamp && chunk[i].err === null){
                    
                     txPromises = [conn.getParsedTransaction(chunk[i].signature).catch(x => console.log(x)), ...txPromises];
                    // await delay(10)
                }
            }
            
            const resolvedTransasctions  = await Promise.all(txPromises).catch(x => console.log(x)) ;
            combined_txs = [ ...combined_txs, ...resolvedTransasctions.filter(x => x !== undefined)]
            console.log(chunks.length -1, index)
            if(index === chunks.length -1){
                combined_txs.sort((a, b) => a.blockTime > b.blockTime ? -1 : 1)
                res(combined_txs)

            }
        
        }
            

    })}
        

    
     const getParsedTransactions = async (conn , sigs , timestamp = 0) =>{
    
        let txPromises = [];
        // sigs.forEach(x=>console.log(x.blockTime))

        const combined_txs = await _getParsedTransactions(conn, sigs, timestamp);

        return combined_txs;
    
    }
    
    const alphaVolume = (transactions) => {
        let lamports = 0;
        transactions.forEach((parsedTX ) => {

            if(parsedTX?.meta?.innerInstructions.length > 0 ){
                // console.log(parsedTX.blockTime) 
                const instructions = parsedTX.meta.innerInstructions[1].instructions;
                instructions.forEach((inst) => {
                    if(inst.parsed.type === "transfer" && inst.program === "system"){
                        lamports = lamports + inst.parsed.info.lamports
                    }
                })
            }
        })
        return lamports
    }
    
    const getEarnings = async (transactions, pubkey)  =>{
        let lamports = 0;
        let usdc = 0
        transactions.forEach(async (parsedTX  ) => {
    
            if(parsedTX?.meta?.innerInstructions.length > 0 ){
                // const instructions   = parsedTX.meta.innerInstructions[1].instructions ;
    
                parsedTX.meta.innerInstructions.forEach( innerInstructions => {
    
                    innerInstructions.instructions.forEach( inst => {
                        // instructions.forEach( inst =>{
    
                            if ( inst.parsed.info.destination === pubkey.toBase58()
                                             && inst.parsed.type === "transfer" 
                                             && inst.program === "system"){
                                                 
                                 lamports = lamports + inst.parsed.info.lamports
         
                             }
                        //  })
                        
                    })
    
    
                })
    
                }
            if(parsedTX?.transaction?.message?.instructions.length > 0){
    
                parsedTX?.transaction?.message?.instructions.forEach(transfer => {
                    const parsedtx = transfer?.parsed
                    if( parsedtx && parsedtx.info.mint === USDC_MINT_ADDRESS.toBase58() 
                        && parsedtx.info.destination === pubkey.toBase58()){
                        usdc = usdc + parsedtx.info.tokenAmount.uiAmount
    
                    }
                })
    
            }
            
        })
        return {lamports, usdc}
    }
    
    
    (async() =>{
        // const tx = await connection.getParsedTransaction("2NZGy54ubhTS3hxy3tJG9PMCHdA2aCFy2haVqLjeTfKbhsHC8SFReTSMc7NKMJRxnR7BmtR7sZCZHCpU8sSfuBa2")
        // const tx2 = await connection.getParsedTransaction("5TETG62uQYp8mQQfmsA2N4jnwW3Y8P5PstwpbxsFUpqfNhgTdVDeVfFESxcfzut9kvRtrNnqdLAqq5x3kdPs6bJx")
    
        // console.log(tx, tx.meta.innerInstructions, tx.transaction.message.accountKeys, tx.transaction.message.instructions[0].parsed)
        // console.log('usdc' ,tx2, tx2.meta.innerInstructions[0].instructions, tx2.transaction.message.accountKeys, tx2.transaction.message.instructions[2].parsed)
    
        for(address of addresses){
            console.log('\n\nProcessing txs for address ', address)
            const file = await loadJson(address)
    
            const pubkey = new PublicKey(address)
    
            const usdc_account = (await PublicKey.findProgramAddress([
                pubkey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                USDC_MINT_ADDRESS.toBuffer()
            ],
                SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
            ))[0]
            console.log(usdc_account.toBase58())
            let sigs;
            let parsedFile;
            let usdc_sigs;
            if(file !== null){
                parsedFile = JSON.parse(file.toString())
                console.log(`Loading current state from filesystem ${pubkey} getting transactions too ${parsedFile.lastTx}`)
                sigs = await getTransactionsSigToSig(pubkey, connection, parsedFile.lastTx)
                usdc_sigs = await getTransactionsSigToSig(usdc_account, connection, parsedFile.last_usdc_tx)
    
            }
            else{
                console.log(`No current state pulling transaction information for ${pubkey} too ${ALPHA_TAKEOVER_TIMESTAMP}`)
    
                sigs = await getTransactionsSigToDate(pubkey, connection, ALPHA_TAKEOVER_TIMESTAMP)
                usdc_sigs = await getTransactionsSigToDate(usdc_account, connection, ALPHA_TAKEOVER_TIMESTAMP)
    
            }
            const txs = await getParsedTransactions(connection, sigs)
            const usdc_account_txs = await getParsedTransactions(connection, usdc_sigs)
    
        
            const vol =  alphaVolume(txs)
            console.log(`\nCalculated volume for latest period ${pubkey.toString()}: `, vol / LAMPORT_SOL_FACTOR)
            const _earnings = await getEarnings(txs, pubkey)
            const usdc_earnings = await getEarnings(usdc_account_txs, usdc_account)
            console.log(`Calculated earnings for latest period ${pubkey.toString()}: `, _earnings.lamports / LAMPORT_SOL_FACTOR)
            const json = {
                timestamp: Date.now(),
                lastTx : sigs.length > 0 ? sigs[0].signature : parsedFile.lastTx,
                last_usdc_tx : usdc_sigs.length > 0 ? usdc_sigs[0].signature : parsedFile?.last_usdc_tx,
                startTx : parsedFile === undefined && sigs.length > 0 ? sigs[sigs.length -1] : parsedFile?.startTx,
                volume: parsedFile ? parsedFile.volume + vol : vol,
                earnings_lamports: parsedFile ? parsedFile.earnings_lamports + _earnings.lamports : _earnings.lamports,
                earnings_usdc: parsedFile ? parsedFile.earnings_usdc + usdc_earnings.usdc : usdc_earnings.usdc,
                startdate: ALPHA_TAKEOVER_TIMESTAMP,
                pubkey : pubkey.toBase58()
            }
        
            await writeFile(pubkey, json)
        }
    
    
    })()