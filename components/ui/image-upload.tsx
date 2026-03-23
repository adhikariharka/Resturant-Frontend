"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, Image as ImageIcon, Loader2, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    onRemove?: () => void
    disabled?: boolean
    className?: string
    aspectRatio?: "square" | "video" | "portrait"
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    disabled,
    className,
    aspectRatio = "video"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [showZoom, setShowZoom] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const aspectRatioClasses = {
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-[3/4]"
    }

    const handleFileChange = async (file: File) => {
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB")
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/upload`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error('Upload failed')

            const data = await response.json()
            onChange(data.url)
            toast.success("Image uploaded successfully")
        } catch (error) {
            console.error('Upload error:', error)
            toast.error("Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) handleFileChange(file)
    }, [])

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange("")
        if (onRemove) onRemove()
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div
                onClick={!disabled && !uploading ? handleClick : undefined}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={cn(
                    "relative rounded-xl border-2 border-dashed transition-all overflow-hidden cursor-pointer group",
                    aspectRatioClasses[aspectRatio],
                    isDragging && "border-primary bg-primary/5 scale-[1.02]",
                    !value && "border-border hover:border-primary/50 hover:bg-accent/50",
                    value && "border-transparent",
                    disabled && "opacity-50 cursor-not-allowed",
                    uploading && "cursor-wait"
                )}
            >
                {value ? (
                    <>
                        <img
                            src={value}
                            alt="Upload preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-9 w-9"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowZoom(true)
                                }}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-9 w-9"
                                onClick={handleRemove}
                                disabled={disabled}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                        {uploading ? (
                            <>
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-primary/10 text-primary">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {isDragging ? "Drop image here" : "Click or drag image to upload"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG, WEBP up to 5MB
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileChange(file)
                }}
                className="hidden"
                disabled={disabled || uploading}
            />

            {/* Zoom Modal */}
            {showZoom && value && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setShowZoom(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={value}
                            alt="Zoomed preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-4 right-4"
                            onClick={() => setShowZoom(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
