'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  Upload, 
  DollarSign, 
  Home, 
  Shield, 
  TrendingUp, 
  Users, 
  Eye, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Bell,
  Settings,
  LogOut,
  User,
  Menu
} from 'lucide-react'
// Import centralized mock data
import { mockSubmissions, mockBountyContent, platforms } from '@/lib/mockData'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'scan', label: 'Content Scanner', icon: Search },
  { id: 'submissions', label: 'My Submissions', icon: Upload },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
]

export default function BountyHunterDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [scanResults, setScanResults] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const router = useRouter()

  const stats = {
    totalEarnings: 0.23,
    verifiedTakedowns: 12,
    pendingSubmissions: 3,
    successRate: 85
  }

  const handleScan = async (contentId, platform) => {
    setIsScanning(true)
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock scan results
    const mockResults = [
      {
        platform: platform,
        url: `https://${platform.toLowerCase()}.com/unauthorized-content-${contentId}`,
        confidence: 95,
        contentMatch: "Exact match found",
        uploadDate: "2024-01-10"
      }
    ]
    
    setScanResults(mockResults)
    setIsScanning(false)
  }

  const handleSubmitBounty = (result) => {
    // This would integrate with the smart contract
    alert(`Bounty submitted for ${result.platform}: ${result.url}`)
  }

  const handleLogOut = () => {
    router.push('/RegistrationPage')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />
      case 'scan':
        return <ScannerContent />
      case 'submissions':
        return <SubmissionsContent />
      case 'earnings':
        return <EarningsContent />
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
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEarnings} ETH</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Takedowns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedTakedowns}</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <Progress value={stats.successRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSubmissions.slice(0, 3).map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">{submission.contentTitle}</p>
                    <p className="text-sm text-gray-500">{submission.platform} • {submission.submissionDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(submission.status)}
                  {submission.status === 'verified' && (
                    <span className="text-sm font-medium text-green-600">+{submission.reward} ETH</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const ScannerContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Scanner</CardTitle>
          <p className="text-sm text-gray-500">
            Scan platforms for unauthorized content and submit bounty claims
          </p>
        </CardHeader>
        <CardContent>
          {/* Available Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {mockBountyContent.map((content) => (
              <Card key={content.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{content.title}</h3>
                    <Badge variant="outline">{content.bountyPool} ETH Pool</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">by {content.publisher}</p>
                  
                  {/* Platform Scan Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {platforms.filter(p => p.scannable).slice(0, 3).map((platform) => (
                      <Button
                        key={platform.name}
                        variant="outline"
                        size="sm"
                        onClick={() => handleScan(content.id, platform.name)}
                        disabled={isScanning}
                        className="text-xs"
                      >
                        {platform.icon} {platform.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scan Results */}
          {isScanning && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Scanning platforms for unauthorized content...</p>
              </CardContent>
            </Card>
          )}

          {scanResults.length > 0 && !isScanning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  Unauthorized Content Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scanResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{result.platform}</h4>
                          <p className="text-sm text-gray-500">{result.url}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          {result.confidence}% Match
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{result.contentMatch}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Uploaded: {result.uploadDate}
                        </span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSubmitBounty(result)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Submit Bounty
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const SubmissionsContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>My Bounty Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSubmissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.contentTitle}</TableCell>
                <TableCell>{submission.platform}</TableCell>
                <TableCell>{submission.submissionDate}</TableCell>
                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                <TableCell>
                  {submission.reward > 0 ? `${submission.reward} ETH` : '-'}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const EarningsContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Earned</span>
              <span className="font-semibold">{stats.totalEarnings} ETH</span>
            </div>
            <div className="flex justify-between">
              <span>This Month</span>
              <span className="font-semibold">0.08 ETH</span>
            </div>
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="font-semibold">0.05 ETH</span>
            </div>
            <div className="flex justify-between">
              <span>Available to Withdraw</span>
              <span className="font-semibold text-green-600">0.18 ETH</span>
            </div>
          </div>
          <Button className="w-full mt-4">
            Withdraw Earnings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Success Rate</span>
                <span>{stats.successRate}%</span>
              </div>
              <Progress value={stats.successRate} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Average Reward</span>
                <span>0.019 ETH</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Response Time</span>
                <span>1.2 days</span>
              </div>
            </div>
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
            <Shield className="h-8 w-8 text-purple-600" />
            <h1 className="text-xl font-bold">Bounty Hunter</h1>
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
                    activeTab === item.id ? 'bg-purple-100 text-purple-600' : ''
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
            <h1 className="text-2xl font-bold capitalize">{activeTab.replace('_', ' ')}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="/placeholder-avatar.png" alt="Hunter" />
                  <AvatarFallback>BH</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
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