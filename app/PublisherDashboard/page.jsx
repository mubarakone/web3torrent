'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Home, 
  Video, 
  BarChart2, 
  Upload, 
  Bell, 
  Settings, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Menu, 
  Users, 
  DollarSign, 
  LogOut,
  Plus,
  TrendingUp,
  Clock,
  Shield,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { BarChart, LineChart } from '@/components/charts'
// Import centralized mock data
import { getPublisherContent, revenueData, platformData } from '@/lib/mockData'

// Mock data for published content - using the centralized data
const mockContent = getPublisherContent()

// Navigation items
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'content', label: 'Content', icon: Video },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'upload', label: 'Upload', icon: Upload },
]

export default function PublisherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const router = useRouter()

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    pricingModel: 'fixed',
    basePrice: '',
    priceIncrement: '',
    demandMultiplier: '100',
    networkFee: '10',
    bountyFee: '5'
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const stats = {
    totalRevenue: 4.2,
    totalContent: 15,
    activeLicenses: 89,
    bountyPool: 0.8
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Auto-populate title from filename
      if (!uploadForm.title) {
        setUploadForm({...uploadForm, title: file.name.replace(/\.[^/.]+$/, "")})
      }
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      // Auto-populate title from filename
      if (!uploadForm.title) {
        setUploadForm({...uploadForm, title: file.name.replace(/\.[^/.]+$/, "")})
      }
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setDragActive(false)
  }

  const handlePublish = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload first')
      return
    }
    
    // This would:
    // 1. Create a torrent from the selected file
    // 2. Generate the magnet hash
    // 3. Upload to IPFS/torrent network
    // 4. Call smart contract with the generated hash and metadata
    console.log('Publishing content:', {
      file: selectedFile,
      metadata: uploadForm
    })
    
    // Reset form after successful upload
    setSelectedFile(null)
    setUploadForm({
      title: '',
      description: '',
      pricingModel: 'fixed',
      basePrice: '',
      priceIncrement: '',
      demandMultiplier: '100',
      networkFee: '10',
      bountyFee: '5'
    })
    
    // Switch back to content tab to see the new content
    setActiveTab('content')
  }

  const handleLogOut = () => {
    router.push('/RegistrationPage')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPricingBadge = (pricingModel) => {
    switch (pricingModel) {
      case 'fixed':
        return <Badge className="bg-blue-100 text-blue-800">Fixed Price</Badge>
      case 'dynamic':
        return <Badge className="bg-purple-100 text-purple-800">Dynamic Price</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />
      case 'content':
        return <ContentManagement />
      case 'analytics':
        return <AnalyticsContent />
      case 'upload':
        return <UploadContent />
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue} ETH</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Content</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLicenses}</div>
            <p className="text-xs text-muted-foreground">+8 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounty Pool</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bountyPool} ETH</div>
            <p className="text-xs text-muted-foreground">Protection fund</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Content Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockContent.slice(0, 3).map((content) => (
                <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{content.title}</p>
                    <p className="text-sm text-gray-500">{content.totalLicenses} licenses • {content.totalRevenue} ETH</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPricingBadge(content.pricingModel)}
                    {content.pricingModel === 'dynamic' && (
                      <div className="text-xs text-green-600">
                        {content.currentPrice > content.basePrice ? '+' : ''}{((content.currentPrice - content.basePrice) / content.basePrice * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
        <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
        </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformData.map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <span className="text-sm">{platform.platform}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{platform.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(platform.count / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const ContentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <Button onClick={() => setActiveTab('upload')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Pricing Model</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Licenses</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContent.map((content) => (
                <TableRow key={content.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{content.title}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        {content.magnetHash.substring(0, 16)}...
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => copyToClipboard(content.magnetHash)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getPricingBadge(content.pricingModel)}
                      {content.pricingModel === 'dynamic' && (
                        <div className="text-xs text-gray-500">
                          Base: {content.basePrice} ETH
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{content.currentPrice} ETH</p>
                      {content.pricingModel === 'dynamic' && content.currentPrice !== content.basePrice && (
                        <p className="text-xs text-green-600">
                          +{((content.currentPrice - content.basePrice) / content.basePrice * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{content.totalLicenses}</TableCell>
                  <TableCell>{content.totalRevenue} ETH</TableCell>
                  <TableCell>{getStatusBadge(content.status)}</TableCell>
                <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                  </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                  </Button>
                    </div>
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const AnalyticsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={revenueData}
              index="month"
              categories={["revenue"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value} ETH`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>License Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={revenueData}
              index="month"
              categories={["licenses"]}
              colors={["green"]}
              valueFormatter={(value) => `${value} licenses`}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Distributions</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Avg. per Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformData.map((platform) => (
                <TableRow key={platform.platform}>
                  <TableCell className="font-medium">{platform.platform}</TableCell>
                  <TableCell>{platform.count}</TableCell>
                  <TableCell>{platform.revenue} ETH</TableCell>
                  <TableCell>{(platform.revenue / platform.count).toFixed(3)} ETH</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const UploadContent = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Publish New Content</h2>
        <p className="text-gray-500">
          Upload your content file and set licensing terms to start earning from distributors
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* File Upload Section */}
            <div>
              <label className="text-sm font-medium mb-2 block">Content File</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : selectedFile 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="audio/*,video/*,application/*"
                />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <p className="font-medium text-green-700">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-lg font-medium">Upload Content File</p>
                    <p className="text-sm text-gray-500">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports audio, video, and document files
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div>
              <label className="text-sm font-medium">Content Title</label>
              <Input 
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                placeholder="Enter a descriptive title for your content"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full p-3 border rounded-md resize-none"
                rows={4}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                placeholder="Describe your content, its target audience, and what makes it valuable..."
              />
            </div>

            {/* Pricing Configuration */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Pricing Model</label>
                <Select 
                  value={uploadForm.pricingModel}
                  onValueChange={(value) => setUploadForm({...uploadForm, pricingModel: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="dynamic">Dynamic Pricing</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadForm.pricingModel === 'fixed' 
                    ? 'Price remains constant for all purchases' 
                    : 'Price increases with demand and popularity'
                  }
                </p>
                </div>

              <div>
                <label className="text-sm font-medium">Base Price (ETH)</label>
                <Input 
                  type="number"
                  step="0.001"
                  value={uploadForm.basePrice}
                  onChange={(e) => setUploadForm({...uploadForm, basePrice: e.target.value})}
                  placeholder="0.05"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {uploadForm.pricingModel === 'fixed' 
                    ? 'Fixed price for all licenses' 
                    : 'Starting price - will increase with each purchase'
                  }
                </p>
              </div>

              {uploadForm.pricingModel === 'dynamic' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Price Increment (ETH)</label>
                    <Input 
                      type="number"
                      step="0.001"
                      value={uploadForm.priceIncrement}
                      onChange={(e) => setUploadForm({...uploadForm, priceIncrement: e.target.value})}
                      placeholder="0.005"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How much the price increases with each license purchase
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Demand Multiplier (%)</label>
                    <Input 
                      type="number"
                      value={uploadForm.demandMultiplier}
                      onChange={(e) => setUploadForm({...uploadForm, demandMultiplier: e.target.value})}
                      placeholder="110"
                      min="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Exponential multiplier for viral content (100 = no multiplier, 110 = 1.1x growth)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Fee Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Network Fee (%)</label>
                <Input 
                  type="number"
                  value={uploadForm.networkFee}
                  onChange={(e) => setUploadForm({...uploadForm, networkFee: e.target.value})}
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage that goes to P2P seeding rebates</p>
                </div>

              <div>
                <label className="text-sm font-medium">Bounty Fee (%)</label>
                <Input 
                  type="number"
                  value={uploadForm.bountyFee}
                  onChange={(e) => setUploadForm({...uploadForm, bountyFee: e.target.value})}
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage that funds copyright protection</p>
              </div>
                </div>

            {/* Dynamic Pricing Info */}
            {uploadForm.pricingModel === 'dynamic' && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Dynamic Pricing Benefits:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Price increases continuously with each purchase</li>
                  <li>• Early buyers get better prices, rewarding discovery</li>
                  <li>• Viral content can achieve exponential price growth</li>
                  <li>• No time limits - content remains available indefinitely</li>
                  <li>• Market-driven pricing reflects true content value</li>
                </ul>
              </div>
            )}

            {/* Publishing Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens when you publish:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your file will be converted to a torrent and uploaded to the P2P network</li>
                <li>• A smart contract will be created with your licensing terms</li>
                <li>• Distributors can purchase licenses to distribute your content</li>
                <li>• You'll earn licensing fees and track all distribution activity</li>
                <li>• Automated copyright protection will monitor unauthorized usage</li>
              </ul>
            </div>

            {/* Publish Button */}
            <Button 
              onClick={handlePublish} 
              className="w-full" 
              size="lg"
              disabled={!selectedFile || !uploadForm.title || !uploadForm.basePrice || (uploadForm.pricingModel === 'dynamic' && !uploadForm.priceIncrement)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Publish Content to Network
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static z-30 bg-white border-r w-64 h-full`}>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Video className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold">Publisher</h1>
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
                    activeTab === item.id ? 'bg-blue-100 text-blue-600' : ''
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
                  <AvatarImage src="/placeholder-avatar.png" alt="Publisher" />
                  <AvatarFallback>PU</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
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