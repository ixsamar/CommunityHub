const mongoose = require('mongoose');
const User = require('../models/User');
const Community = require('../models/Community');
const Post = require('../models/Post');

// Dummy Seeder Data
const seedData = async () => {
  try {
    // 1. Clear existing collections
    await User.deleteMany({});
    await Community.deleteMany({});
    await Post.deleteMany({});

    console.log('Database cleared. Starting seeding...');

    // 2. Seed Default User
    const defaultUser = await User.create({
      name: 'Samara Simha Reddy',
      email: 'usr_1@communityhub.mock',
      password: 'password123',
      bio: 'Mobile App Developer | Pair Programming with AI Antigravity.',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    });

    console.log(`Default User created: ${defaultUser.email}`);

    // 3. Seed Communities
    const community1 = await Community.create({
      name: 'General Discussion',
      description: 'The place for any and all general conversation, updates, and chat.',
      members: 1,
      isPrivate: false,
      joinedUsers: [defaultUser._id],
    });

    const community2 = await Community.create({
      name: 'React Native Devs',
      description: 'Share code snippets, tips, libraries, and bugs related to React Native development.',
      members: 1,
      isPrivate: false,
      joinedUsers: [defaultUser._id],
    });

    const community3 = await Community.create({
      name: 'Private Announcements',
      description: 'Exclusive announcements and private updates for selected members only.',
      members: 1,
      isPrivate: true,
      joinedUsers: [defaultUser._id],
    });

    console.log('Communities seeded successfully.');

    // 4. Seed Posts
    await Post.create({
      title: 'Welcome to Community Hub!',
      content: 'This is the very first post on Community Hub. Feel free to join communities and create new posts!',
      communityId: community1._id,
      authorId: defaultUser._id,
      authorName: defaultUser.name,
      images: ['https://images.unsplash.com/photo-1556761175-b81465b4529a?auto=format&fit=crop&w=800&q=80'],
    });

    await Post.create({
      title: 'Tips for offline-first React Native Apps',
      content: 'When designing offline apps, always use a robust store like RTK Query backed by MMKV cache storage. Also make sure to implement an online synchronization queue manager to handle queued mutations.',
      communityId: community2._id,
      authorId: defaultUser._id,
      authorName: defaultUser.name,
      images: [],
    });

    await Post.create({
      title: 'Render deployment configured successfully!',
      content: 'The backend has been created with MongoDB compatibility and is completely ready to be hosted on Render.',
      communityId: community1._id,
      authorId: defaultUser._id,
      authorName: defaultUser.name,
      images: [],
    });

    console.log('Posts seeded successfully. Seeding complete!');
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
  }
};

// Check if running as a standalone node process
if (require.main === module) {
  const dotenv = require('dotenv');
  const path = require('path');
  // Load local env configurations
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      await seedData();
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error(`MongoDB connection error in seed script: ${err.message}`);
      process.exit(1);
    });
}

module.exports = seedData;
