"use strict";

import {ethers} from "ethers";
import sttConfig from "../artifacts/contracts/stt_contract.sol/STTToken.json" assert {type: "json"}
import agentConfig from "../artifacts/contracts/contract.sol/Agent.json" assert {type: "json"}

const sttContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const agentContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
const privateKey = ""
const network = "http://localhost:8545"

const provider = ethers.getDefaultProvider(network)
const wallet = new ethers.Wallet(privateKey, provider)

async function checkBalance() {
    const contract = new ethers.Contract(sttContractAddress, sttConfig.abi, wallet)
    const balance = await contract.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    console.log(`ballance of ${wallet.address} is ${balance}`)
}

async function send() {
    const contract = new ethers.Contract(sttContractAddress, sttConfig.abi, wallet)
    const transaction = await contract.transfer("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 100)
    const res = await transaction.wait()
    console.log(`send success: ${JSON.stringify(res)}`)
}

async function transfer() {
    const contract = new ethers.Contract(agentContractAddress, agentConfig.abi, wallet)
    console.log(wallet.address)
    const transaction = await contract.transfer(sttContractAddress, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1, {gasLimit: 300000})
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