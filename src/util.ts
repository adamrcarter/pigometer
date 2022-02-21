export const delay = (ms : number) => new Promise((res, rej) =>{
    setInterval(() =>res(""), ms )
})