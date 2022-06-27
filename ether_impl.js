async function getEthersAccountInfo(ethereum) {
    console.log("Getting ethers account info");
    if (typeof ethereum === 'undefined') {
        throw new Error("Ethereum is not ready")
    }
    const provider = new ethers.providers.Web3Provider(ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()

    const address = await signer.getAddress()
    const balance = await signer.getBalance()
    console.log(`address: ${address}, balcance: ${balance.toString()}`)
    return {address, balance: balance.toString()}
}

async function getTronlinkAccountInfo(tronLink) {
    if (!tronLink.ready) {
        throw new Error("Tronlink is not ready")
    }
    if (!tronLink.tronWeb) {
        throw new Error("Tronlink is not ready")
    }
    if (!tronLink.tronWeb.defaultAddress) {
        throw new Error("tronWeb.defaultAddress is not defined")
    }
    const res = await tronLink.request({method: "tron_requestAccounts"})
    console.log(`res: ${JSON.stringify(res)}`)
    if (res.code === 4001) {
        throw new Error(`Tronlink error: ${res.message}`)
    }
    const address = await tronLink.tronWeb.defaultAddress.base58
    const balance = await tronLink.tronWeb.trx.getBalance(address)
    console.log(`address: ${address}, balance: ${balance}`)
    return {address, balance}
}

// async function initTronlink(window) {
//     window.tronLink = {
//         ready: true,
//         tronWeb: window.tronWeb
//     }
// }
