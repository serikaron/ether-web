import TronWeb from 'tronweb';
import config from "./config.json" assert {type: "json"}
import {ethers} from "ethers";

const tronWeb = new TronWeb({
    fullHost: config.tro.network,
    privateKey: config.tro.privateKey,
    headers: {"TRON-PRO-API-KEY": config.tro.apiKey},
})

export async function transferFrom(fromAddress, tokenAddress, amount) {
    const parameters = [
        {type: 'address', value: tokenAddress},
        {type: 'address', value: fromAddress},
        {type: 'uint256', value: amount}
    ]
    const address = tronWeb.address.toHex(tronWeb.address.fromPrivateKey(config.tro.privateKey));
    const transRes = await tronWeb.transactionBuilder.triggerSmartContract(config.tro.contract.address, config.tro.contract.abi, {}, parameters, address);
    const transaction = transRes.transaction
    const signedTxn = await tronWeb.trx.sign(transaction,config.tro.privateKey)
    const receipt = await tronWeb.trx.sendRawTransaction(signedTxn)
    console.log(`transferFrom: ${receipt}`)
    return receipt
}

export async function transferTo(toAddress, tokenAddress, amount) {
    const contract = await tronWeb.contract().at(tokenAddress)
    const transferResult = await contract.transfer(toAddress, amount).send()
    console.log(`transferTo: ${transferResult}`)
    return transferResult
}

export async function getBalance(tokenAddress, address) {
    const contract = await tronWeb.contract().at(tokenAddress)
    const balance = await contract.balanceOf(address).call()
    console.log(`getBalance: ${balance.toString()}`)
    return {balance: balance.toString()}
}