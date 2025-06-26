import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Plus, Minus, Search, Save, X } from 'lucide-react';
import * as XLSX from 'xlsx';

// Componente CardPreview migliorato
const ImprovedCardPreview = ({ card, onClose }) => {
  if (!card) return null;

  return (
    <Card className="p-4 bg-slate-900 border-2 border-purple-400 shadow-2xl">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-white truncate pr-2">{card.name}</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 h-auto"
          >
            <X size={16} />
          </Button>
        )}
      </div>
      
      {/* Immagine carta */}
      {card.art_link && (
        <div className="mb-3">
          <img 
            src={card.art_link} 
            alt={card.name}
            className="w-full h-48 object-cover rounded-lg border border-purple-300"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Info carta */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Tipo:</span>
          <span className="text-white font-medium">{card.type}</span>
        </div>
        
        {card.attribute && (
          <div className="flex justify-between">
            <span className="text-gray-300">Attributo:</span>
            <span className="text-white font-medium">{card.attribute}</span>
          </div>
        )}
        
        {card.star && (
          <div className="flex justify-between">
            <span className="text-gray-300">Livello:</span>
            <span className="text-white font-medium">⭐ {card.star}</span>
          </div>
        )}
        
        {(card.atk !== undefined || card.def !== undefined) && (
          <div className="flex justify-between">
            <span className="text-gray-300">ATK/DEF:</span>
            <span className="text-white font-medium">
              {card.atk || '?'} / {card.def || '?'}
            </span>
          </div>
        )}

        {card.cost && (
          <div className="flex justify-between">
            <span className="text-gray-300">Costo:</span>
            <span className="text-white font-medium">{card.cost}</span>
          </div>
        )}
        
        {card.extra_deck && (
          <Badge className="bg-purple-600 text-white">Extra Deck</Badge>
        )}
      </div>

      {/* Effetto */}
      {card.effect && (
        <div className="mt-3 pt-3 border-t border-slate-600">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Effetto:</h4>
          <p className="text-xs text-gray-200 bg-slate-800/50 p-2 rounded max-h-32 overflow-y-auto">
            {card.effect}
          </p>
        </div>
      )}
    </Card>
  );
};

interface DeckBuilderProps {
  availableCards: any[];
  onDeckSave: (deckData: any) => void;
  initialDeck?: any;
}

const DeckBuilder = ({ availableCards, onDeckSave, initialDeck }: DeckBuilderProps) => {
  const [deckName, setDeckName] = useState(initialDeck?.name || 'Il Mio Deck');
  // Modificato: ogni carta nel deck ha solo l'ID originale + count
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
        card.type.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      extraDeckCards: extra.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.type.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Import da JSON
  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const deckData = JSON.parse(e.target?.result as string);
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
        
        alert('Deck importato con successo!');
      } catch (error) {
        alert('Errore nell\'importazione del file JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Import da Excel
  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newMainDeck: {[cardId: number]: number} = {};
        const newExtraDeck: {[cardId: number]: number} = {};

        jsonData.forEach((row: any) => {
          const card = availableCards.find(c => c.name === row.Nome);
          if (card) {
            const quantity = parseInt(row.Quantità) || 1;
            if (row.Deck === 'Extra') {
              newExtraDeck[card.id] = (newExtraDeck[card.id] || 0) + quantity;
            } else {
              newMainDeck[card.id] = (newMainDeck[card.id] || 0) + quantity;
            }
          }
        });

        setMainDeck(newMainDeck);
        setExtraDeck(newExtraDeck);
        alert('Deck importato da Excel con successo!');
      } catch (error) {
        alert('Errore nell\'importazione del file Excel');
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
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
    const extraDeckArray = convertDeckToArray(extraDeck, true);

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

  // Export JSON
  const exportJSON = () => {
    const mainDeckArray = convertDeckToArray(mainDeck);
    const extraDeckArray = convertDeckToArray(extraDeck, true);

    const deckData = {
      name: deckName,
      mainDeck: mainDeckArray,
      extraDeck: extraDeckArray,
      cards: [...mainDeckArray, ...extraDeckArray]
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

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex gap-4">
        {/* Card Preview - Left Side */}
        <div className="w-80 flex-shrink-0">
          {previewCard ? (
            <ImprovedCardPreview 
              card={previewCard} 
              onClose={() => setPreviewCard(null)} 
            />
          ) : (
            <Card className="p-6 bg-slate-900 border-2 border-purple-400 h-96 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FileText size={48} className="mx-auto mb-4" />
                <p>Seleziona una carta per vedere i dettagli</p>
              </div>
            </Card>
          )}
        </div>

        {/* Main Deck Builder - Right Side */}
        <div className="flex-1">
          <Card className="p-4 bg-slate-900 border-2 border-purple-400">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="text-purple-400" size={24} />
                <h2 className="text-xl font-bold text-white">Deck Builder</h2>
              </div>
              <div className="flex gap-2">
                {/* Import Buttons */}
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload size={16} />
                      JSON
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importFromJSON}
                    className="hidden"
                  />
                </label>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload size={16} />
                      Excel
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={importFromExcel}
                    className="hidden"
                  />
                </label>
                {/* Export Buttons */}
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
                className="bg-slate-800 text-white border-slate-600"
              />
            </div>

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
                  {/* Main Deck Cards */}
                  <Card className="p-4 bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-white mb-3">Carte Main Deck</h3>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {mainDeckCards.map(card => (
                        <div 
                          key={card.id} 
                          className="flex items-center justify-between p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700/70"
                          onMouseEnter={() => setPreviewCard(card)}
                        >
                          <div className="flex-1">
                            <div className="text-white font-medium">{card.name}</div>
                            <div className="text-gray-400 text-sm">{card.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {mainDeck[card.id] || 0}/3
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => addCardToDeck(card)}
                              disabled={(mainDeck[card.id] || 0) >= 3}
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
                  <Card className="p-4 bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-white mb-3">Carte Extra Deck</h3>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {extraDeckCards.map(card => (
                        <div 
                          key={card.id} 
                          className="flex items-center justify-between p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700/70"
                          onMouseEnter={() => setPreviewCard(card)}
                        >
                          <div className="flex-1">
                            <div className="text-white font-medium">{card.name}</div>
                            <div className="text-gray-400 text-sm">{card.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {extraDeck[card.id] || 0}/3
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => addCardToDeck(card, true)}
                              disabled={(extraDeck[card.id] || 0) >= 3}
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
                <Card className="p-4 bg-slate-800/50">
                  <h3 className="text-lg font-semibold text-white mb-3">Main Deck ({mainDeckTotal})</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {Object.entries(mainDeck).map(([cardId, count]) => {
                      const card = availableCards.find(c => c.id === parseInt(cardId));
                      if (!card) return null;
                      return (
                        <div 
                          key={cardId}
                          className="flex items-center justify-between p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700/70"
                          onMouseEnter={() => setPreviewCard(card)}
                        >
                          <div className="flex-1">
                            <div className="text-white font-medium">{card.name}</div>
                            <div className="text-gray-400 text-sm">{card.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {count}x
                            </Badge>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeCardFromDeck(card.id)}
                            >
                              <Minus size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="extra-deck">
                <Card className="p-4 bg-slate-800/50">
                  <h3 className="text-lg font-semibold text-white mb-3">Extra Deck ({extraDeckTotal})</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {Object.entries(extraDeck).map(([cardId, count]) => {
                      const card = availableCards.find(c => c.id === parseInt(cardId));
                      if (!card) return null;
                      return (
                        <div 
                          key={cardId}
                          className="flex items-center justify-between p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700/70"
                          onMouseEnter={() => setPreviewCard(card)}
                        >
                          <div className="flex-1">
                            <div className="text-white font-medium">{card.name}</div>
                            <div className="text-gray-400 text-sm">{card.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {count}x
                            </Badge>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeCardFromDeck(card.id, true)}
                            >
                              <Minus size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
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
