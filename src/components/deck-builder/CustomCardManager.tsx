
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, Eye, EyeOff } from 'lucide-react';
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
      // Aggiungi le carte sample se il toggle è attivo
      const sampleCards = require('@/data/sampleCards.json').cards;
      // Evita duplicati basandosi sull'ID
      const existingIds = new Set(cards.map(c => c.id));
      const uniqueSampleCards = sampleCards.filter((card: any) => !existingIds.has(card.id));
      updatedCards = [...cards, ...uniqueSampleCards];
    }
    
    onCardsUpdate(updatedCards);
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

        if (data.cards && Array.isArray(data.cards)) {
          // File di carte
          newCards = data.cards;
        } else if (Array.isArray(data)) {
          // Array diretto di carte
          newCards = data;
        } else {
          alert('Formato file non riconosciuto. Usa un file con array di carte o oggetto con proprietà "cards".');
          return;
        }

        // Valida le carte
        const validCards = newCards.filter(card => 
          card.id && card.name && card.type
        );

        if (validCards.length === 0) {
          alert('Nessuna carta valida trovata nel file.');
          return;
        }

        // Evita duplicati basandosi sull'ID
        const existingIds = new Set(customCards.map(c => c.id));
        const uniqueCards = validCards.filter(card => !existingIds.has(card.id));
        
        if (uniqueCards.length === 0) {
          alert('Tutte le carte nel file sono già state importate.');
          return;
        }

        const updatedCards = [...customCards, ...uniqueCards];
        saveCustomCards(updatedCards);
        alert(`${uniqueCards.length} carte importate con successo!`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Errore nell\'importazione del file JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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

        // Filtra carte valide
        const validCards = newCards.filter(card => 
          card.name && card.type
        );

        if (validCards.length === 0) {
          alert('Nessuna carta valida trovata nel file Excel.');
          return;
        }

        // Evita duplicati
        const existingIds = new Set(customCards.map(c => c.id));
        const uniqueCards = validCards.filter(card => !existingIds.has(card.id));

        const updatedCards = [...customCards, ...uniqueCards];
        saveCustomCards(updatedCards);
        alert(`${uniqueCards.length} carte importate da Excel con successo!`);
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
      <h3 className="text-lg font-semibold text-white mb-3">Gestione Carte</h3>
      
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
              Import JSON
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
              Import Excel
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
          Export JSON
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
