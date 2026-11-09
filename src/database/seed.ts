// src/database/seed.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { platformCategories, platformStatuses, platforms } from '#database/schema.js'

async function seed() {
    const connectionString =
        process.env.DATABASE_URL ||
        'postgres://postgres:postgrespassword@localhost:5432/onelog_dev'

    const pool = new pg.Pool({ connectionString })
    const db = drizzle(pool)

    console.log('Starting database seeding...')

    // 1. Seed Platform Categories
    console.log('📦 Seeding categories...')
    const insertedCategories = await db
        .insert(platformCategories)
        .values([
            {
                name: 'Social Media',
                slug: 'social-media',
                description: 'Public networks for connecting, posting updates, and media sharing.',
                icon: 'i-lucide-share-2',
                color: '#3B82F6',
            },
            {
                name: 'Developer Tools',
                slug: 'developer-tools',
                description: 'Code hosting, CI/CD, deployment pipelines, and cloud APIs.',
                icon: 'i-lucide-code-2',
                color: '#10B981',
            },
            {
                name: 'Design & Creative',
                slug: 'design-creative',
                description: 'UI/UX prototyping, visual asset creation, and design inspiration.',
                icon: 'i-lucide-palette',
                color: '#F59E0B',
            },
            {
                name: 'Productivity & Workspace',
                slug: 'productivity',
                description: 'Document collaboration, notes, team messaging, and workflows.',
                icon: 'i-lucide-briefcase',
                color: '#8B5CF6',
            },
            {
                name: 'Video & Streaming',
                slug: 'video-streaming',
                description: 'Live broadcasting, video hosting, and content creation platforms.',
                icon: 'i-lucide-video',
                color: '#EF4444',
            },
        ])
        .onConflictDoNothing()
        .returning()

    const categories = insertedCategories.length
        ? insertedCategories
        : await db.select().from(platformCategories)

    const catMap = new Map(categories.map(c => [c.slug, c.id]))

    // 2. Seed Curation-Based Platform Statuses
    console.log('Seeding platform curation statuses...')
    const insertedStatuses = await db
        .insert(platformStatuses)
        .values([
            {
                name: 'Featured',
                slug: 'featured',
                description: 'Highlighted core platform on the primary launchpad showcase.',
                color: '#F59E0B',
            },
            {
                name: 'Trending',
                slug: 'trending',
                description: 'Experiencing rapid community adoption and high daily activity.',
                color: '#EC4899',
            },
            {
                name: 'Beta',
                slug: 'beta',
                description: 'Platform integration is in experimental or preview mode.',
                color: '#8B5CF6',
            },
            {
                name: 'New',
                slug: 'new',
                description: 'Recently added to the OneLog launchpad directory.',
                color: '#10B981',
            },
            {
                name: 'Popular',
                slug: 'popular',
                description: 'Widely used essential platform with high active user base.',
                color: '#3B82F6',
            },
        ])
        .onConflictDoNothing()
        .returning()

    const statuses = insertedStatuses.length
        ? insertedStatuses
        : await db.select().from(platformStatuses)

    const statusMap = new Map(statuses.map(s => [s.slug, s.id]))

    // 3. Seed 20 Platforms with Updated Statuses
    console.log('Seeding 20 initial platforms...')
    const initialPlatforms = [
        {
            name: 'GitHub',
            slug: 'github',
            logo: 'i-simple-icons-github',
            description: 'Development platform for code hosting, version control, and collaboration.',
            url: 'https://github.com',
            color: '#2DBA4E',
            badge: 'Popular',
            monthlyUsers: '100M+',
            isFeatured: true,
            tags: ['Git', 'Developer', 'Open Source'],
            categoryId: catMap.get('developer-tools')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'Google',
            slug: 'google',
            logo: 'i-simple-icons-google',
            description: 'Search, Workspace applications, and identity auth services.',
            url: 'https://google.com',
            color: '#EA4335',
            badge: 'Core',
            monthlyUsers: '4.3B',
            isFeatured: true,
            tags: ['OAuth', 'Search', 'Workspace'],
            categoryId: catMap.get('productivity')!,
            statusId: statusMap.get('featured')!,
        },
        {
            name: 'X (Twitter)',
            slug: 'twitter',
            logo: 'i-simple-icons-x',
            description: 'Real-time social news feed, public discussions, and microblogging.',
            url: 'https://x.com',
            color: '#000000',
            badge: 'Verified',
            monthlyUsers: '550M',
            isFeatured: true,
            tags: ['Social', 'News', 'Microblog'],
            categoryId: catMap.get('social-media')!,
            statusId: statusMap.get('trending')!,
        },
        {
            name: 'Discord',
            slug: 'discord',
            logo: 'i-simple-icons-discord',
            description: 'Voice, video, and text communication platform for communities.',
            url: 'https://discord.com',
            color: '#5865F2',
            badge: 'Community',
            monthlyUsers: '200M',
            isFeatured: true,
            tags: ['Community', 'Chat', 'Voice'],
            categoryId: catMap.get('social-media')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'LinkedIn',
            slug: 'linkedin',
            logo: 'i-simple-icons-linkedin',
            description: 'Professional networking, job hiring, and business content.',
            url: 'https://linkedin.com',
            color: '#0A66C2',
            badge: 'Business',
            monthlyUsers: '310M',
            isFeatured: true,
            tags: ['Jobs', 'Professional', 'Networking'],
            categoryId: catMap.get('social-media')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'YouTube',
            slug: 'youtube',
            logo: 'i-simple-icons-youtube',
            description: 'Global video streaming, content creation, and live broadcasts.',
            url: 'https://youtube.com',
            color: '#FF0000',
            badge: 'Streaming',
            monthlyUsers: '2.5B',
            isFeatured: true,
            tags: ['Video', 'Streaming', 'Creators'],
            categoryId: catMap.get('video-streaming')!,
            statusId: statusMap.get('featured')!,
        },
        {
            name: 'Figma',
            slug: 'figma',
            logo: 'i-simple-icons-figma',
            description: 'Collaborative web-based UI/UX design and prototyping software.',
            url: 'https://figma.com',
            color: '#F24E1E',
            badge: 'Design',
            monthlyUsers: '10M+',
            isFeatured: true,
            tags: ['UI/UX', 'Design', 'Prototyping'],
            categoryId: catMap.get('design-creative')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'Vercel',
            slug: 'vercel',
            logo: 'i-simple-icons-vercel',
            description: 'Frontend cloud framework serverless deployment platform.',
            url: 'https://vercel.com',
            color: '#000000',
            badge: 'Cloud',
            monthlyUsers: '5M+',
            isFeatured: true,
            tags: ['Deployment', 'Next.js', 'Nuxt'],
            categoryId: catMap.get('developer-tools')!,
            statusId: statusMap.get('featured')!,
        },
        {
            name: 'Notion',
            slug: 'notion',
            logo: 'i-simple-icons-notion',
            description: 'All-in-one workspace for notes, docs, task management, and wikis.',
            url: 'https://notion.so',
            color: '#000000',
            badge: 'Workspace',
            monthlyUsers: '30M+',
            isFeatured: true,
            tags: ['Docs', 'Notes', 'Wiki'],
            categoryId: catMap.get('productivity')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'Slack',
            slug: 'slack',
            logo: 'i-simple-icons-slack',
            description: 'Enterprise team messaging, channels, and workplace integrations.',
            url: 'https://slack.com',
            color: '#4A154B',
            badge: 'Enterprise',
            monthlyUsers: '35M',
            isFeatured: true,
            tags: ['Messaging', 'Work', 'Channels'],
            categoryId: catMap.get('productivity')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'Bluesky',
            slug: 'bluesky',
            logo: 'i-simple-icons-bluesky',
            description: 'Decentralized social networking protocol and microblogging client.',
            url: 'https://bsky.app',
            color: '#1185FE',
            badge: 'ATProto',
            monthlyUsers: '25M',
            isFeatured: false,
            tags: ['Decentralized', 'Social', 'ATProto'],
            categoryId: catMap.get('social-media')!,
            statusId: statusMap.get('trending')!,
        },
        {
            name: 'TikTok',
            slug: 'tiktok',
            logo: 'i-simple-icons-tiktok',
            description: 'Short-form video creation and viral video feed algorithm.',
            url: 'https://tiktok.com',
            color: '#000000',
            badge: 'Viral',
            monthlyUsers: '1.5B',
            isFeatured: false,
            tags: ['Shorts', 'Video', 'Viral'],
            categoryId: catMap.get('video-streaming')!,
            statusId: statusMap.get('trending')!,
        },
        {
            name: 'Mastodon',
            slug: 'mastodon',
            logo: 'i-simple-icons-mastodon',
            description: 'Open-source federated social network built on ActivityPub.',
            url: 'https://joinmastodon.org',
            color: '#6364FF',
            badge: 'Federated',
            monthlyUsers: '10M',
            isFeatured: false,
            tags: ['ActivityPub', 'Federated', 'Open Source'],
            categoryId: catMap.get('social-media')!,
            statusId: statusMap.get('beta')!,
        },
        {
            name: 'Reddit',
            slug: 'reddit',
            logo: 'i-simple-icons-reddit',
            description: 'Network of communities for discussions, news, and shared interests.',
            url: 'https://reddit.com',
            color: '#FF4500',
            badge: 'Community',
            monthlyUsers: '850M',
            isFeatured: false,
            tags: ['Forum', 'Communities', 'Upvotes'],
            categoryId: catMap.get('social-media')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'Instagram',
            slug: 'instagram',
            logo: 'i-simple-icons-instagram',
            description: 'Photo and short-form video sharing social media network.',
            url: 'https://instagram.com',
            color: '#E4405F',
            badge: 'Media',
            monthlyUsers: '2B',
            isFeatured: false,
            tags: ['Photos', 'Reels', 'Social'],
            categoryId: catMap.get('social-media')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'Twitch',
            slug: 'twitch',
            logo: 'i-simple-icons-twitch',
            description: 'Live video streaming service focused on gaming and esports.',
            url: 'https://twitch.tv',
            color: '#9146FF',
            badge: 'Live',
            monthlyUsers: '140M',
            isFeatured: false,
            tags: ['Gaming', 'Live', 'Streaming'],
            categoryId: catMap.get('video-streaming')!,
            statusId: statusMap.get('trending')!,
        },
        {
            name: 'Spotify',
            slug: 'spotify',
            logo: 'i-simple-icons-spotify',
            description: 'Digital music, podcast, and audio streaming network.',
            url: 'https://spotify.com',
            color: '#1DB954',
            badge: 'Audio',
            monthlyUsers: '615M',
            isFeatured: false,
            tags: ['Audio', 'Music', 'Podcasts'],
            categoryId: catMap.get('social-media')!,
            statusId: statusMap.get('popular')!,
        },
        {
            name: 'Dribbble',
            slug: 'dribbble',
            logo: 'i-simple-icons-dribbble',
            description: 'Design community showcase for creative professionals.',
            url: 'https://dribbble.com',
            color: '#EA4C89',
            badge: 'Showcase',
            monthlyUsers: '12M',
            isFeatured: false,
            tags: ['Portfolio', 'Design', 'Illustration'],
            categoryId: catMap.get('design-creative')!,
            statusId: statusMap.get('new')!,
        },
        {
            name: 'Medium',
            slug: 'medium',
            logo: 'i-simple-icons-medium',
            description: 'Open publishing platform for long-form writing and technical blogs.',
            url: 'https://medium.com',
            color: '#000000',
            badge: 'Blogs',
            monthlyUsers: '100M',
            isFeatured: false,
            tags: ['Articles', 'Blogging', 'Publishing'],
            categoryId: catMap.get('productivity')!,
            statusId: statusMap.get('new')!,
        },
        {
            name: 'Docker',
            slug: 'docker',
            logo: 'i-simple-icons-docker',
            description: 'Containerization software platform for app packaging and deployment.',
            url: 'https://docker.com',
            color: '#2496ED',
            badge: 'Containers',
            monthlyUsers: '20M',
            isFeatured: false,
            tags: ['Containers', 'DevOps', 'Docker Hub'],
            categoryId: catMap.get('developer-tools')!,
            statusId: statusMap.get('popular')!,
        },
    ]

    await db.insert(platforms).values(initialPlatforms).onConflictDoNothing()

    console.log('Seeding completed successfully!')
    await pool.end()
}

seed().catch(err => {
    console.error('Seeding failed:', err)
    process.exit(1)
})