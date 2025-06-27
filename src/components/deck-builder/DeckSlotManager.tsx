
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, Upload } from 'lucide-react';

interface DeckSlot {
  id: number;
  name: string;
  mainDeck: any[];
  extraDeck: any[];
  totalCards: number;
  lastModified: string;
}

interface DeckSlotManagerProps {
  onLoadDeck: (deckData: any) => void;
  currentDeck: {
    name: string;
    mainDeck: {[cardId: number]: number};
    extraDeck: {[cardId: number]: number};
  };
  availableCards: any[];
}

const DeckSlotManager = ({ onLoadDeck, currentDeck, availableCards }: DeckSlotManagerProps) => {
  const [savedDecks, setSavedDecks] = React.useState<{[key: number]: DeckSlot}>({});

  React.useEffect(() => {
    const saved = localStorage.getItem('yugiduel_saved_decks');
    if (saved) {
      try {
        setSavedDecks(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved decks:', error);
      }
    }
  }, []);

  const saveDeckToSlot = (slotId: number) => {
    const mainDeckArray = convertDeckToArray(currentDeck.mainDeck);
    const extraDeckArray = convertDeckToArray(currentDeck.extraDeck, true);
    const totalCards = mainDeckArray.length + extraDeckArray.length;

    if (totalCards === 0) {
      alert('Il deck è vuoto! Aggiungi alcune carte prima di salvare.');
      return;
    }

    const deckSlot: DeckSlot = {
      id: slotId,
      name: currentDeck.name || `Deck ${slotId}`,
      mainDeck: mainDeckArray,
      extraDeck: extraDeckArray,
      totalCards,
      lastModified: new Date().toLocaleString()
    };

    const updatedDecks = { ...savedDecks, [slotId]: deckSlot };
    setSavedDecks(updatedDecks);
    localStorage.setItem('yugiduel_saved_decks', JSON.stringify(updatedDecks));
    alert(`Deck salvato nello slot ${slotId}!`);
  };

  const loadDeckFromSlot = (slotId: number) => {
    const deck = savedDecks[slotId];
    if (!deck) return;

    onLoadDeck({
      name: deck.name,
      mainDeck: deck.mainDeck,
      extraDeck: deck.extraDeck,
      cards: [...deck.mainDeck, ...deck.extraDeck],
      totalCards: deck.totalCards
    });
    alert(`Deck "${deck.name}" caricato!`);
  };

  const deleteDeckFromSlot = (slotId: number) => {
    if (!savedDecks[slotId]) return;
    
    if (confirm(`Sei sicuro di voler eliminare il deck "${savedDecks[slotId].name}"?`)) {
      const updatedDecks = { ...savedDecks };
      delete updatedDecks[slotId];
      setSavedDecks(updatedDecks);
      localStorage.setItem('yugiduel_saved_decks', JSON.stringify(updatedDecks));
      alert('Deck eliminato!');
    }
  };

  const convertDeckToArray = (deckObj: {[cardId: number]: number}, isExtra: boolean = false) => {
    const result: any[] = [];
    Object.entries(deckObj).forEach(([cardId, count]) => {
      const card = availableCards.find(c => c.id === parseInt(cardId));
      if (card) {
        for (let i = 0; i < count; i++) {
          result.push({ ...card });
        }
      }
    });
    return result;
  };

  return (
    <Card className="p-4 bg-slate-900 border-2 border-purple-400 h-full">
      <h3 className="text-lg font-bold text-white mb-4">Slot Deck Salvati</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(slotId => {
          const deck = savedDecks[slotId];
          return (
            <div key={slotId} className="p-3 bg-slate-800/50 rounded border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Slot {slotId}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => saveDeckToSlot(slotId)}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 h-auto"
                  >
                    <Save size={12} />
                  </Button>
                  {deck && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => loadDeckFromSlot(slotId)}
                        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 h-auto"
                      >
                        <Upload size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDeckFromSlot(slotId)}
                        className="px-2 py-1 h-auto"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {deck ? (
                <div className="text-xs text-gray-300 space-y-1">
                  <div className="font-medium truncate">{deck.name}</div>
                  <div className="flex gap-2">
                    <Badge className="bg-green-600 text-xs">M: {deck.mainDeck.length}</Badge>
                    <Badge className="bg-purple-600 text-xs">E: {deck.extraDeck.length}</Badge>
                  </div>
                  <div className="text-gray-400">{deck.lastModified}</div>
                </div>
              ) : (
                <div className="text-xs text-gray-500">Slot vuoto</div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default DeckSlotManager;
