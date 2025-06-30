import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { 
  PREVIEW_WIDTH_PX, 
  PREVIEW_IMAGE_HEIGHT_PX, 
  PREVIEW_EFFECT_MAX_HEIGHT_PX 
} from '@/config/dimensions';

const CardPreview = ({ card, onClose }) => {
  if (!card) return null;

  return (
    <div 
      className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50"
      style={{ width: `${PREVIEW_WIDTH_PX}px` }}
    >
      <Card className="p-6 bg-slate-900 border-2 border-purple-400 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-white truncate pr-2">{card.name}</h3>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X size={20} />
            </Button>
          )}
        </div>
        
        {/* Immagine carta */}
        {card.art_link && card.art_link !== "NO ICON" && (
          <div className="mb-4">
            <img 
              src={card.art_link} 
              alt={card.name}
              className="w-full object-cover rounded-lg border border-purple-300"
              style={{ height: `${PREVIEW_IMAGE_HEIGHT_PX}px` }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Info carta */}
        <div className="space-y-3 text-base">
          <div className="flex justify-between">
            <span className="text-gray-300">Tipo:</span>
            <span className="text-white font-medium">{card.type}</span>
          </div>
          
          {card.attribute && (
            <div className="flex justify-between">
              <span className="text-gray-300">Attributo:</span>
              <span className="text-white font-medium">{card.attribute}</span>
            </div>
          )}
          
          {card.star && (
            <div className="flex justify-between">
              <span className="text-gray-300">Livello:</span>
              <span className="text-white font-medium">⭐ {card.star}</span>
            </div>
          )}
          
          {(card.atk !== undefined || card.def !== undefined) && (
            <div className="flex justify-between">
              <span className="text-gray-300">ATK/DEF:</span>
              <span className="text-white font-medium text-lg">
                {card.atk || '?'} / {card.def || '?'}
              </span>
            </div>
          )}

          {/* Costo rimosso - obsoleto */}
          
          {card.extra_deck && (
            <Badge className="bg-purple-600 text-white text-sm">Extra Deck</Badge>
          )}
        </div>

        {/* Effetto */}
        {card.effect && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            <h4 className="text-lg font-semibold text-gray-300 mb-3">Effetto:</h4>
            <p 
              className="text-sm text-gray-200 bg-slate-800/50 p-3 rounded overflow-y-auto leading-relaxed"
              style={{ maxHeight: `${PREVIEW_EFFECT_MAX_HEIGHT_PX}px` }}
            >
              {card.effect}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CardPreview;
