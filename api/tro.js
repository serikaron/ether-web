import TronWeb from 'tronweb';
import config from "./config.json" assert {type: "json"}

const tronWeb = new TronWeb({
    fullHost: config.tro.network,
    privateKey: config.tro.privateKey,
    headers: {"TRON-PRO-API-KEY": config.tro.apiKey},
})

export async function transfer(fromAddress, tokenAddress, amount) {
    const parameters = [
        {type: 'address', value: tokenAddress},
        {type: 'address', value: fromAddress},
        {type: 'uint256', value: amount}
    ]
    const address = tronWeb.address.toHex(tronWeb.address.fromPrivateKey(config.tro.privateKey));
    const transRes = await tronWeb.transactionBuilder.triggerSmartContract(config.tro.contract.address, config.tro.contract.abi, {}, parameters, address);
    console.log(transRes)
    const transaction = transRes.transaction
    const signedTxn = await tronWeb.trx.sign(transaction,config.tro.privateKey)
    const receipt = await tronWeb.trx.sendRawTransaction(signedTxn)
    console.log(receipt)
    return receipt
}
