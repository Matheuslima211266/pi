
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Sword, Shield, Zap, Sparkles, Star } from 'lucide-react';

const CardPreview = ({ card, onClose }) => {
  if (!card) return null;

  const getAttributeColor = (attribute) => {
    switch (attribute?.toLowerCase()) {
      case 'light': return 'border-yellow-400 bg-yellow-900/20';
      case 'dark': return 'border-purple-400 bg-purple-900/20';
      case 'fire': return 'border-red-400 bg-red-900/20';
      case 'water': return 'border-blue-400 bg-blue-900/20';
      case 'earth': return 'border-green-400 bg-green-900/20';
      case 'wind': return 'border-cyan-400 bg-cyan-900/20';
      default: return 'border-gray-400 bg-gray-900/20';
    }
  };

  const isMonster = card.card_type === 'monster' || card.atk !== undefined;

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 w-80">
      <Card className={`${getAttributeColor(card.attribute)} p-4 relative`}>
        <Button
          onClick={onClose}
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 text-white hover:bg-white/20"
        >
          <X size={16} />
        </Button>

        <div className="space-y-4">
          {/* Nome e Costo */}
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">{card.name}</h2>
            {card.cost && (
              <Badge className="bg-gold-600 text-black font-bold">
                {card.cost}
              </Badge>
            )}
          </div>

          {/* Immagine */}
          <div className="h-48 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
            {card.art_link && card.art_link !== "NO ICON" ? (
              <img 
                src={card.art_link} 
                alt={card.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (nextSibling) nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`${card.art_link && card.art_link !== "NO ICON" ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600`}>
              {isMonster && <Sparkles className="text-white" size={32} />}
              {card.card_type === 'spell' && <Zap className="text-white" size={32} />}
              {card.card_type === 'trap' && <Star className="text-white" size={32} />}
            </div>
          </div>

          {/* Tipo e Attributo */}
          <div className="flex justify-between items-center text-sm">
            <Badge variant="outline">
              {card.card_type}
            </Badge>
            {card.attribute && (
              <Badge variant="outline">
                {card.attribute}
              </Badge>
            )}
          </div>

          {/* Stelle per mostri */}
          {isMonster && card.star && (
            <div className="text-center">
              <div className="flex justify-center">
                {Array.from({ length: Math.min(card.star, 12) }, (_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>
          )}

          {/* ATK/DEF per mostri */}
          {isMonster && (
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-1">
                <Sword size={16} className="text-red-400" />
                <span className="font-bold">{card.atk}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield size={16} className="text-blue-400" />
                <span className="font-bold">{card.def}</span>
              </div>
            </div>
          )}

          {/* Effetto */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Effetto:</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {card.effect || card.desc || "Nessun effetto disponibile."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CardPreview;
