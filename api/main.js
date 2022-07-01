import express from 'express'

import { transfer as ethTransfer } from "./eth.js";
import { transfer as troTransfer } from "./tro.js";

const app = express()
const port = 8080

app.use(express.json())

app.post('/eth/transfer', async (req, res) => {
    try {
        const r = await ethTransfer(req.body.fromAddress, req.body.tokenAddress, req.body.amount)
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

