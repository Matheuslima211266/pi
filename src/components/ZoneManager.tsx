import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { Search, ArrowDown, Shuffle, Eye, X, ArrowUp, Skull, Ban, BookOpen, Star, Zap, Sword } from 'lucide-react';
import CardComponent from './CardComponent';
import { MODAL_CARD_COLS, MODAL_CARD_SIZE_PX, MODAL_CARD_GAP_PX, MODAL_IMAGE_ONLY, MODAL_CARD_SCALE, MODAL_EXPANDED_WIDTH_PERC, MODAL_EXPANDED_HEIGHT_PERC, SIDEBAR_WIDTH_PX, MODAL_POSITION, FIELD_SIDEBAR_GAP_PX } from '@/config/dimensions';

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
      case 'deadZone': return '💀';
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
      case 'deadZone': return 'border-gray-400 bg-gray-900/20';
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
            onCardPreview={onCardPreview}
            isSmall={true}
            imageOnly={MODAL_IMAGE_ONLY}
            showCost={false}
            showATK={false}
            showDEF={false}
            isFaceDown={zoneName === 'extraDeck' && isHidden}
            position={card.position || 'attack'}
            isEnemy={false}
            zoneName={zoneName}
            slotIndex={null}
            zoneLabel={undefined}
            onContextMenu={null}
            onDoubleClick={null}
            onFieldCardAction={undefined}
            enemyField={undefined}
            onCardClick={undefined}
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

        <ContextMenuItem onClick={() => handleCardAction('move', card, 'deadZone')} className="text-white hover:bg-gray-700">
          <Skull className="mr-2 h-4 w-4" />
          Send to Dead Zone
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
                imageOnly={MODAL_IMAGE_ONLY}
                showCost={false}
                showATK={false}
                showDEF={false}
                onClick={() => !shouldShowFaceDown && onCardPreview(topCard)}
                isFaceDown={shouldShowFaceDown || isHidden}
                position={topCard.position || 'attack'}
                isEnemy={false}
                zoneName={zoneName}
                slotIndex={null}
                zoneLabel={undefined}
                onContextMenu={null}
                onDoubleClick={null}
                onFieldCardAction={undefined}
                enemyField={undefined}
                onCardClick={undefined}
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
  const overlayJustify = MODAL_POSITION === 'center' ? 'center' : (MODAL_POSITION === 'left' ? 'flex-start' : 'flex-end');
  return (
    <div className={`fixed inset-0 bg-black/50 z-[60] flex items-center ${overlayJustify}`} style={{ paddingRight: MODAL_POSITION === 'right' || MODAL_POSITION === 'center' ? SIDEBAR_WIDTH_PX + FIELD_SIDEBAR_GAP_PX : 0, paddingLeft: MODAL_POSITION === 'left' ? 20 : 0 }}>
      <Card
        className={`${getZoneColor()} p-4 relative overflow-hidden`}
        style={{ width: `${MODAL_EXPANDED_WIDTH_PERC}vw`, height: `${MODAL_EXPANDED_HEIGHT_PERC}vh`, maxWidth: `calc(100vw - ${SIDEBAR_WIDTH_PX + FIELD_SIDEBAR_GAP_PX}px)` }}
      >
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

          {/* Multi-selection mode toggle */}
          <Button
            size="sm"
            variant={selectedCards.length > 0 ? "default" : "outline"}
            onClick={() => {
              if (selectedCards.length > 0) {
                setSelectedCards([]);
              }
            }}
            className={`${
              selectedCards.length > 0 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white'
            }`}
          >
            {selectedCards.length > 0 ? (
              <>
                <span className="mr-1">✓</span>
                {selectedCards.length} Selezionate
              </>
            ) : (
              <>
                <span className="mr-1">📋</span>
                Selezione Multipla
              </>
            )}
          </Button>
        </div>

        {/* Multi-selection actions */}
        {selectedCards.length > 1 && (
          <div className="flex flex-col gap-3 mb-4 p-4 bg-gradient-to-r from-blue-900/80 to-purple-900/80 rounded-lg border-2 border-blue-400 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{selectedCards.length}</span>
                  </div>
                  <span className="text-white font-semibold">
                    {selectedCards.length} carte selezionate
                  </span>
                </div>
                <span className="text-blue-200 text-sm">
                  (Ctrl+Click per selezionare/deselezionare)
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSelectedCards([])}
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
              >
                ❌ Cancella Selezione
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={() => handleCardAction('move', null, 'hand')}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                📋 Aggiungi alla Mano
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleCardAction('move', null, 'deadZone')}
                className="bg-gray-600 hover:bg-gray-500 text-white"
              >
                💀 Invia al Cimitero
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleCardAction('move', null, 'banished')}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                🚫 Bandisci
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleCardAction('move', null, 'deck_shuffle')}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                🔄 Rimescola nel Deck
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleCardAction('move', null, 'extraDeck')}
                className="bg-yellow-600 hover:bg-yellow-500 text-white"
              >
                ⭐ Aggiungi all'Extra Deck
              </Button>
            </div>
          </div>
        )}

        {/* Selection instructions */}
        {selectedCards.length === 0 && cards.length > 1 && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <span className="text-blue-400">💡 Suggerimento:</span>
              <span>Usa <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl</kbd> + Click per selezionare più carte e eseguire azioni multiple</span>
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div className="overflow-y-auto flex-1" style={{display:'grid',gridTemplateColumns:`repeat(${MODAL_CARD_COLS}, minmax(${MODAL_CARD_SIZE_PX * MODAL_CARD_SCALE}px,1fr))`,gap:`${MODAL_CARD_GAP_PX}px`}}>
          {sortedCards.map((card, index) => (
            <div 
              key={card.id} 
              className={`cursor-pointer transition-all duration-300 hover:scale-110 relative ${
                selectedCards.includes(card.id) 
                  ? 'ring-4 ring-green-400 ring-opacity-80 shadow-lg shadow-green-400/50 scale-105 animate-pulse' 
                  : 'hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50'
              }`}
              onClick={(e) => handleCardClick(card, e)}
            >
              {/* Selection indicator */}
              {selectedCards.includes(card.id) && (
                <div className="absolute -top-2 -right-2 z-10 animate-bounce">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
              )}
              
              {/* Hover effect for multi-selection */}
              {selectedCards.length > 0 && !selectedCards.includes(card.id) && (
                <div className="absolute inset-0 bg-blue-400/10 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              )}
              
              <ContextMenu>
                <ContextMenuTrigger>
                  <CardComponent
                    card={card}
                    onClick={(c) => handleCardClick(c, { ctrlKey: false })}
                    onCardPreview={onCardPreview}
                    isSmall={true}
                    imageOnly={MODAL_IMAGE_ONLY}
                    showCost={false}
                    showATK={false}
                    showDEF={false}
                    isFaceDown={zoneName === 'extraDeck' && isHidden}
                    position={card.position || 'attack'}
                    isEnemy={false}
                    zoneName={zoneName}
                    slotIndex={null}
                    zoneLabel={undefined}
                    onContextMenu={null}
                    onDoubleClick={null}
                    onFieldCardAction={undefined}
                    enemyField={undefined}
                    onCardClick={undefined}
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

                  <ContextMenuItem onClick={() => handleCardAction('move', card, 'deadZone')} className="text-white hover:bg-gray-700">
                    <Skull className="mr-2 h-4 w-4" />
                    Send to Dead Zone
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
