import React from 'react';
import { BookOpen, Skull, Ban, Sparkles, Mountain, Heart } from 'lucide-react';

interface GameZoneBoxProps {
  zoneName: string;
  cards: any[];
  title: string;
  onCardPreview: (card: any) => void;
  onCardMove: (card: any, fromZone: string, toZone: string, slotIndex?: number) => void;
  onDeckMill?: (count: number) => void;
  onDrawCard?: () => void;
  isPlayer: boolean;
}

const GameZoneBox = ({ 
  zoneName, 
  cards, 
  title, 
  onCardPreview, 
  onCardMove, 
  onDeckMill, 
  onDrawCard, 
  isPlayer 
}: GameZoneBoxProps) => {
  const getZoneIcon = () => {
    switch (zoneName) {
      case 'deck': return <BookOpen size={16} />;
      case 'deadZone': return <Skull size={16} />;
      case 'banished': return <Ban size={16} />;
      case 'field': return <Mountain size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const handleZoneClick = () => {
    if (zoneName === 'deck' && onDrawCard && isPlayer) {
      onDrawCard();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (zoneName === 'deck' && onDeckMill && isPlayer) {
      onDeckMill(1);
    }
  };

  return (
    <div 
      className="w-16 h-20 border border-gray-600 rounded bg-gray-800/50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-colors"
      onClick={handleZoneClick}
      onContextMenu={handleContextMenu}
    >
      <div className="text-gray-400 mb-1">
        {getZoneIcon()}
      </div>
      <div className="text-xs text-gray-300 text-center px-1 leading-tight">
        {title}
      </div>
      <div className="text-xs text-gray-400">
        {cards.length}
      </div>
    </div>
  );
};

export default GameZoneBox;
