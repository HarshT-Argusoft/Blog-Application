import express from "express"
import auth from "../middleware/auth.js";
import Subscriptions from "../models/subscriptions.js"

const router = express.Router()

router.get('/subscriptions', async (req, res) => {
    try {
        const subscriptions = await Subscriptions.find()

        if (subscriptions.length === 0) {
            return res.status(404).send('No Subscriptions Found')
        }
        return res.status(200).send(subscriptions)
    } catch (error) {
        return res.status(400).send(error.message)
    }
})

router.post('/subscriptions/add', async (req, res) => {
    const newSub = new Subscriptions(req.body)

    try {
        await newSub.save()
        res.status(200).send(newSub)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.patch('/subscription/:id/update', async (req, res) => {
    const subscriptionId = req.params.id

    try {
        const subscription = await Subscriptions.findByIdAndUpdate(subscriptionId, { ...req.body }, { new: true })

        if (!subscription) {
            return res.status(404).send("Subscription not found")
        }
        return res.status(200).send(subscription)
    } catch (error) {
        return res.status(400).send(error.message)
    }
})

router.delete('/subscription/:id', async (req, res) => {
    const subscriptionId = req.params.id

    try {
        const subscription = await Subscriptions.findByIdAndDelete(subscriptionId)

        if (!subscription) {
            return res.status(404).send("subscription not found")
        }
        return res.status(200).send(subscription)
    } catch (error) {
        return res.status(400).send(error.message)

    }
})

export default router;