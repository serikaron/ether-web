"use strict";

async function erc20Contract(tokenAddress) {
    const abi = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        "function balanceOf(address owner) view returns (uint256)"
    ];

    // console.log(window.ethereum)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    return new ethers.Contract(tokenAddress, abi, signer)
}

async function getEthersAccountInfo(tokenAddress) {
    console.log("Getting ethers account info");
    if (typeof window.ethereum === 'undefined') {
        throw new Error("Ethereum is not ready")
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()

    const address = await signer.getAddress()
    const token = await erc20Contract(tokenAddress)
    const balance = await token.balanceOf(address)
    console.log(`address: ${address}, balcance: ${balance.toString()}`)
    return {address, balance: balance.toString()}
}

async function ethersApproval(tokenAddress, contractAddress, amount) {
    const token = await erc20Contract(tokenAddress)
    const res = await token.approve(contractAddress, ethers.BigNumber.from(amount))
    console.log(`res: ${JSON.stringify(res)}`)
}

async function checkEthersApproval(tokenAddress, contractAddress) {
    const token = await erc20Contract(tokenAddress)
    const res = await token.allowance(window.ethereum.selectedAddress, contractAddress)
    console.log(`res: ${res.toString()}`)
    return res.toString()
}

async function getTronlinkAccountInfo(tokenAddress) {
    if (!window.tronLink.ready) {
        // throw new Error("TronLink is not ready")
        await initTronLink()
    }
    if (!window.tronLink.tronWeb) {
        return {code: -1, msg: `TronLink is not ready`, data: {}}
    }
    if (!window.tronLink.tronWeb.defaultAddress) {
        return {code: -2, msg: `tronWeb.defaultAddress is not defined`, data: {}}
    }
    let address
    let token
    try {
        address = await window.tronLink.tronWeb.defaultAddress.base58
    } catch (e) {
        return {code: -3, msg: `tronWeb.defaultAddress is not defined`, data: {}}
    }
    try {
        token = await window.tronLink.tronWeb.contract().at(tokenAddress)
    } catch (e) {
        return {code: -4, msg: `tokenAddress(${tokenAddress}) invalid`, data: {}}
    }
    try {
        const balance = await token.balanceOf(address).call()
        console.log(`address: ${address}, balance: ${balance}`)
        return {code: 0, msg: "", data: {address, balance}}
    } catch (e) {
        return {code: -5, msg: `${e}`, data: {}}
    }
}

async function tronLinkApproval(tokenAddress, contractAddress, amount) {
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
    const res = await token.approve(contractAddress, ethers.BigNumber.from(amount)).send()
    console.log(`res: ${JSON.stringify(res)}`)
}

async function checkTronLinkApproval(tokenAddress, contractAddress) {
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
    console.log(`res: ${res.toString()}`)
    return res.toString()
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
