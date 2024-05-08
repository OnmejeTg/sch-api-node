import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  authUser:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true

  },
  surname: {
    type: String,
    required: true,
  },
  othername: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    lowercase: true, // Ensures email is stored in lowercase
    match: /^\S+@\S+\.\S+$/,
    minLength:3,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: String
  }
});

adminSchema.methods.fullName =  function (){
  return `${this.surname} ${this.othername}`
}

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
