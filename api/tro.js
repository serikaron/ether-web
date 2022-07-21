import TronWeb from 'tronweb';
import config from "./config.json" assert {type: "json"}
import {ethers} from "ethers";

let _spenderAccount = ""
let _payAccount = ""
let _platformAccount = ""

function tronWeb(privateKey) {
    return new TronWeb({
        fullHost: config.tro.network,
        privateKey: privateKey,
        headers: {"TRON-PRO-API-KEY": config.tro.apiKey},
    })
}

async function tokenContract(tokenAddress, privateKey = "") {
    return await tronWeb(privateKey === "" ? _spenderAccount : privateKey).contract().at(tokenAddress)
}

async function parseToken(tokenAddress, amount) {
    const token = await tokenContract(tokenAddress)
    const decimals = await token.decimals().call()
    return ethers.utils.parseUnits(amount.toString(), decimals.toString())
}

async function waitForTransaction(txId, timeoutInSeocnds = 300) {
    const f = async () => {
        let timer
        return new Promise(resolve => {
            timer = setInterval(async () => {
                const tx = await tronWeb("").trx.getTransaction(txId)
                console.log(`checkTransaction, tx:${JSON.stringify(tx)}`)
                if ("ret" in tx) {
                    let result = tx.ret[0].contractRet === "SUCCESS" ? 0 : 1
                    clearInterval(timer)
                    resolve(result)
                    return
                }
                if (timeoutInSeocnds-- <= 0) {
                    clearInterval(timer)
                    resolve(2)
                }
            }, 1000)
        })
    }
    try {
        const result = await f()
        console.log(`checkTransaction(${txId}), result:${result}`)
        return result
    } catch (e) {
        console.log(`checkTransaction(${txId}), error:${e}`)
        return -1
    }
}

export async function transferToPlatform(userAddress, tokenAddress, amount) {
    try {
        if (_spenderAccount === "") {
            return {code: -100, msg: "spender account not set"}
        }
        if (_platformAccount === "") {
            return {code: -101, msg: "platform account not set"}
        }
        const parsedAmount = await parseToken(tokenAddress, amount)
        console.log(`Transferring ${amount}(${parsedAmount}) tokens(${tokenAddress}) from ${userAddress} to ${_platformAccount}`)
        const contract = await tokenContract(tokenAddress, _spenderAccount)
        const txId = await contract.transferFrom(userAddress, _platformAccount, parsedAmount).send()
        console.log(`transfer success: ${txId}`)
        await waitForTransaction(txId)
        return {code: 0, msg: "", data: {txId}}
    } catch (e) {
        console.log(`transferToPlatform: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function transferToUser(userAddress, tokenAddress, amount) {
    try {
        if (_payAccount === "") {
            return {code: -100, msg: "pay account not set"}
        }
        const parsedAmount = await parseToken(tokenAddress, amount)
        console.log(`Transferring ${amount}(${parsedAmount}) tokens(${tokenAddress}) to ${userAddress}`)
        const contract = await tokenContract(tokenAddress, _payAccount)
        const transferResult = await contract.transfer(userAddress, parsedAmount).send()
        console.log(`transferToUser: ${transferResult}`)
        await waitForTransaction(transferResult)
        return {code: 0, msg: "", data: {txId: transferResult}}
    } catch (e) {
        console.log(`transferToUser: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function getBalance(tokenAddress, address) {
    try {
        if (_spenderAccount === "") {
            return {code: -100, msg: "spender account not set"}
        }
        const contract = await tokenContract(tokenAddress, _spenderAccount)
        const balance = await contract.balanceOf(address).call()
        const decimals = await contract.decimals().call()
        const balanceFormatted = ethers.utils.formatUnits(balance, decimals)
        console.log(`getBalance: ${balance.toString()} ${balanceFormatted}`)
        return {code: 0, msg: "", data: {balance: balanceFormatted}}
    } catch (e) {
        console.log(`getBalance: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function allowance(tokenAddress, userAddress) {
    try {
        if (_spenderAccount === "") {
            return {code: -100, msg: "spender account not set"}
        }
        const contract = await tokenContract(tokenAddress, _spenderAccount)
        const allowance = await contract.allowance(userAddress, tronWeb("").address.fromPrivateKey(_spenderAccount)).call()
        const decimals = await contract.decimals().call()
        const allowanceFormatted = ethers.utils.formatUnits(allowance, decimals)
        console.log(`allowance: ${allowance.toString()} ${allowanceFormatted}`)
        return {code: 0, msg: "", data: {allowance: allowanceFormatted}}
    } catch (e) {
        console.log(`allowance: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function updateSettings(settings) {
    _spenderAccount = settings.spender.privateKey
    const spenderAddress = await tronWeb("").address.fromPrivateKey(_spenderAccount)
    if (spenderAddress !== settings.spender.address) {
        return {code: -1, msg: "spender address not match"}
    }
    _payAccount = settings.platformOut.privateKey
    const payAddress = await tronWeb("").address.fromPrivateKey(_payAccount)
    if (payAddress !== settings.platformOut.address) {
        return {code: -2, msg: "pay address not match"}
    }
    _platformAccount = settings.platformIn.address
    return {code: 0, msg: "OK", data: {}}
}