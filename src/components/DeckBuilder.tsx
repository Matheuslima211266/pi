
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Save, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

import DeckSlotManager from './deck-builder/DeckSlotManager';
import CardPreview from './deck-builder/CardPreview';
import CustomCardManager from './deck-builder/CustomCardManager';
import CardList from './deck-builder/CardList';
import DeckView from './deck-builder/DeckView';

interface DeckBuilderProps {
  availableCards: any[];
  onDeckSave: (deckData: any) => void;
  initialDeck?: any;
}

const DeckBuilder = ({ availableCards: initialAvailableCards, onDeckSave, initialDeck }: DeckBuilderProps) => {
  const [deckName, setDeckName] = useState(initialDeck?.name || 'Il Mio Deck');
  const [availableCards, setAvailableCards] = useState(initialAvailableCards);
  
  // Deck state - ogni carta nel deck ha solo l'ID originale + count
  const [mainDeck, setMainDeck] = useState<{[cardId: number]: number}>(
    initialDeck?.mainDeck ? 
    initialDeck.mainDeck.reduce((acc, card) => {
      acc[card.id] = (acc[card.id] || 0) + 1;
      return acc;
    }, {}) : {}
  );
  
  const [extraDeck, setExtraDeck] = useState<{[cardId: number]: number}>(
    initialDeck?.extraDeck ? 
    initialDeck.extraDeck.reduce((acc, card) => {
      acc[card.id] = (acc[card.id] || 0) + 1;
      return acc;
    }, {}) : {}
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [previewCard, setPreviewCard] = useState<any>(null);

  // Separa le carte disponibili
  const { mainDeckCards, extraDeckCards } = useMemo(() => {
    const main = availableCards.filter(card => !card.extra_deck);
    const extra = availableCards.filter(card => card.extra_deck);
    
    return {
      mainDeckCards: main.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.type && card.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.attribute && card.attribute.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
      extraDeckCards: extra.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.type && card.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.attribute && card.attribute.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    };
  }, [availableCards, searchTerm]);

  // Conta totale carte nei deck
  const mainDeckTotal = Object.values(mainDeck).reduce((sum: number, count: number) => sum + count, 0);
  const extraDeckTotal = Object.values(extraDeck).reduce((sum: number, count: number) => sum + count, 0);

  // Aggiunge una carta al deck
  const addCardToDeck = (card: any, isExtra: boolean = false) => {
    const targetDeck = isExtra ? extraDeck : mainDeck;
    const setTargetDeck = isExtra ? setExtraDeck : setMainDeck;
    const maxCards = isExtra ? 15 : 60;
    const maxCopies = 3;
    const currentTotal = isExtra ? extraDeckTotal : mainDeckTotal;

    if (currentTotal >= maxCards) {
      alert(`Deck ${isExtra ? 'Extra' : 'Main'} pieno! Massimo ${maxCards} carte.`);
      return;
    }

    const currentCount = targetDeck[card.id] || 0;
    if (currentCount >= maxCopies) {
      alert(`Massimo ${maxCopies} copie della stessa carta!`);
      return;
    }

    setTargetDeck({
      ...targetDeck,
      [card.id]: currentCount + 1
    });
  };

  // Rimuove una carta dal deck
  const removeCardFromDeck = (cardId: number, isExtra: boolean = false) => {
    const targetDeck = isExtra ? extraDeck : mainDeck;
    const setTargetDeck = isExtra ? setExtraDeck : setMainDeck;

    const currentCount = targetDeck[cardId] || 0;
    if (currentCount <= 1) {
      const newDeck = { ...targetDeck };
      delete newDeck[cardId];
      setTargetDeck(newDeck);
    } else {
      setTargetDeck({
        ...targetDeck,
        [cardId]: currentCount - 1
      });
    }
  };

  // Converti deck format per export/save
  const convertDeckToArray = (deckObj: {[cardId: number]: number}) => {
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

  // Valida il deck
  const validateDeck = () => {
    const errors = [];
    
    if (mainDeckTotal < 40) {
      errors.push(`Main Deck deve avere almeno 40 carte (attualmente: ${mainDeckTotal})`);
    }
    if (mainDeckTotal > 60) {
      errors.push(`Main Deck può avere massimo 60 carte (attualmente: ${mainDeckTotal})`);
    }
    if (extraDeckTotal > 15) {
      errors.push(`Extra Deck può avere massimo 15 carte (attualmente: ${extraDeckTotal})`);
    }

    return errors;
  };

  // Salva il deck
  const saveDeck = () => {
    const errors = validateDeck();
    if (errors.length > 0) {
      alert('Errori nel deck:\n' + errors.join('\n'));
      return;
    }

    const mainDeckArray = convertDeckToArray(mainDeck);
    const extraDeckArray = convertDeckToArray(extraDeck);

    const deckData = {
      name: deckName,
      mainDeck: mainDeckArray,
      extraDeck: extraDeckArray,
      cards: [...mainDeckArray, ...extraDeckArray],
      totalCards: mainDeckTotal + extraDeckTotal
    };

    onDeckSave(deckData);
    alert('Deck salvato con successo!');
  };

  // Export Excel
  const exportExcel = () => {
    const data: any[] = [];
    
    Object.entries(mainDeck).forEach(([cardId, count]) => {
      const card = availableCards.find(c => c.id === parseInt(cardId));
      if (card) {
        data.push({
          Nome: card.name,
          Quantità: count,
          Tipo: card.type,
          Attributo: card.attribute || 'N/A',
          Livello: card.star || 'N/A',
          ATK: card.atk || 'N/A',
          DEF: card.def || 'N/A',
          Effetto: card.effect || 'N/A',
          Deck: 'Main'
        });
      }
    });

    Object.entries(extraDeck).forEach(([cardId, count]) => {
      const card = availableCards.find(c => c.id === parseInt(cardId));
      if (card) {
        data.push({
          Nome: card.name,
          Quantità: count,
          Tipo: card.type,
          Attributo: card.attribute || 'N/A',
          Livello: card.star || 'N/A',
          ATK: card.atk || 'N/A',
          DEF: card.def || 'N/A',
          Effetto: card.effect || 'N/A',
          Deck: 'Extra'
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deck');
    XLSX.writeFile(workbook, `${deckName.replace(/\s+/g, '_')}.xlsx`);
  };

  // Carica deck da slot
  const handleLoadDeck = (deckData: any) => {
    if (deckData.name) setDeckName(deckData.name);
    
    // Converti array in oggetto conteggio
    if (deckData.mainDeck) {
      const mainCount: {[cardId: number]: number} = {};
      deckData.mainDeck.forEach((card: any) => {
        mainCount[card.id] = (mainCount[card.id] || 0) + 1;
      });
      setMainDeck(mainCount);
    }
    
    if (deckData.extraDeck) {
      const extraCount: {[cardId: number]: number} = {};
      deckData.extraDeck.forEach((card: any) => {
        extraCount[card.id] = (extraCount[card.id] || 0) + 1;
      });
      setExtraDeck(extraCount);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex gap-4">
        {/* Left Panel - Deck Slots */}
        <div className="w-80 flex-shrink-0">
          <DeckSlotManager
            onLoadDeck={handleLoadDeck}
            currentDeck={{ name: deckName, mainDeck, extraDeck }}
            availableCards={availableCards}
          />
        </div>

        {/* Center - Card Preview */}
        <div className="w-80 flex-shrink-0">
          <CardPreview 
            card={previewCard} 
            onClose={() => setPreviewCard(null)} 
          />
        </div>

        {/* Right Panel - Main Deck Builder */}
        <div className="flex-1 min-w-0">
          <Card className="p-4 bg-slate-900 border-2 border-purple-400">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="text-purple-400" size={24} />
                <h2 className="text-xl font-bold text-white">Deck Builder</h2>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportExcel} variant="outline" size="sm">
                  <Download size={16} />
                  Excel
                </Button>
              </div>
            </div>

            {/* Nome del deck */}
            <div className="mb-4">
              <Input
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Nome del deck"
                className="bg-slate-800 text-white border-slate-600"
              />
            </div>

            {/* Custom Card Manager */}
            <CustomCardManager
              onCardsUpdate={setAvailableCards}
              availableCards={availableCards}
            />

            {/* Contatori deck */}
            <div className="flex gap-4 mb-4">
              <Badge className={`px-3 py-1 ${mainDeckTotal >= 40 && mainDeckTotal <= 60 ? 'bg-green-600' : 'bg-red-600'}`}>
                Main Deck: {mainDeckTotal}/60 (min: 40)
              </Badge>
              <Badge className={`px-3 py-1 ${extraDeckTotal <= 15 ? 'bg-green-600' : 'bg-red-600'}`}>
                Extra Deck: {extraDeckTotal}/15
              </Badge>
            </div>

            <Tabs defaultValue="builder" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                <TabsTrigger value="builder" className="text-white">Costruisci</TabsTrigger>
                <TabsTrigger value="main-deck" className="text-white">Main Deck</TabsTrigger>
                <TabsTrigger value="extra-deck" className="text-white">Extra Deck</TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="space-y-4">
                {/* Ricerca */}
                <div className="flex items-center gap-2">
                  <Search className="text-gray-400" size={20} />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cerca carte..."
                    className="bg-slate-800 text-white border-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CardList
                    cards={mainDeckCards}
                    title="Carte Main Deck"
                    deckCounts={mainDeck}
                    onAddCard={(card) => addCardToDeck(card, false)}
                    onCardHover={setPreviewCard}
                  />

                  <CardList
                    cards={extraDeckCards}
                    title="Carte Extra Deck"
                    deckCounts={extraDeck}
                    onAddCard={(card) => addCardToDeck(card, true)}
                    onCardHover={setPreviewCard}
                  />
                </div>
              </TabsContent>

              <TabsContent value="main-deck">
                <DeckView
                  title="Main Deck"
                  deckCards={mainDeck}
                  availableCards={availableCards}
                  onRemoveCard={(cardId) => removeCardFromDeck(cardId, false)}
                  onCardHover={setPreviewCard}
                />
              </TabsContent>

              <TabsContent value="extra-deck">
                <DeckView
                  title="Extra Deck"
                  deckCards={extraDeck}
                  availableCards={availableCards}
                  onRemoveCard={(cardId) => removeCardFromDeck(cardId, true)}
                  onCardHover={setPreviewCard}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-4">
              <Button
                onClick={saveDeck}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
                disabled={validateDeck().length > 0}
              >
                <Save size={16} />
                Salva Deck
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
