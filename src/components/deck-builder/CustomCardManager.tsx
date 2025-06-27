
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CustomCardManagerProps {
  onCardsUpdate: (cards: any[]) => void;
  availableCards: any[];
}

const CustomCardManager = ({ onCardsUpdate, availableCards }: CustomCardManagerProps) => {
  const [customCards, setCustomCards] = useState<any[]>([]);
  const [showSampleCards, setShowSampleCards] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('yugiduel_custom_cards');
    if (saved) {
      try {
        const cards = JSON.parse(saved);
        setCustomCards(cards);
        updateAvailableCards(cards);
      } catch (error) {
        console.error('Error loading custom cards:', error);
      }
    }
  }, []);

  const updateAvailableCards = (cards: any[]) => {
    let updatedCards = [...cards];
    
    if (showSampleCards) {
      // Importa le sample cards direttamente invece di usare require
      import('@/data/sampleCards.json').then(module => {
        const sampleCards = module.default.cards;
        const existingIds = new Set(cards.map(c => c.id));
        const uniqueSampleCards = sampleCards.filter((card: any) => !existingIds.has(card.id));
        const finalCards = [...cards, ...uniqueSampleCards];
        onCardsUpdate(finalCards);
      }).catch(error => {
        console.error('Error loading sample cards:', error);
        onCardsUpdate(cards);
      });
    } else {
      onCardsUpdate(updatedCards);
    }
  };

  useEffect(() => {
    updateAvailableCards(customCards);
  }, [showSampleCards]);

  const saveCustomCards = (cards: any[]) => {
    setCustomCards(cards);
    localStorage.setItem('yugiduel_custom_cards', JSON.stringify(cards));
    updateAvailableCards(cards);
  };

  const importCardsFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        let newCards: any[] = [];

        // Controlla se è un file di carte o un deck
        if (data.cards && Array.isArray(data.cards)) {
          // File di carte - aggiunge al database delle carte
          newCards = data.cards;
          importCards(newCards, 'carte dal file JSON');
        } else if (data.mainDeck && data.extraDeck) {
          // File deck - chiede cosa fare
          const choice = confirm(
            'Questo sembra essere un file deck. Vuoi:\n' +
            'OK = Importare solo le carte nel database\n' +
            'Annulla = Questo non è supportato qui (usa "Carica Deck" negli slot)'
          );
          if (choice) {
            newCards = [...(data.mainDeck || []), ...(data.extraDeck || [])];
            importCards(newCards, 'carte dal deck');
          }
        } else if (Array.isArray(data)) {
          // Array diretto di carte
          newCards = data;
          importCards(newCards, 'carte dal file JSON');
        } else {
          alert('Formato file non riconosciuto. Per importare un deck completo, usa la funzione "Carica Deck" negli slot di salvataggio.');
          return;
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Errore nell\'importazione del file JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const importCards = (newCards: any[], source: string) => {
    // Valida le carte
    const validCards = newCards.filter(card => 
      card.id && card.name && card.type
    );

    if (validCards.length === 0) {
      alert(`Nessuna carta valida trovata in ${source}.`);
      return;
    }

    // Evita duplicati basandosi sull'ID
    const existingIds = new Set(customCards.map(c => c.id));
    const uniqueCards = validCards.filter(card => !existingIds.has(card.id));
    
    if (uniqueCards.length === 0) {
      alert(`Tutte le carte in ${source} sono già state importate.`);
      return;
    }

    const updatedCards = [...customCards, ...uniqueCards];
    saveCustomCards(updatedCards);
    alert(`${uniqueCards.length} ${source} importate con successo!`);
  };

  const importCardsFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newCards = jsonData.map((row: any, index: number) => ({
          id: row.ID || Date.now() + index,
          name: row.Nome || row.Name || `Carta ${index + 1}`,
          type: row.Tipo || row.Type || 'Monster',
          attribute: row.Attributo || row.Attribute || null,
          star: row.Livello || row.Level || null,
          atk: row.ATK || null,
          def: row.DEF || null,
          effect: row.Effetto || row.Effect || null,
          extra_deck: (row.Deck === 'Extra' || row.ExtraDeck === true),
          art_link: row.Immagine || row.Image || null,
          cost: row.Costo || row.Cost || null
        }));

        importCards(newCards, 'carte da Excel');
      } catch (error) {
        console.error('Excel import error:', error);
        alert('Errore nell\'importazione del file Excel');
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const exportCardsToJSON = () => {
    if (customCards.length === 0) {
      alert('Nessuna carta personalizzata da esportare.');
      return;
    }

    const dataStr = JSON.stringify({ cards: customCards }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carte_personalizzate.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearCustomCards = () => {
    if (confirm('Sei sicuro di voler eliminare tutte le carte personalizzate?')) {
      saveCustomCards([]);
      alert('Carte personalizzate eliminate!');
    }
  };

  const toggleSampleCards = () => {
    setShowSampleCards(!showSampleCards);
  };

  return (
    <Card className="p-4 bg-slate-800/50 mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">Gestione Carte Database</h3>
      
      <div className="mb-3 p-3 bg-blue-900/30 rounded border border-blue-400">
        <p className="text-blue-200 text-sm">
          <FileText size={16} className="inline mr-2" />
          <strong>Nota:</strong> Qui importi carte nel tuo database personale. Per caricare un deck completo, usa gli slot di salvataggio a sinistra.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Toggle carte sample */}
        <Button
          onClick={toggleSampleCards}
          variant={showSampleCards ? "default" : "outline"}
          size="sm"
          className={showSampleCards ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {showSampleCards ? <Eye size={16} /> : <EyeOff size={16} />}
          {showSampleCards ? 'Nascondi Sample' : 'Mostra Sample'}
        </Button>

        {/* Import buttons */}
        <label className="cursor-pointer">
          <Button variant="outline" size="sm" asChild>
            <span>
              <Upload size={16} />
              Import Carte JSON
            </span>
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={importCardsFromJSON}
            className="hidden"
          />
        </label>

        <label className="cursor-pointer">
          <Button variant="outline" size="sm" asChild>
            <span>
              <Upload size={16} />
              Import Carte Excel
            </span>
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={importCardsFromExcel}
            className="hidden"
          />
        </label>

        {/* Export button */}
        <Button
          onClick={exportCardsToJSON}
          variant="outline"
          size="sm"
          disabled={customCards.length === 0}
        >
          <Download size={16} />
          Export Carte JSON
        </Button>

        {/* Clear button */}
        <Button
          onClick={clearCustomCards}
          variant="destructive"
          size="sm"
          disabled={customCards.length === 0}
        >
          <Trash2 size={16} />
          Elimina Tutte
        </Button>
      </div>

      <div className="flex gap-4 text-sm">
        <Badge className="bg-blue-600">
          Carte Personalizzate: {customCards.length}
        </Badge>
        <Badge className="bg-green-600">
          Carte Disponibili: {availableCards.length}
        </Badge>
        {showSampleCards && (
          <Badge className="bg-purple-600">
            Sample Cards Attive
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default CustomCardManager;
