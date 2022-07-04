import express from 'express'

import {transferFrom as ethTransferFrom, transferTo as ethTransferTo, getBalance as ethGetBalance} from "./eth.js";
import {transferFrom as troTransferFrom, transferTo as troTransferTo, getBalance as troGetBalance} from "./tro.js";

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

app.get('/eth/token/:token/address/:address/balance', async (req, res) => {
    try {
        const r = await ethGetBalance(req.params.token, req.params.address)
        res.set("Content-Type", "application/json")
        res.send(r)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
})

app.post('/tro/transferFrom', async (req, res) => {
    try {
        const r = await troTransferFrom(req.body.fromAddress, req.body.tokenAddress, req.body.amount)
        res.set("Content-Type", "application/json")
        res.send(r)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
})

app.post('/tro/transferTo', async (req, res) => {
    try {
        const r = await troTransferTo(req.body.toAddress, req.body.tokenAddress, req.body.amount)
        res.set("Content-Type", "application/json")
        res.send(r)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
})

app.get('/tro/token/:token/address/:address/balance', async (req, res) => {
    try {
        const r = await troGetBalance(req.params.token, req.params.address)
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

