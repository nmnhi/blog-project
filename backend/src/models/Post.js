import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minLenght: [3, "Title mus be at least 3 characters"],
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      minLenght: [10, "Content must be at least 10 characters"],
    },

    thumnail: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

postSchema.index({ title: "text", content: "text" });

const Post = mongoose.model("Post", postSchema);

export default Post;
