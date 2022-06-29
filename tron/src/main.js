"use strict";

import {ethers} from "ethers";
import TronWeb from 'tronweb';

const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";

const API_HOST = "https://api.shasta.trongrid.io"
const OWNER_ADDRESS = "41FE41F638351ADAAF30D7D38CB3CBFFC34699CD8B";
const CONTRACT_ADDRESS = "41F73FE0593D3AC65AE060782525F354A3D6A20A7A";
const TOKEN_ADDRESS = "TKyq4GzNALAzSRjCM6ZHo7tBJXVWHiSNQK";
const FROM_ADDRESS = "TDBfA84hsCaX84KEkXmnodDgVNpkAryMU1";

const privateKey = ""
const apiKey = "4dc681b0-2dc4-4a22-9e0e-ee124fc556cf"

const tronWeb = new TronWeb({
    fullHost: API_HOST,
    privateKey: privateKey,
    headers: {"TRON-PRO-API-KEY": apiKey},
})

async function encodeParams(inputs) {
    let typesValues = inputs
    let parameters = ''

    if (typesValues.length == 0)
        return parameters
    const abiCoder = new AbiCoder();
    let types = [];
    const values = [];

    for (let i = 0; i < typesValues.length; i++) {
        let {type, value} = typesValues[i];
        if (type == 'address')
            value = value.replace(ADDRESS_PREFIX_REGEX, '0x');
        else if (type == 'address[]')
            value = value.map(v => toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x'));
        types.push(type);
        values.push(value);
    }

    console.log(types, values)
    try {
        parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');
    } catch (ex) {
        console.log(ex);
    }
    return parameters
}

async function transfer() {
    const parameters = [
        {type: 'address', value: TOKEN_ADDRESS},
        {type: 'address', value: FROM_ADDRESS},
        {type: 'uint256', value: 1}
    ]
    const transRes = await tronWeb.transactionBuilder.triggerSmartContract(CONTRACT_ADDRESS, "transfer(address,address,uint256)", {}, parameters, OWNER_ADDRESS);
    console.log(transRes)
    const transaction = transRes.transaction
    const signedTxn = await tronWeb.trx.sign(transaction,privateKey)
    const receipt = await tronWeb.trx.sendRawTransaction(signedTxn)
    console.log(receipt)
}

transfer()
.then(() => {
    console.log("done")
})
.catch(e => {
    console.log(e)
})