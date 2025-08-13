import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import Image from 'next/image'
import TorrentDownloader from '@/lib/TorrentDownloader'

export function VideoDetailsModal({ isOpen, onClose, video }) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [startDownload, setStartDownload] = useState(false);

  if (!video) return null

  const handleDownload = () => {
    setStartDownload(true);  // Trigger the download
  };

  const handleClose = () => {
    if (onClose) {
        onClose()
    }
    setStartDownload(false);  // Reset the state after download completes
    setTermsAccepted(false)
};

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          { !startDownload ? (
            <>
          <DialogHeader>
            <DialogTitle>{video?.title}</DialogTitle>
            <DialogDescription>{video?.publisher}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Image
                src={`/placeholder.svg?height=200&width=200`}
                alt={video?.title}
                width={200}
                height={200}
                className="col-span-4"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm text-muted-foreground col-span-4">{video?.description}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium">Date Published:</p>
              <p className="text-sm text-muted-foreground col-span-3">{video?.datePublished}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium">Downloads:</p>
              <p className="text-sm text-muted-foreground col-span-3">{video?.downloads}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium">Seeders:</p>
              <p className="text-sm text-muted-foreground col-span-3">{video?.seeders}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium">Leechers:</p>
              <p className="text-sm text-muted-foreground col-span-3">{video?.leechers}</p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={setTermsAccepted}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept terms and conditions
              </label>
            </div>
            <Button
              disabled={!termsAccepted}
              className={`${termsAccepted ? 'bg-black text-white' : 'bg-gray-300 text-gray-500'} hover:bg-black/90`}
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </DialogFooter>
            </>) : (
              <TorrentDownloader torrentData={video} />
            )}
        </DialogContent>
      </Dialog>
  )
}