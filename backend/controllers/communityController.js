const Community = require('../models/Community');

const getUserId = (req) => {
  return req.user?.id || null;
};

exports.getCommunities = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search = '', sort = 'name', filter = 'all' } = req.query;

  let query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (filter === 'public') {
    query.isPrivate = false;
  } else if (filter === 'private') {
    query.isPrivate = true;
  }

  let sortOption = {};
  if (sort === 'name') {
    sortOption = { name: 1 };
  } else if (sort === 'members') {
    sortOption = { members: -1 };
  } else if (sort === 'recent') {
    sortOption = { createdAt: -1 };
  }

  try {
    const total = await Community.countDocuments(query);
    const communities = await Community.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const userId = getUserId(req);
    const mappedData = communities.map(c => {
      const isJoined = userId ? c.joinedUsers.includes(userId) : false;
      return {
        id: c._id,
        name: c.name,
        description: c.description,
        members: c.members,
        isPrivate: c.isPrivate,
        createdAt: c.createdAt,
        isJoined,
      };
    });

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

exports.getCommunityById = async (req, res) => {
  try {
    const c = await Community.findById(req.params.id);
    if (!c) {
      return res.status(404).json({ message: 'Community not found.' });
    }

    const userId = getUserId(req);
    const isJoined = userId ? c.joinedUsers.includes(userId) : false;

    res.json({
      id: c._id,
      name: c.name,
      description: c.description,
      members: c.members,
      isPrivate: c.isPrivate,
      createdAt: c.createdAt,
      isJoined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.createCommunity = async (req, res) => {
  const { name, description, isPrivate } = req.body;
  const userId = getUserId(req);

  if (!name) {
    return res.status(400).json({ message: 'Name is required.' });
  }

  try {
    const existing = await Community.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Community name already exists.' });
    }

    const joinedUsers = userId ? [userId] : [];

    const c = await Community.create({
      name,
      description,
      isPrivate: !!isPrivate,
      joinedUsers,
      members: joinedUsers.length || 1,
    });

    res.status(201).json({
      id: c._id,
      name: c.name,
      description: c.description,
      members: c.members,
      isPrivate: c.isPrivate,
      createdAt: c.createdAt,
      isJoined: !!userId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.joinCommunity = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const c = await Community.findById(req.params.id);
    if (!c) {
      return res.status(404).json({ message: 'Community not found.' });
    }

    if (!c.joinedUsers.includes(userId)) {
      c.joinedUsers.push(userId);
      c.members = c.joinedUsers.length;
      await c.save();
    }

    res.json({
      id: c._id,
      name: c.name,
      description: c.description,
      members: c.members,
      isPrivate: c.isPrivate,
      createdAt: c.createdAt,
      isJoined: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.leaveCommunity = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const c = await Community.findById(req.params.id);
    if (!c) {
      return res.status(404).json({ message: 'Community not found.' });
    }

    c.joinedUsers = c.joinedUsers.filter(u => u.toString() !== userId);
    c.members = c.joinedUsers.length;
    await c.save();

    res.json({
      id: c._id,
      name: c.name,
      description: c.description,
      members: c.members,
      isPrivate: c.isPrivate,
      createdAt: c.createdAt,
      isJoined: false,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
