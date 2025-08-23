"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { RotateCcw, ZoomIn, ZoomOut, Crop } from 'lucide-react'

interface ImageCropperProps {
  imageFile: File | null
  onCropComplete: (croppedImage: File) => void
  aspectRatio?: number
  trigger?: React.ReactNode
}

export default function ImageCropper({ 
  imageFile, 
  onCropComplete, 
  aspectRatio = 1,
  trigger 
}: ImageCropperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return
    
    const img = imageRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 400 / aspectRatio

    // Calculate initial scale to fit image in canvas
    const scaleX = canvas.width / img.naturalWidth
    const scaleY = canvas.height / img.naturalHeight
    const initialScale = Math.min(scaleX, scaleY) * 0.8 // Start with 80% to allow some zoom
    
    setScale(initialScale)
    setImageLoaded(true)
    drawImage()
  }, [aspectRatio])

  const drawImage = useCallback(() => {
    if (!imageRef.current || !canvasRef.current || !imageLoaded) return
    
    const img = imageRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context
    ctx.save()

    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2)

    // Apply transformations
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)

    // Draw image
    ctx.drawImage(
      img,
      -img.naturalWidth / 2 + position.x / scale,
      -img.naturalHeight / 2 + position.y / scale
    )

    // Restore context
    ctx.restore()
  }, [scale, rotation, position, imageLoaded])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDragging(true)
    setDragStart({ x: x - position.x, y: y - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setPosition({
      x: x - dragStart.x,
      y: y - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCrop = () => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
        onCropComplete(croppedFile)
        setIsOpen(false)
      }
    }, 'image/jpeg', 0.9)
  }

  const resetTransformations = () => {
    if (!imageRef.current || !canvasRef.current) return
    
    const img = imageRef.current
    const canvas = canvasRef.current
    
    // Calculate initial scale to fit image in canvas
    const scaleX = canvas.width / img.naturalWidth
    const scaleY = canvas.height / img.naturalHeight
    const initialScale = Math.min(scaleX, scaleY) * 0.8
    
    setScale(initialScale)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // Redraw image when transformations change
  useEffect(() => {
    if (imageLoaded) {
      drawImage()
    }
  }, [drawImage, imageLoaded])

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false)
      setPosition({ x: 0, y: 0 })
      setRotation(0)
    }
  }, [isOpen])

  if (!imageFile) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Crop Image</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <DialogDescription>
            Adjust your image to create the perfect profile picture
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Canvas Container */}
          <div 
            ref={containerRef}
            className="relative border rounded-lg overflow-hidden bg-gray-100"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <canvas
              ref={canvasRef}
              className="block mx-auto"
              style={{ maxWidth: '100%', height: 'auto', pointerEvents: 'none' }}
            />
            
            {/* Crop overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div className="absolute inset-4 border-2 border-white border-dashed"></div>
            </div>
          </div>

          {/* Hidden image for reference */}
          <img
            ref={imageRef}
            src={URL.createObjectURL(imageFile)}
            onLoad={handleImageLoad}
            style={{ display: 'none' }}
            alt="Original"
          />

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Zoom</label>
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                <Slider
                  value={[scale]}
                  onValueChange={([value]) => setScale(value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rotation</label>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <Slider
                  value={[rotation]}
                  onValueChange={([value]) => setRotation(value)}
                  min={-180}
                  max={180}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetTransformations}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={!imageLoaded}>
            <Crop className="h-4 w-4 mr-2" />
            Crop & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
