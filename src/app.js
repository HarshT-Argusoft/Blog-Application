import express from "express";
import './db/mongoose.js'
import blogRouter from './routers/blog.js'
import commentRouter from './routers/comment.js'
import userRouter from './routers/user.js'

const app = express()

app.use(express.json())
app.use(blogRouter)
app.use(commentRouter)
app.use(userRouter)

export default app