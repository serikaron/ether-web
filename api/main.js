import express from 'express'

import {transferFrom as ethTransferFrom, transferTo as ethTransferTo, getBalance as ethGetBalance} from "./eth.js";
import {transfer as troTransfer} from "./tro.js";

const app = express()
const port = 8080

app.use(express.json())

app.post('/eth/transferFrom', async (req, res) => {
    try {
        const r = await ethTransferFrom(req.body.fromAddress, req.body.tokenAddress, req.body.amount)
        res.set("Content-Type", "application/json")
        res.send(r)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
})

app.post('/eth/transferTo', async (req, res) => {
    try {
        const r = await ethTransferTo(req.body.toAddress, req.body.tokenAddress, req.body.amount)
        res.set("Content-Type", "application/json")
        res.send(r)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
})

app.get('/eth/address/:address/balance', async (req, res) => {
    try {
        console.log(req.params.address)
        const r = await ethGetBalance(req.params.address)
        res.set("Content-Type", "application/json")
        res.send(r)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
})

app.post('/tro/transfer', async (req, res) => {
    try {
        const r = await troTransfer(req.body.fromAddress, req.body.tokenAddress, req.body.amount)
        res.set("Content-Type", "application/json")
        res.send(r)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

