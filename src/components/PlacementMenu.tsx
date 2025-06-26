
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
      case 'deadZone':
        return [
          { key: 'send', label: 'Send to Dead Zone', icon: '💀' }
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
        className="fixed bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-lg z-50 min-w-40"
        style={{ 
          left: `${placementMenu.x}px`, 
          top: `${placementMenu.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="text-sm font-semibold mb-2 text-gray-300">
          {placementMenu.card?.name}
        </div>
        <div className="space-y-1">
          {getMenuOptions(placementMenu.zoneName).map((option) => (
            <Button 
              key={option.key}
              size="sm" 
              onClick={() => onPlacementChoice(option.key)}
              className="w-full text-left justify-start text-sm h-7 bg-gray-700 hover:bg-gray-600 text-white"
              variant="ghost"
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onClose}
          className="w-full mt-2 text-sm h-7 border-gray-600 text-gray-300 hover:bg-gray-700"
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
