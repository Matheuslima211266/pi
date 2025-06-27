
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, X } from 'lucide-react';

interface CardPreviewProps {
  card: any | null;
  onClose?: () => void;
}

const CardPreview = ({ card, onClose }: CardPreviewProps) => {
  if (!card) {
    return (
      <Card className="p-6 bg-slate-900 border-2 border-purple-400 h-[600px] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FileText size={64} className="mx-auto mb-4" />
          <p className="text-lg">Seleziona una carta per vedere i dettagli</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-900 border-2 border-purple-400 shadow-2xl h-[600px] overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white truncate pr-2">{card.name}</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 h-auto flex-shrink-0"
          >
            <X size={20} />
          </Button>
        )}
      </div>
      
      {/* Immagine carta */}
      {card.art_link && (
        <div className="mb-4">
          <img 
            src={card.art_link} 
            alt={card.name}
            className="w-full h-72 object-cover rounded-lg border border-purple-300"
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
          <span className="text-gray-300 font-medium">Tipo:</span>
          <span className="text-white font-semibold">{card.type}</span>
        </div>
        
        {card.attribute && (
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">Attributo:</span>
            <span className="text-white font-semibold">{card.attribute}</span>
          </div>
        )}
        
        {card.star && (
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">Livello:</span>
            <span className="text-white font-semibold">⭐ {card.star}</span>
          </div>
        )}
        
        {(card.atk !== undefined || card.def !== undefined) && (
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">ATK/DEF:</span>
            <span className="text-white font-semibold text-lg">
              {card.atk || '?'} / {card.def || '?'}
            </span>
          </div>
        )}
        
        {card.extra_deck && (
          <div className="flex justify-start">
            <Badge className="bg-purple-600 text-white text-sm">Extra Deck</Badge>
          </div>
        )}
      </div>

      {/* Effetto */}
      {card.effect && (
        <div className="mt-6 pt-4 border-t border-slate-600">
          <h4 className="text-lg font-semibold text-gray-300 mb-3">Effetto:</h4>
          <div className="text-sm text-gray-200 bg-slate-800/50 p-4 rounded max-h-48 overflow-y-auto leading-relaxed">
            {card.effect}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CardPreview;
