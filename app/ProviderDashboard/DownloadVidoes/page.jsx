'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronDown, Filter, Download, X, Clock, CheckCircle, Search, Play } from 'lucide-react'
import Image from 'next/image'
import TorrentDownloader from '@/lib/TorrentDownloader'

export default function DownloadVideos({ purchasedLicenses = [] }) {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [currentFilter, setCurrentFilter] = useState('All Videos')
  const [searchTerm, setSearchTerm] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [startDownload, setStartDownload] = useState(false)
  const [downloadingItems, setDownloadingItems] = useState(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [videoStatuses, setVideoStatuses] = useState({}) // Track video statuses separately

  // Filter licenses to only show those available for download or currently downloading
  const availableForDownload = purchasedLicenses.filter(license => 
    license.downloadStatus === 'available' || license.downloadStatus === 'downloading'
  )

  // Convert purchased licenses to video format for compatibility with existing UI
  const videos = availableForDownload.map(license => ({
    id: license.id.toString(),
    title: license.title,
    publisher: license.publisher || 'Licensed Content',
    datePublished: license.purchaseDate,
    downloads: 0, // Not applicable for licensed content
    seeders: license.seedingStats?.peers || 0,
    leechers: 0, // Not applicable
    magnetURI: `magnet:?xt=urn:btih:${license.magnetHash}&dn=${encodeURIComponent(license.title)}&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337`, // Construct proper magnet URI
    downloadStatus: videoStatuses[license.id] || license.downloadStatus, // Use tracked status or fallback
    purchasePrice: license.purchasePrice,
    contentId: license.contentId,
    description: `Licensed content purchased for ${license.purchasePrice} ETH on ${license.purchaseDate}. This content is available for download and distribution across platforms.`,
    // Add torrent data structure expected by TorrentDownloader
    torrentData: {
      magnetURI: `magnet:?xt=urn:btih:${license.magnetHash}&dn=${encodeURIComponent(license.title)}&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337`,
      title: license.title,
      id: license.id.toString()
      }
  }))

  const handleVideoSelect = (video) => {
    setSelectedVideo(video)
    setStartDownload(false)
    setTermsAccepted(false)
    setModalOpen(true)
  }

  const handleDownload = () => {
    if (!selectedVideo || !termsAccepted) return
    
    console.log('Starting download for:', selectedVideo.title)
    
    // Set download started first
    setStartDownload(true)
    
    // Update video status using state instead of direct mutation
    setVideoStatuses(prev => ({
      ...prev,
      [selectedVideo.contentId]: 'downloading'
    }))
    
    setDownloadingItems(prev => new Set([...prev, selectedVideo.id]))
    
    // Don't update selectedVideo immediately to prevent component recreation
    // The status will be updated through videoStatuses and getCurrentVideoStatus
  }

  const handleDownloadComplete = (videoId) => {
    console.log('Download completed for video:', videoId)
    
    setDownloadingItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(videoId)
      return newSet
    })
    
    // Update video status to completed
    const contentId = selectedVideo?.contentId || videoId
    setVideoStatuses(prev => ({
      ...prev,
      [contentId]: 'completed'
    }))
    
    // Update selectedVideo status
    if (selectedVideo && (selectedVideo.id === videoId || selectedVideo.contentId.toString() === videoId)) {
      setSelectedVideo(prev => ({
        ...prev,
        downloadStatus: 'completed'
      }))
    }
    
    // Don't set startDownload to false - keep the component mounted
    // setStartDownload(false) // Remove this line
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedVideo(null)
    setStartDownload(false)
    setTermsAccepted(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-blue-100 text-blue-800"><Download className="w-3 h-3 mr-1" />Ready</Badge>
      case 'downloading':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Downloading</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Complete</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.publisher.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (currentFilter === 'All Videos') return matchesSearch
    if (currentFilter === 'Ready to Download') return matchesSearch && video.downloadStatus === 'available'
    if (currentFilter === 'Downloading') return matchesSearch && video.downloadStatus === 'downloading'
    return matchesSearch
  })

  // Get current video status for display
  const getCurrentVideoStatus = () => {
    if (!selectedVideo) return null
    return videoStatuses[selectedVideo.contentId] || selectedVideo.downloadStatus
  }

  const currentStatus = getCurrentVideoStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Licensed Content Downloads</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                {currentFilter}
                <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCurrentFilter('All Videos')}>
                All Videos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentFilter('Ready to Download')}>
                Ready to Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentFilter('Downloading')}>
                Downloading
              </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg border">
        {filteredVideos.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
                <TableHead>Content</TableHead>
              <TableHead>Publisher</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {filteredVideos.map((video) => (
                <TableRow 
                  key={video.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleVideoSelect(video)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{video.title}</p>
                        <p className="text-xs text-gray-500">Content ID: {video.contentId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{video.publisher}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{video.purchasePrice} ETH</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{video.datePublished}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(video.downloadStatus)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      disabled={video.downloadStatus !== 'available'}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVideoSelect(video)
                      }}
                    >
                      {video.downloadStatus === 'available' ? 'Download' : 
                       video.downloadStatus === 'downloading' ? 'Downloading...' : 'Downloaded'}
                    </Button>
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Download className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Content Available</h3>
            <p className="text-sm">
              {currentFilter === 'All Videos' 
                ? 'Purchase licenses from the Marketplace to download content.'
                : `No content matches the "${currentFilter}" filter.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Download Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{selectedVideo?.title}</DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-6">
              {/* Video Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Content Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Publisher:</span>
                      <span className="font-medium">{selectedVideo.publisher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Price:</span>
                      <span className="font-medium">{selectedVideo.purchasePrice} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium">{selectedVideo.datePublished}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Content ID:</span>
                      <span className="font-medium">{selectedVideo.contentId}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">License Status</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      ✓ You have a valid license for this content
                    </p>
                    <p className="text-xs text-blue-600">
                      You can download and distribute this content on registered platforms
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedVideo.description}
                </p>
              </div>

              {/* Download Section */}
              {currentStatus === 'available' && (
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Download Content</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                        onCheckedChange={setTermsAccepted}
              />
                      <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                        I understand that I have purchased a license for this content and agree to use it in accordance with the licensing terms. I will distribute this content only through legitimate platforms and will register my distributions as required.
              </label>
            </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={!termsAccepted}
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Start P2P Download
            </Button>
          </div>
                </div>
              )}

              {currentStatus === 'downloading' && (
                <div className="border-t pt-6">
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-yellow-800 text-sm mb-2">
                      📥 Download in progress...
                    </p>
                    <p className="text-xs text-yellow-700">
                      Your content is being downloaded via P2P network. This may take a few minutes depending on the number of seeders.
                    </p>
                  </div>
                </div>
              )}

              {currentStatus === 'completed' && (
                <div className="border-t pt-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 text-sm mb-2">
                      ✓ Content downloaded successfully!
                    </p>
                    <p className="text-xs text-green-700">
                      You can now seed this content from the Seed tab to earn P2P rebates, or distribute it on your registered platforms.
                    </p>
                  </div>
                </div>
              )}

              {/* TorrentDownloader component - render when download starts and keep mounted */}
              {startDownload && selectedVideo && (
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">P2P Download Progress</h4>
                  <TorrentDownloader 
                    torrentData={selectedVideo.torrentData}
                    onDownloadComplete={handleDownloadComplete}
                  />
                </div>
          )}
        </div>
      )}
        </DialogContent>
      </Dialog>
    </div>
  )
}