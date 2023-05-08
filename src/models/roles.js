import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Roles = mongoose.model('Role', RoleSchema)

export default Roles