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

    // 3. Seed other authors
    const authorsData = [
      { name: 'Alex Johnson', email: 'alex@communityhub.mock', password: 'password123', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' },
      { name: 'Sarah Connor', email: 'sarah@communityhub.mock', password: 'password123', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
      { name: 'Devon Miller', email: 'devon@communityhub.mock', password: 'password123', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' },
      { name: 'Emily Watson', email: 'emily@communityhub.mock', password: 'password123', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
      { name: 'James Carter', email: 'james@communityhub.mock', password: 'password123', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' }
    ];

    const createdAuthors = [defaultUser];
    for (const author of authorsData) {
      const u = await User.create(author);
      createdAuthors.push(u);
    }

    console.log(`Users/Authors seeded: ${createdAuthors.length}`);

    // 4. Base Communities Data
    const baseCommunities = [
      {
        idKey: 'c1',
        name: 'React Native Specialists',
        description: 'Deep dives into React Native internals, performance optimization, Reanimated, and native modules.',
        members: 1420,
        isPrivate: false,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c2',
        name: 'UI/UX Design Pioneers',
        description: 'Stunning user interface concepts, modern user experience research, typography guidelines, and design systems.',
        members: 890,
        isPrivate: false,
        image: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c3',
        name: 'Tech Startup Ecosystem',
        description: 'Co-founders matching, early stage venture funding, pitch decks optimization, and scalable startup growth hacks.',
        members: 3120,
        isPrivate: false,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c4',
        name: 'TypeScript Core & Types',
        description: 'Strict typing challenges, TS compiler configurations, advanced utility types, and structural type system details.',
        members: 640,
        isPrivate: true,
        image: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c5',
        name: 'Next.js & Server Components',
        description: 'Next.js App Router, React Server Components, server actions, caching, and Vercel edge deployment strategies.',
        members: 1850,
        isPrivate: false,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c6',
        name: 'Rust Systems Hackers',
        description: 'Low level systems programming, memory safety guarantees, WebAssembly, actix-web, and embedded systems in Rust.',
        members: 510,
        isPrivate: true,
        image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c7',
        name: 'Figma Component Wizards',
        description: 'Figma auto-layout, interactive components, variable design tokens, and developer handoff best practices.',
        members: 920,
        isPrivate: false,
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c8',
        name: 'AI & Machine Learning Hub',
        description: 'Neural networks, prompt engineering, fine-tuning LLMs, PyTorch tutorials, and local model inference architectures.',
        members: 4200,
        isPrivate: false,
        image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c9',
        name: 'Cybersecurity & Penetration',
        description: 'Ethical hacking, OWASP Top 10 vulnerabilities, zero trust architecture, and network packet analysis scripts.',
        members: 780,
        isPrivate: true,
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60',
      },
      {
        idKey: 'c10',
        name: 'GraphQL & Apollo Devs',
        description: 'GraphQL schema design, Apollo Federation, query caching, resolver optimization, and code-generation tools.',
        members: 460,
        isPrivate: false,
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
      },
    ];

    const topics = [
      { name: 'Kotlin Developers', desc: 'Modern Android development, coroutines, Ktor backend integration, and Multiplatform UI.', isPrivate: false },
      { name: 'SwiftUI Architects', desc: 'Declarative layout hierarchies, state management with Observable, custom animations, and layout wrappers.', isPrivate: false },
      { name: 'DevOps & GitOps', desc: 'Kubernetes operators, Terraform provisioning, GitHub Actions pipelines, and Prometheus monitoring.', isPrivate: true },
      { name: 'Ethereum Builders', desc: 'Solidity smart contracts, Hardhat compiling, Ethers.js frontend integration, and gas cost optimizations.', isPrivate: false },
      { name: 'Creative Coding & WebGL', desc: 'Three.js shaders, custom fragment styling, noise animations, and physics engine setups.', isPrivate: false },
      { name: 'Golang Microservices', desc: 'High-concurrency networking patterns, gRPC contract routing, sqlx querying, and Docker deployments.', isPrivate: true },
      { name: 'Product Growth Circle', desc: 'A/B testing methodologies, cohort conversion matrices, user retention graphs, and landing page conversions.', isPrivate: false },
      { name: 'Angular Enterprise', desc: 'Strict workspace setups, standalone directives, custom injection tokens, and state stores.', isPrivate: false },
      { name: 'Flutter App Craftsmen', desc: 'Widget trees rendering optimizations, BloC business logic layouts, package builders, and web builds.', isPrivate: false },
      { name: 'Svelte Society', desc: 'Reactive assignments compilation, SvelteKit routing, server layouts, and component libraries.', isPrivate: false }
    ];

    const unsplashImages = [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format&fit=crop&q=60'
    ];

    // Generate Communities c11 to c35
    const communitiesToCreate = [...baseCommunities];
    for (let i = 11; i <= 35; i++) {
      const topicIndex = (i - 11) % topics.length;
      const topic = topics[topicIndex];
      const imageIndex = (i - 11) % unsplashImages.length;
      const members = 150 + ((i * 37) % 850);

      communitiesToCreate.push({
        idKey: `c${i}`,
        name: `${topic.name} [#${i}]`,
        description: topic.desc,
        members,
        isPrivate: topic.isPrivate,
        image: unsplashImages[imageIndex],
      });
    }

    // Insert communities into Database and store their DB ObjectId maps
    const communityDbMap = {};
    for (const comm of communitiesToCreate) {
      const created = await Community.create({
        name: comm.name,
        description: comm.description,
        members: comm.members,
        isPrivate: comm.isPrivate,
        image: comm.image,
        joinedUsers: [defaultUser._id] // Default user joins all by default for dummy flow
      });
      communityDbMap[comm.idKey] = created;
    }

    console.log('Communities seeded successfully.');

    // 5. Post Content Templates
    const contentTemplates = [
      {
        title: 'Best practices in production',
        content: "When building for enterprise clients, the most important aspect is error-boundary handling. Make sure you wrap screen segments so that a single failure doesn't crash the entire screen layout. Let me know what you think!",
      },
      {
        title: 'How we optimized render performance by 40%',
        content: 'We recently replaced standard ScrollView lists with FlashList and implemented React.memo on items. Adding custom keyExtractors and estimatedItemSize resulted in an immediate reduction in frame drops.',
      },
      {
        title: 'Offline-First architecture patterns',
        content: 'For an app that remains useful in low connectivity, write data to local secure databases like MMKV, fetch query arrays, and sync pending updates to a local queue. Highly recommend standardizing the API envelope.',
      },
      {
        title: 'Discussion: Designing flexible component systems',
        content: "Should we rely on strict predefined spacing structures or let components accept flexible margins? Share your team's configuration guidelines!",
      }
    ];

    // Seed Posts (3 posts per community)
    let postCount = 0;
    for (let cId = 1; cId <= 35; cId++) {
      const idKey = `c${cId}`;
      const dbCommunity = communityDbMap[idKey];

      for (let pIdx = 1; pIdx <= 3; pIdx++) {
        const globalIndex = cId * 3 + pIdx;
        const author = createdAuthors[globalIndex % createdAuthors.length];
        const template = contentTemplates[globalIndex % contentTemplates.length];
        
        await Post.create({
          title: `${template.title} in ${dbCommunity.name}`,
          content: template.content,
          communityId: dbCommunity._id,
          authorId: author._id,
          authorName: author.name,
        });
        postCount++;
      }
    }

    console.log(`Posts seeded successfully. Seeding complete! Total: ${postCount} posts.`);
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
    });
}

module.exports = seedData;
