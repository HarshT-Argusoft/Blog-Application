import mongoose from "mongoose";
import Comment from "./comment.js";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: false,
        trim: true
    },
    image: {
        type: Buffer,
        required: false
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},
    {
        timestamps: true
    })

blogSchema.methods.toJSON = function () {
    const blogObject = this.toObject()

    delete blogObject.creator
    // delete blogObject._id
    delete blogObject.createdAt
    delete blogObject.updatedAt
    delete blogObject.__v


    return blogObject
}

blogSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'blog_id'
})

blogSchema.pre('findOneAndDelete', async function (next) {

    await Comment.deleteMany({ blog_id: this._conditions._id })
    next()
})

const Blog = mongoose.model('Blog', blogSchema)

export default Blog