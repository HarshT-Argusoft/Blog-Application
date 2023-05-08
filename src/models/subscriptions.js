import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    subscriptionName: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

const Subscriptions = mongoose.model('Subscription', SubscriptionSchema)

export default Subscriptions