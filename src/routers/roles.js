import express from "express"
import auth from "../middleware/auth.js";
import Roles from "../models/roles.js"

const router = express.Router()

router.get('/roles', async (req, res) => {
    try {
        const roles = await Roles.find()
        if (roles.length === 0) {
            return res.status(400).send("No roles found")
        }
        return res.status(200).send(roles)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.get('/role/:id', async (req, res) => {
    const roleId = req.params.id
    try {
        const role = await Roles.findById(roleId)
        if (!role) {
            return res.status(404).send('No role Found')
        }
        return res.status(200).send(role)
    } catch (error) {
        return res.status(400).send(error.message)
    }
})

router.post('/roles/add', async (req, res) => {
    const newRole = new Roles({
        ...req.body
    })

    try {
        await newRole.save()
        res.status(200).send(newRole)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.patch('/roles/:id/update', async (req, res) => {
    const roleId = req.params.id

    try {
        const role = await Roles.findByIdAndUpdate(roleId, { ...req.body }, { new: true })

        if (!role) {
            return res.status(404).send("Role not found")
        }
        return res.status(200).send(role)
    } catch (error) {
        return res.status(400).send(error.message)
    }
})

router.delete('/roles/:id', async (req, res) => {
    const roleId = req.params.id

    try {
        const role = await Roles.findByIdAndDelete(roleId)

        if (!role) {
            return res.status(404).send("Role not found")
        }
        return res.status(200).send(role)
    } catch (error) {
        return res.status(400).send(error.message)

    }
})

export default router