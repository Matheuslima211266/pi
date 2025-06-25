
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { Search, Sort, Shuffle, Eye, X, ArrowUp, ArrowDown } from 'lucide-react';
import CardComponent from './CardComponent';

const ZoneManager = ({ 
  cards, 
  zoneName, 
  onCardMove, 
  onCardPreview, 
  isExpanded, 
  onToggleExpand,
  maxDisplayCards = 20
}) => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('order_sent');
  const [filterBy, setFilterBy] = useState('all');

  // Filtering and sorting
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (card.effect || card.desc || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'monster' && card.card_type === 'monster') ||
                         (filterBy === 'spell' && card.card_type === 'spell') ||
                         (filterBy === 'trap' && card.card_type === 'trap');
    
    return matchesSearch && matchesFilter;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'card_type':
        return a.card_type.localeCompare(b.card_type);
      case 'level':
        return (b.star || 0) - (a.star || 0);
      case 'attack':
        return (b.atk || 0) - (a.atk || 0);
      default:
        return 0; // order_sent (original order)
    }
  });

  const handleCardClick = (card, event) => {
    if (event.ctrlKey) {
      setSelectedCards(prev => 
        prev.includes(card.id) 
          ? prev.filter(id => id !== card.id)
          : [...prev, card.id]
      );
    } else {
      setSelectedCards([card.id]);
      onCardPreview(card);
    }
  };

  const handleCardAction = (action, card, destination) => {
    if (selectedCards.length > 1) {
      // Multiple selection action
      selectedCards.forEach(cardId => {
        const selectedCard = cards.find(c => c.id === cardId);
        if (selectedCard) {
          onCardMove(selectedCard, zoneName, destination);
        }
      });
      setSelectedCards([]);
    } else {
      onCardMove(card, zoneName, destination);
    }
  };

  const getZoneIcon = () => {
    switch (zoneName) {
      case 'graveyard': return '💀';
      case 'banished': return '🚫';
      case 'banishedFaceDown': return '👁️‍🗨️';
      case 'deck': return '📚';
      default: return '📦';
    }
  };

  const getZoneColor = () => {
    switch (zoneName) {
      case 'graveyard': return 'border-gray-400 bg-gray-900/20';
      case 'banished': return 'border-red-400 bg-red-900/20';
      case 'banishedFaceDown': return 'border-purple-400 bg-purple-900/20';
      case 'deck': return 'border-blue-400 bg-blue-900/20';
      default: return 'border-gray-400 bg-gray-900/20';
    }
  };

  const renderContextMenu = (card) => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative">
          <CardComponent
            card={card}
            onClick={(c) => handleCardClick(c, { ctrlKey: false })}
            isSmall={true}
            showCost={false}
          />
          {selectedCards.includes(card.id) && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-black">✓</span>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => handleCardAction('preview', card)}>
          <Eye className="mr-2 h-4 w-4" />
          View Card Details
        </ContextMenuItem>
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <ArrowUp className="mr-2 h-4 w-4" />
            Move to Hand/Field
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'hand')}>
              Add to Hand
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'monsters')}>
              Special Summon (ATK)
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'spellsTraps')}>
              Activate on Field
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Shuffle className="mr-2 h-4 w-4" />
            Return to Deck
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_top')}>
              Top of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_bottom')}>
              Bottom of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_shuffle')}>
              Shuffle into Deck
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {zoneName !== 'banished' && zoneName !== 'banishedFaceDown' && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              Banish Card
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => handleCardAction('move', card, 'banished')}>
                Banish Face-up
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCardAction('move', card, 'banishedFaceDown')}>
                Banish Face-down
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );

  // Compact view
  if (!isExpanded) {
    const topCard = cards[cards.length - 1];
    return (
      <div className={`${getZoneColor()} border-2 rounded-lg p-2 cursor-pointer transition-all hover:scale-105`}
           onClick={onToggleExpand}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-lg">{getZoneIcon()}</span>
            <Badge variant="outline" className="text-xs">
              {zoneName}
            </Badge>
          </div>
          <Badge className="bg-black/50 text-white">
            {cards.length}
          </Badge>
        </div>
        
        <div className="flex gap-1">
          {/* Stack representation */}
          <div className="w-12 h-16 bg-blue-800 rounded border-2 border-blue-400 flex items-center justify-center">
            <span className="text-xs font-bold text-white">DECK</span>
          </div>
          
          {/* Top card preview */}
          {topCard && (
            <div className="w-12 h-16">
              <CardComponent
                card={topCard}
                isSmall={true}
                showCost={false}
                onClick={() => onCardPreview(topCard)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className={`${getZoneColor()} w-4/5 h-4/5 p-4 relative`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getZoneIcon()}</span>
            <h3 className="text-xl font-bold">{zoneName} ({cards.length} cards)</h3>
          </div>
          <Button onClick={onToggleExpand} variant="ghost" size="sm">
            <X size={16} />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
          >
            <option value="order_sent">Order Sent</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="card_type">Card Type</option>
            <option value="level">Level/Rank</option>
            <option value="attack">ATK/DEF</option>
          </select>

          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
          >
            <option value="all">All Cards</option>
            <option value="monster">Monsters Only</option>
            <option value="spell">Spells Only</option>
            <option value="trap">Traps Only</option>
          </select>
        </div>

        {/* Multi-selection actions */}
        {selectedCards.length > 1 && (
          <div className="flex gap-2 mb-4 p-2 bg-blue-900/50 rounded">
            <span className="text-sm">{selectedCards.length} cards selected:</span>
            <Button size="sm" onClick={() => handleCardAction('move', null, 'hand')}>
              Add All to Hand
            </Button>
            <Button size="sm" onClick={() => handleCardAction('move', null, 'banished')}>
              Banish All
            </Button>
            <Button size="sm" onClick={() => setSelectedCards([])}>
              Clear Selection
            </Button>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-8 gap-2 overflow-y-auto flex-1">
          {sortedCards.map((card, index) => (
            <div 
              key={card.id} 
              className={`cursor-pointer transition-all hover:scale-110 ${
                selectedCards.includes(card.id) ? 'ring-2 ring-green-400' : ''
              }`}
              onClick={(e) => handleCardClick(card, e)}
            >
              {renderContextMenu(card)}
            </div>
          ))}
        </div>

        {sortedCards.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            No cards found
          </div>
        )}
      </Card>
    </div>
  );
};

export default ZoneManager;
