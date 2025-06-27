
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, Upload, Download, FileText } from 'lucide-react';

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
      totalCards: deck.totalCards,
      source: 'slot'
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

  const importDeckFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.mainDeck && data.extraDeck) {
          // Carica direttamente nel costruttore del deck
          onLoadDeck({
            name: data.name || 'Deck Importato',
            mainDeck: data.mainDeck,
            extraDeck: data.extraDeck,
            cards: [...data.mainDeck, ...data.extraDeck],
            totalCards: data.mainDeck.length + data.extraDeck.length,
            source: 'import'
          });
          alert(`Deck "${data.name || 'Deck Importato'}" caricato nel costruttore!`);
        } else {
          alert('Questo file non contiene un deck valido. Deve contenere mainDeck e extraDeck.');
        }
      } catch (error) {
        console.error('Deck import error:', error);
        alert('Errore nell\'importazione del file deck');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const exportDeckFromSlot = (slotId: number) => {
    const deck = savedDecks[slotId];
    if (!deck) return;

    const deckData = {
      name: deck.name,
      mainDeck: deck.mainDeck,
      extraDeck: deck.extraDeck,
      totalCards: deck.totalCards,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(deckData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.name.replace(/\s+/g, '_')}_deck.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4 bg-slate-900 border-2 border-purple-400 h-full">
      <h3 className="text-lg font-bold text-white mb-3">Gestione Mazzi</h3>
      
      <div className="mb-3 p-2 bg-purple-900/30 rounded border border-purple-400">
        <p className="text-purple-200 text-xs">
          <FileText size={12} className="inline mr-1" />
          Qui puoi salvare/caricare mazzi completi. Usa "Importa Deck" per caricare direttamente un deck nel costruttore.
        </p>
      </div>

      <div className="flex gap-1 mb-3">
        <label className="cursor-pointer flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs">
            <Upload size={12} />
            Importa Deck
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={importDeckFromFile}
            className="hidden"
          />
        </label>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(slotId => {
          const deck = savedDecks[slotId];
          return (
            <div key={slotId} className="p-3 bg-slate-800/50 rounded border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">Slot {slotId}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => saveDeckToSlot(slotId)}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 h-auto"
                    title="Salva deck corrente"
                  >
                    <Save size={12} />
                  </Button>
                  {deck && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => loadDeckFromSlot(slotId)}
                        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 h-auto"
                        title="Carica deck"
                      >
                        <Upload size={12} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => exportDeckFromSlot(slotId)}
                        className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 h-auto"
                        title="Esporta deck"
                      >
                        <Download size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDeckFromSlot(slotId)}
                        className="px-2 py-1 h-auto"
                        title="Elimina deck"
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
