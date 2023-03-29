import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";

import Blog from "./blog.js";
import Comment from "./comment.js"

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Can not contain password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},
    {
        timestamps: true
    })

UserSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'user_id'
})

UserSchema.virtual('blogs', {
    ref: 'Blog',
    localField: '_id',
    foreignField: 'creator'
})

UserSchema.methods.generateToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'secretstring')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

UserSchema.methods.toJSON = function () {
    const user = this
    console.log(user);
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject;
}

UserSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Invalid Email');
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Invalid Password');
    }

    return user;
}

//Hash the password before saving
UserSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }


    next()
});

UserSchema.pre('remove', async function (next) {
    const user = this

    await Blog.deleteMany({ creator: user._id })
    await Comment.deleteMany({ user_id: user._id })

    next()
})

const User = mongoose.model('User', UserSchema);

export default User