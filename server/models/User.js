import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    image: {type: String, required: true},
    phone: {type: String, default: "9999999999"} // Added phone field with default value
})

const User = mongoose.model('User', userSchema)

export default User;
