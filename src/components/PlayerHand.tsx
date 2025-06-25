
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { Hand, ArrowUp, Skull, Ban, BookOpen, Eye, Star, Zap, Sword, Shield } from 'lucide-react';

const PlayerHand = ({ cards, onPlayCard, isPlayerTurn, onCardPreview, onCardMove }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (card) => {
    if (!isPlayerTurn) return;
    
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
      if (onPlayCard) {
        onPlayCard(card);
      }
    }
  };

  const handleCardPreview = (card) => {
    if (onCardPreview) {
      onCardPreview(card);
    }
  };

  const handleCardMovement = (card, destination) => {
    console.log(`Moving card ${card.name} from hand to ${destination}`);
    if (onCardMove) {
      onCardMove(card, 'hand', destination);
    }
  };

  const renderCardWithContextMenu = (card, index) => {
    return (
      <ContextMenu key={card.id}>
        <ContextMenuTrigger>
          <div className="flex-shrink-0 relative">
            <div
              onDoubleClick={() => handleCardPreview(card)}
              className="cursor-pointer"
            >
              <CardComponent
                card={card}
                onClick={handleCardClick}
                isPlayable={isPlayerTurn}
                isInHand={true}
                showCost={true}
              />
            </div>
            {selectedCard?.id === card.id && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 bg-gray-800 border-gray-600 z-50">
          <ContextMenuItem onClick={() => handleCardPreview(card)} className="text-white hover:bg-gray-700">
            <Eye className="mr-2 h-4 w-4" />
            View Card Details
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => handleCardMovement(card, 'graveyard')} className="text-white hover:bg-gray-700">
            <Skull className="mr-2 h-4 w-4" />
            Send to Graveyard
          </ContextMenuItem>

          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
              <Ban className="mr-2 h-4 w-4" />
              Banish Card
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-gray-800 border-gray-600">
              <ContextMenuItem onClick={() => handleCardMovement(card, 'banished')} className="text-white hover:bg-gray-700">
                Banish Face-up
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCardMovement(card, 'banishedFaceDown')} className="text-white hover:bg-gray-700">
                Banish Face-down
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
              <BookOpen className="mr-2 h-4 w-4" />
              Return to Deck
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-gray-800 border-gray-600">
              <ContextMenuItem onClick={() => handleCardMovement(card, 'deck_top')} className="text-white hover:bg-gray-700">
                Top of Deck
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCardMovement(card, 'deck_bottom')} className="text-white hover:bg-gray-700">
                Bottom of Deck
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCardMovement(card, 'deck_shuffle')} className="text-white hover:bg-gray-700">
                Shuffle into Deck
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuItem onClick={() => handleCardMovement(card, 'extraDeck')} className="text-white hover:bg-gray-700">
            <Star className="mr-2 h-4 w-4" />
            Add to Extra Deck
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <Card className="bg-slate-800/70 border-blue-400 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Hand className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold">La Tua Mano</h3>
        <Badge variant="outline" className="ml-auto">
          {cards.length} carte
        </Badge>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {cards.map((card, index) => renderCardWithContextMenu(card, index))}
        
        {cards.length === 0 && (
          <div className="w-full text-center py-8 text-gray-400">
            <p>La tua mano è vuota</p>
          </div>
        )}
      </div>
      
      {selectedCard && (
        <div className="mt-4 p-3 bg-blue-900/50 border border-blue-400 rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm">Carta selezionata: <strong>{selectedCard.name}</strong></span>
            <span className="text-xs text-gray-300">Clicca su una zona del campo per posizionarla</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Doppio-click per vedere la carta in grande | Tasto destro per menu opzioni
          </div>
        </div>
      )}
      
      {!isPlayerTurn && (
        <div className="mt-2 text-center">
          <Badge variant="secondary">
            Non è il tuo turno
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default PlayerHand;
