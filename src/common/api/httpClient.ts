/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosAdapter } from 'axios';
import { secureStorage, storage } from '../storage/mmkv';
import { ENV } from '../config/env';

// Custom Axios Adapter for Mocking Endpoints
const customAdapter: AxiosAdapter = async (config) => {
  const url = config.url || '';

  if (url.endsWith('/auth/login')) {
    const data = JSON.parse(config.data || '{}');
    // Allow any password of at least 6 characters for user ease, or enforce a mock default
    if (data.email && data.password && data.password.length >= 6) {
      return {
        data: {
          user: {
            id: 'usr_1',
            name: 'Samara Simha Reddy',
            email: data.email,
          },
          token: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    } else {
      return {
        data: { message: 'Invalid credentials. Password must be at least 6 characters.' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
      };
    }
  }

  if (url.endsWith('/auth/refresh')) {
    const data = JSON.parse(config.data || '{}');
    if (data.refreshToken && data.refreshToken.startsWith('mock-refresh-token-')) {
      return {
        data: {
          user: {
            id: 'usr_1',
            name: 'Samara Simha Reddy',
            email: 'samarasimhareddy437@gmail.com',
          },
          token: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    } else {
      return {
        data: { message: 'Session expired. Invalid refresh token.' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      };
    }
  }

  const getJoinedCommunities = (): string[] => {
    const data = storage.getString('joined_communities');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  const saveJoinedCommunities = (ids: string[]) => {
    storage.set('joined_communities', JSON.stringify(ids));
  };

  const generateMockCommunities = (): any[] => {
    const base = [
      { id: 'c1', name: 'React Native Specialists', description: 'Deep dives into React Native internals, performance optimization, Reanimated, and native modules.', members: 1420, isPrivate: false, createdAt: '2026-01-15T08:00:00Z', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60' },
      { id: 'c2', name: 'UI/UX Design Pioneers', description: 'Stunning user interface concepts, modern user experience research, typography guidelines, and design systems.', members: 890, isPrivate: false, createdAt: '2026-02-10T10:30:00Z', image: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=500&auto=format&fit=crop&q=60' },
      { id: 'c3', name: 'Tech Startup Ecosystem', description: 'Co-founders matching, early stage venture funding, pitch decks optimization, and scalable startup growth hacks.', members: 3120, isPrivate: false, createdAt: '2025-12-01T12:00:00Z', image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&auto=format&fit=crop&q=60' },
      { id: 'c4', name: 'TypeScript Core & Types', description: 'Strict typing challenges, TS compiler configurations, advanced utility types, and structural type system details.', members: 640, isPrivate: true, createdAt: '2026-03-01T09:15:00Z', image: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60' },
      { id: 'c5', name: 'Next.js & Server Components', description: 'Next.js App Router, React Server Components, server actions, caching, and Vercel edge deployment strategies.', members: 1850, isPrivate: false, createdAt: '2026-01-20T14:45:00Z', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60' },
      { id: 'c6', name: 'Rust Systems Hackers', description: 'Low level systems programming, memory safety guarantees, WebAssembly, actix-web, and embedded systems in Rust.', members: 510, isPrivate: true, createdAt: '2026-04-05T16:20:00Z', image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=60' },
      { id: 'c7', name: 'Figma Component Wizards', description: 'Figma auto-layout, interactive components, variable design tokens, and developer handoff best practices.', members: 920, isPrivate: false, createdAt: '2026-02-18T11:00:00Z', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60' },
      { id: 'c8', name: 'AI & Machine Learning Hub', description: 'Neural networks, prompt engineering, fine-tuning LLMs, PyTorch tutorials, and local model inference architectures.', members: 4200, isPrivate: false, createdAt: '2025-11-15T09:00:00Z', image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=60' },
      { id: 'c9', name: 'Cybersecurity & Penetration', description: 'Ethical hacking, OWASP Top 10 vulnerabilities, zero trust architecture, and network packet analysis scripts.', members: 780, isPrivate: true, createdAt: '2026-03-22T08:30:00Z', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60' },
      { id: 'c10', name: 'GraphQL & Apollo Devs', description: 'GraphQL schema design, Apollo Federation, query caching, resolver optimization, and code-generation tools.', members: 460, isPrivate: false, createdAt: '2026-01-30T17:00:00Z', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60' },
    ];

    const topics = [
      { name: 'Kotlin Developers', desc: 'Modern Android development, coroutines, Ktor backend integration, and Multiplatform UI.', isPrivate: false, tag: 'Kotlin' },
      { name: 'SwiftUI Architects', desc: 'Declarative layout hierarchies, state management with Observable, custom animations, and layout wrappers.', isPrivate: false, tag: 'SwiftUI' },
      { name: 'DevOps & GitOps', desc: 'Kubernetes operators, Terraform provisioning, GitHub Actions pipelines, and Prometheus monitoring.', isPrivate: true, tag: 'DevOps' },
      { name: 'Ethereum Builders', desc: 'Solidity smart contracts, Hardhat compiling, Ethers.js frontend integration, and gas cost optimizations.', isPrivate: false, tag: 'Web3' },
      { name: 'Creative Coding & WebGL', desc: 'Three.js shaders, custom fragment styling, noise animations, and physics engine setups.', isPrivate: false, tag: 'WebGL' },
      { name: 'Golang Microservices', desc: 'High-concurrency networking patterns, gRPC contract routing, sqlx querying, and Docker deployments.', isPrivate: true, tag: 'Go' },
      { name: 'Product Growth Circle', desc: 'A/B testing methodologies, cohort conversion matrices, user retention graphs, and landing page conversions.', isPrivate: false, tag: 'Product' },
      { name: 'Angular Enterprise', desc: 'Strict workspace setups, standalone directives, custom injection tokens, and state stores.', isPrivate: false, tag: 'Angular' },
      { name: 'Flutter App Craftsmen', desc: 'Widget trees rendering optimizations, BloC business logic layouts, package builders, and web builds.', isPrivate: false, tag: 'Flutter' },
      { name: 'Svelte Society', desc: 'Reactive assignments compilation, SvelteKit routing, server layouts, and component libraries.', isPrivate: false, tag: 'Svelte' },
    ];

    const unsplashImages = [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format&fit=crop&q=60',
    ];

    const list = [...base];
    for (let i = 11; i <= 35; i++) {
      const topicIndex = (i - 11) % topics.length;
      const topic = topics[topicIndex];
      const imageIndex = (i - 11) % unsplashImages.length;
      
      const members = 150 + ((i * 37) % 850);
      const dateOffsetDays = i * 4;
      const createdAtDate = new Date(Date.now() - dateOffsetDays * 24 * 60 * 60 * 1000);

      list.push({
        id: `c${i}`,
        name: `${topic.name} [#${i}]`,
        description: topic.desc,
        members,
        isPrivate: topic.isPrivate,
        createdAt: createdAtDate.toISOString(),
        image: unsplashImages[imageIndex],
      });
    }
    return list;
  };

  const generateMockPosts = (): any[] => {
    const posts: any[] = [];
    const authors = [
      { name: 'Alex Johnson', id: 'usr_2' },
      { name: 'Sarah Connor', id: 'usr_3' },
      { name: 'Devon Miller', id: 'usr_4' },
      { name: 'Emily Watson', id: 'usr_5' },
      { name: 'James Carter', id: 'usr_6' },
    ];

    const contentTemplates = [
      { title: 'Best practices in production', content: 'When building for enterprise clients, the most important aspect is error-boundary handling. Make sure you wrap screen segments so that a single failure doesn\'t crash the entire screen layout. Let me know what you think!' },
      { title: 'How we optimized render performance by 40%', content: 'We recently replaced standard ScrollView lists with FlashList and implemented React.memo on items. Adding custom keyExtractors and estimatedItemSize resulted in an immediate reduction in frame drops.' },
      { title: 'Offline-First architecture patterns', content: 'For an app that remains useful in low connectivity, write data to local secure databases like MMKV, fetch query arrays, and sync pending updates to a local queue. Highly recommend standardizing the API envelope.' },
      { title: 'Discussion: Designing flexible component systems', content: 'Should we rely on strict predefined spacing structures or let components accept flexible margins? Share your team\'s configuration guidelines!' },
    ];

    for (let cId = 1; cId <= 35; cId++) {
      const communityId = `c${cId}`;
      for (let pIdx = 1; pIdx <= 3; pIdx++) {
        const globalIndex = cId * 3 + pIdx;
        const author = authors[globalIndex % authors.length];
        const template = contentTemplates[globalIndex % contentTemplates.length];
        const dateOffsetHours = globalIndex * 2;
        const createdAt = new Date(Date.now() - dateOffsetHours * 60 * 60 * 1000).toISOString();

        posts.push({
          id: `p_${communityId}_${pIdx}`,
          title: `${template.title} in Community c${cId}`,
          content: template.content,
          communityId,
          authorId: author.id,
          authorName: author.name,
          createdAt,
        });
      }
    }
    return posts;
  };

  // Mock routes for Communities
  if (url.includes('/communities')) {
    // 1. Join community: POST /communities/:id/join
    if (url.endsWith('/join') && config.method?.toUpperCase() === 'POST') {
      const match = url.match(/\/communities\/([a-zA-Z0-9_-]+)\/join$/);
      if (match) {
        const id = match[1];
        const joined = getJoinedCommunities();
        if (!joined.includes(id)) {
          joined.push(id);
          saveJoinedCommunities(joined);
        }
        const communities = generateMockCommunities();
        const found = communities.find((c: any) => c.id === id);
        if (found) {
          found.isJoined = true;
          found.members += 1;
          return {
            data: found,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        }
      }
      return {
        data: { message: 'Community not found for join' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      };
    }

    // 2. Leave community: POST /communities/:id/leave
    if (url.endsWith('/leave') && config.method?.toUpperCase() === 'POST') {
      const match = url.match(/\/communities\/([a-zA-Z0-9_-]+)\/leave$/);
      if (match) {
        const id = match[1];
        let joined = getJoinedCommunities();
        if (joined.includes(id)) {
          joined = joined.filter((x: string) => x !== id);
          saveJoinedCommunities(joined);
        }
        const communities = generateMockCommunities();
        const found = communities.find((c: any) => c.id === id);
        if (found) {
          found.isJoined = false;
          found.members = Math.max(0, found.members - 1);
          return {
            data: found,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        }
      }
      return {
        data: { message: 'Community not found for leave' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      };
    }

    // 3. Get single community: GET /communities/:id
    const singleMatch = url.match(/\/communities\/([a-zA-Z0-9_-]+)$/);
    if (singleMatch && config.method?.toUpperCase() === 'GET') {
      const id = singleMatch[1];
      const joined = getJoinedCommunities();
      const communities = generateMockCommunities();
      const found = communities.find((c: any) => c.id === id);
      if (found) {
        found.isJoined = joined.includes(id);
        if (found.isJoined) {
          found.members += 1;
        }
        const posts = generateMockPosts();
        found.postsCount = posts.filter((p: any) => p.communityId === id).length;
        return {
          data: found,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }
      return {
        data: { message: 'Community not found' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      };
    }

    // 4. Get communities list: GET /communities
    if (config.method?.toUpperCase() === 'GET') {
      const params = config.params || {};
      const search = (params.search || '').toLowerCase();
      const sort = params.sort || 'name';
      const filter = params.filter || 'all';
      const page = parseInt(params.page || '1', 10);
      const limit = parseInt(params.limit || '10', 10);

      const joined = getJoinedCommunities();
      let list = generateMockCommunities().map((c: any) => {
        const isJoined = joined.includes(c.id);
        return {
          ...c,
          isJoined,
          members: isJoined ? c.members + 1 : c.members,
        };
      });

      if (filter === 'public') {
        list = list.filter((c: any) => !c.isPrivate);
      } else if (filter === 'private') {
        list = list.filter((c: any) => c.isPrivate);
      }

      if (search) {
        list = list.filter(
          (c: any) =>
            c.name.toLowerCase().includes(search) ||
            c.description.toLowerCase().includes(search)
        );
      }

      if (sort === 'name') {
        list.sort((a: any, b: any) => a.name.localeCompare(b.name));
      } else if (sort === 'members') {
        list.sort((a: any, b: any) => b.members - a.members);
      } else if (sort === 'recent') {
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const total = list.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedList = list.slice(startIndex, endIndex);

      return {
        data: {
          data: paginatedList,
          page,
          limit,
          total,
          totalPages,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }
  }

  // Mock routes for Posts
  if (url.includes('/posts')) {
    if (config.method?.toUpperCase() === 'GET') {
      const params = config.params || {};
      const communityId = params.communityId;
      let posts = generateMockPosts();
      if (communityId) {
        posts = posts.filter((p: any) => p.communityId === communityId);
      }
      posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        data: posts,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    if (config.method?.toUpperCase() === 'POST') {
      const body = JSON.parse(config.data || '{}');
      const newPost = {
        id: `p_${Date.now()}`,
        title: body.title || 'Untitled',
        content: body.content || '',
        communityId: body.communityId,
        authorId: 'usr_1',
        authorName: 'Samara Simha Reddy',
        createdAt: new Date().toISOString(),
      };
      return {
        data: newPost,
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
    }
  }

  // Fallback to standard network adapter for non-auth requests
  const defaultAdapter = axios.defaults.adapter;
  if (defaultAdapter) {
    return (defaultAdapter as any)(config);
  }
  throw new Error('Default axios adapter not found');
};

// Queue to hold failed requests while refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const httpClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: customAdapter, // Hook in the mock adapter
});

// Request Interceptor: Inject JWT token from MMKV
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = secureStorage.getString('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('[Request Interceptor Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors & Token Refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Check if the error is due to a network timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn(`[Network Timeout] Request to ${originalRequest?.url} timed out.`);
      return Promise.reject(new Error('Network request timed out. Please try again.'));
    }

    // Check if the error is a 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refreshing, add this request to the queue to be retried later
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = secureStorage.getString('auth_refresh_token');
      if (refreshToken) {
        try {
          console.log('[Token Refresh] Attempting to refresh access token...');
          
          // Request new tokens using standard axios (with mock adapter to make it succeed)
          const response = await axios.post(`${ENV.API_URL}/auth/refresh`, {
            refreshToken,
          }, {
            timeout: ENV.API_TIMEOUT,
            adapter: customAdapter,
          });

          const { token: newAccessToken, refreshToken: newRefreshToken, user } = response.data;

          // Save new credentials
          secureStorage.setString('auth_token', newAccessToken);
          secureStorage.setString('auth_refresh_token', newRefreshToken);

          // Update Redux state dynamically to avoid circular dependencies
          try {
            const { store } = require('../../app/store');
            const { setCredentials } = require('../../features/auth/store/authSlice');
            store.dispatch(setCredentials({ user, token: newAccessToken, refreshToken: newRefreshToken }));
          } catch (reduxError) {
            console.error('[Redux Update Failure during Refresh]', reduxError);
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry the original failed request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return httpClient(originalRequest);
        } catch (refreshError) {
          console.error('[Token Refresh Error] Refresh token is invalid or expired.', refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;

          // Clear credentials and log out
          secureStorage.delete('auth_token');
          secureStorage.delete('auth_refresh_token');
          secureStorage.delete('auth_user');

          try {
            const { store } = require('../../app/store');
            const { clearCredentials } = require('../../features/auth/store/authSlice');
            store.dispatch(clearCredentials());
          } catch (reduxError) {
            console.error('[Redux Reset Failure during Logout]', reduxError);
          }

          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
      } else {
        // No refresh token, perform clean logout
        secureStorage.delete('auth_token');
        secureStorage.delete('auth_refresh_token');
        secureStorage.delete('auth_user');

        try {
          const { store } = require('../../app/store');
          const { clearCredentials } = require('../../features/auth/store/authSlice');
          store.dispatch(clearCredentials());
        } catch (reduxError) {
          console.error('[Redux Reset Failure]', reduxError);
        }
      }
    }

    // Global Error Logger for other status codes
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`[API Error] Status: ${status || 'Network Error'} | Message: ${message}`);

    return Promise.reject(error);
  }
);
