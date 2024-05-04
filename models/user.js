import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
  },
  othernames: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to verify password
userSchema.methods.verifyPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
  

// Create model
const User = mongoose.model("User", userSchema);

export default User;
