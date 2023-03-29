import express from "express"
import User from "../models/user.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.post('/user', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken()
        res.send({ user, token })
    } catch (err) {
        res.status(400).send(err.message);
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token != req.token);

        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send(err.message)
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send(err.message)
    }
})


router.get('/users/me', auth, async (req, res) => {
    const user = req.user
    await user.populate({
        path: 'blogs'
    })
    const blogs = user.blogs
    res.send({ user, blogs })
});


router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ['email', 'username', 'password']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {

        updates.forEach((update) => req.user[update] = req.body[update]);

        await req.user.save();

        res.send(req.user)

    } catch (err) {
        res.status(400).send(err.message)
    }
});

router.delete('/users/me', auth, async (req, res) => {

    try {
        await User.findByIdAndDelete(req.user._id)
        res.send(req.user)
    } catch (err) {
        res.status(500).send(err.message)
    }
});

export default router