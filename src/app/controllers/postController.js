const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate(['user', 'comments']);

        return res.send({ posts });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading posts' });
    }
});

router.get('/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate(['user', 'comments']);

        return res.send({ post });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading post' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, article, comments } = req.body;

        const post = await Post.create({ title, article, user: req.userId });

        await Promise.all(comments.map(async comment => {
            const postComment = new Comment({ ...comment, post: post._id });

            await postComment.save();

            post.comments.push(postComment);
        }));

        await post.save();

        return res.send({ post });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: 'Error creating new post' });
    }
});

router.delete('/:postId', async (req, res) => {
    try {
        await Post.findByIdAndRemove(req.params.postId);

        return res.send();
    } catch (err) {
        return res.status(400).send({ error: 'Error deleting post' });
    }
});

router.put('/:postId', async (req, res) => {
    try {
        const { title, article, comments } = req.body;

        const post = await Post.findByIdAndUpdate(req.params.postId, {
            title,
            article
        }, { new: true });

        post.comments = [];
        await Comment.remove({ post: post._id });

        await Promise.all(comments.map(async comment => {
            const postComment = new Comment({ ...comment, post: post._id });

            await postComment.save();

            post.comments.push(postComment);
        }));

        await post.save();

        return res.send({ post });
    } catch (err) {
        return res.status(400).send({ error: 'Error updating post' });
    }
});

module.exports = app => app.use('/posts', router);