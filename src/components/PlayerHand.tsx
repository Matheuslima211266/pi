import React from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { Hand, ArrowUp, Skull, Ban, BookOpen, Eye, Star, Zap, Sword, Shield, Users, UserCheck } from 'lucide-react';

const PlayerHand = ({ cards, onPlayCard, isPlayerTurn, onCardPreview, onCardMove, onShowCard, onShowHand, selectedCardFromHand }) => {
  const handleCardClick = (card) => {
    if (selectedCardFromHand?.id === card.id) {
      onCardMove(card, 'hand', 'deadZone');
    } else {
      onPlayCard(card);
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
                onCardPreview={onCardPreview}
                isPlayable={true}
                isInHand={true}
                showCost={true}
                position={card.position || 'attack'}
                isEnemy={false}
                onContextMenu={() => {}}
                onDoubleClick={() => handleCardPreview(card)}
                zoneName={"hand"}
                slotIndex={index}
                isSmall={false}
                showATK={true}
                showDEF={true}
                zoneLabel={"Hand"}
                onFieldCardAction={undefined}
                enemyField={undefined}
                onCardClick={undefined}
              />
            </div>
            {selectedCardFromHand?.id === card.id && (
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
    <div className="flex flex-row items-end gap-2 px-2 py-1 overflow-x-auto min-h-[90px] max-w-full justify-center">
      {cards.map((card, idx) => renderCardWithContextMenu(card, idx))}
      {cards.length === 0 && (
        <div className="w-full text-center py-4 text-gray-400">
          <p className="text-sm">La tua mano è vuota</p>
        </div>
      )}
    </div>
  );
};

export default PlayerHand;
