"use strict";

import axios from "axios"
import {ethers} from "ethers"
import config from "./config.json" assert {type: "json"}

let _spenderAccount = ""
let _payAccount = ""
let _platformAccount = ""

const provider = ethers.getDefaultProvider(config.eth.network)

const tokenAbi = [
    "function transfer(address to, uint amount) returns (bool)",
    "function transferFrom(address from, address to, uint amount)",
    "event Transfer(address indexed from, address indexed to, uint amount)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function allowance(address owner, address spender) view returns (uint256)",
]

function wallet(privateKey) {
    return new ethers.Wallet(privateKey, provider)
}

function tokenContract(tokenAddress, privateKey = "") {
    return privateKey === "" ? new ethers.Contract(tokenAddress, tokenAbi, provider)
        : new ethers.Contract(tokenAddress, tokenAbi, wallet(privateKey))
}

async function parseToken(tokenAddress, amount) {
    const decimals = await tokenContract(tokenAddress).decimals()
    return ethers.utils.parseUnits(amount.toString(), decimals.toString())
}

async function formatToken(tokenAddress, amount) {
    const decimals = await tokenContract(tokenAddress).decimals()
    return ethers.utils.formatUnits(amount, decimals.toString())
}

async function waitForTransaction(txId) {
    await provider.waitForTransaction(txId, 1, 1)
}

async function getFee() {
    try {
        const r = await axios.get("https://ethgasstation.info/json/ethgasAPI.json")
        const out = {
            maxFeePerGas: ethers.utils.parseUnits((r.data.fast/10).toString(), "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
        }
        console.log(`Fee: maxFeePerGas: ${ethers.utils.formatUnits(out.maxFeePerGas, "gwei")} maxPriorityFeePerGas: ${ethers.utils.formatUnits(out.maxPriorityFeePerGas, "gwei")}`)
        return out
    } catch (e) {
        const out = {
            maxFeePerGas: ethers.utils.parseUnits("40", "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
        }
        console.log(`getFee error ${e}`)
        console.log(`getFee error use default fee: maxFeePerGas: ${ethers.utils.formatUnits(out.maxFeePerGas, "gwei")} maxPriorityFeePerGas: ${ethers.utils.formatUnits(out.maxPriorityFeePerGas, "gwei")}`)
        return out
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
        const fee = await getFee()
        const transaction = await tokenContract(tokenAddress, _spenderAccount).transferFrom(userAddress, _platformAccount, parsedAmount, {
            gasLimit: 300000,
            maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
            maxFeePerGas: fee.maxFeePerGas
        })
        const res = await transaction.wait()
        console.log(`transfer success: ${res.transactionHash}, waiting for confirmation`)
        await waitForTransaction(res.transactionHash)
        console.log(`transfer success: ${res.transactionHash}, confirmed`)
        return {code: 0, msg: "", data: {txId: res.transactionHash}}
    } catch (e) {
        console.log(`transfer failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function transferToUser(userAddress, tokenAddress, amount) {
    try {
        if (_payAccount === "") {
            return {code: -100, msg: "payAccount not set"}
        }

        const parsedAmount = await parseToken(tokenAddress, amount)
        const fee = await getFee()
        const transaction = await tokenContract(tokenAddress, _payAccount).transfer(userAddress, parsedAmount, {
            gasLimit: 100000,
            maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
            maxFeePerGas: fee.maxFeePerGas
        })
        const res = await transaction.wait()
        console.log(`transfer success: ${res.transactionHash}, waiting for confirmation`)
        await waitForTransaction(res.transactionHash)
        console.log(`transfer success: ${res.transactionHash}, confirmed`)
        return {code: 0, msg: "", data: {txId: res.transactionHash}}
    } catch (e) {
        console.log(`transfer failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function getBalance(tokenAddress, address) {
    try {
        const balance = await tokenContract(tokenAddress).balanceOf(address)
        const balanceFormatted = await formatToken(tokenAddress, balance)
        console.log(`balance: ${balance.toString()} ${balanceFormatted}`)
        return {code: 0, msg: "", data: {balance: balanceFormatted}}
    } catch (e) {
        console.log(`get balance failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function allowance(tokenAddress, userAddress) {
    try {
        if (_spenderAccount === "") {
            return {code: -100, msg: "spender account not set"}
        }
        console.log(`check allowance(${tokenAddress}) from ${userAddress} to ${_spenderAccount}`)
        const allowance = await tokenContract(tokenAddress).allowance(userAddress, wallet(_spenderAccount).address)
        const allowanceFormatted = await formatToken(tokenAddress, allowance)
        console.log(`allowance: ${allowance.toString()} ${allowanceFormatted}`)
        return {code: 0, msg: "", data: {allowance: allowanceFormatted}}
    } catch (e) {
        console.log(`get allowance failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function updateSettings(settings) {
    _spenderAccount = settings.spender.privateKey
    const spenderAddress = wallet(_spenderAccount).address
    if (spenderAddress !== settings.spender.address) {
        return {code: -1, msg: "spender address not match"}
    }
    _payAccount = settings.platformOut.privateKey
    const payAddress = wallet(_payAccount).address
    if (payAddress !== settings.platformOut.address) {
        return {code: -1, msg: "pay address not match"}
    }
    _platformAccount = settings.platformIn.address
    return {code: 0, msg: "OK", data: {}}
}
