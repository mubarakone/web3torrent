'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Download, 
  Upload, 
  User, 
  LogOut, 
  Home, 
  DollarSign,
  Shield,
  ExternalLink,
  Plus,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  ShoppingCart,
  Settings,
  Bell,
  Menu,
  Network,
  Search
} from 'lucide-react'
import DownloadVideos from './DownloadVidoes/page'
import SeedVideos from './SeedVideos/page'
// Import centralized mock data
import { availableContent, myLicenses, platforms } from '@/lib/mockData'

// Dynamically load ForceGraph2D to prevent SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { ssr: false })

// Navigation items
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
  { id: 'licenses', label: 'My Licenses', icon: Shield },
  { id: 'download', label: 'Download', icon: Download },
  { id: 'seed', label: 'Seed', icon: Upload },
]

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [platformForm, setPlatformForm] = useState({
    platform: '',
    url: '',
    contentId: ''
  })
  const [selectedGraphContent, setSelectedGraphContent] = useState('all')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const stats = {
    totalLicenses: 8,
    totalSpent: 0.34,
    totalEarnings: 0.089,
    activeSeeds: 12
  }

  const handlePurchaseLicense = async (content) => {
    // This would integrate with the smart contract to purchase license
    console.log('Purchasing license for:', content)
    
    // Simulate the purchase process
    const newLicense = {
      id: myLicenses.length + 1,
      contentId: content.id,
      title: content.title,
      publisher: content.publisher,
      magnetHash: content.magnetHash,
      purchasePrice: content.currentPrice,
      purchaseDate: new Date().toISOString().split('T')[0],
      status: "active",
      downloadStatus: "available", // Ready for download
      platforms: [],
      seedingStats: {
        uploaded: "0 GB",
        peers: 0,
        earnings: 0,
        isSeeding: false,
        uploadSpeed: "0 KB/s"
      }
    }
    
    // In a real app, this would be handled by state management or API calls
    // For now, we'll just log the purchase
    console.log('License purchased:', newLicense)
    
    setPurchaseDialogOpen(false)
    setSelectedContent(null)
    
    // Show success message
    alert(`License purchased successfully!
    
Content: ${content.title}
Price: ${content.currentPrice} ETH
${content.pricingModel === 'dynamic' ? `Next price: ~${(content.currentPrice + content.priceIncrement).toFixed(3)} ETH` : ''}

The content is now available in your Download tab.`)
  }

  const handleRegisterPlatform = async () => {
    // This would integrate with the smart contract
    console.log('Registering platform:', platformForm)
    setPlatformDialogOpen(false)
    setPlatformForm({ platform: '', url: '', contentId: '' })
  }

  const handleLogOut = () => {
      router.push('/RegistrationPage')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getDownloadStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-blue-100 text-blue-800">Ready to Download</Badge>
      case 'downloading':
        return <Badge className="bg-yellow-100 text-yellow-800">Downloading...</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Downloaded</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Generate graph data based on selected content type
  const generateGraphData = () => {
    let contentToShow = []
    
    switch (selectedGraphContent) {
      case 'downloaded':
        contentToShow = myLicenses.filter(license => license.downloadStatus === 'completed')
        break
      case 'seeding':
        contentToShow = myLicenses.filter(license => license.seedingStats?.isSeeding === true)
        break
      default:
        contentToShow = myLicenses.filter(license => license.downloadStatus === 'completed')
    }

    const nodes = [
      { id: 'distributor', name: 'You (Distributor)', group: 0, size: 12 }
    ]

    const links = []

    contentToShow.forEach((content, contentIndex) => {
      // Add content node
      const contentNodeId = `content-${content.id}`
      nodes.push({
        id: contentNodeId,
        name: content.title,
        group: 1,
        size: 8,
        type: 'content'
      })

      // Link distributor to content
      links.push({
        source: 'distributor',
        target: contentNodeId,
        value: 2,
        type: content.seedingStats?.isSeeding ? 'seeding' : 'downloaded'
      })

      // Add peer nodes for this content
      const peerCount = content.seedingStats?.peers || 0
      for (let i = 0; i < Math.min(peerCount, 10); i++) { // Limit to 10 peers for visualization
        const peerNodeId = `peer-${content.id}-${i}`
        nodes.push({
          id: peerNodeId,
          name: `Peer ${i + 1}`,
          group: 2,
          size: 4,
          type: 'peer'
        })

        // Link content to peer
        links.push({
          source: contentNodeId,
          target: peerNodeId,
          value: 1,
          type: 'peer-connection'
        })
      }
    })

    return { nodes, links }
  }

  const graphData = generateGraphData()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />
      case 'marketplace':
        return <LicenseMarketplace />
      case 'licenses':
        return <MyLicensesContent />
      case 'download':
        return <DownloadVideos purchasedLicenses={myLicenses} />
      case 'seed':
        return <SeedVideos downloadedContent={myLicenses.filter(license => license.downloadStatus === 'completed')} />
      default:
        return null
    }
  }

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLicenses}</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent} ETH</div>
            <p className="text-xs text-muted-foreground">On content licenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P2P Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEarnings} ETH</div>
            <p className="text-xs text-muted-foreground">From seeding rebates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Seeds</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSeeds}</div>
            <p className="text-xs text-muted-foreground">Currently seeding</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Graph Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5" />
              <CardTitle>P2P Network Visualization</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show:</span>
              <Select value={selectedGraphContent} onValueChange={setSelectedGraphContent}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="downloaded">Downloaded</SelectItem>
                  <SelectItem value="seeding">Seeding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex">
            {/* Graph */}
            <div className="flex-1">
              <div style={{ height: '400px', width: '100%' }}>
                <ForceGraph2D
                  graphData={graphData}
                  nodeAutoColorBy="group"
                  nodeLabel="name"
                  nodeVal="size"
                  linkDirectionalParticles={2}
                  linkDirectionalParticleSpeed={0.006}
                  linkColor={(link) => {
                    switch (link.type) {
                      case 'seeding':
                        return '#10b981' // green for seeding
                      case 'downloaded':
                        return '#3b82f6' // blue for downloaded
                      case 'peer-connection':
                        return '#6b7280' // gray for peer connections
                      default:
                        return '#6b7280'
                    }
                  }}
                  nodeColor={(node) => {
                    switch (node.group) {
                      case 0:
                        return '#059669' // distributor (you)
                      case 1:
                        return '#2563eb' // content
                      case 2:
                        return '#9ca3af' // peers
                      default:
                        return '#6b7280'
                    }
                  }}
                  width={600}
                  height={400}
                />
              </div>
            </div>

            {/* Scrollspy Navigation */}
            <div className="w-64 ml-6">
              <div className="sticky top-0">
                <h4 className="font-medium mb-4">Content Overview</h4>
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {myLicenses.filter(license => {
                      switch (selectedGraphContent) {
                        case 'downloaded':
                          return license.downloadStatus === 'completed'
                        case 'seeding':
                          return license.seedingStats?.isSeeding === true
                        default:
                          return license.downloadStatus === 'completed'
                      }
                    }).map((content) => (
                      <div key={content.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{content.title}</h5>
                          {content.seedingStats?.isSeeding ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Upload className="w-3 h-3 mr-1" />
                              Seeding
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Downloaded
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Peers:</span>
                            <span>{content.seedingStats?.peers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Uploaded:</span>
                            <span>{content.seedingStats?.uploaded || '0 GB'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Earnings:</span>
                            <span className="text-green-600">+{content.seedingStats?.earnings || 0} ETH</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Legend */}
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">Legend</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span>You (Distributor)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span>Content</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span>Peers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-green-500"></div>
                      <span>Seeding</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-blue-500"></div>
                      <span>Downloaded</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myLicenses.slice(0, 3).map((license) => (
                <div key={license.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{license.title}</p>
                    <p className="text-sm text-gray-500">{license.purchasePrice} ETH • {license.purchaseDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(license.status)}
                    <Badge variant="outline">{license.platforms.length} platforms</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seeding Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myLicenses.filter(l => l.downloadStatus === 'completed').map((license) => (
                <div key={license.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{license.title}</span>
                    <span className="text-sm text-green-600">+{license.seedingStats.earnings} ETH</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{license.seedingStats.uploaded} uploaded</span>
                    <span>{license.seedingStats.peers} peers</span>
                  </div>
                  <Progress value={(license.seedingStats.peers / 50) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const LicenseMarketplace = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Marketplace</h2>
        <div className="flex space-x-2">
          <Input 
            placeholder="Search content..." 
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableContent
          .filter(content => 
            content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            content.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
            content.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((content) => (
          <Card key={content.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <p className="text-sm text-gray-500">by {content.publisher}</p>
                </div>
                <Badge 
                  className={
                    content.pricingModel === 'fixed' 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-purple-100 text-purple-800"
                  }
                >
                  {content.pricingModel === 'fixed' ? 'Fixed' : 'Dynamic'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{content.description}</p>
              
              {/* Tags */}
              {content.tags && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {content.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {content.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{content.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Current Price:</span>
                  <span className="font-semibold">{content.currentPrice} ETH</span>
                </div>
                
                {content.pricingModel === 'dynamic' && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Base Price:</span>
                      <span>{content.basePrice} ETH</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Price Growth:</span>
                      <span className="text-green-600">
                        +{((content.currentPrice - content.basePrice) / content.basePrice * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Next Purchase:</span>
                      <span className="text-orange-600">
                        ~{(content.currentPrice + content.priceIncrement).toFixed(3)} ETH
                      </span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Network Fee:</span>
                  <span>{content.networkFee} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bounty Fee:</span>
                  <span>{content.bountyFee} ETH</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Total Cost:</span>
                  <span>{(content.currentPrice + content.networkFee + content.bountyFee).toFixed(4)} ETH</span>
                </div>
              </div>

              {/* Price History for Dynamic Content */}
              {content.pricingModel === 'dynamic' && content.priceHistory && (
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-medium text-gray-700">Price History</div>
                  <div className="h-12 flex items-end space-x-1">
                    {content.priceHistory.slice(-8).map((point, index) => (
                      <div
                        key={index}
                        className="bg-purple-200 flex-1 rounded-t"
                        style={{
                          height: `${(point.price / Math.max(...content.priceHistory.map(p => p.price))) * 100}%`,
                          minHeight: '4px'
                        }}
                        title={`${point.price} ETH (${point.licenses} licenses)`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Last {Math.min(content.priceHistory.length, 8)} price points
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500">{content.totalLicenses} licenses sold</span>
                <span className="text-xs text-gray-500">Published {content.publishDate}</span>
              </div>

              <Button 
                className="w-full" 
                onClick={() => {
                  setSelectedContent(content)
                  setPurchaseDialogOpen(true)
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Purchase License
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Content License</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedContent.title}</h3>
                <p className="text-sm text-gray-500">by {selectedContent.publisher}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>License Price:</span>
                  <span>{selectedContent.currentPrice} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Fee (P2P Rebates):</span>
                  <span>{selectedContent.networkFee} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Bounty Fee (Copyright Protection):</span>
                  <span>{selectedContent.bountyFee} ETH</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{(selectedContent.currentPrice + selectedContent.networkFee + selectedContent.bountyFee).toFixed(4)} ETH</span>
                </div>
              </div>

              {selectedContent.pricingModel === 'dynamic' && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800">Dynamic Pricing Alert</p>
                      <p className="text-orange-700">
                        Price increases with each purchase. Next buyer will pay ~{(selectedContent.currentPrice + selectedContent.priceIncrement).toFixed(3)} ETH.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What you get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Rights to distribute on any platform</li>
                  <li>• Content will appear in your Download tab</li>
                  <li>• P2P seeding rebates</li>
                  <li>• Copyright protection coverage</li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handlePurchaseLicense(selectedContent)}>
                  Confirm Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  const MyLicensesContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Licenses</h2>
        <Button 
          onClick={() => {
            setSelectedLicense(null)
            setPlatformDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Platform
        </Button>
      </div>

      <div className="grid gap-6">
        {myLicenses.map((license) => (
          <Card key={license.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{license.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Purchased for {license.purchasePrice} ETH on {license.purchaseDate}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {getStatusBadge(license.status)}
                  {getDownloadStatusBadge(license.downloadStatus)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform Registrations */}
                <div>
                  <h4 className="font-medium mb-3">Platform Registrations</h4>
                  <div className="space-y-2">
                    {license.platforms.length > 0 ? license.platforms.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{platform.name}</span>
                          {platform.registered ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(platform.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500">No platforms registered yet</p>
                    )}
                  </div>
                </div>

                {/* Seeding Stats */}
                <div>
                  <h4 className="font-medium mb-3">Seeding Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Data Uploaded:</span>
                      <span className="text-sm font-medium">{license.seedingStats.uploaded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Peers Served:</span>
                      <span className="text-sm font-medium">{license.seedingStats.peers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Earnings:</span>
                      <span className="text-sm font-medium text-green-600">
                        +{license.seedingStats.earnings} ETH
                      </span>
                    </div>
                    <Progress value={(license.seedingStats.peers / 50) * 100} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedLicense(license)
                    setPlatformForm({...platformForm, contentId: license.contentId.toString()})
                    setPlatformDialogOpen(true)
                  }}
                >
                  Add Platform
                </Button>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Registration Dialog */}
      <Dialog open={platformDialogOpen} onOpenChange={setPlatformDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Platform Publication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select 
                value={platformForm.platform}
                onValueChange={(value) => setPlatformForm({...platformForm, platform: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.name} value={platform.name}>
                      {platform.icon} {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Content URL</label>
              <Input 
                value={platformForm.url}
                onChange={(e) => setPlatformForm({...platformForm, url: e.target.value})}
                placeholder="https://platform.com/your-content"
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Register your content on platforms to prevent bounty hunters 
                from flagging it as unauthorized. This protects your distribution rights.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setPlatformDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegisterPlatform}>
                Register Platform
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static z-30 bg-white border-r w-64 h-full`}>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Download className="h-8 w-8 text-green-600" />
            <h1 className="text-xl font-bold">Distributor</h1>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeTab === item.id ? 'bg-green-100 text-green-600' : ''
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                  <AvatarImage src="/placeholder-avatar.png" alt="Distributor" />
                  <AvatarFallback>DI</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderTabContent()}
        </main>
                </div>
                
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      </div>
  )
}