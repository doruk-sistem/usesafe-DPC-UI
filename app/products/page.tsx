"use client";

import { motion } from "framer-motion";
import { 
  Box, 
  QrCode, 
  History, 
  ShieldCheck, 
  Leaf, 
  Globe, 
  Zap 
} from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from "next/link";

import { ProductList } from "@/components/products/product-list";
import { Button } from "@/components/ui/button";
import { EnhancedCard } from "@/components/ui/enhanced-card";

export default function ProductsPage() {
  const t = useTranslations('products');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const featureItems = [
    {
      icon: QrCode,
      title: t('cards.traceability.title'),
      description: t('cards.traceability.description'),
      gradient: "from-blue-500 to-blue-700",
      backgroundIcon: Globe
    },
    {
      icon: History,
      title: t('cards.history.title'),
      description: t('cards.history.description'),
      gradient: "from-green-500 to-green-700",
      backgroundIcon: Leaf
    },
    {
      icon: ShieldCheck,
      title: t('cards.certifications.title'),
      description: t('cards.certifications.description'),
      gradient: "from-purple-500 to-purple-700",
      backgroundIcon: Zap
    }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative overflow-hidden"
    >
      {/* Gradient Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background opacity-50 -z-10" />
      
      <div className="container px-6 md:px-8 mx-auto py-10">
        <motion.div 
          variants={containerVariants}
          className="flex flex-col items-center text-center mb-12 relative"
        >
          {/* Floating Background Icons */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1], 
              scale: [0.5, 0.7, 0.5] 
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-20 -right-20 opacity-10"
          >
            <Box className="h-64 w-64 text-primary" />
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <Box className="h-16 w-16 text-primary mb-6 animate-pulse group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-2 -right-2 h-4 w-4 bg-green-500 rounded-full animate-ping"></div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative"
          >
            {t('title')}
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute bottom-0 left-0 h-1 bg-primary"
            />
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mb-8"
          >
            {t('description')}
          </motion.p>
          
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12"
          >
            {featureItems.map((item, index) => (
              <motion.div 
                key={item.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                {/* Background Icon */}
                <motion.div 
                  className="absolute -top-8 -right-8 opacity-10"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <item.backgroundIcon className="h-32 w-32 text-primary" />
                </motion.div>

                <EnhancedCard 
                  gradient={`bg-gradient-to-br ${item.gradient}`}
                  hoverEffect={true}
                  className="h-full text-white relative overflow-hidden"
                >
                  <div className="flex flex-col items-center p-4 h-full z-10 relative">
                    <item.icon className="h-8 w-8 text-white/80 mb-2 group-hover:rotate-12 transition-transform" />
                    <h3 className="font-semibold mb-1 text-lg">{item.title}</h3>
                    <p className="text-sm text-white/70 text-center">
                      {item.description}
                    </p>
                  </div>
                </EnhancedCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="space-y-4 mb-8 flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-semibold">{t('featured.title')}</h2>
            <p className="text-muted-foreground">
              {t('featured.description')}
            </p>
          </div>
          <Link href="/verify">
            <Button variant="outline" className="group">
              {t('verify')}
              <ShieldCheck className="ml-2 h-4 w-4 group-hover:text-green-500 transition-colors" />
            </Button>
          </Link>
        </motion.div>

        <ProductList />
      </div>
    </motion.div>
  );
}