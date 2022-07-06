"use strict";

import TronWeb from 'tronweb';

const API_HOST = "https://api.shasta.trongrid.io"
// const OWNER_ADDRESS = "41FE41F638351ADAAF30D7D38CB3CBFFC34699CD8B";
// const CONTRACT_ADDRESS = "41F73FE0593D3AC65AE060782525F354A3D6A20A7A";
const TOKEN_ADDRESS = "TKyq4GzNALAzSRjCM6ZHo7tBJXVWHiSNQK";
// const FROM_ADDRESS = "TDBfA84hsCaX84KEkXmnodDgVNpkAryMU1";

const privateKey = ""
const apiKey = "4dc681b0-2dc4-4a22-9e0e-ee124fc556cf"

const tronWeb = new TronWeb({
    fullHost: API_HOST,
    privateKey: privateKey,
    headers: {"TRON-PRO-API-KEY": apiKey},
})

// async function transfer() {
//     const parameters = [
//         {type: 'address', value: TOKEN_ADDRESS},
//         {type: 'address', value: FROM_ADDRESS},
//         {type: 'uint256', value: 1}
//     ]
//     const transRes = await tronWeb.transactionBuilder.triggerSmartContract(CONTRACT_ADDRESS, "transfer(address,address,uint256)", {}, parameters, OWNER_ADDRESS);
//     console.log(transRes)
//     const transaction = transRes.transaction
//     const signedTxn = await tronWeb.trx.sign(transaction,privateKey)
//     const receipt = await tronWeb.trx.sendRawTransaction(signedTxn)
//     console.log(receipt)
// }

async function balanceOf() {
    const contract = await tronWeb.contract().at(TOKEN_ADDRESS)
    const balance = await contract.balanceOf("TWZgZs7Jx26kvKeAsSijrUeAPFNBZqVDKt").call()
    console.log(`getBalance: ${balance.toString()}`)
    return {balance: balance.toString()}
}

// async function send() {
//     const contract = await tronWeb.contract().at(TOKEN_ADDRESS)
//     const transferResult = await contract.transfer("TWZgZs7Jx26kvKeAsSijrUeAPFNBZqVDKt", 100000000).send()
//     console.log(transferResult)
// }

balanceOf()
.then(() => {
    console.log("done")
})
.catch(e => {
    console.log(e)
})