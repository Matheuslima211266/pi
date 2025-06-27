
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
      <Card className="p-6 bg-slate-900 border-2 border-purple-400 h-96 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FileText size={48} className="mx-auto mb-4" />
          <p>Seleziona una carta per vedere i dettagli</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-slate-900 border-2 border-purple-400 shadow-2xl h-fit max-h-96 overflow-y-auto">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-white truncate pr-2">{card.name}</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 h-auto flex-shrink-0"
          >
            <X size={16} />
          </Button>
        )}
      </div>
      
      {/* Immagine carta */}
      {card.art_link && (
        <div className="mb-3">
          <img 
            src={card.art_link} 
            alt={card.name}
            className="w-full h-48 object-cover rounded-lg border border-purple-300"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Info carta */}
      <div className="space-y-2 text-sm">
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
            <span className="text-white font-medium">
              {card.atk || '?'} / {card.def || '?'}
            </span>
          </div>
        )}

        {card.cost && (
          <div className="flex justify-between">
            <span className="text-gray-300">Costo:</span>
            <span className="text-white font-medium">{card.cost}</span>
          </div>
        )}
        
        {card.extra_deck && (
          <Badge className="bg-purple-600 text-white">Extra Deck</Badge>
        )}
      </div>

      {/* Effetto */}
      {card.effect && (
        <div className="mt-3 pt-3 border-t border-slate-600">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Effetto:</h4>
          <p className="text-xs text-gray-200 bg-slate-800/50 p-2 rounded max-h-32 overflow-y-auto">
            {card.effect}
          </p>
        </div>
      )}
    </Card>
  );
};

export default CardPreview;
