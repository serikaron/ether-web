import TronWeb from 'tronweb';
import config from "./config.json" assert {type: "json"}

const tronWeb = new TronWeb({
    fullHost: config.tro.network,
    privateKey: config.tro.privateKey,
    headers: {"TRON-PRO-API-KEY": config.tro.apiKey},
})

export async function transferFrom(fromAddress, tokenAddress, amount) {
    try {
        const parameters = [
            {type: 'address', value: tokenAddress},
            {type: 'address', value: fromAddress},
            {type: 'uint256', value: amount}
        ]
        const address = tronWeb.address.toHex(tronWeb.address.fromPrivateKey(config.tro.privateKey));
        const transRes = await tronWeb.transactionBuilder.triggerSmartContract(config.tro.contract.address, config.tro.contract.abi, {}, parameters, address);
        const transaction = transRes.transaction
        const signedTxn = await tronWeb.trx.sign(transaction, config.tro.privateKey)
        const receipt = await tronWeb.trx.sendRawTransaction(signedTxn)
        console.log(`transferFrom: ${JSON.stringify(receipt)}`)
        return {code: 0, msg: "", data: {txId: receipt.txid}}
    } catch (e) {
        console.log(`transferFrom: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function transferTo(toAddress, tokenAddress, amount) {
    try {
        const contract = await tronWeb.contract().at(tokenAddress)
        const transferResult = await contract.transfer(toAddress, amount).send()
        console.log(`transferTo: ${transferResult}`)
        return {code: 0, msg: "", data: {txId: transferResult}}
    } catch (e) {
        console.log(`transferTo: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}

export async function getBalance(tokenAddress, address) {
    try {
        const contract = await tronWeb.contract().at(tokenAddress)
        const balance = await contract.balanceOf(address).call()
        console.log(`getBalance: ${balance.toString()}`)
        return {code: 0, msg: "", data:{balance: balance.toString()}}
    } catch (e) {
        console.log(`getBalance: ${e}`)
        return {code: -1, msg: `${e}`}
    }
}