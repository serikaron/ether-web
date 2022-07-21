import express from 'express'

import {
    transferToPlatform as ethTransferToPlatform,
    transferToUser as ethTransferToUser,
    getBalance as ethGetBalance,
    allowance as ethAllowance,
    updateSettings as ethUpdateSettings,
} from "./eth.js";
import {
    transferToPlatform as troTransferToPlatform,
    transferToUser as troTransferToUser,
    getBalance as troGetBalance,
    allowance as troAllowance,
    updateSettings as troUpdateSettings,
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

app.get('/eth/token/:token/address/:address/allowance', async (req, res) => {
    run(res, async () => {
        return await ethAllowance(req.params.token, req.params.address)
    })
})

app.post('/eth/settings', async (req, res) => {
    run(res, async () => {
        return await ethUpdateSettings(req.body.spenderAccount, req.body.payAccount)
    })
})

app.post('/tro/transferToPlatform', async (req, res) => {
    run(res, async () => {
        return await troTransferToPlatform(req.body.userAddress, req.body.platformAddress, req.body.tokenAddress, req.body.amount)
    })
})

app.post('/tro/transferToUser', async (req, res) => {
    run(res, async () => {
        return await troTransferToUser(req.body.userAddress, req.body.tokenAddress, req.body.amount)
    })
})

app.get('/tro/token/:token/address/:address/balance', async (req, res) => {
    run(res, async () => {
        return await troGetBalance(req.params.token, req.params.address)
    })
})

app.get('/tro/token/:token/address/:address/allowance', async (req, res) => {
    run(res, async () => {
        return await troAllowance(req.params.token, req.params.address)
    })
})

app.post('/tro/settings', async (req, res) => {
    run(res, async () => {
        return await troUpdateSettings(req.body.spenderAccount, req.body.payAccount)
    })
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

