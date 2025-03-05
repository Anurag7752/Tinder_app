import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";


export const swipeRight = async (req, res) => {
    try {
        const {likedUserId} = req.params;
        const currentUser = await User.findById(req.user.id);
        const likedUser = await User.findById(likedUserId);

        if(!likedUser){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if(!currentUser.likes.includes(likedUserId)){
            currentUser.likes.push(likedUserId);
            await currentUser.save();

        // if the other user already liked us, it's a match, so let's update both users

        if(likedUser.likes.includes(currentUser.id)){
            likedUser.matches.push(currentUser.id);
            likedUser.matches.push(currentUser.id);

            await Promise.all([await currentUser.save(), await likedUser.save()]);


            // send notification in real-time with socket.io

            const connectedUsers = getConnectedUsers();
            const io = getIO();

            const likedUserSocketId = connectedUsers.get(likedUserId);

            if(likedUserSocketId){
                io.to(likedUserSocketId).emit("match", {
                    _id: currentUser.id,
                    name: currentUser.name,
                    image: currentUser.image,
                });
            }

            const currentSocketId = connectedUsers.get(req.user._id.toString());
            if(currentSocketId){
                io.to(currentSocketId).emit("match", {
                    _id: likedUser.id,
                    name: likedUser.name,
                    image: likedUser.image,
                });
            }
        }
    }

    res.status(200).json({
        success: true,
        user: currentUser,
    });
    } catch (error) {
        console.log("Error in swipeRight controller: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const swipeLeft = async ( req, res) => {
    try {
        const {dislikedUserId} = req.params;

        const currentUser = await User.findById(req.user.id);

        if(!currentUser.dislikes.includes(dislikedUserId)){
            currentUser.dislikes.push(dislikedUserId);
            await currentUser.save();
        }

        res.status(200).json({
            success: true,
            user: currentUser,
        });

    } catch (error) {
        console.log("Error in swipeLeft controller: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const getMatches = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).populate("matches", "name image");

        res.status(200).json({
            success: true,
            matches: user.matches,
        });

    } catch (error) {
        console.log("Error in getMatches controller: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const getUserProfiles = async (req, res) => {
    try{
        const currentUser = await User.findById(req.user.id);

        const users = await User.find({
            $and:[
                { _id: { $ne: currentUser.id } },
				{ _id: { $nin: currentUser.likes } },
				{ _id: { $nin: currentUser.dislikes } },
				{ _id: { $nin: currentUser.matches } },
            {
                gender: 
                    currentUser.genderPreference === "both"
                    ? { $ne: currentUser.gender }
                    : currentUser.genderPreference,
            },
            { genderPreference: { $in: [currentUser.gender, "both"] } },

            ],
        });

        res.status(200).json({
            success: true,
            users,
        });

    } catch (error) {
        console.log("Error in getUserProfiles controller: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
