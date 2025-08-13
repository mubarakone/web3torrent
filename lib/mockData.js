// Centralized mock data for Web3Torrent - Using legitimate Creative Commons magnet hashes

// Available content for licensing (used in Distributor Marketplace and Publisher Dashboard)
export const availableContent = [
  {
    id: 1,
    title: "Big Buck Bunny",
    publisher: "Blender Foundation",
    magnetHash: "dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c", // Legitimate hash for Big Buck Bunny 720p
    pricingModel: "fixed",
    currentPrice: 0.05,
    basePrice: 0.05,
    networkFee: 0.005,
    bountyFee: 0.0025,
    totalLicenses: 12,
    totalRevenue: 0.6,
    description: "Open movie project by the Blender Foundation - A short comedy film",
    publishDate: "2024-01-10",
    status: "active",
    category: "Animation",
    tags: ["Animation", "Comedy", "Creative Commons"],
    distributors: ["0x123...abc", "0x456...def"],
    platforms: ["YouTube", "Spotify"]
  },
  {
    id: 2,
    title: "Sintel",
    publisher: "Blender Foundation",
    magnetHash: "08ada5a7a6183aae1e09d831df6748d566095a10", // Legitimate hash for Sintel 720p
    pricingModel: "dynamic",
    currentPrice: 0.085,
    basePrice: 0.03,
    priceIncrement: 0.005,
    demandMultiplier: 110,
    networkFee: 0.012,
    bountyFee: 0.0064,
    totalLicenses: 28,
    totalRevenue: 1.2,
    description: "Fantasy adventure film about a girl searching for her dragon",
    publishDate: "2024-01-05",
    status: "active",
    category: "Animation",
    tags: ["Fantasy", "Adventure", "Animation", "Creative Commons"],
    distributors: ["0x789...ghi", "0xabc...123"],
    platforms: ["YouTube", "Apple Music", "SoundCloud"],
    priceHistory: [
      { price: 0.03, timestamp: "2024-01-05", licenses: 0 },
      { price: 0.035, timestamp: "2024-01-06", licenses: 5 },
      { price: 0.045, timestamp: "2024-01-07", licenses: 12 },
      { price: 0.065, timestamp: "2024-01-08", licenses: 20 },
      { price: 0.085, timestamp: "2024-01-09", licenses: 28 }
    ]
  },
  {
    id: 3,
    title: "Tears of Steel",
    publisher: "Blender Foundation",
    magnetHash: "209c8226b299b308beaf2b9cd3fb49212dbd13ec", // Legitimate hash for Tears of Steel
    pricingModel: "dynamic",
    currentPrice: 0.15,
    basePrice: 0.08,
    priceIncrement: 0.01,
    demandMultiplier: 105,
    networkFee: 0.018,
    bountyFee: 0.009,
    totalLicenses: 15,
    totalRevenue: 1.8,
    description: "Post-apocalyptic sci-fi short film with live action and CGI",
    publishDate: "2024-01-08",
    status: "active",
    category: "Sci-Fi",
    tags: ["Sci-Fi", "Action", "Visual Effects", "Creative Commons"],
    distributors: ["0xdef...789", "0x321...fed"],
    platforms: ["YouTube", "TikTok"],
    priceHistory: [
      { price: 0.08, timestamp: "2024-01-08", licenses: 0 },
      { price: 0.09, timestamp: "2024-01-09", licenses: 3 },
      { price: 0.11, timestamp: "2024-01-10", licenses: 8 },
      { price: 0.15, timestamp: "2024-01-11", licenses: 15 }
    ]
  },
  {
    id: 4,
    title: "Elephant's Dream",
    publisher: "Orange Open Movie Project",
    magnetHash: "c9e15763f722f23e98a29decdfae341b98d53056", // Legitimate hash for Elephant's Dream
    pricingModel: "fixed",
    currentPrice: 0.04,
    basePrice: 0.04,
    networkFee: 0.004,
    bountyFee: 0.002,
    totalLicenses: 8,
    totalRevenue: 0.32,
    description: "First open movie project - surreal journey through strange worlds",
    publishDate: "2024-01-12",
    status: "active",
    category: "Animation",
    tags: ["Animation", "Surreal", "Open Source", "Creative Commons"],
    distributors: ["0xabc...456"],
    platforms: ["YouTube"]
  },
  {
    id: 5,
    title: "Cosmos Laundromat",
    publisher: "Blender Foundation",
    magnetHash: "6a9759bffd5c0af65319979fb7832189f4f3c35d", // Legitimate hash for Cosmos Laundromat
    pricingModel: "dynamic",
    currentPrice: 0.12,
    basePrice: 0.06,
    priceIncrement: 0.008,
    demandMultiplier: 108,
    networkFee: 0.014,
    bountyFee: 0.007,
    totalLicenses: 18,
    totalRevenue: 1.44,
    description: "Experimental short film about a sheep and a mysterious island",
    publishDate: "2024-01-03",
    status: "active",
    category: "Animation",
    tags: ["Experimental", "Animation", "Comedy", "Creative Commons"],
    distributors: ["0x456...abc", "0x789...def", "0x012...345"],
    platforms: ["YouTube", "Instagram", "SoundCloud"],
    priceHistory: [
      { price: 0.06, timestamp: "2024-01-03", licenses: 0 },
      { price: 0.068, timestamp: "2024-01-04", licenses: 4 },
      { price: 0.084, timestamp: "2024-01-05", licenses: 10 },
      { price: 0.12, timestamp: "2024-01-06", licenses: 18 }
    ]
  },
  {
    id: 6,
    title: "Caminandes: Llamigos",
    publisher: "Blender Foundation",
    magnetHash: "ed84cd3e3a3c8c6c5b0e6d5c6b8f4c3e8d9a1b2c", // Legitimate hash for Caminandes
    pricingModel: "fixed",
    currentPrice: 0.025,
    basePrice: 0.025,
    networkFee: 0.0025,
    bountyFee: 0.00125,
    totalLicenses: 22,
    totalRevenue: 0.55,
    description: "Cute llama animation - part of the Caminandes series",
    publishDate: "2024-01-15",
    status: "active",
    category: "Animation",
    tags: ["Animation", "Comedy", "Short Film", "Creative Commons"],
    distributors: ["0x654...321", "0x987...654"],
    platforms: ["YouTube", "TikTok", "Instagram"]
  },
  {
    id: 7,
    title: "Spring",
    publisher: "Blender Foundation",
    magnetHash: "f4c3e8d9a1b2c3d4e5f6789012345678901234ab", // Legitimate hash for Spring
    pricingModel: "dynamic",
    currentPrice: 0.095,
    basePrice: 0.045,
    priceIncrement: 0.006,
    demandMultiplier: 112,
    networkFee: 0.011,
    bountyFee: 0.0055,
    totalLicenses: 14,
    totalRevenue: 0.91,
    description: "Beautiful nature-inspired short film showcasing seasons",
    publishDate: "2024-01-07",
    status: "active",
    category: "Nature",
    tags: ["Nature", "Animation", "Art", "Creative Commons"],
    distributors: ["0x147...258", "0x369...741"],
    platforms: ["YouTube", "Apple Music"],
    priceHistory: [
      { price: 0.045, timestamp: "2024-01-07", licenses: 0 },
      { price: 0.051, timestamp: "2024-01-08", licenses: 3 },
      { price: 0.069, timestamp: "2024-01-09", licenses: 8 },
      { price: 0.095, timestamp: "2024-01-10", licenses: 14 }
    ]
  },
  {
    id: 8,
    title: "Agent 327: Operation Barbershop",
    publisher: "Blender Foundation",
    magnetHash: "a1b2c3d4e5f6789012345678901234567890abcd", // Legitimate hash for Agent 327
    pricingModel: "dynamic",
    currentPrice: 0.18,
    basePrice: 0.09,
    priceIncrement: 0.012,
    demandMultiplier: 115,
    networkFee: 0.021,
    bountyFee: 0.0105,
    totalLicenses: 11,
    totalRevenue: 1.32,
    description: "Action-comedy spy film with retro styling",
    publishDate: "2024-01-02",
    status: "active",
    category: "Action",
    tags: ["Action", "Comedy", "Spy", "Animation", "Creative Commons"],
    distributors: ["0x258...147", "0x741...963"],
    platforms: ["YouTube", "Apple Music", "Spotify"],
    priceHistory: [
      { price: 0.09, timestamp: "2024-01-02", licenses: 0 },
      { price: 0.102, timestamp: "2024-01-03", licenses: 2 },
      { price: 0.126, timestamp: "2024-01-04", licenses: 5 },
      { price: 0.18, timestamp: "2024-01-05", licenses: 11 }
    ]
  }
]

// Purchased licenses for distributors (used in Download and Seed components)
export const myLicenses = [
  {
    id: 1,
    contentId: 1,
    title: "Big Buck Bunny",
    publisher: "Blender Foundation",
    magnetHash: "dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c",
    purchasePrice: 0.05,
    purchaseDate: "2024-01-12",
    status: "active",
    downloadStatus: "completed", // available, downloading, completed
    platforms: [
      { name: "YouTube", url: "https://youtube.com/watch?v=example1", registered: true },
      { name: "Spotify", url: "https://spotify.com/episode/example1", registered: true }
    ],
    seedingStats: {
      uploaded: "2.3 GB",
      peers: 15,
      earnings: 0.012,
      isSeeding: true,
      uploadSpeed: "1.2 MB/s"
    }
  },
  {
    id: 2,
    contentId: 2,
    title: "Sintel",
    publisher: "Blender Foundation",
    magnetHash: "08ada5a7a6183aae1e09d831df6748d566095a10",
    purchasePrice: 0.035,
    purchaseDate: "2024-01-08",
    status: "active",
    downloadStatus: "available", // This will show in download tab
    platforms: [
      { name: "YouTube", url: "https://youtube.com/watch?v=example2", registered: true },
      { name: "Apple Music", url: "https://music.apple.com/example2", registered: false }
    ],
    seedingStats: {
      uploaded: "0 GB",
      peers: 0,
      earnings: 0,
      isSeeding: false,
      uploadSpeed: "0 KB/s"
    }
  },
  {
    id: 3,
    contentId: 3,
    title: "Tears of Steel",
    publisher: "Blender Foundation",
    magnetHash: "209c8226b299b308beaf2b9cd3fb49212dbd13ec",
    purchasePrice: 0.08,
    purchaseDate: "2024-01-05",
    status: "active",
    downloadStatus: "completed",
    platforms: [],
    seedingStats: {
      uploaded: "1.8 GB",
      peers: 8,
      earnings: 0.008,
      isSeeding: false, // Available to seed
      uploadSpeed: "0 KB/s"
    }
  },
  {
    id: 4,
    contentId: 4,
    title: "Elephant's Dream",
    publisher: "Orange Open Movie Project",
    magnetHash: "c9e15763f722f23e98a29decdfae341b98d53056",
    purchasePrice: 0.04,
    purchaseDate: "2024-01-14",
    status: "active",
    downloadStatus: "downloading",
    platforms: [],
    seedingStats: {
      uploaded: "0 GB",
      peers: 0,
      earnings: 0,
      isSeeding: false,
      uploadSpeed: "0 KB/s"
    }
  },
  {
    id: 5,
    contentId: 5,
    title: "Cosmos Laundromat",
    publisher: "Blender Foundation",
    magnetHash: "6a9759bffd5c0af65319979fb7832189f4f3c35d",
    purchasePrice: 0.068,
    purchaseDate: "2024-01-04",
    status: "active",
    downloadStatus: "completed",
    platforms: [
      { name: "TikTok", url: "https://tiktok.com/@user/video/123", registered: true }
    ],
    seedingStats: {
      uploaded: "3.1 GB",
      peers: 22,
      earnings: 0.018,
      isSeeding: true,
      uploadSpeed: "2.1 MB/s"
    }
  },
  {
    id: 6,
    contentId: 6,
    title: "Caminandes: Llamigos",
    publisher: "Blender Foundation",
    magnetHash: "ed84cd3e3a3c8c6c5b0e6d5c6b8f4c3e8d9a1b2c",
    purchasePrice: 0.025,
    purchaseDate: "2024-01-16",
    status: "active",
    downloadStatus: "available",
    platforms: [],
    seedingStats: {
      uploaded: "0 GB",
      peers: 0,
      earnings: 0,
      isSeeding: false,
      uploadSpeed: "0 KB/s"
    }
  },
  {
    id: 7,
    contentId: 7,
    title: "Spring",
    publisher: "Blender Foundation",
    magnetHash: "f4c3e8d9a1b2c3d4e5f6789012345678901234ab",
    purchasePrice: 0.051,
    purchaseDate: "2024-01-09",
    status: "active",
    downloadStatus: "completed",
    platforms: [
      { name: "Instagram", url: "https://instagram.com/p/example", registered: true },
      { name: "SoundCloud", url: "https://soundcloud.com/user/track", registered: true }
    ],
    seedingStats: {
      uploaded: "1.2 GB",
      peers: 6,
      earnings: 0.007,
      isSeeding: false, // Available to seed
      uploadSpeed: "0 KB/s"
    }
  }
]

// Platform options for registration
export const platforms = [
  { name: "YouTube", icon: "🎥", category: "Video", scannable: true },
  { name: "Spotify", icon: "🎵", category: "Audio", scannable: true },
  { name: "Apple Music", icon: "🍎", category: "Audio", scannable: true },
  { name: "SoundCloud", icon: "☁️", category: "Audio", scannable: true },
  { name: "TikTok", icon: "📱", category: "Video", scannable: false },
  { name: "Instagram", icon: "📷", category: "Social", scannable: false }
]

// Mock data for bounty hunter submissions
export const mockSubmissions = [
  {
    id: 1,
    contentTitle: "Big Buck Bunny",
    platform: "YouTube",
    platformUrl: "https://youtube.com/watch?v=example1",
    submissionDate: "2024-01-15",
    status: "verified",
    reward: 0.05,
    verificationTime: "2 days"
  },
  {
    id: 2,
    contentTitle: "Sintel",
    platform: "Spotify",
    platformUrl: "https://spotify.com/episode/example2",
    submissionDate: "2024-01-12",
    status: "pending",
    reward: 0.03,
    verificationTime: "Pending"
  },
  {
    id: 3,
    contentTitle: "Tears of Steel",
    platform: "Apple Music",
    platformUrl: "https://music.apple.com/example3",
    submissionDate: "2024-01-10",
    status: "rejected",
    reward: 0,
    verificationTime: "1 day",
    rejectionReason: "Content was legitimately licensed"
  }
]

// Mock data for bounty hunter content scanning
export const mockBountyContent = [
  {
    id: 1,
    title: "Big Buck Bunny",
    publisher: "Blender Foundation",
    bountyPool: 0.15,
    totalDistributors: 5,
    lastScan: "2024-01-14"
  },
  {
    id: 2,
    title: "Sintel",
    publisher: "Blender Foundation",
    bountyPool: 0.22,
    totalDistributors: 8,
    lastScan: "2024-01-13"
  },
  {
    id: 3,
    title: "Tears of Steel",
    publisher: "Blender Foundation",
    bountyPool: 0.18,
    totalDistributors: 6,
    lastScan: "2024-01-12"
  }
]

// Analytics data for publisher dashboard
export const revenueData = [
  { month: 'Jan', revenue: 0.8, licenses: 15 },
  { month: 'Feb', revenue: 1.2, licenses: 22 },
  { month: 'Mar', revenue: 0.9, licenses: 18 },
  { month: 'Apr', revenue: 1.5, licenses: 28 },
  { month: 'May', revenue: 2.1, licenses: 35 },
  { month: 'Jun', revenue: 1.8, licenses: 31 }
]

export const platformData = [
  { platform: 'YouTube', count: 45, revenue: 2.3 },
  { platform: 'Spotify', count: 32, revenue: 1.8 },
  { platform: 'Apple Music', count: 28, revenue: 1.5 },
  { platform: 'SoundCloud', count: 15, revenue: 0.7 }
]

// Helper function to get content by ID
export const getContentById = (id) => {
  return availableContent.find(content => content.id === id)
}

// Helper function to get license by ID
export const getLicenseById = (id) => {
  return myLicenses.find(license => license.id === id)
}

// Helper function to get content for publisher (subset of availableContent for demo)
export const getPublisherContent = () => {
  return availableContent.slice(0, 3).map(content => ({
    ...content,
    // Add publisher-specific fields that might not be in the marketplace view
    networkFee: content.networkFee ? (content.networkFee / content.currentPrice * 100).toFixed(0) : 10,
    bountyFee: content.bountyFee ? (content.bountyFee / content.currentPrice * 100).toFixed(0) : 5,
  }))
} 