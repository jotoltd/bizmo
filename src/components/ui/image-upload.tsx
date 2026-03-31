"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (formData: FormData) => Promise<{ success?: boolean; error?: string; url?: string }>;
  onRemove: () => Promise<{ success?: boolean; error?: string }>;
  entityId: string;
  entityType: "profile" | "business";
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
}

const sizeClasses = {
  sm: { container: "w-16 h-16", icon: "w-5 h-5" },
  md: { container: "w-24 h-24", icon: "w-6 h-6" },
  lg: { container: "w-32 h-32", icon: "w-8 h-8" },
};

export function ImageUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  entityId,
  entityType,
  size = "md",
  shape = "circle",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append("file", file);
    if (entityType === "profile") {
      formData.append("userId", entityId);
    } else {
      formData.append("businessId", entityId);
    }

    try {
      const result = await onUpload(formData);
      if (result.error) {
        setError(result.error);
        setPreview(currentImageUrl || null);
      } else if (result.url) {
        setPreview(result.url);
      }
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      const result = await onRemove();
      if (result.error) {
        setError(result.error);
      } else {
        setPreview(null);
      }
    } catch {
      setError("Failed to remove image");
    } finally {
      setIsUploading(false);
    }
  };

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
  const sizeClass = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className={`relative ${sizeClass.container} ${shapeClass} overflow-hidden cursor-pointer group`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Image or placeholder */}
        {preview ? (
          <Image
            src={preview}
            alt="Profile"
            fill
            className="object-cover"
            sizes={sizeClass.container}
          />
        ) : (
          <div className={`w-full h-full ${shapeClass} bg-gradient-to-br from-electric/20 to-purple-500/20 flex items-center justify-center border-2 border-dashed border-white/20`}>
            <Camera className={`${sizeClass.icon} text-slate-400`} />
          </div>
        )}

        {/* Overlay */}
        <div className={`absolute inset-0 ${shapeClass} bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDragging ? "opacity-100 bg-electric/30" : ""}`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-white" />
              <span className="text-xs text-white font-medium">
                {isDragging ? "Drop here" : "Upload"}
              </span>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
          className="hidden"
        />
      </motion.div>

      {/* Remove button */}
      <AnimatePresence>
        {preview && !isUploading && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={handleRemove}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <X className="w-3 h-3" />
            Remove
          </motion.button>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-rose-400 text-center max-w-[200px]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
