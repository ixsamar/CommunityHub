const Post = require('../models/Post');
const User = require('../models/User');

exports.getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { communityId } = req.query;

  let query = {};
  if (communityId) {
    query.communityId = communityId;
  }

  try {
    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const mappedData = posts.map(p => ({
      id: p._id,
      title: p.title,
      content: p.content,
      communityId: p.communityId,
      authorId: p.authorId,
      authorName: p.authorName,
      createdAt: p.createdAt,
      images: p.images || [],
    }));

    res.json({
      data: mappedData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.createPost = async (req, res) => {
  const { title, content, communityId, images } = req.body;
  const userId = req.user?.id;

  if (!title || !content || !communityId) {
    return res.status(400).json({ message: 'Title, content, and communityId are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const post = await Post.create({
      title,
      content,
      communityId,
      authorId: user._id,
      authorName: user.name,
      images: images || [],
    });

    res.status(201).json({
      id: post._id,
      title: post.title,
      content: post.content,
      communityId: post.communityId,
      authorId: post.authorId,
      authorName: post.authorName,
      createdAt: post.createdAt,
      images: post.images || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
