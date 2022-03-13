export const ALPHA_LAUNCH_TIMETSAMP = 1633885200
                                        
export const LAMPORT_SOL_FACTOR = 1000000000

export const calculateSOLPerPig = (lamports : number, numDelistedPigs : number = 10000) : number =>{
    const sol = lamports / LAMPORT_SOL_FACTOR;
    const perPig = sol/numDelistedPigs
    return perPig
}

export const calculateUSDPerPig = (lamports : number, usdtPrice : number, numDelistedPigs : number = 10000) : number =>{
    const solPerPig = calculateSOLPerPig(lamports)
    const usdPerPig = usdtPrice * solPerPig
    return usdPerPig
}

export const secToDays = (seconds : number) =>{
    return seconds / 86400
}

export const calculateAverageSOLPerDay = (lamports : number, stamp : number ) =>{
    const secondsSinceLaunch = stamp - ALPHA_LAUNCH_TIMETSAMP;
    const daysSinceLaunch = secToDays(secondsSinceLaunch);
    const lampPerDay = lamports /daysSinceLaunch
    console.log('days', daysSinceLaunch, lamports, lampPerDay)
    return lampPerDay / LAMPORT_SOL_FACTOR
}

export const calculateAverageSOLPerPig = (lamports : number, stamp : number ) =>{
    return calculateAverageSOLPerDay(lamports, stamp) /10000
}
