"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageLightboxProps {
  isOpen: boolean
  onClose: () => void
  src: string
  alt: string
}

export function ImageLightbox({ isOpen, onClose, src, alt }: ImageLightboxProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-screen max-h-screen w-screen h-screen bg-black/95 border-0 p-0 flex items-center justify-center"
        showCloseButton={false}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-[60] text-white hover:bg-white/20 hover:text-white"
          onClick={onClose}
        >
          <X className="h-8 w-8" />
          <span className="sr-only">Close</span>
        </Button>

        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="max-h-screen max-w-screen object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </DialogContent>
    </Dialog>
  )
}
