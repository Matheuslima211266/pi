import React from 'react';
import { Button } from '@/components/ui/button';

const PlacementMenu = ({ placementMenu, onPlacementChoice, onClose }) => {
  if (!placementMenu) {
    return null;
  }

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

  const options = getMenuOptions(placementMenu.zoneName);
  
  if (options.length === 0) {
    onClose();
    return null;
  }

  // Calcola la posizione del menu vicino al cursore
  const menuStyle = {
    position: 'fixed' as const,
    left: Math.max(10, Math.min(placementMenu.x - 100, window.innerWidth - 220)),
    top: Math.max(10, Math.min(placementMenu.y - 50, window.innerHeight - 200)),
    zIndex: 1000
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50"
        onClick={() => {
          onClose();
        }}
        style={{ zIndex: 999 }}
      />
      <div 
        className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-2xl min-w-48 max-w-64"
        style={menuStyle}
      >
        <div className="text-sm font-semibold mb-3 text-gray-300 border-b border-gray-600 pb-2">
          Place: {placementMenu.card?.name}
        </div>
        <div className="space-y-2">
          {options.map((option) => (
            <Button 
              key={option.key}
              size="sm" 
              onClick={() => {
                onPlacementChoice(option.key);
              }}
              className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-gray-500"
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
          onClick={() => {
            onClose();
          }}
          className="w-full mt-3 text-sm h-8 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          Cancel
        </Button>
      </div>
    </>
  );
};

export default PlacementMenu;
