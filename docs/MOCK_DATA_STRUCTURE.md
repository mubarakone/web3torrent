# Mock Data Structure

This document explains the centralized mock data structure used throughout the Web3Torrent application.

## Overview

All mock data has been centralized in `/lib/mockData.js` to ensure consistency and make maintenance easier. This file contains legitimate Creative Commons magnet hashes from Blender Foundation and other open movie projects.

## Data Structure

### Available Content (`availableContent`)
Contains 8 Creative Commons films with legitimate magnet hashes:
- **Big Buck Bunny** - Fixed pricing, comedy animation
- **Sintel** - Dynamic pricing, fantasy adventure
- **Tears of Steel** - Dynamic pricing, sci-fi action
- **Elephant's Dream** - Fixed pricing, surreal animation
- **Cosmos Laundromat** - Dynamic pricing, experimental comedy
- **Caminandes: Llamigos** - Fixed pricing, cute llama animation
- **Spring** - Dynamic pricing, nature-inspired art
- **Agent 327: Operation Barbershop** - Dynamic pricing, spy action-comedy

Each content item includes:
- Basic info (title, publisher, description, category, tags)
- Legitimate magnet hash for WebTorrent compatibility
- Pricing model (fixed or dynamic) with current/base prices
- Network and bounty fees
- License sales and revenue data
- Price history for dynamic content
- Distribution platforms and distributor addresses

### Purchased Licenses (`myLicenses`)
Contains 7 licenses purchased by distributors, mapped to the content above:
- Download status (available, downloading, completed)
- Platform registrations
- Seeding statistics (uploaded data, peers, earnings, upload speed)
- Purchase details (price, date, status)

### Platform Options (`platforms`)
Available platforms for content distribution:
- YouTube, Spotify, Apple Music, SoundCloud (scannable)
- TikTok, Instagram (not scannable by bounty hunters)

### Bounty Hunter Data
- `mockSubmissions` - Bounty hunter submission history
- `mockBountyContent` - Content available for scanning

### Analytics Data
- `revenueData` - Monthly revenue and license trends
- `platformData` - Platform distribution statistics

## Usage

Import the data you need in your components:

```javascript
import { 
  availableContent, 
  myLicenses, 
  platforms,
  mockSubmissions,
  mockBountyContent,
  revenueData,
  platformData,
  getContentById,
  getLicenseById,
  getPublisherContent
} from '@/lib/mockData'
```

## Helper Functions

- `getContentById(id)` - Find content by ID
- `getLicenseById(id)` - Find license by ID  
- `getPublisherContent()` - Get publisher's content (subset with publisher-specific fields)

## Components Updated

All dashboards now import from the centralized data:
- **ProviderDashboard** - Uses `availableContent`, `myLicenses`, `platforms`
- **PublisherDashboard** - Uses `getPublisherContent()`, `revenueData`, `platformData`
- **BountyHunterDashboard** - Uses `mockSubmissions`, `mockBountyContent`, `platforms`
- **DownloadVideos** - Receives `myLicenses` via props
- **SeedVideos** - Receives filtered `myLicenses` via props

## Benefits

1. **Consistency** - All components use the same data structure
2. **Maintainability** - Single source of truth for all mock data
3. **Legitimate Hashes** - All magnet hashes are from real Creative Commons content
4. **WebTorrent Compatible** - Hashes work with actual torrent clients
5. **Rich Data** - Comprehensive pricing, analytics, and distribution data
6. **Easy Updates** - Change data in one place, reflected everywhere

## Real Magnet Hashes

All magnet hashes in the data are legitimate and correspond to actual Creative Commons content:
- Big Buck Bunny (Blender Foundation)
- Sintel (Blender Foundation) 
- Tears of Steel (Blender Foundation)
- Elephant's Dream (Orange Open Movie Project)
- Cosmos Laundromat (Blender Foundation)
- Caminandes series (Blender Foundation)
- Spring (Blender Foundation)
- Agent 327 (Blender Foundation)

These can be used for actual WebTorrent testing and demonstration purposes. 