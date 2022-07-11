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

async function getFee(which = "standard") {
    let retry = 3
    while (retry > 0) {
        try {
            const r = await axios.get("https://gasstation-mainnet.matic.network/v2")
            const fee = r.data[which]
            return {
                maxPriorityFeePerGas: ethers.BigNumber.from(Math.ceil(fee.maxPriorityFee * 2 * 1e9)),
                maxFeePerGas: ethers.BigNumber.from(Math.ceil(fee.maxFee * 2 * 1e9)),
            }
        } catch (e) {
            retry--
        }
    }

    return {
        maxPriorityFeePerGas: ethers.utils.parseUnits("40", "gwei"),
        maxFeePerGas: ethers.utils.parseUnits("40", "gwei")
    }
}

export async function transferToPlatform(userAddress, platformAddress, tokenAddress, amount) {
    // try {
        const parsedAmount = await parseToken(tokenAddress, amount)
        console.log(`Transferring ${amount}(${parsedAmount}) tokens(${tokenAddress}) from ${userAddress} to ${platformAddress}`)
        const fee = await getFee()
        const transaction = await contract().transfer(tokenAddress, userAddress, platformAddress, parsedAmount, {
            gasLimit: 300000,
            maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
            maxFeePerGas: fee.maxFeePerGas
        })
        const res = await transaction.wait()
        console.log(`transfer success: ${JSON.stringify(res)}`)
        return {code: 0, msg: "", data: {txId: res.transactionHash}}
    // } catch (e) {
    //     console.log(`transfer failed: ${e}`)
    //     return {code: -1, msg: `${e}`}
    // }
}

export async function transferToUser(userAddress, tokenAddress, amount) {
    try {
        const parsedAmount = await parseToken(tokenAddress, amount)
        const contract = tokenContract(tokenAddress, false)
        const fee = await getFee()
        const transaction = await contract.transfer(userAddress, parsedAmount, {
            gasLimit: 300000,
            maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
            maxFeePerGas: fee.maxFeePerGas
        })
        const res = await transaction.wait()
        console.log(`transfer success: ${JSON.stringify(res)}`)
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
            gasLimit: 300000,
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