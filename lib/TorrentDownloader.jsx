'use client'

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Download, AlertCircle } from 'lucide-react';

// Dynamically load ForceGraph2D to prevent SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { ssr: false });

const TorrentDownloader = ({ torrentData, onDownloadComplete }) => {
  const [peers, setPeers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [torrentFile, setTorrentFile] = useState(null);
  const [fileSaved, setFileSaved] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('initializing');
  const [error, setError] = useState(null);
  
  // Use refs to persist client and torrent instances
  const clientRef = useRef(null);
  const torrentRef = useRef(null);

  // Extract magnetURI from torrentData
  const magnetURI = torrentData?.magnetURI || torrentData?.magnetHash;

  useEffect(() => {
    if (!magnetURI) {
      setError('No magnet URI provided');
      setDownloadStatus('error');
      return;
    }

    if (typeof window === 'undefined' || !window.WebTorrent) {
      setError('WebTorrent not available in this browser');
      setDownloadStatus('error');
      return;
    }

    console.log('Starting torrent download for:', torrentData?.title || 'Unknown content');
    
    // Create client if it doesn't exist
    if (!clientRef.current) {
      clientRef.current = new window.WebTorrent();
      console.log('WebTorrent client created');
    }

    const client = clientRef.current;
    setDownloadStatus('downloading');

    // Setup torrent event handlers function
    function setupTorrentHandlers(torrent) {
      // Remove any existing listeners to prevent duplicates
      torrent.removeAllListeners('download');
      torrent.removeAllListeners('done');
      torrent.removeAllListeners('error');

            torrent.on('download', () => {
        const activePeers = torrent.wires.map(wire => ({
          peerId: wire.peerId || `peer-${Math.random().toString(36).substr(2, 9)}`,
                addr: wire.remoteAddress || 'Unknown',
          downloadSpeed: wire.downloadSpeed ? wire.downloadSpeed() : 0,
          uploadSpeed: wire.uploadSpeed ? wire.uploadSpeed() : 0
        }));

        setPeers(activePeers);
        const percentDone = torrent.length > 0 ? (torrent.downloaded / torrent.length) * 100 : 0;
        setProgress(Math.min(percentDone, 100));
            });
      
            torrent.on('done', () => {
        console.log('Download complete!');
        setDownloadStatus('completed');
        
        if (torrent.files && torrent.files.length > 0) {
          const file = torrent.files[0];
                file.getBlob((err, blob) => {
            if (err) {
              console.error('Error getting blob:', err);
              setError('Error processing downloaded file');
              setDownloadStatus('error');
              return;
            }
            
                    const url = URL.createObjectURL(blob);
                    setTorrentFile({
                      url,
                      name: file.name,
              size: file.length
            });
            console.log('File ready for download:', file.name);
          });
        }

        if (onDownloadComplete) {
          onDownloadComplete(torrentData?.id || torrent.infoHash);
        }
      });

      torrent.on('error', (err) => {
        console.error('Torrent error:', err);
        setError(`Download error: ${err.message}`);
        setDownloadStatus('error');
      });

      // Initial progress update
      if (torrent.length > 0) {
        const percentDone = (torrent.downloaded / torrent.length) * 100;
        setProgress(Math.min(percentDone, 100));
        
        // If already complete, trigger completion
        if (percentDone >= 100) {
          console.log('Torrent already complete');
          setDownloadStatus('completed');
          if (onDownloadComplete) {
            onDownloadComplete(torrentData?.id || torrent.infoHash);
          }
        }
      }

      console.log('Torrent handlers configured for:', torrent.name || 'Unknown');
    }

    // Check if torrent is already added
    const existingTorrent = client.get(magnetURI);
    if (existingTorrent) {
      console.log('Using existing torrent:', existingTorrent.name || 'Initializing...');
      torrentRef.current = existingTorrent;
      
      // If torrent is still initializing, wait for it to be ready
      if (!existingTorrent.name || !existingTorrent.ready) {
        console.log('Waiting for existing torrent to initialize...');
        existingTorrent.on('ready', () => {
          console.log('Existing torrent ready:', existingTorrent.name);
          setupTorrentHandlers(existingTorrent);
        });
      } else {
        setupTorrentHandlers(existingTorrent);
      }
      return;
    }

    console.log('Adding torrent:', magnetURI);
    
    client.add(magnetURI, {
      // Add WebTorrent options for better compatibility
      announce: [
        'udp://tracker.openbittorrent.com:80',
        'udp://tracker.opentrackr.org:1337',
        'wss://tracker.btorrent.xyz',
        'wss://tracker.openwebtorrent.com'
      ]
    }, (torrent) => {
      console.log('Torrent added:', torrent.name);
      torrentRef.current = torrent;
      setupTorrentHandlers(torrent);
    });

    // Handle client-level errors
    client.on('error', (err) => {
      console.error('WebTorrent client error:', err);
      setError(`Client error: ${err.message}`);
      setDownloadStatus('error');
    });

    // Cleanup on unmount
        return () => {
      if (torrentRef.current && clientRef.current) {
        console.log('Cleaning up torrent');
        try {
          clientRef.current.remove(torrentRef.current);
        } catch (err) {
          console.warn('Error removing torrent:', err);
        }
      }
    };
  }, [magnetURI]); // Remove other dependencies that cause re-runs

  const handleSaveFile = () => {
    if (torrentFile) {
      const link = document.createElement('a');
      link.href = torrentFile.url;
      link.download = torrentFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setFileSaved(true);
    }
  };

  const getStatusMessage = () => {
    switch (downloadStatus) {
      case 'initializing':
        return 'Initializing download...';
      case 'downloading':
        return `Downloading... ${progress.toFixed(1)}%`;
      case 'completed':
        return 'Download completed successfully!';
      case 'error':
        return `Error: ${error}`;
      default:
        return 'Unknown status';
    }
  };

  const getSecondaryMessage = () => {
    switch (downloadStatus) {
      case 'initializing':
        return 'Connecting to the P2P network...';
      case 'downloading':
        return `Connected to ${peers.length} peer(s)`;
      case 'completed':
        return torrentFile ? `File ready: ${torrentFile.name}` : 'Processing file...';
      case 'error':
        return 'Please try again or contact support';
      default:
        return '';
    }
  };

  const graphData = {
    nodes: [
      { id: 'user', name: 'You', group: 0, size: 12 },
      ...peers.slice(0, 10).map((peer, index) => ({
        id: peer.peerId,
        name: `Peer ${index + 1}`,
        group: 1,
        size: 8,
        addr: peer.addr
      }))
    ],
    links: peers.slice(0, 10).map(peer => ({
      source: 'user',
      target: peer.peerId,
      value: 1
      }))
  };  

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{getStatusMessage()}</h3>
        <p className="text-sm text-gray-600">{getSecondaryMessage()}</p>
      </div>

      {/* Error Display */}
      {downloadStatus === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Download Failed</span>
            </div>
            <p className="text-sm text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      {downloadStatus === 'downloading' && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{progress.toFixed(1)}% complete</span>
            <span>{peers.length} peer(s) connected</span>
          </div>
        </div>
      )}

      {/* P2P Network Visualization */}
      {downloadStatus === 'downloading' && peers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">P2P Network Activity</h4>
            <div className="h-64 w-full">
        <ForceGraph2D
          graphData={graphData}
          nodeAutoColorBy="group"
                nodeLabel="name"
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.01}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = 12/globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                  ctx.fillStyle = node.group === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(34, 197, 94, 0.8)';
                  ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = 'white';
                  ctx.fillText(label, node.x, node.y);
                }}
                width={400}
                height={250}
        />
      </div>
          </CardContent>
        </Card>
      )}

      {/* Download Complete */}
      {downloadStatus === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-800">
                <Check className="h-5 w-5" />
                <span className="font-medium">Download Complete!</span>
      </div>
      {torrentFile && (
                <Button onClick={handleSaveFile} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  {fileSaved ? 'Saved' : 'Save File'}
                </Button>
              )}
            </div>
            {torrentFile && (
              <div className="mt-3 text-sm text-green-700">
                <p><strong>File:</strong> {torrentFile.name}</p>
                <p><strong>Size:</strong> {(torrentFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                <p className="mt-2 text-xs">
                  💡 This content is now available for seeding. You can start earning P2P rebates by sharing it with other users.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TorrentDownloader;
