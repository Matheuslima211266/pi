import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { Search, ArrowDown, Shuffle, Eye, X, ArrowUp, Skull, Ban, BookOpen, Star, Zap, Sword } from 'lucide-react';
import CardComponent from './CardComponent';

const ZoneManager = ({ 
  cards, 
  zoneName, 
  onCardMove, 
  onCardPreview, 
  isExpanded, 
  onToggleExpand,
  maxDisplayCards = 20,
  onDrawCard = null,
  isHidden = false,
  isCompact = false
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
      case 'extraDeck': return '⭐';
      case 'fieldSpell': return '🏛️';
      default: return '📦';
    }
  };

  const getZoneColor = () => {
    switch (zoneName) {
      case 'graveyard': return 'border-gray-400 bg-gray-900/20';
      case 'banished': return 'border-red-400 bg-red-900/20';
      case 'banishedFaceDown': return 'border-purple-400 bg-purple-900/20';
      case 'deck': return 'border-blue-400 bg-blue-900/20';
      case 'extraDeck': return 'border-yellow-400 bg-yellow-900/20';
      case 'fieldSpell': return 'border-purple-400 bg-purple-900/20';
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
            isFaceDown={zoneName === 'extraDeck' && isHidden}
          />
          {selectedCards.includes(card.id) && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-black">✓</span>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-gray-800 border-gray-600 z-50">
        <ContextMenuItem onClick={() => onCardPreview(card)} className="text-white hover:bg-gray-700">
          <Eye className="mr-2 h-4 w-4" />
          View Card Details
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => handleCardAction('move', card, 'hand')} className="text-white hover:bg-gray-700">
          <ArrowUp className="mr-2 h-4 w-4" />
          Add to Hand
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
            <Sword className="mr-2 h-4 w-4" />
            Summon/Activate
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-gray-800 border-gray-600">
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'monsters')} className="text-white hover:bg-gray-700">
              Special Summon (ATK)
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'spellsTraps')} className="text-white hover:bg-gray-700">
              <Zap className="mr-2 h-4 w-4" />
              Activate on Field
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'fieldSpell')} className="text-white hover:bg-gray-700">
              Field Spell Zone
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => handleCardAction('move', card, 'graveyard')} className="text-white hover:bg-gray-700">
          <Skull className="mr-2 h-4 w-4" />
          Send to Graveyard
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
            <Ban className="mr-2 h-4 w-4" />
            Banish Card
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-gray-800 border-gray-600">
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'banished')} className="text-white hover:bg-gray-700">
              Banish Face-up
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'banishedFaceDown')} className="text-white hover:bg-gray-700">
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
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_top')} className="text-white hover:bg-gray-700">
              Top of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_bottom')} className="text-white hover:bg-gray-700">
              Bottom of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_shuffle')} className="text-white hover:bg-gray-700">
              Shuffle into Deck
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => handleCardAction('move', card, 'extraDeck')} className="text-white hover:bg-gray-700">
          <Star className="mr-2 h-4 w-4" />
          Add to Extra Deck
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  const handleDrawCard = () => {
    if (zoneName === 'deck' && cards.length > 0 && onDrawCard) {
      onDrawCard();
    }
  };

  // Compact view
  if (!isExpanded) {
    const topCard = cards[cards.length - 1];
    const shouldShowFaceDown = zoneName === 'deck' || zoneName === 'extraDeck' || zoneName === 'banishedFaceDown';
    
    return (
      <div className={`${getZoneColor()} border-2 rounded-lg ${isCompact ? 'p-1' : 'p-2'} cursor-pointer transition-all hover:scale-105`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className={`${isCompact ? 'text-sm' : 'text-lg'}`}>{getZoneIcon()}</span>
            <Badge variant="outline" className={`${isCompact ? 'text-xs' : 'text-xs'}`}>
              {zoneName}
            </Badge>
          </div>
          <Badge className="bg-black/50 text-white">
            {cards.length}
          </Badge>
        </div>
        
        <div className="flex gap-1">
          {/* Stack representation */}
          {zoneName === 'deck' ? (
            <div 
              className={`${isCompact ? 'w-10 h-14' : 'w-12 h-16'} bg-blue-800 rounded border-2 border-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-700`}
              onClick={handleDrawCard}
              title="Click to draw a card"
            >
              <span className={`${isCompact ? 'text-xs' : 'text-xs'} font-bold text-white`}>DRAW</span>
            </div>
          ) : (
            <div 
              className={`${isCompact ? 'w-10 h-14' : 'w-12 h-16'} ${getZoneColor()} rounded border-2 flex items-center justify-center`}
              onClick={onToggleExpand}
            >
              <span className={`${isCompact ? 'text-sm' : 'text-lg'}`}>{getZoneIcon()}</span>
            </div>
          )}
          
          {/* Top card preview */}
          {topCard && (
            <div className={`${isCompact ? 'w-10 h-14' : 'w-12 h-16'}`} onClick={onToggleExpand}>
              <CardComponent
                card={topCard}
                isSmall={true}
                showCost={false}
                onClick={() => !shouldShowFaceDown && onCardPreview(topCard)}
                isFaceDown={shouldShowFaceDown || isHidden}
              />
            </div>
          )}
        </div>

        {/* Draw button for deck */}
        {zoneName === 'deck' && onDrawCard && (
          <div className="mt-2">
            <Button 
              size="sm" 
              onClick={handleDrawCard}
              className={`w-full ${isCompact ? 'text-xs h-6' : 'text-xs'}`}
              disabled={cards.length === 0}
            >
              Draw Card ({cards.length})
            </Button>
          </div>
        )}
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
            <Button size="sm" onClick={() => handleCardAction('move', null, 'graveyard')}>
              Send All to Graveyard
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
              <ContextMenu>
                <ContextMenuTrigger>
                  <CardComponent
                    card={card}
                    onClick={(c) => handleCardClick(c, { ctrlKey: false })}
                    isSmall={true}
                    showCost={false}
                    isFaceDown={zoneName === 'extraDeck' && isHidden}
                  />
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-gray-800 border-gray-600 z-50">
                  <ContextMenuItem onClick={() => onCardPreview(card)} className="text-white hover:bg-gray-700">
                    <Eye className="mr-2 h-4 w-4" />
                    View Card Details
                  </ContextMenuItem>
                  
                  <ContextMenuItem onClick={() => handleCardAction('move', card, 'hand')} className="text-white hover:bg-gray-700">
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Add to Hand
                  </ContextMenuItem>

                  <ContextMenuSub>
                    <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
                      <Sword className="mr-2 h-4 w-4" />
                      Summon/Activate
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="bg-gray-800 border-gray-600">
                      <ContextMenuItem onClick={() => handleCardAction('move', card, 'monsters')} className="text-white hover:bg-gray-700">
                        Special Summon (ATK)
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCardAction('move', card, 'spellsTraps')} className="text-white hover:bg-gray-700">
                        <Zap className="mr-2 h-4 w-4" />
                        Activate on Field
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCardAction('move', card, 'fieldSpell')} className="text-white hover:bg-gray-700">
                        Field Spell Zone
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>

                  <ContextMenuItem onClick={() => handleCardAction('move', card, 'graveyard')} className="text-white hover:bg-gray-700">
                    <Skull className="mr-2 h-4 w-4" />
                    Send to Graveyard
                  </ContextMenuItem>

                  <ContextMenuSub>
                    <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
                      <Ban className="mr-2 h-4 w-4" />
                      Banish Card
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="bg-gray-800 border-gray-600">
                      <ContextMenuItem onClick={() => handleCardAction('move', card, 'banished')} className="text-white hover:bg-gray-700">
                        Banish Face-up
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCardAction('move', card, 'banishedFaceDown')} className="text-white hover:bg-gray-700">
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
                      <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_top')} className="text-white hover:bg-gray-700">
                        Top of Deck
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_bottom')} className="text-white hover:bg-gray-700">
                        Bottom of Deck
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCardAction('move', card, 'deck_shuffle')} className="text-white hover:bg-gray-700">
                        Shuffle into Deck
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>

                  <ContextMenuItem onClick={() => handleCardAction('move', card, 'extraDeck')} className="text-white hover:bg-gray-700">
                    <Star className="mr-2 h-4 w-4" />
                    Add to Extra Deck
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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
