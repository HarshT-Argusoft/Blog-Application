import express from "express";
import cors from 'cors'

// import './db/mongoose.js'
import mongoose from "mongoose";
import blogRouter from './routers/blog.js'
import commentRouter from './routers/comment.js'
import userRouter from './routers/user.js'
import roleRouter from './routers/roles.js'
import subscriptionRouter from './routers/subscription.js'


import session from 'express-session'

const app = express()

app.use(express.json())
app.use(cors())
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}))

app.use((err, req, res, next) => {
    console.log(err.message);
    // res.status(err.status || 500).send({
    //     message: err.message
    // });
});

const tenants = [
    { id: 1, name: 'client1', database: 'client1_db' },
    { id: 2, name: 'client2', database: 'client2_db' },
    { id: 3, name: 'client3', database: 'client3_db' },
]

app.use((req, res, next) => {
    const subdomain = req.subdomains[0];
    const tenant = tenants.find(tenant => tenant.name === subdomain);
    if (!tenant) return res.status(404).send('Tenant not found');
    process.env.TENANT = tenant
    req.tenant = tenant;
    next();
})

app.use((req, res, next) => {
    console.log(req.tenant);
    const { database } = req.tenant
    process.env.TENANT_DB = database
    mongoose.connect(`mongodb://localhost:5000/${process.env.TENANT_DB}`)
    console.log(`Connected to ${process.env.TENANT_DB} database`);
    next();
})


app.use(blogRouter)
app.use(commentRouter)
app.use(userRouter)
app.use(roleRouter)
app.use(subscriptionRouter)

export default app;