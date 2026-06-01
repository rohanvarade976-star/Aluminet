const ForumPost = require('../models/ForumPost');
const { createNotification } = require('./notification.controller');
const { awardAchievement } = require('./achievements.controller');

exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
    const post = await ForumPost.create({ title: title.trim(), content: content.trim(), category, tags, author: req.user._id });
    await post.populate('author', 'name avatar role currentRole');
    awardAchievement(req.user._id, 'first_post', req.io).catch(() => {});
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    const posts = await ForumPost.find(filter)
      .populate('author', 'name avatar role currentRole')
      .select('-replies')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await ForumPost.countDocuments(filter);
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get post with paginated replies
exports.getPost = async (req, res) => {
  try {
    const { replyPage = 1, replyLimit = 20 } = req.query;
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('author', 'name avatar role currentRole currentCompany');

    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Paginate replies (newest last, sliced)
    const totalReplies = post.replies.length;
    const start = (replyPage - 1) * replyLimit;
    const paginatedReplies = post.replies.slice(start, start + Number(replyLimit));

    // Populate reply authors inline
    const ForumPostModel = require('../models/ForumPost');
    const populated = await ForumPostModel.populate(paginatedReplies, {
      path: 'author', select: 'name avatar role currentRole'
    });

    res.json({
      post: { ...post.toObject(), replies: populated },
      replyMeta: { total: totalReplies, page: Number(replyPage), pages: Math.ceil(totalReplies / replyLimit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.isClosed) return res.status(400).json({ error: 'Post is closed' });
    if (!req.body.content?.trim()) return res.status(400).json({ error: 'Reply content is required' });

    post.replies.push({ author: req.user._id, content: req.body.content.trim() });
    await post.save();
    await post.populate('replies.author', 'name avatar role currentRole');

    // Notify post author (not if replying to own post)
    if (!post.author.equals(req.user._id)) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'forum_reply',
        title: `${req.user.name} replied to your post`,
        message: `"${post.title.substring(0, 60)}"`,
        link: `/forum/${post._id}`,
        io: req.io
      }).catch(() => {});
    }

    // Return only the new reply (last element)
    const newReply = post.replies[post.replies.length - 1];
    res.status(201).json({ reply: newReply, totalReplies: post.replies.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const idx = post.upvotes.indexOf(req.user._id);
    if (idx === -1) post.upvotes.push(req.user._id);
    else post.upvotes.splice(idx, 1);
    await post.save();

    // Notify author on upvote (not own upvote, only when upvoting not un-upvoting)
    if (idx === -1 && !post.author.equals(req.user._id)) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'post_upvoted',
        title: `${req.user.name} upvoted your post`,
        message: `"${post.title.substring(0, 60)}"`,
        link: `/forum/${post._id}`,
        io: req.io
      }).catch(() => {});

      // Check helpful_member achievement (10 total upvotes across all posts)
      const result = await ForumPost.aggregate([
        { $match: { author: post.author } },
        { $project: { count: { $size: '$upvotes' } } },
        { $group: { _id: null, total: { $sum: '$count' } } }
      ]);
      if (result[0]?.total >= 10) {
        awardAchievement(post.author, 'helpful_member', req.io).catch(() => {});
      }
    }

    res.json({ upvotes: post.upvotes.length, upvoted: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.author.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
