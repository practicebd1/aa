import { Course, Section, Lesson, PlaylistRecord, AdminUser, PlatformSettings } from '../src/types';

export const INITIAL_SETTINGS: PlatformSettings = {
  siteName: 'SkillStream',
  tagline: 'Learn Digital Skills. Build Your Future.',
  contactEmail: 'practicebd22@gmail.com',
  contactPhone: '+1 (555) 234-5678',
  youtubeApiKeyConfigured: false,
  allowPublicRegistration: false,
  storageProvider: 'local'
};

export const INITIAL_ADMIN: AdminUser & { passwordHash: string } = {
  id: 'usr_admin_01',
  email: 'ahmadshiblibd@gmail.com',
  name: 'Ahmad Shibli (Admin)',
  role: 'super_admin',
  createdAt: new Date().toISOString(),
  passwordHash: 'aaZZ##00<>'
};

// Batch 19 Videos directly from Playlist PLNgtm77fkk0wewVZUM-4l5jSlYx9ZENzX
const BATCH_19_VIDEOS = [
  { videoId: 'Fp1hTo942wY', title: 'Class 01: Understanding AI & Data-Driven Digital Marketing, 4Ps & Growth Mindset' },
  { videoId: 'qTw1kfIy5KM', title: 'Class 02: Understanding Google Ads Architecture & How Search & Display Ads Work' },
  { videoId: '1UMPC09AwHQ', title: 'Class 03: Google Ads Auction Mechanics & Account Setup Best Practices' },
  { videoId: 'p9WejBBfINA', title: 'Class 04: Google Ads Client Access, MCC Manager Account & Verification' },
  { videoId: 'PFYHJk2aqp8', title: 'Class 05: Google Ads Campaign Objectives & Search Campaign Creation' },
  { videoId: 'o9ZO0NvWd2g', title: 'Class 06: Geographic Location, Language Targeting & Ad Scheduling' },
  { videoId: 'qrVtgGwmXps', title: 'Class 07: High-Intent Keyword Research Using Google Keyword Planner' },
  { videoId: 'eFIoFWbL_JM', title: 'Class 08: Keyword Research with AI & Budget Allocation for Search Ads' },
  { videoId: 'Av5lfxGva2Q', title: 'Class 09: Keyword Match Types (Broad, Phrase, Exact) & Negative Keywords' },
  { videoId: 'dVKVqrYQvAQ', title: 'Class 10: Core Bidding Strategies: Manual CPC, Maximize Clicks & Maximize Conversions' },
  { videoId: 'y-VWezEKLF4', title: 'Class 11: Advanced Bidding: Target CPA, Target ROAS, CPM & Impression Share' },
  { videoId: '-YtlblMJrzY', title: 'Class 12: High-Converting Google Ads Copywriting Using Generative AI' },
  { videoId: 'WGqm5r__aJ0', title: 'Class 13 (Part 1): Dynamic Keyword & Location Insertion for High CTR' },
  { videoId: '27GGyB_EQms', title: 'Class 13 (Part 2): Dynamic Countdown & Time Insertion for Urgent Promotions' },
  { videoId: 'fA2TOHsr6S4', title: 'Class 14: Google Ads Assets: Sitelink, Callout & Structured Snippet Extensions' },
  { videoId: '3JHp1pV00oQ', title: 'Class 15: Automated vs. Manual Ad Extensions & Optimization Checklist' },
  { videoId: '7z1CSb0QE7U', title: 'Class 16: Google Ads Conversion Tracking Architecture & GTM Account Setup' },
  { videoId: 'kgAzyJoB25w', title: 'Class 17: Attribution Models, Click-Through, View-Through & Engaged Conversions' },
  { videoId: 'VNvm_wMaMoo', title: 'Class 18: Implementing Google Ads Conversion Tracking via Google Tag Manager' },
  { videoId: 'NdLTQYwbPh4', title: 'Class 19: E-commerce Purchase & Revenue Conversion Tracking with GTM DataLayer' },
  { videoId: 'xMFRMl2UP0o', title: 'Class 20: Google Ads Call Conversion Tracking Setup with GTM' },
  { videoId: 'EIlayG0ux1k', title: 'Class 21: Call Tracking Strategies: Calls from Ads, Click-to-Call & Website Numbers' },
  { videoId: 'U8uP30tcDew', title: 'Class 22: Google Ads Enhanced Conversions via GTM & Dynamic Search Ads (DSA)' },
  { videoId: 'UNSNvAOeZBs', title: 'Class 23: Google Display Network (GDN) Fundamentals & Audience Targeting' },
  { videoId: '27Y7E3-rImY', title: 'Class 24: Responsive Display Ads Campaign Setup & Placement Targeting' },
  { videoId: 'X9GbxMTSvAY', title: 'Class 25: YouTube Video Ads Setup & Creative Video Marketing Strategy' },
  { videoId: 'lJo-lzpvo98', title: 'Class 26: Remarketing Fundamentals: Linking GA4 with Google Ads & Audience Segments' },
  { videoId: 'p-DIBFpcnKQ', title: 'Class 27: Building Custom GA4 Audiences & Google Ads Remarketing Campaigns' },
  { videoId: 'Fu2AL7j4QXw', title: 'Class 28: Performance Max (PMax) & Demand Gen Campaigns Setup & Best Practices' },
  { videoId: 'L-AUYAJjYdU', title: 'Class 29: UTM Parameters & Tracking Templates for Deep GA4 Analysis' },
  { videoId: 'XsxIpkQol7U', title: 'Class 30: Google Ads Complete Account Audit, Optimization Checklist & Client Reporting' }
];

// Batch 20 Videos directly from Playlist PLCpvPpk0dyXs
const BATCH_20_VIDEOS = [
  { videoId: 'Y37e28d4nYQ', title: 'Class 01: Understanding Marketing, 4Ps & AI-Driven vs. Data-Driven Frameworks' },
  { videoId: 'hPvOJz-3pjM', title: 'Class 02: Introduction to Google Ads Platform, Architecture & Account Creation' },
  { videoId: 'YWt5bccs7WE', title: 'Class 03: Billing Setup, Payment Methods & Agency Client Access as a Freelancer' },
  { videoId: 'IrEe7tQwmFk', title: 'Class 04: The Google Ads Ad Auction & Selecting Correct Campaign Objectives' },
  { videoId: 'wWjDPbwtYyM', title: 'Class 05: Google Ads Campaign Structure: Search Network, Scheduling & Geo Targeting' },
  { videoId: 'MxZliU55qjw', title: 'Class 06: Comprehensive Guide to Google Ads Smart & Manual Bidding Strategies' },
  { videoId: 'jYNVQUYVzOE', title: 'Class 07: Competitor & Keyword Research Using Google Keyword Planner' },
  { videoId: '1qRbIkbBYvw', title: 'Class 08: Keyword Match Types Demystified for High Search Intent' },
  { videoId: 'QlNLlel-a5Y', title: 'Class 09: Writing High-Converting Ad Copy, Headlines & Descriptions for Maximum CTR' },
  { videoId: 'dLFvNdotdwg', title: 'Class 10: Google Ads Asset Extensions: Deep Dive into Sitelinks & Callouts' },
  { videoId: 'x_fFzWkx-uI', title: 'Class 11: Call Assets, Structured Snippets & Lead Form Extensions Explained' },
  { videoId: 'wOLUfQ2IE5I', title: 'Class 12: Google Tag Manager (GTM) Essentials for Lead & Purchase Tracking' },
  { videoId: '68d-erlQ53I', title: 'Class 13: Google Ads Conversion Tracking & First-Party Enhanced Conversions' },
  { videoId: 'k9a43SV7Q_c', title: 'Class 14: End-to-End Google Search Ads Setup with AI Optimization' },
  { videoId: '8bqdr3H4BN4', title: 'Class 15: Live PPC Project: Building an Agency Search Campaign from Scratch' },
  { videoId: 'tICwlS9_3BU', title: 'Class 16: Google Display Ads: Visual Assets, Affinity Audiences & Placements' },
  { videoId: 'DOd5RdmF5Kc', title: 'Class 17: High-Impact YouTube Video Ads Strategy & In-Stream Setup' },
  { videoId: 'iQoCZrp0nOw', title: 'Class 18: Strategic Remarketing Campaigns: Re-engaging Website Visitors' },
  { videoId: 'QGg3N1Z4EqA', title: 'Class 19: Performance Max (PMax) Campaigns: Asset Groups, Signals & Budgeting' },
  { videoId: 'qfq129iyHY0', title: 'Class 20: Performance Max Optimization, Search Term Insights & Negative Placements' },
  { videoId: 'LEyD08V1soQ', title: 'Class 21: Real-World Performance Max E-commerce Case Study & Analysis' },
  { videoId: 'VayVtVyy0_g', title: 'Class 22: Client Acquisition Masterclass: Landing High-Ticket Clients Outside Marketplaces' }
];

// 38-Class Course: Digital Marketing & Freelancing Course
const CLASS_38_SECTION_1 = [
  { num: 1, title: 'Orientation & Tools Management', videoId: 'Fp1hTo942wY' },
  { num: 2, title: 'Google Features & Workspace Productivity', videoId: 'qTw1kfIy5KM' },
  { num: 3, title: 'Microsoft Office Application — Microsoft Word', videoId: '1UMPC09AwHQ' },
  { num: 4, title: 'Microsoft Excel for Marketing Data & Calculations', videoId: 'p9WejBBfINA' },
  { num: 5, title: 'Microsoft PowerPoint Presentation Design', videoId: 'PFYHJk2aqp8' },
  { num: 6, title: 'Canva Designing: Social Graphics & Ad Creatives', videoId: 'o9ZO0NvWd2g' },
  { num: 7, title: 'Personal Branding & Professional Portfolio Setup', videoId: 'qrVtgGwmXps' },
  { num: 8, title: 'Facebook Page Optimization & Audience Engagement', videoId: 'eFIoFWbL_JM' },
  { num: 9, title: 'Instagram Marketing & Reels Content Strategy', videoId: 'Av5lfxGva2Q' },
  { num: 10, title: 'Pinterest Marketing & Visual Search Traffic', videoId: 'dVKVqrYQvAQ' },
  { num: 11, title: 'Twitter (X) Marketing & Thought Leadership', videoId: 'y-VWezEKLF4' },
  { num: 12, title: 'LinkedIn Marketing & Professional Network Expansion', videoId: '-YtlblMJrzY' },
  { num: 13, title: 'YouTube Channel Customization & Video SEO Basics', videoId: 'WGqm5r__aJ0' },
  { num: 14, title: 'Video Making by Mobile: Filming & Editing Apps', videoId: '27GGyB_EQms' },
  { num: 15, title: 'AI Animation & Generative Video Tools', videoId: 'fA2TOHsr6S4' },
  { num: 16, title: 'Review Class: Social Media Mastery & Q&A', videoId: '3JHp1pV00oQ' }
];

const CLASS_38_SECTION_2 = [
  { num: 17, title: 'Website Overview, Domain Registration & Hosting Fundamentals', videoId: '7z1CSb0QE7U' },
  { num: 18, title: 'WordPress Customization for Portfolio Websites', videoId: 'kgAzyJoB25w' },
  { num: 19, title: 'WordPress Virtual Assistant Roles & Content Publishing', videoId: 'VNvm_wMaMoo' },
  { num: 20, title: 'Social Media Management & Editorial Calendar Automation', videoId: 'NdLTQYwbPh4' },
  { num: 21, title: 'Facebook Business Manager Setup & Core Ads Research', videoId: 'xMFRMl2UP0o' },
  { num: 22, title: 'Advanced Ads Campaign Setup (ABO, CBO, A/B Testing)', videoId: 'EIlayG0ux1k' },
  { num: 23, title: 'Facebook Data Source: Meta Pixel & Conversions API', videoId: 'U8uP30tcDew' },
  { num: 24, title: 'Instagram Marketing: Organic Growth & Community Scaling', videoId: 'UNSNvAOeZBs' },
  { num: 25, title: 'LinkedIn Lead Generation Strategies & Prospect Outreach', videoId: '27Y7E3-rImY' },
  { num: 26, title: 'B2B Lead Generation Using Advanced Scraping & Verification Tools', videoId: 'X9GbxMTSvAY' },
  { num: 27, title: 'CRM Systems, Email Marketing & Drip Automation', videoId: 'lJo-lzpvo98' },
  { num: 28, title: 'Keyword Research & Search Intent Competitor Analysis', videoId: 'p-DIBFpcnKQ' },
  { num: 29, title: 'On-Site SEO Optimization: Title Tags, Meta, Headings & Content', videoId: 'Fu2AL7j4QXw' },
  { num: 30, title: 'Technical SEO & Full Website Audit Workflow', videoId: 'L-AUYAJjYdU' },
  { num: 31, title: 'High-Authority Backlinks, Outreach & Guest Posting', videoId: 'XsxIpkQol7U' },
  { num: 32, title: 'Local SEO, Google Business Profile & Citations', videoId: 'Y37e28d4nYQ' },
  { num: 33, title: 'Google Search Console Verification, Indexing & Error Fixing', videoId: 'hPvOJz-3pjM' },
  { num: 34, title: 'Freelance Marketplace Introduction & Onboarding Preparation', videoId: 'YWt5bccs7WE' },
  { num: 35, title: 'Fiverr Gig Analysis, Competitor Benchmarking & Creation', videoId: 'IrEe7tQwmFk' },
  { num: 36, title: 'Fiverr Inside Out: Order Management, Reviews & Leveling Up', videoId: 'wWjDPbwtYyM' },
  { num: 37, title: 'Upwork Marketplace: Profile Optimization, Proposals & Connects', videoId: 'MxZliU55qjw' },
  { num: 38, title: 'Marketplace Success Strategy, Contract Negotiations & Conclusion', videoId: 'jYNVQUYVzOE' }
];

export function generateSeedData(): {
  courses: Course[];
  sections: Section[];
  lessons: Lesson[];
  playlists: PlaylistRecord[];
} {
  const courses: Course[] = [];
  const sections: Section[] = [];
  const lessons: Lesson[] = [];
  const playlists: PlaylistRecord[] = [];

  const now = new Date().toISOString();

  // 1. Digital Marketing Course (Published)
  const c1Id = 'course_digital_marketing';
  courses.push({
    id: c1Id,
    slug: 'digital-marketing',
    title: 'Digital Marketing Course',
    shortDescription: 'Comprehensive masterclass covering search, social media, data analytics, and performance advertising.',
    fullDescription: 'Master the complete spectrum of modern digital marketing. Learn how top brands drive qualified traffic, convert visitors into repeat customers, and optimize multichannel campaigns using cutting-edge analytics and automation frameworks.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    category: 'Digital Marketing',
    level: 'All Levels',
    status: 'published',
    instructorName: 'Sarah Jenkins & Marketing Faculty',
    instructorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    courseIntroduction: 'Welcome to the complete Digital Marketing Program. In this course, you will transition from fundamental concepts to enterprise-grade execution.',
    learningOutcomes: [
      'Architect full-funnel digital marketing strategies',
      'Execute high-ROI social media advertising campaigns',
      'Master keyword research, on-page SEO, and technical indexing',
      'Implement conversion tracking with Google Analytics and Tag Manager'
    ],
    featured: true,
    displayOrder: 1,
    createdAt: now,
    updatedAt: now
  });

  // Sections for Course 1
  const c1s1Id = 'sec_dm_01';
  sections.push({
    id: c1s1Id,
    courseId: c1Id,
    title: 'Section 01: Digital Marketing Fundamentals',
    description: 'Foundational principles of digital customer acquisition and market positioning.',
    order: 1,
    status: 'published',
    createdAt: now,
    updatedAt: now
  });
  lessons.push(
    {
      id: 'les_dm_01',
      sectionId: c1s1Id,
      courseId: c1Id,
      title: 'Lesson 01: Introduction to Digital Marketing',
      description: 'Understanding the digital landscape, consumer psychology, and market dynamics.',
      videoType: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=Fp1hTo942wY',
      youtubeVideoId: 'Fp1hTo942wY',
      duration: '45 mins',
      lessonNumber: 1,
      order: 1,
      freePreview: true,
      status: 'published',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'les_dm_02',
      sectionId: c1s1Id,
      courseId: c1Id,
      title: 'Lesson 02: Digital Marketing Channels & Strategy',
      description: 'Evaluating organic vs. paid channels, customer journey mapping, and channel synergy.',
      videoType: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=qTw1kfIy5KM',
      youtubeVideoId: 'qTw1kfIy5KM',
      duration: '52 mins',
      lessonNumber: 2,
      order: 2,
      freePreview: false,
      status: 'published',
      createdAt: now,
      updatedAt: now
    }
  );

  const c1s2Id = 'sec_dm_02';
  sections.push({
    id: c1s2Id,
    courseId: c1Id,
    title: 'Section 02: Social Media Marketing & Brand Building',
    description: 'Practical guides to organic engagement and paid social campaigns.',
    order: 2,
    status: 'published',
    createdAt: now,
    updatedAt: now
  });
  lessons.push(
    {
      id: 'les_dm_03',
      sectionId: c1s2Id,
      courseId: c1Id,
      title: 'Lesson 03: Facebook & Instagram Marketing Setup',
      description: 'Creating high-converting visual creative and targeting targeted demographic segments.',
      videoType: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=1UMPC09AwHQ',
      youtubeVideoId: '1UMPC09AwHQ',
      duration: '58 mins',
      lessonNumber: 3,
      order: 1,
      freePreview: false,
      status: 'published',
      createdAt: now,
      updatedAt: now
    }
  );

  // 2. Batch 19 Course (Published with all 31 videos from playlist PLNgtm77fkk0wewVZUM-4l5jSlYx9ZENzX)
  const c2Id = 'course_batch_19';
  courses.push({
    id: c2Id,
    slug: 'batch-19',
    title: 'Batch 19 Course',
    shortDescription: 'Complete Google Ads, conversion tracking, AI copywriting, and search campaign masterclass series.',
    fullDescription: 'Comprehensive training delivered to Batch 19 students covering end-to-end Google Ads architecture, keyword match types, GTM conversion tracking, Performance Max, Demand Gen, remarketing, and account auditing.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    category: 'Google Ads',
    level: 'Intermediate',
    status: 'published',
    instructorName: 'Lead Google Ads Strategist',
    instructorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    courseIntroduction: 'Direct live recording series from Batch 19. All lessons are arranged in exact sequence from Class 01 to the Final Audit Class.',
    learningOutcomes: [
      'Master Google Ads auction mechanics, bidding strategies, and campaign structures',
      'Conduct AI-assisted keyword research and dynamic ad copy insertion',
      'Implement enterprise conversion tracking, enhanced conversions, and call tracking with GTM',
      'Run Google Display, YouTube Video, and Performance Max campaigns with confidence'
    ],
    featured: true,
    displayOrder: 2,
    createdAt: now,
    updatedAt: now
  });

  const c2s1Id = 'sec_batch_19_all';
  sections.push({
    id: c2s1Id,
    courseId: c2Id,
    title: 'Batch 19 Curriculum: Complete Lecture Series',
    description: '31 comprehensive video lessons imported directly from the official Batch 19 YouTube playlist.',
    order: 1,
    status: 'published',
    createdAt: now,
    updatedAt: now
  });

  BATCH_19_VIDEOS.forEach((v, idx) => {
    lessons.push({
      id: `les_b19_${idx + 1}`,
      sectionId: c2s1Id,
      courseId: c2Id,
      title: v.title,
      description: `In-depth class session covering ${v.title}. Includes practical demonstrations and campaign walkthroughs.`,
      videoType: 'youtube',
      youtubeUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
      youtubeVideoId: v.videoId,
      thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      duration: '60 mins',
      lessonNumber: idx + 1,
      order: idx + 1,
      freePreview: idx === 0,
      status: 'published',
      createdAt: now,
      updatedAt: now
    });
  });

  playlists.push({
    id: 'pl_b19',
    playlistId: 'PLNgtm77fkk0wewVZUM-4l5jSlYx9ZENzX',
    title: 'Batch 19 Course Playlist',
    courseId: c2Id,
    courseTitle: 'Batch 19 Course',
    sectionId: c2s1Id,
    sectionTitle: 'Batch 19 Curriculum: Complete Lecture Series',
    videoCount: BATCH_19_VIDEOS.length,
    importedAt: now,
    lastSyncedAt: now,
    status: 'active',
    youtubeUrl: 'https://youtube.com/playlist?list=PLNgtm77fkk0wewVZUM-4l5jSlYx9ZENzX&si=UPoCc2ZS-7SwIIZj'
  });

  // 3. Batch 20 Course (Published with all 22 videos from playlist PLCpvPpk0dyXs)
  const c3Id = 'course_batch_20';
  courses.push({
    id: c3Id,
    slug: 'batch-20',
    title: 'Batch 20 Course',
    shortDescription: 'Advanced Google Ads masterclass focusing on PPC campaigns, PMax, conversion tracking, and direct client acquisition.',
    fullDescription: 'The complete video series from Batch 20. Learn modern Google Ads practices including Enhanced Conversion Tracking, GTM, Display Ads, YouTube Video Ads, and high-ticket client hunting outside traditional freelance marketplaces.',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    category: 'Google Ads',
    level: 'Advanced',
    status: 'published',
    instructorName: 'Senior PPC Consultant',
    instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    courseIntroduction: 'Batch 20 lecture series covering everything from foundational 4Ps of marketing to client acquisition strategies.',
    learningOutcomes: [
      'Build agency-level Google Search and Display ad campaigns',
      'Optimize Performance Max (PMax) with custom asset groups and audience signals',
      'Track full-funnel conversions using Google Tag Manager',
      'Land high-value digital marketing clients outside crowded marketplaces'
    ],
    featured: true,
    displayOrder: 3,
    createdAt: now,
    updatedAt: now
  });

  const c3s1Id = 'sec_batch_20_all';
  sections.push({
    id: c3s1Id,
    courseId: c3Id,
    title: 'Batch 20 Curriculum: Complete Lecture Series',
    description: '22 masterclass sessions imported directly from the official Batch 20 YouTube playlist.',
    order: 1,
    status: 'published',
    createdAt: now,
    updatedAt: now
  });

  BATCH_20_VIDEOS.forEach((v, idx) => {
    lessons.push({
      id: `les_b20_${idx + 1}`,
      sectionId: c3s1Id,
      courseId: c3Id,
      title: v.title,
      description: `Complete lecture covering practical implementation of ${v.title}.`,
      videoType: 'youtube',
      youtubeUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
      youtubeVideoId: v.videoId,
      thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      duration: '55 mins',
      lessonNumber: idx + 1,
      order: idx + 1,
      freePreview: idx === 0,
      status: 'published',
      createdAt: now,
      updatedAt: now
    });
  });

  playlists.push({
    id: 'pl_b20',
    playlistId: 'PLCpvPpk0dyXs',
    title: 'Batch 20 Course Playlist',
    courseId: c3Id,
    courseTitle: 'Batch 20 Course',
    sectionId: c3s1Id,
    sectionTitle: 'Batch 20 Curriculum: Complete Lecture Series',
    videoCount: BATCH_20_VIDEOS.length,
    importedAt: now,
    lastSyncedAt: now,
    status: 'active',
    youtubeUrl: 'https://youtube.com/playlist?list=PLCpvPpk0dyXs&si=lniPd3Gx1F4eHbwC'
  });

  // 4. Google Ads — Legacy Version (Draft)
  const c4Id = 'course_google_ads_legacy';
  courses.push({
    id: c4Id,
    slug: 'google-ads-legacy',
    title: 'Google Ads — Legacy Version',
    shortDescription: 'Archive edition of traditional Google AdWords strategies and legacy search campaign structures.',
    fullDescription: 'An extensive historical archive and reference course analyzing legacy Google AdWords interfaces, manual bidding strategies, and standard keyword match mechanics prior to automated Smart Bidding updates.',
    thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80',
    category: 'Google Ads',
    level: 'Intermediate',
    status: 'draft',
    instructorName: 'Marketing Archive Team',
    learningOutcomes: [
      'Understand legacy AdWords bidding mechanics',
      'Analyze historical campaign data and bidding models'
    ],
    featured: false,
    displayOrder: 4,
    createdAt: now,
    updatedAt: now
  });

  // 5. Google Ads — Updated Version (Draft)
  const c5Id = 'course_google_ads_updated';
  courses.push({
    id: c5Id,
    slug: 'google-ads-updated',
    title: 'Google Ads — Updated Version',
    shortDescription: 'Modern Google Ads platform guidelines, Smart Bidding, AI-generated assets, and Performance Max.',
    fullDescription: 'The updated standard for Google Ads management. Covers automated campaign management, first-party data integration, privacy-centric measurement, and AI-driven asset generation.',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    category: 'Google Ads',
    level: 'Advanced',
    status: 'draft',
    instructorName: 'Google Certified Professional',
    learningOutcomes: [
      'Leverage AI Max asset generation for responsive ads',
      'Master privacy-compliant measurement and first-party cookies'
    ],
    featured: false,
    displayOrder: 5,
    createdAt: now,
    updatedAt: now
  });

  // 6. SEO Course (Draft)
  const c6Id = 'course_seo';
  courses.push({
    id: c6Id,
    slug: 'seo',
    title: 'SEO Course',
    shortDescription: 'Comprehensive search engine optimization: technical audits, on-page optimization, and authority link building.',
    fullDescription: 'Step-by-step search engine optimization curriculum. Learn how search engines crawl, render, and index web pages, and rank websites consistently in organic search results.',
    thumbnail: 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?auto=format&fit=crop&w=1200&q=80',
    category: 'SEO',
    level: 'All Levels',
    status: 'draft',
    instructorName: 'Technical SEO Specialist',
    learningOutcomes: [
      'Conduct comprehensive technical SEO audits',
      'Execute white-hat backlink building campaigns'
    ],
    featured: false,
    displayOrder: 6,
    createdAt: now,
    updatedAt: now
  });

  // 7. Digital Marketing Basic Course (Draft)
  const c7Id = 'course_digital_marketing_basic';
  courses.push({
    id: c7Id,
    slug: 'digital-marketing-basic',
    title: 'Digital Marketing Basic Course',
    shortDescription: 'A beginner-friendly introduction to digital advertising, branding, and online marketing channels.',
    fullDescription: 'Start your journey into online marketing. This course provides a gentle introduction to social media, email campaigns, search engines, and basic performance metrics.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    category: 'Digital Marketing',
    level: 'Beginner',
    status: 'draft',
    instructorName: 'Junior Academy Instructor',
    learningOutcomes: [
      'Understand core online marketing terminology',
      'Create basic social media graphics and promotional copy'
    ],
    featured: false,
    displayOrder: 7,
    createdAt: now,
    updatedAt: now
  });

  // 8. Google Analytics Course (Draft)
  const c8Id = 'course_google_analytics';
  courses.push({
    id: c8Id,
    slug: 'google-analytics',
    title: 'Google Analytics Course',
    shortDescription: 'Master Google Analytics 4 (GA4): custom event tracking, exploration reports, and attribution modelling.',
    fullDescription: 'Complete guide to GA4 data collection and reporting. Learn event-based data models, custom funnel explorations, BigQuery exporting, and attribution comparison.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    category: 'Analytics',
    level: 'Intermediate',
    status: 'draft',
    instructorName: 'Web Analytics Consultant',
    learningOutcomes: [
      'Configure custom events and parameters in GA4',
      'Build funnel and path exploration reports'
    ],
    featured: false,
    displayOrder: 8,
    createdAt: now,
    updatedAt: now
  });

  // 9. Digital Marketing & Freelancing Course (Published, 38 Classes)
  const c9Id = 'course_dm_freelancing_38';
  courses.push({
    id: c9Id,
    slug: 'digital-marketing-freelancing',
    title: 'Digital Marketing & Freelancing Course',
    shortDescription: 'The 38-class flagship course: digital foundation, social media, advanced SEO, and freelance marketplace mastery.',
    fullDescription: 'The definitive 38-class curriculum designed to take you from foundational productivity tools and social media marketing to advanced Google Ads, technical SEO, and international freelancing on Fiverr and Upwork.',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'Freelancing & Marketing',
    level: 'All Levels',
    status: 'published',
    instructorName: 'Senior Digital Mentor',
    instructorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    courseIntroduction: 'Structured into two extensive sections: 16 Foundation & Social Media classes followed by 22 Advanced Marketing, SEO & Marketplace classes.',
    learningOutcomes: [
      'Master essential design, office productivity, and personal branding tools',
      'Launch professional Facebook, Instagram, LinkedIn, and YouTube campaigns',
      'Execute end-to-end SEO, keyword research, site audits, and Google Search Console indexing',
      'Establish a thriving freelance presence on Fiverr and Upwork with verified gig strategies'
    ],
    featured: true,
    displayOrder: 9,
    createdAt: now,
    updatedAt: now
  });

  // Section 1: Digital Foundation & Social Media (16 Lessons)
  const c9s1Id = 'sec_dm38_01';
  sections.push({
    id: c9s1Id,
    courseId: c9Id,
    title: 'Section 01: Digital Foundation & Social Media',
    description: '16 classes covering digital tools, office productivity, graphic design, and major social media networks.',
    order: 1,
    status: 'published',
    createdAt: now,
    updatedAt: now
  });

  CLASS_38_SECTION_1.forEach((item, idx) => {
    lessons.push({
      id: `les_dm38_s1_${item.num}`,
      sectionId: c9s1Id,
      courseId: c9Id,
      title: `${item.num < 10 ? '0' + item.num : item.num} — ${item.title}`,
      description: `Class ${item.num}: In-depth training on ${item.title}.`,
      videoType: 'youtube',
      youtubeUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
      youtubeVideoId: item.videoId,
      thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
      duration: '45-60 mins',
      lessonNumber: item.num,
      order: idx + 1,
      freePreview: item.num === 1,
      status: 'published',
      createdAt: now,
      updatedAt: now
    });
  });

  // Section 2: Advanced Digital Marketing, SEO & Freelancing (22 Lessons)
  const c9s2Id = 'sec_dm38_02';
  sections.push({
    id: c9s2Id,
    courseId: c9Id,
    title: 'Section 02: Advanced Digital Marketing, SEO & Freelancing',
    description: '22 classes covering web hosting, WordPress, paid ad campaigns, SEO audits, and marketplace freelancing.',
    order: 2,
    status: 'published',
    createdAt: now,
    updatedAt: now
  });

  CLASS_38_SECTION_2.forEach((item, idx) => {
    lessons.push({
      id: `les_dm38_s2_${item.num}`,
      sectionId: c9s2Id,
      courseId: c9Id,
      title: `${item.num} — ${item.title}`,
      description: `Class ${item.num}: In-depth practical session on ${item.title}.`,
      videoType: 'youtube',
      youtubeUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
      youtubeVideoId: item.videoId,
      thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
      duration: '50-65 mins',
      lessonNumber: item.num,
      order: idx + 1,
      freePreview: false,
      status: 'published',
      createdAt: now,
      updatedAt: now
    });
  });

  return { courses, sections, lessons, playlists };
}
