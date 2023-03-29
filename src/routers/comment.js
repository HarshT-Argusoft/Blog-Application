import express from "express";
import auth from "../middleware/auth.js";
import Comment from "../models/comment.js";

const router = express.Router()

router.post('/comments/:blogId', auth, async (req, res) => {

    try {
        const blogId = req.params.blogId

        const comment = new Comment({ ...req.body, blog_id: blogId, user_id: req.user._id })
        await comment.save()

        res.status(201).send(comment)

    } catch (error) {
        res.status(400).send(error.message)
    }

})

router.get('/comments/:blogId', async (req, res) => {
    // console.log(req.params.blogId);
    try {
        const blogId = req.params.blogId

        const comments = await Comment.find({ blog_id: blogId })

        if (!comments) {
            return res.status(400).send('Can not find comments')
        }
        res.status(201).send(comments)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.get('/comment/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId

        console.log(commentId);
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(400).send('Can not find comment')
        }
        res.status(201).send(comment)

    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.patch('/comment/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId

        const comment = await Comment.findByIdAndUpdate(commentId, { ...req.body }, { new: true })
        if (!comment) {
            return res.status(400).send('Can not find comment')
        }
        await comment.save()
        res.status(201).send(comment)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.delete('/comment/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId

        const comment = await Comment.findByIdAndDelete(commentId)
        if (!comment) {
            return res.status(400).send('Can not find comment')
        }
        res.status(201).send(comment)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

export default router