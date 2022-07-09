"use strict";

import axios from "axios"
import {ethers} from "ethers"
import config from "./config.json" assert {type: "json"}

const provider = ethers.getDefaultProvider(config.eth.network)
const wallet = new ethers.Wallet(config.eth.payAccount, provider)

function contract() {
    const owner = new ethers.Wallet(config.eth.contractOwner, provider)
    return new ethers.Contract(config.eth.contract.address, config.eth.contract.abi, owner)
}

async function getFee(which="standard") {
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
    try {
        const fee = await getFee()
        const transaction = await contract().transfer(tokenAddress, userAddress, platformAddress, amount, {
            gasLimit: 300000,
            maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
            maxFeePerGas: fee.maxFeePerGas
        })
        const res = await transaction.wait()
        console.log(`transfer success: ${JSON.stringify(res)}`)
        return {code: 0, msg: "", data:{txId: res.transactionHash}}
    } catch (e) {
        console.log(`transfer failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function transferToUser(userAddress, tokenAddress, amount) {
    try {
        const abi = [
            "function transfer(address to, uint amount) returns (bool)",
            "event Transfer(address indexed from, address indexed to, uint amount)"
        ]
        const contract = new ethers.Contract(tokenAddress, abi, wallet)
        const fee = await getFee()
        const transaction = await contract.transfer(userAddress, amount, {
            gasLimit: 300000,
            maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
            maxFeePerGas: fee.maxFeePerGas
        })
        const res = await transaction.wait()
        console.log(`transfer success: ${JSON.stringify(res)}`)
        return {code: 0, msg: "", data:{txId: res.transactionHash}}
    } catch (e) {
        console.log(`transfer failed: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function getBalance(tokenAddress, address) {
    try {
        const abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ]
        const token = new ethers.Contract(tokenAddress, abi, provider)
        const balance = await token.balanceOf(address)
        const decimals = await token.decimals()
        const balanceFormatted = ethers.utils.formatUnits(balance, decimals)
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
        return {code: 0, msg: "", data:{owner}}
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