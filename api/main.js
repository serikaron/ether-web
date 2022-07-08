import express from 'express'

import {
    transferToPlatform as ethTransferToPlatform,
    transferToUser as ethTransferToUser,
    getBalance as ethGetBalance,
    getOwner as ethGetOwner,
    setOwner as ethSetOwner,
} from "./eth.js";
import {
    transferToPlatform as troTransferToPlatform,
    transferToUser as troTransferToUser,
    getBalance as troGetBalance
} from "./tro.js";

const app = express()
const port = 8080

app.use(express.json())

async function run(res, f) {
    try {
        const out = await f()
        res.set("Content-Type", "application/json")
        res.send(out)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
}

app.post('/eth/transferToPlatform', async (req, res) => {
    run(res, async () => {
        return await ethTransferToPlatform(req.body.userAddress, req.body.platformAddress, req.body.tokenAddress, req.body.amount)
    })
})

app.post('/eth/transferToUser', async (req, res) => {
    run(res, async () => {
        return await ethTransferToUser(req.body.userAddress, req.body.tokenAddress, req.body.amount)
    })
})

app.get('/eth/token/:token/address/:address/balance', async (req, res) => {
    run(res, async () => {
        return await ethGetBalance(req.params.token, req.params.address)
    })
})

app.post('/eth/owner', async (req, res) => {
    run(res, async () => {
        return await ethSetOwner(req.body.owner)
    })
})

app.get('/eth/owner', async (req, res) => {
    run(res, async () => {
        return await ethGetOwner()
    })
})

app.post('/tro/transferToPlatform', async (req, res) => {
    try {
        const r = await troTransferToPlatform(req.body.userAddress, req.body.tokenAddress, req.body.amount)
        res.set("Content-Type", "application/json")
        res.send(r)
    } catch (e) {
        console.log(e)
        res.set("Content-Type", "text/plain")
        res.send(e)
    }
})

app.post('/tro/transferToUser', async (req, res) => {
    try {
        const r = await troTransferToUser(req.body.userAddress, req.body.tokenAddress, req.body.amount)
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

