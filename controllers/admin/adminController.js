import Admin from "../../models/admin.js";
import User from "../../models/user.js";

const createAdmin = async (req, res) => {
  try {
    const { surname, othername, username, password, email } = req.body;

    if (!username || !password || !email || !surname || !othername) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create authentication user
    const authUser = new User({
      username: username,
      password: password,
      userType: "admin",
    });

    // Save the authUser to ensure the username is unique and saved correctly
    await authUser.save();

    const newAdmin = new Admin({
      authUser: authUser._id, // assuming you want to store a reference
      surname,
      othername,
      username,
      email,
    });

    await newAdmin.save();

    res.json({
      success: true,
      message: "Admin created successfully",
      data: newAdmin,
    });
  } catch (error) {
    console.error("Failed to create admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.errorResponse.errmsg,
    });
  }
};

const getAllAdmins = async (req, res) =>{
    try {
        // Fetch all admin records from the database
        const admins = await Admin.find({}).populate('authUser');

        // Check if we have admins
        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No admins found',
            });
        }

        // Respond with the list of admins
        res.json({
            success: true,
            message: 'Admins retrieved successfully',
            data: admins,
        });
    } catch (error) {
        console.error('Failed to retrieve admins:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
}


export { createAdmin, getAllAdmins };
