import express from "express";
// import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import Blog from '../models/blog.js'

const router = express.Router()

router.post('/blogs', auth, async (req, res) => {
    const userId = req.user._id
    const blog = new Blog({
        ...req.body,
        creator: userId
    })

    try {
        await blog.save()
        res.status(201).send(blog)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find()

        if (!blogs) {
            return res.status(400).send('Can not find blogs')
        }
        return res.status(201).send(blogs)
    } catch (error) {
        res.status(400).send(error.message)
    }

})

router.get('/blogs/:id', async (req, res) => {
    try {
        const blogId = req.params.id

        const blog = await Blog.findById(blogId)

        if (!blog) {
            return res.status(400).send('Can not find blog')
        }
        await blog.populate({
            path: 'comments'
        })
        // console.log(blog.comments);
        res.status(201).send({ blog, comments: blog.comments })
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.patch('/blogs/:id', auth, async (req, res) => {

    try {
        const blogId = req.params.id
        const blog = await Blog.findOneAndUpdate({ _id: blogId, creator: req.user._id }, { ...req.body }, { new: true })

        if (!blog) {
            return res.status(400).send('Can not find blog')
        }
        await blog.save()
        res.status(201).send(blog)

    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.delete('/blogs/:id', auth, async (req, res) => {

    try {
        const blogId = req.params.id
        const blog = await Blog.findOneAndDelete({ _id: blogId, creator: req.user._id })

        if (!blog) {
            return res.status(400).send('Can not find blog')
        }
        res.status(201).send(blog)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

export default router