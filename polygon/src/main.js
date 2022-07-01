"use strict";

import ethers from "ethers";
import sttConfig from "../artifacts/contracts/stt_contract.sol/STTToken.json" assert {type: "json"}
import agentConfig from "../artifacts/contracts/contract.sol/Agent.json" assert {type: "json"}

const sttContractAddress = "0xAc5DFB21853A1fdF2CCaF11fC2D2076f3e89049b"
const agentContractAddress = "0x30e4b13b99780d51dfc6156e639f97e602c330b0"
const privateKey = ""
const network = "https://rpc-mumbai.maticvigil.com"

const provider = ethers.getDefaultProvider(network)
const wallet = new ethers.Wallet(privateKey, provider)

async function checkBalance() {
    const contract = new ethers.Contract(sttContractAddress, sttConfig.abi, wallet)
    const balance = await contract.balanceOf("0x8B76C049A3c61b7De2BB656D18E6d63dF9718E6B")
    console.log(`ballance of ${wallet.address} is ${balance}`)
    const eth = ethers.utils.formatEther(100)
    console.log(`1 eth is ${eth}`)
}

async function send() {
    const contract = new ethers.Contract(sttContractAddress, sttConfig.abi, wallet)
    const transaction = await contract.transfer("0x8B76C049A3c61b7De2BB656D18E6d63dF9718E6B", 100, {gasLimit: 300000})
    const res = await transaction.wait()
    console.log(`send success: ${JSON.stringify(res)}`)
}

async function transfer() {
    const contract = new ethers.Contract(agentContractAddress, agentConfig.abi, wallet)
    console.log(wallet.address)
    const transaction = await contract.transfer(sttContractAddress, "0x8B76C049A3c61b7De2BB656D18E6d63dF9718E6B", 1, {gasLimit: 300000})
    const res = await transaction.wait()
    console.log(`transfer success: ${JSON.stringify(res)}`)
}

checkBalance()
.then(() => {
    console.log("success")
})
.catch(err => {
    console.log(err)
})