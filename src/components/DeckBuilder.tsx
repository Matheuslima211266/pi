
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Plus, Minus, Search, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DeckBuilderProps {
  availableCards: any[];
  onDeckSave: (deckData: any) => void;
  initialDeck?: any;
}

const DeckBuilder = ({ availableCards, onDeckSave, initialDeck }: DeckBuilderProps) => {
  const [deckName, setDeckName] = useState(initialDeck?.name || 'Il Mio Deck');
  const [mainDeck, setMainDeck] = useState<any[]>(initialDeck?.mainDeck || []);
  const [extraDeck, setExtraDeck] = useState<any[]>(initialDeck?.extraDeck || []);
  const [searchTerm, setSearchTerm] = useState('');

  // Separa le carte disponibili
  const { mainDeckCards, extraDeckCards } = useMemo(() => {
    const main = availableCards.filter(card => !card.extra_deck);
    const extra = availableCards.filter(card => card.extra_deck);
    
    return {
      mainDeckCards: main.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.type.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      extraDeckCards: extra.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
  }, [availableCards, searchTerm]);

  // Conta le carte nel deck
  const getCardCount = (cardId: number, deck: any[]) => {
    return deck.filter(card => card.id === cardId).length;
  };

  // Aggiunge una carta al deck
  const addCardToDeck = (card: any, isExtra: boolean = false) => {
    const targetDeck = isExtra ? extraDeck : mainDeck;
    const setTargetDeck = isExtra ? setExtraDeck : setMainDeck;
    const maxCards = isExtra ? 15 : 60;
    const maxCopies = 3;

    if (targetDeck.length >= maxCards) {
      alert(`Deck ${isExtra ? 'Extra' : 'Main'} pieno! Massimo ${maxCards} carte.`);
      return;
    }

    const currentCount = getCardCount(card.id, targetDeck);
    if (currentCount >= maxCopies) {
      alert(`Massimo ${maxCopies} copie della stessa carta!`);
      return;
    }

    setTargetDeck([...targetDeck, { ...card, deckId: Date.now() + Math.random() }]);
  };

  // Rimuove una carta dal deck
  const removeCardFromDeck = (cardId: number, isExtra: boolean = false) => {
    const targetDeck = isExtra ? extraDeck : mainDeck;
    const setTargetDeck = isExtra ? setExtraDeck : setMainDeck;

    const cardIndex = targetDeck.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      const newDeck = [...targetDeck];
      newDeck.splice(cardIndex, 1);
      setTargetDeck(newDeck);
    }
  };

  // Valida il deck
  const validateDeck = () => {
    const errors = [];
    
    if (mainDeck.length < 40) {
      errors.push(`Main Deck deve avere almeno 40 carte (attualmente: ${mainDeck.length})`);
    }
    if (mainDeck.length > 60) {
      errors.push(`Main Deck può avere massimo 60 carte (attualmente: ${mainDeck.length})`);
    }
    if (extraDeck.length > 15) {
      errors.push(`Extra Deck può avere massimo 15 carte (attualmente: ${extraDeck.length})`);
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

    const deckData = {
      name: deckName,
      mainDeck,
      extraDeck,
      cards: [...mainDeck, ...extraDeck],
      totalCards: mainDeck.length + extraDeck.length
    };

    onDeckSave(deckData);
    alert('Deck salvato con successo!');
  };

  // Export JSON
  const exportJSON = () => {
    const deckData = {
      name: deckName,
      mainDeck,
      extraDeck,
      cards: [...mainDeck, ...extraDeck]
    };

    const dataStr = JSON.stringify(deckData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deckName.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Excel
  const exportExcel = () => {
    const mainDeckData = mainDeck.map(card => ({
      Nome: card.name,
      Tipo: card.type,
      Attributo: card.attribute || 'N/A',
      Livello: card.star || 'N/A',
      ATK: card.atk || 'N/A',
      DEF: card.def || 'N/A',
      Deck: 'Main'
    }));

    const extraDeckData = extraDeck.map(card => ({
      Nome: card.name,
      Tipo: card.type,
      Attributo: card.attribute || 'N/A',
      Livello: card.star || 'N/A',
      ATK: card.atk || 'N/A',
      DEF: card.def || 'N/A',
      Deck: 'Extra'
    }));

    const worksheet = XLSX.utils.json_to_sheet([...mainDeckData, ...extraDeckData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deck');
    XLSX.writeFile(workbook, `${deckName.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <Card className="p-4 bg-slate-800/90 border-purple-400">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-purple-400" size={24} />
            <h2 className="text-xl font-bold text-white">Deck Builder</h2>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportJSON} variant="outline" size="sm">
              <Download size={16} />
              JSON
            </Button>
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
            className="bg-slate-700 text-white border-slate-600"
          />
        </div>

        {/* Contatori deck */}
        <div className="flex gap-4 mb-4">
          <Badge className={`px-3 py-1 ${mainDeck.length >= 40 && mainDeck.length <= 60 ? 'bg-green-600' : 'bg-red-600'}`}>
            Main Deck: {mainDeck.length}/60 (min: 40)
          </Badge>
          <Badge className={`px-3 py-1 ${extraDeck.length <= 15 ? 'bg-green-600' : 'bg-red-600'}`}>
            Extra Deck: {extraDeck.length}/15
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
                className="bg-slate-700 text-white border-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Deck Cards */}
              <Card className="p-4 bg-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Carte Main Deck</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {mainDeckCards.map(card => (
                    <div key={card.id} className="flex items-center justify-between p-2 bg-slate-600/50 rounded">
                      <div className="flex-1">
                        <div className="text-white font-medium">{card.name}</div>
                        <div className="text-gray-400 text-sm">{card.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getCardCount(card.id, mainDeck)}/3
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => addCardToDeck(card)}
                          disabled={getCardCount(card.id, mainDeck) >= 3}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Extra Deck Cards */}
              <Card className="p-4 bg-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Carte Extra Deck</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {extraDeckCards.map(card => (
                    <div key={card.id} className="flex items-center justify-between p-2 bg-slate-600/50 rounded">
                      <div className="flex-1">
                        <div className="text-white font-medium">{card.name}</div>
                        <div className="text-gray-400 text-sm">{card.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getCardCount(card.id, extraDeck)}/3
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => addCardToDeck(card, true)}
                          disabled={getCardCount(card.id, extraDeck) >= 3}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="main-deck">
            <Card className="p-4 bg-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Main Deck ({mainDeck.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {mainDeck.map(card => (
                  <div key={card.deckId} className="flex items-center justify-between p-2 bg-slate-600/50 rounded">
                    <div className="flex-1">
                      <div className="text-white font-medium">{card.name}</div>
                      <div className="text-gray-400 text-sm">{card.type}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeCardFromDeck(card.id)}
                    >
                      <Minus size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="extra-deck">
            <Card className="p-4 bg-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Extra Deck ({extraDeck.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {extraDeck.map(card => (
                  <div key={card.deckId} className="flex items-center justify-between p-2 bg-slate-600/50 rounded">
                    <div className="flex-1">
                      <div className="text-white font-medium">{card.name}</div>
                      <div className="text-gray-400 text-sm">{card.type}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeCardFromDeck(card.id, true)}
                    >
                      <Minus size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button
            onClick={saveDeck}
            className="bg-gold-600 hover:bg-gold-700 text-black font-semibold"
            disabled={validateDeck().length > 0}
          >
            <Save size={16} />
            Salva Deck
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeckBuilder;
