import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        receiver:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        content:{
            type: String,
            require: true,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;