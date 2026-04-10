const ForumPost = require('../models/ForumPost');

exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const post = await ForumPost.create({ title, content, category, tags, author: req.user._id });
    await post.populate('author', 'name avatar role currentRole');
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

exports.getPost = async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('author', 'name avatar role currentRole currentCompany')
     .populate('replies.author', 'name avatar role currentRole');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.isClosed) return res.status(400).json({ error: 'Post is closed' });
    post.replies.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('replies.author', 'name avatar role currentRole');
    res.status(201).json({ replies: post.replies });
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
    res.json({ upvotes: post.upvotes.length, upvoted: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.author.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
