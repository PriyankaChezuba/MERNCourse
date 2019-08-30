const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    if (!posts) {
      res.status(400).json({ msg: "No posts found for the given user." });
    }
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById({ _id: req.params.id });
    if (!post) {
      res.status(400).json({ msg: "No Post found with the Id" });
    }

    res.json(post);
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId") {
      res.status(500).json({ msg: "No Post found with the Id" });
    }
    res.status(500).json({ msg: "Error finding post with the given Id" });
  }
});

router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (post.user.toString() !== req.user.id) {
      res
        .status(401)
        .json({ msg: "You are not authorized to delete this post." });
    }

    await post.remove();
    res.json({ msg: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Unable to delete post." });
  }
});

router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors });
    }

    const { text } = req.body;
    try {
      const user = await User.findOne({ _id: req.user.id }).select("-password");

      var name = user.name;
      var avatar = user.avatar;

      var post = new Post({ text, name, avatar });
      post.user = req.user.id;
      await post.save();
      res.json(post);
    } catch (error) {
      console.log(error);
      res.status(500).send({ msg: "Could not add post." });
    }
  }
);

// likes
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res
        .status(400)
        .json({ msg: "The user with this Id has already liked the post" });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error liking the post" });
  }
});

router.put("/unlike/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "The post has not been liked yet" });
    }

    var removeIndex = post.likes
      .map(item => item.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error liking the post" });
  }
});

router.post(
  "/comment/:post_id",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors });
    }

    const { text } = req.body;
    try {
      const user = await User.findOne({ _id: req.user.id }).select("-password");
      const post = await Post.findById(req.params.post_id);

      var newComment = {
        text: text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.log(error);
      res.status(500).send({ msg: "Server Error" });
    }
  }
);

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = await post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    if (!comment) {
      res.status(400).json({ msg: "Comment does not exist" });
    }

    if (comment.user.toString() !== req.user.id) {
      res.status(401).send({ msg: "Unauthorized to delete the comment." });
    }

    var removeIndex = post.comments
      .map(item => item._id)
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    console.log(post.comments);
    res.json(post.comments);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Server Error" });
  }
});

module.exports = router;
