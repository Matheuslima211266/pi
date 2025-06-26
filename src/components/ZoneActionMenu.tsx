
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shuffle, ArrowDown, ArrowUp, Eye, Skull } from 'lucide-react';

const ZoneActionMenu = ({ zoneName, onAction, onClose, position }) => {
  const getMenuOptions = () => {
    switch (zoneName) {
      case 'deck':
        return [
          { key: 'draw', label: 'Pesca 1', icon: <ArrowUp size={16} /> },
          { key: 'mill', label: 'Mill 1', icon: <Skull size={16} /> },
          { key: 'mill3', label: 'Mill 3', icon: <Skull size={16} /> },
          { key: 'mill5', label: 'Mill 5', icon: <Skull size={16} /> },
          { key: 'shuffle', label: 'Mescola', icon: <Shuffle size={16} /> },
          { key: 'search', label: 'Cerca', icon: <Eye size={16} /> },
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> }
        ];
      case 'extraDeck':
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> },
          { key: 'search', label: 'Cerca', icon: <Eye size={16} /> }
        ];
      case 'graveyard':
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> },
          { key: 'shuffle', label: 'Mescola nel Deck', icon: <Shuffle size={16} /> }
        ];
      case 'banished':
      case 'banishedFaceDown':
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> }
        ];
      case 'fieldSpell':
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> }
        ];
      default:
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> }
        ];
    }
  };

  const options = getMenuOptions();
  if (options.length === 0) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <Card 
        className="fixed z-50 bg-gray-800 border-gray-600 p-3 min-w-48"
        style={{ 
          left: position?.x || '50%', 
          top: position?.y || '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        <div className="text-sm font-semibold mb-2 text-white capitalize">
          {zoneName} Actions
        </div>
        <div className="space-y-1">
          {options.map((option) => (
            <Button 
              key={option.key}
              size="sm" 
              onClick={() => onAction(option.key)}
              className="w-full text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white"
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
          className="w-full mt-2 text-sm h-8 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
      </Card>
    </>
  );
};

export default ZoneActionMenu;
