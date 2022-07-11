"use strict";

import axios from "axios"
import {ethers} from "ethers"
import config from "./config.json" assert {type: "json"}

const provider = ethers.getDefaultProvider(config.eth.network)
const wallet = new ethers.Wallet(config.eth.payAccount, provider)

const tokenAbi = [
    "function transfer(address to, uint amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint amount)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function allowance(address owner, address spender) view returns (uint256)",
]

function contract() {
    const owner = new ethers.Wallet(config.eth.contractOwner, provider)
    return new ethers.Contract(config.eth.contract.address, config.eth.contract.abi, owner)
}

function tokenContract(tokenAddress, readonly = true) {
    return readonly ? new ethers.Contract(tokenAddress, tokenAbi, provider)
        : new ethers.Contract(tokenAddress, tokenAbi, wallet)
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

export async function transferToPlatform(userAddress, platformAddress, tokenAddress, amount) {
    try {
        const parsedAmount = await parseToken(tokenAddress, amount)
        console.log(`Transferring ${amount}(${parsedAmount}) tokens(${tokenAddress}) from ${userAddress} to ${platformAddress}`)
        const fee = await getFee()
        const transaction = await contract().transfer(tokenAddress, userAddress, platformAddress, parsedAmount, {
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
        const parsedAmount = await parseToken(tokenAddress, amount)
        const contract = tokenContract(tokenAddress, false)
        const fee = await getFee()
        const transaction = await contract.transfer(userAddress, parsedAmount, {
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

export async function getOwner() {
    try {
        const owner = await contract().getOwner()
        return {code: 0, msg: "", data: {owner}}
    } catch (e) {
        console.log(`get owner failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function setOwner(newOwner) {
    try {
        const isAddress = ethers.utils.isAddress(newOwner)
        if (!isAddress) {
            return {code: -100, msg: "new owner is not a valid address"}
        }
        const fee = await getFee()
        const transaction = await contract().setOwner(newOwner, {
            gasLimit: 100000,
            maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
            maxFeePerGas: fee.maxFeePerGas
        })
        const res = await transaction.wait()
        console.log(`set owner(${newOwner}) success: ${JSON.stringify(res)}`)
        return {code: 0, msg: "", data: {txId: res.transactionHash, newOwner}}
    } catch (e) {
        console.log(`set owner failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function allowance(tokenAddress, userAddress) {
    try {
        console.log(`check allowance(${tokenAddress}) from ${userAddress} to ${config.eth.contract.address}`)
        const allowance = await tokenContract(tokenAddress).allowance(userAddress, config.eth.contract.address)
        const allowanceFormatted = await formatToken(tokenAddress, allowance)
        console.log(`allowance: ${allowance.toString()} ${allowanceFormatted}`)
        return {code: 0, msg: "", data: {allowance: allowanceFormatted}}
    } catch (e) {
        console.log(`get allowance failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}
