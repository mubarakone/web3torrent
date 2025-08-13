'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Upload, Play, Pause, FolderOpen, DollarSign, Users, TrendingUp } from 'lucide-react'

export default function SeedVideos({ downloadedContent = [] }) {
  const [selectedSeed, setSelectedSeed] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDownload, setSelectedDownload] = useState(null)
  const [seedingFile, setSeedingFile] = useState(null)

  // Only files that are currently seeding appear in the main seed list
  const currentlySeeding = downloadedContent.filter(content => content.seedingStats?.isSeeding === true)
  const mockSeeds = currentlySeeding.map(content => ({
    id: content.id,
    title: content.title,
    contentId: content.contentId,
    magnetHash: content.magnetHash,
    purchasePrice: content.purchasePrice,
    isSeeding: true,
    uploaded: content.seedingStats?.uploaded || '0 GB',
    peers: content.seedingStats?.peers || 0,
    earnings: content.seedingStats?.earnings || 0,
    uploadSpeed: content.seedingStats?.uploadSpeed || '0 KB/s'
  }))

  // Downloaded but not seeding files appear in "Add New Seed" section
  const notSeedingFiles = downloadedContent.filter(content => 
    content.downloadStatus === 'completed' && content.seedingStats?.isSeeding !== true
  )
  const availableToSeed = notSeedingFiles.map(content => ({
    id: content.id,
    title: content.title,
    contentId: content.contentId,
    magnetHash: content.magnetHash,
    purchasePrice: content.purchasePrice,
    downloadDate: content.purchaseDate
  }))

  const filteredSeeds = mockSeeds.filter(seed => 
    seed.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSeedSelect = (seedId) => {
    setSelectedSeed(seedId)
    setSelectedDownload(null)
    setSeedingFile(null)
  }

  const handleAddNewSeed = () => {
    setSelectedSeed('new')
    setSelectedDownload(null)
    setSeedingFile(null)
  }

  const handleStartSeeding = async (content) => {
    // In a real implementation, this would:
    // 1. Open file picker dialog for user to select the downloaded file
    // 2. Verify the file matches the magnet hash
    // 3. Start seeding with WebTorrent using the file + magnet hash
    // 4. Update the content's seeding status
    
    console.log('Starting seeding for:', content)
    
    // Simulate file selection process
    setSeedingFile(content)
    
    // This would normally integrate with WebTorrent to start seeding
    // For now, we'll just show the UI flow
    alert(`To start seeding "${content.title}":
    
1. Click "Browse Files" to select the downloaded file from your computer
2. The system will verify the file matches the license
3. Start earning P2P rebates by sharing with other users

Note: Make sure you have the complete file downloaded before seeding.`)
  }

  const handleStopSeeding = (seedId) => {
    console.log('Stopping seeding for:', seedId)
    // This would stop the WebTorrent seeding process
  }

  const getSelectedSeedData = () => {
    if (selectedSeed === 'new') return null
    return mockSeeds.find(seed => seed.id === selectedSeed)
  }

  const totalEarnings = mockSeeds.reduce((sum, seed) => sum + seed.earnings, 0)
  const totalUploaded = mockSeeds.reduce((sum, seed) => {
    const uploaded = parseFloat(seed.uploaded.replace(' GB', '')) || 0
    return sum + uploaded
  }, 0)
  const totalPeers = mockSeeds.reduce((sum, seed) => sum + seed.peers, 0)

  return (
    <div className="flex h-screen">
      {/* Left side */}
      <div className="w-1/3 bg-white flex flex-col border-r">
        {/* Stats Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Earnings</p>
              <p className="font-semibold text-green-600">+{totalEarnings.toFixed(3)} ETH</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Uploaded</p>
              <p className="font-semibold">{totalUploaded.toFixed(1)} GB</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Peers</p>
              <p className="font-semibold">{totalPeers}</p>
            </div>
          </div>
        </div>

        {/* Add New Seed Button */}
        <div className="p-4 border-b">
          <Button 
            variant="outline" 
            className="w-full border-2 border-dashed border-blue-500 hover:bg-blue-50 text-blue-600"
            onClick={handleAddNewSeed}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Seed
          </Button>
        </div>

        {/* Currently Seeding Files */}
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 bg-background z-10 p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="search"
                placeholder="Search seeding files..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredSeeds.length > 0 ? filteredSeeds.map((seed) => (
              <div
                key={seed.id}
                className={`p-4 cursor-pointer hover:bg-accent border-b ${selectedSeed === seed.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                onClick={() => handleSeedSelect(seed.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{seed.title}</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <Upload className="w-3 h-3 mr-1" />
                    Seeding
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{seed.uploaded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peers:</span>
                    <span>{seed.peers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Earnings:</span>
                    <span className="text-green-600">+{seed.earnings} ETH</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Active Seeds</h3>
                <p className="text-sm">
                  Start seeding downloaded content to earn P2P rebates.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 p-6 bg-gray-50">
          {selectedSeed === 'new' ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Add New Seed</h2>
              <p className="text-gray-600">
                Select downloaded content to start seeding and earn P2P rebates.
              </p>
            </div>
            
            <div className="grid gap-4">
              {availableToSeed.length > 0 ? availableToSeed.map((download) => (
                <Card
                  key={download.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedDownload === download.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedDownload(download.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <FolderOpen className="w-8 h-8 text-blue-500" />
            <div>
                          <h3 className="font-medium">{download.title}</h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Content ID: {download.contentId}</p>
                            <p>Purchased: {download.downloadDate} for {download.purchasePrice} ETH</p>
                            <p>Hash: {download.magnetHash.substring(0, 16)}...</p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartSeeding(download)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Start Seeding
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">All Downloaded Content is Seeding</h3>
                    <p className="text-sm">
                      All your downloaded content is already being seeded.
                      Purchase more licenses from the Marketplace to expand your seeding library.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {availableToSeed.length > 0 && (
              <Card className="mt-6 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    How P2P Seeding Works
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <h5 className="font-medium mb-2">Start Earning:</h5>
                      <ol className="space-y-1 list-decimal list-inside">
                        <li>Select downloaded content above</li>
                        <li>Click "Start Seeding" to browse for the file</li>
                        <li>Select the file from your local storage</li>
                        <li>Begin sharing with other users</li>
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Earning Rebates:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Earn ETH based on bandwidth contributed</li>
                        <li>More peers = higher earnings</li>
                        <li>Automatic payments from network fees</li>
                        <li>24/7 passive income opportunity</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          ) : selectedSeed ? (
          <div className="max-w-4xl mx-auto">
            {(() => {
              const seedData = getSelectedSeedData()
              if (!seedData) return null
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{seedData.title}</h2>
                      <p className="text-gray-600">Content ID: {seedData.contentId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">
                        <Upload className="w-3 h-3 mr-1" />
                        Actively Seeding
                      </Badge>
                      <Button 
                        variant="outline"
                        onClick={() => handleStopSeeding(seedData.id)}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Seeding
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Upload className="w-4 h-4 text-blue-500" />
                          <h3 className="font-medium text-gray-600">Data Uploaded</h3>
                        </div>
                        <p className="text-2xl font-bold">{seedData.uploaded}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <h3 className="font-medium text-gray-600">Peers Served</h3>
                        </div>
                        <p className="text-2xl font-bold">{seedData.peers}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <h3 className="font-medium text-gray-600">Earnings</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-600">+{seedData.earnings} ETH</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <h3 className="font-medium text-gray-600">Upload Speed</h3>
                        </div>
                        <p className="text-2xl font-bold">{seedData.uploadSpeed}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Seeding Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
            <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Network Contribution</span>
                            <span className="text-sm text-gray-600">{seedData.peers}/50 max peers</span>
                          </div>
                          <Progress value={(seedData.peers / 50) * 100} className="h-2" />
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Uploaded:</span>
                            <span className="font-medium">{seedData.uploaded}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Connections:</span>
                            <span className="font-medium">{seedData.peers} peers</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Upload Rate:</span>
                            <span className="font-medium">{seedData.uploadSpeed}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-green-800">Total Earned</span>
                            <span className="text-lg font-bold text-green-600">+{seedData.earnings} ETH</span>
                          </div>
                          <p className="text-xs text-green-700">
                            From {seedData.uploaded} uploaded to {seedData.peers} unique peers
                          </p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>License Cost:</span>
                            <span className="text-red-600">-{seedData.purchasePrice} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Seeding Earnings:</span>
                            <span className="text-green-600">+{seedData.earnings} ETH</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-medium">
                            <span>Net Position:</span>
                            <span className={seedData.earnings >= seedData.purchasePrice ? 'text-green-600' : 'text-orange-600'}>
                              {seedData.earnings >= seedData.purchasePrice ? '+' : ''}{(seedData.earnings - seedData.purchasePrice).toFixed(4)} ETH
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })()}
            </div>
          ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center max-w-md">
              <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">P2P Seeding Dashboard</h3>
              <p className="text-sm mb-6">
                Select a seeding file from the left panel or add a new one to start earning P2P rebates.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div className="text-left">
                  <p className="font-medium mb-1">Currently Seeding:</p>
                  <p>Files you're actively sharing with the network</p>
                </div>
                <div className="text-left">
                  <p className="font-medium mb-1">Add New Seed:</p>
                  <p>Upload downloaded files to start earning rebates</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}