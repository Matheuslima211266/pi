
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { Hand, ArrowUp, Skull, Ban, BookOpen, Eye, Star, Zap, Sword, Shield, Users, UserCheck } from 'lucide-react';

const PlayerHand = ({ cards, onPlayCard, isPlayerTurn, onCardPreview, onCardMove, onShowCard, onShowHand }) => {
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

  const handleShowCardToOpponent = (card) => {
    if (onShowCard) {
      onShowCard(card);
    }
  };

  const handleShowHandToOpponent = () => {
    if (onShowHand) {
      onShowHand();
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
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
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
          
          <ContextMenuItem onClick={() => handleShowCardToOpponent(card)} className="text-white hover:bg-gray-700">
            <UserCheck className="mr-2 h-4 w-4" />
            Show to Opponent
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => handleCardMovement(card, 'deadZone')} className="text-white hover:bg-gray-700">
            <Skull className="mr-2 h-4 w-4" />
            Send to Dead Zone
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
    <Card className="bg-slate-800 border-blue-400 p-1">
      <div className="flex items-center gap-1 mb-1 bg-slate-900/90 p-1 rounded">
        <Hand className="text-blue-400" size={14} />
        <h3 className="text-sm font-semibold text-white">La Tua Mano</h3>
        <Badge variant="outline" className="ml-auto text-xs py-0 px-1 bg-slate-900 text-white border-slate-600">
          {cards.length} carte
        </Badge>
        <Button
          onClick={handleShowHandToOpponent}
          size="sm"
          variant="outline"
          className="ml-1 h-6 text-xs px-2 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
        >
          <Users className="mr-1 h-3 w-3" />
          Mostra
        </Button>
      </div>
      
      {/* Centered hand container */}
      <div className="flex justify-center">
        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
          {cards.map((card, index) => renderCardWithContextMenu(card, index))}
          
          {cards.length === 0 && (
            <div className="w-full text-center py-4 text-gray-400">
              <p className="text-sm">La tua mano è vuota</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedCard && (
        <div className="mt-1 p-1 bg-blue-900/90 border border-blue-400 rounded">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white">Selezionata: <strong>{selectedCard.name}</strong></span>
            <span className="text-xs text-gray-300">Clicca una zona del campo</span>
          </div>
        </div>
      )}
      
      {!isPlayerTurn && (
        <div className="mt-1 text-center">
          <Badge variant="secondary" className="text-xs bg-slate-700 text-white">
            Non è il tuo turno
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default PlayerHand;
