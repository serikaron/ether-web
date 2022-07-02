"use strict";

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

async function erc20Contract(tokenAddress) {
    const abi = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ];

    // console.log(window.ethereum)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    return new ethers.Contract(tokenAddress, abi, signer)
}

async function ethersApproval(tokenAddress, contractAddress, amount) {
    const token = await erc20Contract(tokenAddress)
    const res = await token.approve(contractAddress, amount)
    console.log(`res: ${JSON.stringify(res)}`)
}

async function checkEthersApproval(tokenAddress, contractAddress) {
    const token = await erc20Contract(tokenAddress)
    const res = await token.allowance(window.ethereum.selectedAddress, contractAddress)
    console.log(`res: ${JSON.stringify(res)}`)
}

async function getTronlinkAccountInfo() {
    if (!window.tronLink.ready) {
        // throw new Error("TronLink is not ready")
        await initTronLink()
    }
    if (!window.tronLink.tronWeb) {
        throw new Error("TronLink is not ready")
    }
    if (!window.tronLink.tronWeb.defaultAddress) {
        throw new Error("tronWeb.defaultAddress is not defined")
    }
    const address = await window.tronLink.tronWeb.defaultAddress.base58
    const balance = await window.tronLink.tronWeb.trx.getBalance(address)
    console.log(`address: ${address}, balance: ${balance}`)
    return {address, balance}
}

async function tronLinkApproval(tokenAddress, contractAddress, amount) {
    try {
        if (!window.tronLink.ready) {
            // throw new Error("TronLink is not ready")
            await initTronLink()
        }
        if (!window.tronLink.tronWeb) {
            throw new Error("TronLink is not ready")
        }
        if (!window.tronLink.tronWeb.defaultAddress) {
            throw new Error("tronWeb.defaultAddress is not defined")
        }
        const token = await window.tronLink.tronWeb.contract().at(tokenAddress)
        const res = await token.approve(contractAddress, amount).send()
        console.log(`res: ${JSON.stringify(res)}`)
    } catch (e) {
        console.log(`error: ${e}`)
    }
}

async function checkTronLinkApproval(tokenAddress, contractAddress) {
    try {
        if (!window.tronLink.ready) {
            // throw new Error("TronLink is not ready")
            await initTronLink()
        }
        if (!window.tronLink.tronWeb) {
            throw new Error("TronLink is not ready")
        }
        if (!window.tronLink.tronWeb.defaultAddress) {
            throw new Error("tronWeb.defaultAddress is not defined")
        }
        const token = await window.tronLink.tronWeb.contract().at(tokenAddress)
        const res = await token.allowance(window.tronLink.tronWeb.defaultAddress.base58, contractAddress).call()
        console.log(`res: ${JSON.stringify(res)}`)
    } catch (e) {
        console.log(`error: ${e}`)
    }
}

function checkPlugin() {
    if (typeof window.ethereum === 'undefined') {
        throw new Error("Ethereum is not installed")
    }
    if (typeof window.tronLink === 'undefined') {
        throw new Error("TronLink is not installed")
    }
}

async function initTronLink() {
    const res = await window.tronLink.request({method: "tron_requestAccounts"})
    console.log(`res: ${JSON.stringify(res)}`)
    if (typeof res.code === 'undefined') {
        throw new Error("Login TronLink first")
    }
    if (res.code === 4001) {
        throw new Error(`TronLink error: ${res.message}`)
    }
}
