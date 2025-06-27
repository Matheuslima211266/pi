
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save } from 'lucide-react';

// Import the refactored components
import DeckSlotManager from './deck-builder/DeckSlotManager';
import CustomCardManager from './deck-builder/CustomCardManager';
import CardList from './deck-builder/CardList';
import DeckView from './deck-builder/DeckView';
// Import the main CardPreview for hover behavior
import CardPreview from './CardPreview';

interface DeckBuilderProps {
  onBack?: () => void;
  onDeckSave: (deckData: any) => void;
  availableCards?: any[];
  initialDeck?: any;
}

const DeckBuilder = ({ onBack, onDeckSave, availableCards: initialAvailableCards = [], initialDeck }: DeckBuilderProps) => {
  const [deckName, setDeckName] = useState('Nuovo Deck');
  const [mainDeck, setMainDeck] = useState<{[cardId: number]: number}>({});
  const [extraDeck, setExtraDeck] = useState<{[cardId: number]: number}>({});
  const [availableCards, setAvailableCards] = useState<any[]>(initialAvailableCards);
  const [previewCard, setPreviewCard] = useState<any>(null);

  // Load initial deck if provided
  useEffect(() => {
    if (initialDeck) {
      handleLoadDeck(initialDeck);
    }
  }, [initialDeck]);

  const currentDeck = {
    name: deckName,
    mainDeck,
    extraDeck
  };

  const handleCardsUpdate = (cards: any[]) => {
    setAvailableCards(cards);
  };

  const handleAddCard = (card: any) => {
    const isExtraDeck = card.extra_deck;
    const targetDeck = isExtraDeck ? extraDeck : mainDeck;
    const setTargetDeck = isExtraDeck ? setExtraDeck : setMainDeck;
    
    const currentCount = targetDeck[card.id] || 0;
    if (currentCount < 3) {
      setTargetDeck(prev => ({
        ...prev,
        [card.id]: currentCount + 1
      }));
    }
  };

  const handleRemoveCard = (cardId: number) => {
    // Check if card is in main deck
    if (mainDeck[cardId]) {
      if (mainDeck[cardId] === 1) {
        const newMainDeck = { ...mainDeck };
        delete newMainDeck[cardId];
        setMainDeck(newMainDeck);
      } else {
        setMainDeck(prev => ({
          ...prev,
          [cardId]: prev[cardId] - 1
        }));
      }
    }
    // Check if card is in extra deck
    else if (extraDeck[cardId]) {
      if (extraDeck[cardId] === 1) {
        const newExtraDeck = { ...extraDeck };
        delete newExtraDeck[cardId];
        setExtraDeck(newExtraDeck);
      } else {
        setExtraDeck(prev => ({
          ...prev,
          [cardId]: prev[cardId] - 1
        }));
      }
    }
  };

  const handleLoadDeck = (deckData: any) => {
    console.log('Loading deck:', deckData);
    
    if (deckData.source === 'import') {
      // Caricamento diretto da import - converte array in oggetti con conteggi
      const newMainDeck: {[cardId: number]: number} = {};
      const newExtraDeck: {[cardId: number]: number} = {};
      
      // Conta le occorrenze di ogni carta nel main deck
      deckData.mainDeck?.forEach((card: any) => {
        newMainDeck[card.id] = (newMainDeck[card.id] || 0) + 1;
      });
      
      // Conta le occorrenze di ogni carta nell'extra deck
      deckData.extraDeck?.forEach((card: any) => {
        newExtraDeck[card.id] = (newExtraDeck[card.id] || 0) + 1;
      });
      
      setMainDeck(newMainDeck);
      setExtraDeck(newExtraDeck);
      setDeckName(deckData.name || 'Deck Importato');
      
      // FIXED: Assicurati che tutte le carte del deck siano disponibili
      const allDeckCards = [...(deckData.mainDeck || []), ...(deckData.extraDeck || [])];
      const uniqueDeckCards = allDeckCards.reduce((acc: any[], card: any) => {
        if (!acc.find(c => c.id === card.id)) {
          acc.push(card);
        }
        return acc;
      }, []);
      
      // Aggiungi le carte del deck alle carte disponibili se non ci sono già
      const existingIds = new Set(availableCards.map(c => c.id));
      const newCards = uniqueDeckCards.filter(card => !existingIds.has(card.id));
      
      if (newCards.length > 0) {
        // Salva le nuove carte nel database personale
        const savedCards = localStorage.getItem('yugiduel_custom_cards');
        const customCards = savedCards ? JSON.parse(savedCards) : [];
        const updatedCustomCards = [...customCards, ...newCards];
        localStorage.setItem('yugiduel_custom_cards', JSON.stringify(updatedCustomCards));
        
        // FIXED: Aggiorna le carte disponibili immediatamente
        const updatedAvailableCards = [...availableCards, ...newCards];
        setAvailableCards(updatedAvailableCards);
        
        console.log(`Added ${newCards.length} new cards to database and available cards`);
      }
    } else {
      // Caricamento da slot (già nel formato corretto)
      setMainDeck({});
      setExtraDeck({});
      setDeckName(deckData.name || 'Deck Caricato');
      
      // FIXED: Assicurati che tutte le carte del deck siano disponibili anche per gli slot
      const allDeckCards = [...(deckData.mainDeck || []), ...(deckData.extraDeck || [])];
      const uniqueDeckCards = allDeckCards.reduce((acc: any[], card: any) => {
        if (!acc.find(c => c.id === card.id)) {
          acc.push(card);
        }
        return acc;
      }, []);
      
      const existingIds = new Set(availableCards.map(c => c.id));
      const newCards = uniqueDeckCards.filter(card => !existingIds.has(card.id));
      
      if (newCards.length > 0) {
        const updatedAvailableCards = [...availableCards, ...newCards];
        setAvailableCards(updatedAvailableCards);
      }
      
      // Converte gli array in oggetti con conteggi
      setTimeout(() => {
        const newMainDeck: {[cardId: number]: number} = {};
        const newExtraDeck: {[cardId: number]: number} = {};
        
        deckData.mainDeck?.forEach((card: any) => {
          newMainDeck[card.id] = (newMainDeck[card.id] || 0) + 1;
        });
        
        deckData.extraDeck?.forEach((card: any) => {
          newExtraDeck[card.id] = (newExtraDeck[card.id] || 0) + 1;
        });
        
        setMainDeck(newMainDeck);
        setExtraDeck(newExtraDeck);
      }, 100);
    }
  };

  const handleSaveDeck = () => {
    const mainDeckArray: any[] = [];
    const extraDeckArray: any[] = [];
    
    // Converte il deck corrente in array
    Object.entries(mainDeck).forEach(([cardId, count]) => {
      const card = availableCards.find(c => c.id === parseInt(cardId));
      if (card) {
        for (let i = 0; i < count; i++) {
          mainDeckArray.push({ ...card });
        }
      }
    });
    
    Object.entries(extraDeck).forEach(([cardId, count]) => {
      const card = availableCards.find(c => c.id === parseInt(cardId));
      if (card) {
        for (let i = 0; i < count; i++) {
          extraDeckArray.push({ ...card });
        }
      }
    });
    
    const deckData = {
      name: deckName,
      mainDeck: mainDeckArray,
      extraDeck: extraDeckArray,
      cards: [...mainDeckArray, ...extraDeckArray],
      totalCards: mainDeckArray.length + extraDeckArray.length
    };
    
    onDeckSave(deckData);
    alert(`Deck "${deckName}" salvato e pronto per il gioco!`);
  };

  // Filtri per le carte
  const mainDeckCards = availableCards.filter(card => !card.extra_deck);
  const extraDeckCards = availableCards.filter(card => card.extra_deck);

  // Combina i conteggi per il display
  const allDeckCounts = { ...mainDeck, ...extraDeck };

  // Statistiche del deck
  const mainDeckCount = Object.values(mainDeck).reduce((sum, count) => sum + count, 0);
  const extraDeckCount = Object.values(extraDeck).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al Menu
            </Button>
          )}
          <h1 className="text-3xl font-bold text-white">Costruttore Deck</h1>
          <Button onClick={handleSaveDeck} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Salva per Gioco
          </Button>
        </div>

        {/* Deck Name */}
        <div className="mb-6">
          <Card className="p-4 bg-slate-800/50">
            <div className="flex items-center gap-4">
              <label className="text-white font-medium">Nome Deck:</label>
              <Input
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="flex gap-4">
                <Badge className="bg-green-600">Main: {mainDeckCount}/60</Badge>
                <Badge className="bg-purple-600">Extra: {extraDeckCount}/15</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Deck Slots */}
          <div className="col-span-3">
            <DeckSlotManager
              onLoadDeck={handleLoadDeck}
              currentDeck={currentDeck}
              availableCards={availableCards}
            />
          </div>

          {/* Center Panel - Cards and Deck */}
          <div className="col-span-9 space-y-6">
            {/* Custom Card Manager */}
            <CustomCardManager
              onCardsUpdate={handleCardsUpdate}
              availableCards={availableCards}
            />

            {/* Available Cards */}
            <div className="grid grid-cols-1 gap-4">
              <CardList
                cards={mainDeckCards}
                title="Carte Main Deck"
                deckCounts={allDeckCounts}
                onAddCard={handleAddCard}
                onCardHover={setPreviewCard}
              />
              <CardList
                cards={extraDeckCards}
                title="Carte Extra Deck"
                deckCounts={allDeckCounts}
                onAddCard={handleAddCard}
                onCardHover={setPreviewCard}
              />
            </div>

            {/* Current Deck */}
            <div className="grid grid-cols-2 gap-4">
              <DeckView
                title="Main Deck"
                deckCards={mainDeck}
                availableCards={availableCards}
                onRemoveCard={handleRemoveCard}
                onCardHover={setPreviewCard}
              />
              <DeckView
                title="Extra Deck"
                deckCards={extraDeck}
                availableCards={availableCards}
                onRemoveCard={handleRemoveCard}
                onCardHover={setPreviewCard}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Preview - Positioned like in-game */}
      {previewCard && (
        <CardPreview 
          card={previewCard} 
          onClose={() => setPreviewCard(null)} 
        />
      )}
    </div>
  );
};

export default DeckBuilder;
