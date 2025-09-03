'use client';

import React from 'react';
import { motion } from 'framer-motion';
import NeuralNetworkBackground from './NeuralNetworkBackground';

interface CtaButton {
  text: string;
  href: string;
  primary?: boolean;
}

interface HeroProps {
  title: string;
  description: string;
  badgeText?: string;
  badgeLabel?: string;
  ctaButtons?: CtaButton[];
  microDetails?: string[];
}

const Hero: React.FC<HeroProps> = ({
  title,
  description,
  badgeText,
  badgeLabel,
  ctaButtons = [],
  microDetails = []
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Neural Network Background */}
      <div className="absolute inset-0 z-0">
        <NeuralNetworkBackground />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Badge */}
        {badgeText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
              {badgeLabel && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-500 text-white rounded-full">
                  {badgeLabel}
                </span>
              )}
              <span className="text-sm text-white/80 font-light tracking-wide">
                {badgeText}
              </span>
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight leading-tight"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl font-light tracking-wide leading-relaxed"
        >
          {description}
        </motion.p>

        {/* CTA Buttons */}
        {ctaButtons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            {ctaButtons.map((button, index) => (
              <a
                key={index}
                href={button.href}
                className={`
                  px-8 py-3 rounded-lg font-medium transition-all duration-300 tracking-wide
                  ${button.primary 
                    ? 'bg-white text-black hover:bg-white/90 hover:scale-105' 
                    : 'border border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                  }
                `}
              >
                {button.text}
              </a>
            ))}
          </motion.div>
        )}

        {/* Micro Details */}
        {microDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6 text-xs text-white/50 font-light tracking-widest uppercase"
          >
            {microDetails.map((detail, index) => (
              <span key={index} className="hover:text-white/70 transition-colors duration-300">
                {detail}
              </span>
            ))}
          </motion.div>
        )}
      </div>

      {/* REMOVIDO: Gradiente de sobreposição que estava causando o problema */}
    </div>
  );
};

export default Hero;