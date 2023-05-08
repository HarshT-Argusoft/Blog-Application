import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    blog_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Blog'
    }
},
    {
        timestamps: true
    })

CommentSchema.methods.toJSON = function () {
    const commentObject = this.toObject()

    // delete commentObject.user_id
    // delete commentObject._id
    delete commentObject.blog_id
    delete commentObject.updatedAt
    delete commentObject.createdAt
    delete commentObject.__v


    return commentObject
}

const Comment = mongoose.model('Comment', CommentSchema)

export default Comment