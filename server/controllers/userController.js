import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";


export const updateProfile = async (req, res) => {
    // image -> upload to Cloudinary => MongoDB

    try {
        const { image, ...otherData } = req.body;

        let updatedData = { ...otherData };

        if (image) {
            if (image.startsWith("data:image")) { // Fixed syntax issue
                try {
                    const uploadResponse = await cloudinary.uploader.upload(image);
                    updatedData.image = uploadResponse.secure_url;
                } catch (error) {
                    console.log("Error uploading image:", error); // Fixed incorrect error reference
                    return res.status(500).json({ error: "Image upload failed" }); // Added proper error response
                }
            }
        }

       const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });

       res.status(200).json({
        success: true,
        user: updatedUser,
       });

    } catch (error) {
        console.log("Error in updateProfile controller: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

