"use strict";

import axios from "axios"
import {ethers} from "ethers"
import config from "./config.json" assert {type: "json"}

const provider = ethers.getDefaultProvider(config.eth.network)
const wallet = new ethers.Wallet(config.eth.privateKey, provider)

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

export async function transferFrom(fromAddress, tokenAddress, amount) {
    const contract = new ethers.Contract(config.eth.contract.address, config.eth.contract.abi, wallet)
    const fee = await getFee()
    const transaction = await contract.transfer(tokenAddress, fromAddress, amount, {
        gasLimit: 300000,
        maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
        maxFeePerGas: fee.maxFeePerGas
    })
    const res = await transaction.wait()
    console.log(`transfer success: ${JSON.stringify(res)}`)
    return res
}

export async function transferTo(toAddress, tokenAddress, amount) {
    const abi = [
        "function transfer(address to, uint amount) returns (bool)",
        "event Transfer(address indexed from, address indexed to, uint amount)"
    ]
    const contract = new ethers.Contract(tokenAddress, abi, wallet)
    const fee = await getFee()
    const transaction = await contract.transfer(toAddress, amount, {
        gasLimit: 300000,
        maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
        maxFeePerGas: fee.maxFeePerGas
    })
    const res = await transaction.wait()
    console.log(`transfer success: ${JSON.stringify(res)}`)
    return res
}

export async function getBalance(address) {
    const balance = await provider.getBalance(address)
    console.log(`balance: ${balance}`)
}