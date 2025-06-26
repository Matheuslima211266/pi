
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUp, Skull, Ban, BookOpen, Star, Eye, ArrowDown, RotateCcw } from 'lucide-react';

const SlotPopupMenu = ({ 
  card, 
  zoneName, 
  onAction, 
  onClose, 
  position 
}) => {
  if (!card) return null;

  const handleAction = (action, destination) => {
    onAction(action, card, destination);
    onClose();
  };

  const isMonster = card.card_type === 'monster' || card.atk !== undefined;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <Card 
        className="fixed z-50 bg-gray-800 border-gray-600 p-3 min-w-48 max-h-96 overflow-y-auto"
        style={{ 
          left: position?.x || '50%', 
          top: position?.y || '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        <div className="text-sm font-semibold mb-2 text-white">
          {card.name}
        </div>
        <div className="space-y-1">
          {/* View Card */}
          <Button 
            size="sm" 
            onClick={() => handleAction('preview', null)}
            className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
            variant="ghost"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Card
          </Button>

          {/* Change Position (only for monsters in monster zone) */}
          {isMonster && zoneName === 'monsters' && (
            <Button 
              size="sm" 
              onClick={() => handleAction('changePosition', 'position')}
              className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
              variant="ghost"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Change Position
            </Button>
          )}

          {/* To Hand */}
          <Button 
            size="sm" 
            onClick={() => handleAction('toHand', 'hand')}
            className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
            variant="ghost"
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            To Hand
          </Button>

          {/* To Graveyard */}
          {zoneName !== 'graveyard' && (
            <Button 
              size="sm" 
              onClick={() => handleAction('toGraveyard', 'graveyard')}
              className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
              variant="ghost"
            >
              <Skull className="mr-2 h-4 w-4" />
              To Graveyard
            </Button>
          )}

          {/* Banish Options */}
          {zoneName !== 'banished' && zoneName !== 'banishedFaceDown' && (
            <>
              <Button 
                size="sm" 
                onClick={() => handleAction('toBanished', 'banished')}
                className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
                variant="ghost"
              >
                <Ban className="mr-2 h-4 w-4" />
                Banish Face-up
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleAction('toBanishedFaceDown', 'banishedFaceDown')}
                className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
                variant="ghost"
              >
                <Ban className="mr-2 h-4 w-4" />
                Banish Face-down
              </Button>
            </>
          )}

          {/* Deck Options */}
          {zoneName !== 'deck' && (
            <>
              <Button 
                size="sm" 
                onClick={() => handleAction('toDeckTop', 'deck_top')}
                className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
                variant="ghost"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Top of Deck
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleAction('toDeckBottom', 'deck_bottom')}
                className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
                variant="ghost"
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                Bottom of Deck
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleAction('toDeckShuffle', 'deck_shuffle')}
                className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
                variant="ghost"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Shuffle into Deck
              </Button>
            </>
          )}

          {/* Extra Deck */}
          {zoneName !== 'extraDeck' && (
            <Button 
              size="sm" 
              onClick={() => handleAction('toExtraDeck', 'extraDeck')}
              className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
              variant="ghost"
            >
              <Star className="mr-2 h-4 w-4" />
              To Extra Deck
            </Button>
          )}

          {/* Field Options */}
          {zoneName !== 'monsters' && zoneName !== 'spellsTraps' && zoneName !== 'fieldSpell' && (
            <>
              <Button 
                size="sm" 
                onClick={() => handleAction('toField', 'monsters')}
                className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
                variant="ghost"
              >
                ⚔️ To Monster Zone
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleAction('toField', 'spellsTraps')}
                className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
                variant="ghost"
              >
                ⚡ To S/T Zone
              </Button>
            </>
          )}

          {/* Flip Card (for field cards) */}
          {(zoneName === 'monsters' || zoneName === 'spellsTraps') && (
            <Button 
              size="sm" 
              onClick={() => handleAction('flipCard', 'flip')}
              className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
              variant="ghost"
            >
              🔄 {card.faceDown ? 'Flip Face-up' : 'Set Face-down'}
            </Button>
          )}
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={onClose}
          className="w-full mt-2 text-sm h-8 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
      </Card>
    </>
  );
};

export default SlotPopupMenu;
