import TronWeb from 'tronweb';
import config from "./config.json" assert {type: "json"}
import {ethers} from "ethers";

// const tronWeb = new TronWeb({
//     fullHost: config.tro.network,
//     privateKey: config.tro.privateKey,
//     headers: {"TRON-PRO-API-KEY": config.tro.apiKey},
// })

function tronWeb(privateKey) {
    return new TronWeb({
        fullHost: config.tro.network,
        privateKey: privateKey,
        headers: {"TRON-PRO-API-KEY": config.tro.apiKey},
    })
}

async function agentContract() {
    console.log(`agentContract, address:${config.tro.agentAddress}`)
    return await tronWeb(config.tro.contractOwner).contract().at(config.tro.contract.address)
}

async function tokenContract(tokenAddress) {
    return await tronWeb(config.tro.payAccount).contract().at(tokenAddress)
}

async function parseToken(tokenAddress, amount) {
    const token = await tokenContract(tokenAddress)
    const decimals = await token.decimals().call()
    return ethers.utils.parseUnits(amount.toString(), decimals.toString())
}

export async function transferToPlatform(userAddress, platformAddress, tokenAddress, amount) {
    try {
        const parsedAmount = await parseToken(tokenAddress, amount)
        const contract = await agentContract()
        const txId = await contract.transfer(tokenAddress, userAddress, platformAddress, parsedAmount).send()
        return {code: 0, msg: "", data: {txId}}
    } catch (e) {
        console.log(`transferToPlatform: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function transferToUser(userAddress, tokenAddress, amount) {
    try {
        const parsedAmount = await parseToken(tokenAddress, amount)
        const contract = await tokenContract(tokenAddress)
        const transferResult = await contract.transfer(userAddress, parsedAmount).send()
        console.log(`transferToUser: ${transferResult}`)
        return {code: 0, msg: "", data: {txId: transferResult}}
    } catch (e) {
        console.log(`transferToUser: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function getBalance(tokenAddress, address) {
    try {
        const contract = await tokenContract(tokenAddress)
        const balance = await contract.balanceOf(address).call()
        const decimals = await contract.decimals().call()
        const balanceFormatted = ethers.utils.formatUnits(balance, decimals)
        console.log(`getBalance: ${balance.toString()} ${balanceFormatted}`)
        return {code: 0, msg: "", data:{balance: balanceFormatted}}
    } catch (e) {
        console.log(`getBalance: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function getOwner() {
    try {
        const contract = await agentContract()
        const ownerHex = await contract.getOwner().call()
        const owner = tronWeb(config.tro.contractOwner).address.fromHex(ownerHex)
        console.log(`getOwner: ${owner}`)
        return {code: 0, msg: "", data:{owner}}
    } catch (e) {
        console.log(`getOwner: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function setOwner(newOwner) {
    try {
        const isAddress = tronWeb(config.tro.contractOwner).isAddress(newOwner)
        if (!isAddress) {
            return {code: -100, msg: `${newOwner} is not a valid address`}
        }
        const contract = await agentContract()
        const txId = await contract.setOwner(newOwner).send()
        console.log(`setOwner${newOwner} success, tdId: ${txId}`)
        return {code: 0, msg: "", data:{newOwner, txId}}
    } catch (e) {
        console.log(`setOwner: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}