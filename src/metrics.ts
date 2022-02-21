import { Connection, ParsedInstruction, ParsedTransactionMeta, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { ALPHA_PUBKEY } from "./const";
import { LAMPORT_SOL_FACTOR, secToDays } from "./util/calculations";

const alphaEarnings = (transactions : ParsedTransactionWithMeta[]) : number =>{
    let lamports = 0;
    transactions.forEach((parsedTX : ParsedTransactionWithMeta) => {

        if(parsedTX.meta.innerInstructions.length > 1 ){
        	const instuction : ParsedInstruction  = parsedTX.meta.innerInstructions[1].instructions[0] as ParsedInstruction;

        	if(instuction.parsed.info.destination === ALPHA_PUBKEY.toBase58() 
                        && instuction.parsed.type === "transfer" 
                        && instuction.parsed.program === "system"
                        ){

        		lamports = lamports + instuction.parsed.info.lamports
        	}
        }
    })
    return lamports
}

const alphaVolume = (transactions : ParsedTransactionWithMeta[]) : number => {
    let lamports = 0;
    transactions.forEach((parsedTX : ParsedTransactionWithMeta) => {

        if(parsedTX.meta.innerInstructions.length > 1 ){
        	const instructions = parsedTX.meta.innerInstructions[1].instructions;

            instructions.forEach((inst : ParsedInstruction) => {
                if(inst.parsed.type === "transfer" && inst.parsed.program === "system"){
                    lamports = lamports + inst.parsed.info.lamports
                }
            })
        }
    })
    return lamports
}


export const earningsPer24hrs = (lamports : number, now : number, toTimestamp : number ) =>{
    const secondsSinceLaunch = now - toTimestamp;
    const daysSinceLaunch = secToDays(secondsSinceLaunch);
    const lampPerDay = lamports /daysSinceLaunch
    console.log('days', daysSinceLaunch, lamports, lampPerDay)
    return lampPerDay / LAMPORT_SOL_FACTOR
}

export const totalBalance = async (conn : Connection, pubkey : PublicKey) =>{

    const lamports = await conn.getBalance(pubkey);
    const sol = lamports /LAMPORT_SOL_FACTOR;

}
