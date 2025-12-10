'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Helper function to safely get string value from field that might be a translation object
const getStringValue = (field: any, locale: string = 'en'): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    return field[locale] || field.en || field.fr || '';
  }
  return String(field);
};

interface Circuit {
  id: string;
  name: string;
  image: string;
  priceMAD: number;
  location: string;
  productSlug: string;
  description?: string;
  duration?: string;
  highlights?: string[];
}

interface CircuitsCarouselProps {
  circuits: Circuit[];
  showPrice?: boolean;
  locale: string;
}

export function CircuitsCarousel({ circuits, showPrice = true, locale }: CircuitsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [theta, setTheta] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const radius = typeof window !== 'undefined' && window.innerWidth <= 768 ? 300 : 450;
  const totalCards = circuits.length;

  useEffect(() => {
    const anglePerCard = 360 / totalCards;
    const newIndex = Math.round(Math.abs(theta / anglePerCard) % totalCards);
    setCurrentIndex(newIndex >= totalCards ? 0 : newIndex);
  }, [theta, totalCards]);

  const rotateCarousel = (newTheta: number) => {
    setTheta(newTheta);
  };

  const nextCard = () => {
    const anglePerCard = 360 / totalCards;
    rotateCarousel(theta - anglePerCard);
  };

  const prevCard = () => {
    const anglePerCard = 360 / totalCards;
    rotateCarousel(theta + anglePerCard);
  };

  const toggleFlip = (index: number) => {
    if (index === currentIndex) {
      const newFlipped = new Set(flippedCards);
      if (newFlipped.has(index)) {
        newFlipped.delete(index);
      } else {
        newFlipped.add(index);
      }
      setFlippedCards(newFlipped);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diffX = clientX - startX;
    const sensitivity = 0.5;
    const newTheta = theta + diffX * sensitivity;

    if (carouselRef.current) {
      carouselRef.current.style.transform = `rotateY(${newTheta}deg)`;
    }
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diffX = clientX - startX;

    if (Math.abs(diffX) > 20) {
      if (diffX > 0) {
        prevCard();
      } else {
        nextCard();
      }
    } else {
      const anglePerCard = 360 / totalCards;
      const snapAngle = Math.round(theta / anglePerCard) * anglePerCard;
      rotateCarousel(snapAngle);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        nextCard();
      } else if (e.key === 'ArrowRight') {
        prevCard();
      } else if (e.key === 'Enter' || e.key === ' ') {
        toggleFlip(currentIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, theta]);

  return (
    <div className="relative w-full py-12">
      {/* Carousel Container */}
      <div
        className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center"
        style={{ perspective: '1000px' }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
      >
        <div
          ref={carouselRef}
          className="relative transition-transform duration-500 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${theta}deg)`,
            width: `${radius}px`,
            height: `${radius}px`
          }}
        >
          {circuits.map((circuit, index) => {
            const angle = (360 / totalCards) * index;
            const rad = (angle * Math.PI) / 180;
            const isFlipped = flippedCards.has(index);

            return (
              <div
                key={circuit.id}
                className="absolute w-[300px] h-[420px] cursor-pointer"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-150px',
                  marginTop: '-210px',
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onClick={() => toggleFlip(index)}
              >
                {/* Card Inner */}
                <div
                  className="relative w-full h-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {/* Front Face */}
                  <div
                    className="absolute w-full h-full rounded-[20px] overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, rgba(255, 183, 63, 0.15), rgba(112, 207, 241, 0.15))',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 183, 63, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="relative h-[200px] w-full overflow-hidden">
                      <Image
                        src={circuit.image}
                        alt={getStringValue(circuit.name, locale)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="p-6 flex flex-col h-[220px]">
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          {getStringValue(circuit.location, locale)}
                        </span>
                      </div>

                      <h3 className="text-xl font-display font-bold text-white mb-3 line-clamp-2">
                        {getStringValue(circuit.name, locale)}
                      </h3>

                      <div className="flex-grow" />

                      {showPrice && (
                        <div className="mt-4">
                          <div className="text-2xl font-bold text-primary">
                            {circuit.priceMAD === 0 ? 'Contact for pricing' : `${circuit.priceMAD} MAD`}
                          </div>
                          <p className="text-xs text-white/70 mt-1">Click to see details</p>
                        </div>
                      )}

                      {!showPrice && (
                        <p className="text-sm text-white/70 mt-4">
                          Click to see details
                        </p>
                      )}
                    </div>

                    <div
                      className="absolute inset-0 rounded-[20px] pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(255, 183, 63, 0.2), transparent 70%)'
                      }}
                    />
                  </div>

                  {/* Back Face */}
                  <div
                    className="absolute w-full h-full rounded-[20px] overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'linear-gradient(135deg, rgba(112, 207, 241, 0.15), rgba(255, 183, 63, 0.15))',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(112, 207, 241, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="p-6 h-full flex flex-col text-white">
                      <h3 className="text-xl font-display font-bold mb-4 text-primary">
                        {getStringValue(circuit.name, locale)}
                      </h3>

                      <div className="flex-grow overflow-y-auto mb-4">
                        <p className="text-sm text-white/90 leading-relaxed mb-4">
                          {getStringValue(circuit.description, locale) || 'Discover the beauty and culture of Morocco with this amazing circuit. Experience unforgettable moments and create lasting memories.'}
                        </p>

                        {circuit.highlights && Array.isArray(circuit.highlights) && circuit.highlights.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
                              Highlights
                            </h4>
                            <ul className="space-y-1">
                              {circuit.highlights.slice(0, 3).map((highlight, idx) => (
                                <li key={idx} className="text-xs text-white/80 flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span>{getStringValue(highlight, locale)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center text-accent">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{getStringValue(circuit.location, locale)}</span>
                        </div>
                        {circuit.duration && (
                          <div className="flex items-center text-accent">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{getStringValue(circuit.duration, locale)}</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/${locale}/excursion/${circuit.productSlug}`}
                        className="mt-4 w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-full text-center text-sm font-semibold transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={prevCard}
          className="w-12 h-12 rounded-full glass border border-primary/30 flex items-center justify-center text-primary hover:scale-110 transition-transform duration-300"
          aria-label="Previous circuit"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-sm text-white/70">
          {currentIndex + 1} / {totalCards}
        </div>

        <button
          onClick={nextCard}
          className="w-12 h-12 rounded-full glass border border-primary/30 flex items-center justify-center text-primary hover:scale-110 transition-transform duration-300"
          aria-label="Next circuit"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Instructions */}
      <p className="text-center text-xs text-white/50 mt-4">
        Use arrow keys or swipe to navigate • Click card to flip
      </p>
    </div>
  );
}