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
  email: {
    type: String,
    unique: true,
    lowercase: true, // Ensures email is stored in lowercase
    match: /^\S+@\S+\.\S+$/,
    minLength:3
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

// Method to get full name
// Method to get full name
userSchema.methods.getFullName = function () {
    let fullName = "";
  
    // Check if surname and othernames are present
    if (this.surname) {
      fullName += this.surname;
    }
    
    if (this.othernames) {
      if (fullName.length > 0) {
        fullName += " ";
      }
      fullName += this.othernames;
    }
  
    // Return full name
    return fullName || "Unknown";
  };
  

// Create model
const User = mongoose.model("User", userSchema);

export default User;
