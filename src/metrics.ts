import { Connection, ParsedInstruction, ParsedTransactionMeta, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { ALPHA_PUBKEY } from "./const";
import { LAMPORT_SOL_FACTOR, secToDays } from "./util/calculations";

export const getEarnings = (transactions : ParsedTransactionWithMeta[], pubkey : PublicKey) : number =>{
    let lamports = 0;
    transactions.forEach((parsedTX : ParsedTransactionWithMeta) => {

        if(parsedTX.meta.innerInstructions.length > 1 ){
        	const instructions : ParsedInstruction[]  = parsedTX.meta.innerInstructions[1].instructions as ParsedInstruction[];


                instructions.forEach( inst =>{

                   if ( inst.parsed.info.destination === pubkey.toBase58()
                                    && inst.parsed.type === "transfer" 
                                    && inst.program === "system"){
                                        
                        lamports = lamports + inst.parsed.info.lamports

                    }
                })
        	}
        
    })
    return lamports
}

export const alphaVolume = (transactions : ParsedTransactionWithMeta[]) : number => {
    let lamports = 0;
    transactions.forEach((parsedTX : ParsedTransactionWithMeta) => {

        if(parsedTX.meta.innerInstructions.length > 1 ){
        	const instructions = parsedTX.meta.innerInstructions[1].instructions;
            console.log(instructions)
            instructions.forEach((inst : ParsedInstruction) => {
                if(inst.parsed.type === "transfer" && inst.program === "system"){
                    lamports = lamports + inst.parsed.info.lamports
                }
            })
        }
    })
    return lamports
}


export const earningsPer24hrs = (lamports : number, now : number, toTimestamp : number ) =>{
    const secondsSinceLaunch = now - toTimestamp;
    console.log(now, toTimestamp, secondsSinceLaunch)
    const daysSinceLaunch = secToDays(secondsSinceLaunch);
    const lampPerDay = lamports /daysSinceLaunch
    console.log('days', daysSinceLaunch, lamports, lampPerDay)
    return lampPerDay / LAMPORT_SOL_FACTOR
}
