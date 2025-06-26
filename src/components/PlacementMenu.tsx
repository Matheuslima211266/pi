
import React from 'react';
import { Button } from '@/components/ui/button';

const PlacementMenu = ({ placementMenu, onPlacementChoice, onClose }) => {
  if (!placementMenu) return null;

  const getMenuOptions = (zoneName) => {
    switch (zoneName) {
      case 'monsters':
        return [
          { key: 'attack', label: 'Attack Position', icon: '⚔️' },
          { key: 'defense', label: 'Defense Position', icon: '🛡️' },
          { key: 'facedown', label: 'Face-down Defense', icon: '🔒' }
        ];
      case 'spellsTraps':
        return [
          { key: 'activate', label: 'Activate Now', icon: '⚡' },
          { key: 'set', label: 'Set Face-down', icon: '🔒' }
        ];
      case 'graveyard':
        return [
          { key: 'send', label: 'Send to Graveyard', icon: '💀' }
        ];
      case 'banished':
        return [
          { key: 'faceup', label: 'Banish Face-up', icon: '🚫' },
          { key: 'facedown', label: 'Banish Face-down', icon: '👁️' }
        ];
      case 'banishedFaceDown':
        return [
          { key: 'facedown', label: 'Banish Face-down', icon: '👁️' }
        ];
      case 'deck':
        return [
          { key: 'top', label: 'Top of Deck', icon: '🔝' },
          { key: 'bottom', label: 'Bottom of Deck', icon: '🔽' },
          { key: 'shuffle', label: 'Shuffle into Deck', icon: '🔀' }
        ];
      case 'extraDeck':
        return [
          { key: 'add', label: 'Add to Extra Deck', icon: '⭐' }
        ];
      case 'fieldSpell':
        return [
          { key: 'activate', label: 'Activate Field Spell', icon: '🏛️' }
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <div 
        className="fixed bg-gray-800 border border-gray-600 rounded-lg p-1 shadow-lg z-50 min-w-32"
        style={{ left: placementMenu.x, top: placementMenu.y }}
      >
        <div className="text-xs font-semibold mb-1 text-gray-300">
          {placementMenu.card?.name}
        </div>
        <div className="space-y-0.5">
          {getMenuOptions(placementMenu.zoneName).map((option) => (
            <Button 
              key={option.key}
              size="sm" 
              onClick={() => onPlacementChoice(option.key)}
              className="w-full text-left justify-start text-xs h-5"
              variant="ghost"
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onClose}
          className="w-full mt-1 text-xs h-5"
        >
          Cancel
        </Button>
      </div>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
    </>
  );
};

export default PlacementMenu;
