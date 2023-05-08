import express from "express"
import User from "../models/user.js"
import auth from "../middleware/auth.js"
import Roles from "../models/roles.js"
import Subscriptions from "../models/subscriptions.js"
import nodemailer from 'nodemailer'


const adminMail = 'htrambadia@argusoft.com'
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: 'htrambadia@argusoft.com',
        pass: 'pleylxshmqkcqfri'
    }
})
const router = express.Router()

router.post('/user', async (req, res) => {
    const roleId = await Roles.findOne({ roleName: "User" })
    let user = { ...req.body, roleId }

    try {
        const subscription = await Subscriptions.findOne({ _id: user.subscription })
        let lastDate = new Date()
        const noOfMonths = parseInt(subscription.duration.split(' ')[0])
        lastDate.setDate(lastDate.getDate() + 30 * noOfMonths)
        user = User({ ...user, lastDate })
        await user.save()
        const token = await user.generateToken()

        // NodeMailer
        const mailOption = {
            from: adminMail,
            to: user.email,
            subject: 'Successful Signing Up',
            text: `Hello ${user.username}, 
            Hope this mail finds you well. This mail is to inform you that your account is signed up successfully. your subscription will be activated soon. Please try to login after some time.`
        }

        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info);
            }
        })

        res.status(201).send({ user, token })
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
})

router.post('/users/login', async (req, res, next) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        console.log(user);
        if (!user) {
            return res.send({ error: 'Invalid credentials' })
        }
        if (user.status === 'inactive') {
            return res.status(404).send({ error: 'Your account is not approved. Please Try again Later' })
        }
        const today = new Date()
        if (user.lastDate < today) {
            return res.status(200).send({ error: 'Your Subscription has been over' })
        }
        const token = await user.generateToken()
        await user.populate({
            path: 'roleId'
        })
        const role = user.roleId.roleName

        res.send({ userId: user._id, token, role })
    } catch (err) {

    }
})

router.post('/googleLogin', async (req, res) => {
    const email = req.body.email
    try {
        const user = await User.findOne({ email: email });
        console.log(user);
        const token = await user.generateToken()
        res.send({ userId: user._id, token })
    } catch (error) {
        res.send(error.message)
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

router.get('/users/pending', async (req, res) => {
    const users = await User.find({ status: "inactive" })
    if (users.length === 0) {
        return res.status(404).send('No pending Request found')
    }
    return res.status(200).send({ users })
})

router.get('/users/me', auth, async (req, res) => {
    const user = req.user
    await user.populate({
        path: 'roleId'
    })
    // await user.populate({
    //     path: 'blogs'
    // })
    console.log(user);
    const blogs = user.blogs
    const role = user.roleId.roleName
    res.send({ user, blogs, role })
});

router.patch('/user/:id', async (req, res) => {
    const userId = req.params.id

    try {
        const user = await User.findByIdAndUpdate(userId, req.body, { new: true })
        if (!user) {
            return res.status(404).send('User not found')
        }
        return res.send(user)
    } catch (error) {
        res.status(400).send(error.message)
    }

})

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
        // console.log(req.user._id);
        await User.findOneAndDelete({ _id: req.user._id })
        res.send(req.user)
    } catch (err) {
        res.status(500).send(err.message)
    }
});


import passport from 'passport'
import { Strategy as GoogleStartegy } from 'passport-google-oauth2'

const GOOGLE_CLIENT_ID = '221528622401-shd1nksfn5bnn7o8ichmmg4ndu419gqa.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'

router.use(passport.initialize());
router.use(passport.session());

passport.use(new GoogleStartegy(
    {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/google/callback",
        passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
        // console.log(accessToken);
        // console.log(profile);
        const email = profile.email
        let user = await User.findOne({ email: profile.email })
        if (user) {
            // const token = await user.generateToken()
            // console.log(token);
            return done(null, email)
        } else {
            user = new User({
                username: profile.displayName,
                email: profile.email
            })
            await user.save()
            // const token = await user.generateToken()

            return done(null, email)
        }

    }
))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj, done) => {
    done(null, obj)
})

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/auth/google/callback',
    passport.authenticate('google'),
    function (req, res) {
        // console.log(req);
        // const accToken = 'Bearer ' + req.user
        const email = req.user
        // console.log(accToken);
        res.redirect('http://localhost:4200/auth?authenticated=true&email=' + email)
    })



export default router