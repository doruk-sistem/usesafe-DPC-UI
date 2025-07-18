"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";

import { ProductImage } from "@/lib/types/product";

interface ProductImageGalleryProps {
  images: ProductImage[];
  name: string;
}

export function ProductImageGallery({
  images,
  name,
}: ProductImageGalleryProps) {
  const primaryImage = images.find((img) => img.is_primary) || images[0];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="space-y-8"
    >
      {/* Main Product Image */}
      <div className="aspect-square relative rounded-3xl overflow-hidden bg-gradient-to-br from-background to-muted/30 shadow-2xl group perspective-1000">
        <motion.div
          whileHover={{
            rotateY: 5,
            scale: 1.05,
            boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full h-full"
        >
          <Image
            src={primaryImage.url}
            alt={name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {/* Sparkle Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="absolute top-4 right-4 text-yellow-400"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((image, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="aspect-square relative rounded-xl overflow-hidden bg-white shadow-md cursor-pointer hover:ring-2 ring-primary/50 transition-all duration-200"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-contain p-1"
              sizes="(max-width: 768px) 25vw, 15vw"
              quality={80}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
