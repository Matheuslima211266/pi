
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    loadCustomCards();
  }, []);

  const loadCustomCards = async () => {
    const saved = localStorage.getItem('yugiduel_custom_cards');
    if (saved) {
      try {
        const cards = JSON.parse(saved);
        setCustomCards(cards);
        updateAvailableCards(cards, showSampleCards);
      } catch (error) {
        console.error('Error loading custom cards:', error);
      }
    } else {
      updateAvailableCards([], showSampleCards);
    }
  };

  const updateAvailableCards = async (cards: any[], includeSampleCards: boolean) => {
    let updatedCards = [...cards];
    
    if (includeSampleCards) {
      try {
        const sampleCardsModule = await import('@/data/sampleCards.json');
        const sampleCards = sampleCardsModule.default.cards;
        const existingIds = new Set(cards.map(c => c.id));
        const uniqueSampleCards = sampleCards.filter((card: any) => !existingIds.has(card.id));
        updatedCards = [...cards, ...uniqueSampleCards];
      } catch (error) {
        console.error('Error loading sample cards:', error);
      }
    }
    
    onCardsUpdate(updatedCards);
  };

  useEffect(() => {
    updateAvailableCards(customCards, showSampleCards);
  }, [showSampleCards, customCards]);

  const saveCustomCards = (cards: any[]) => {
    setCustomCards(cards);
    localStorage.setItem('yugiduel_custom_cards', JSON.stringify(cards));
    updateAvailableCards(cards, showSampleCards);
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
          // File deck - estrae le carte uniche dal deck
          const allDeckCards = [...(data.mainDeck || []), ...(data.extraDeck || [])];
          
          // Estrae carte uniche (per evitare duplicati se una carta è presente più volte)
          const uniqueCards = allDeckCards.reduce((acc: any[], card: any) => {
            if (!acc.find(c => c.id === card.id)) {
              acc.push(card);
            }
            return acc;
          }, []);
          
          newCards = uniqueCards;
          importCards(newCards, 'carte estratte dal deck');
        } else if (Array.isArray(data)) {
          // Array diretto di carte
          newCards = data;
          importCards(newCards, 'carte dal file JSON');
        } else {
          alert('Formato file non riconosciuto. Questo strumento importa solo carte nel database.');
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
    alert(`${uniqueCards.length} ${source} importate con successo nel database!`);
  };

  // Aggiornata per supportare la nuova struttura Excel
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

        const newCards = jsonData.map((row: any, index: number) => {
          // Gestione della nuova struttura Excel
          const isExtraDeck = ['fusion', 'synchro', 'xyz', 'link', 'pendulum'].includes(
            (row.Frame || row.Type || '').toLowerCase()
          );
          
          // Determina il tipo di carta dalla colonna Frame o Type Ability
          let cardType = 'Monster';
          const frameValue = (row.Frame || '').toLowerCase();
          const typeAbility = (row['Type Ability'] || '').toLowerCase();
          
          if (frameValue.includes('spell') || frameValue.includes('magic') || typeAbility.includes('magia')) {
            cardType = 'Spell';
          } else if (frameValue.includes('trap') || typeAbility.includes('trappola')) {
            cardType = 'Trap';
          } else if (frameValue === 'effect' || typeAbility.includes('effetto')) {
            cardType = 'Effect Monster';
          }

          return {
            id: row.ID || Date.now() + index + Math.random(),
            name: row.Name || row.Nome || `Carta ${index + 1}`,
            type: cardType,
            attribute: row.Attribute || row.Attributo || null,
            star: parseInt(row.Star || row.Livello || 0) || null,
            atk: parseInt(row.ATK || 0) || null,
            def: parseInt(row.DEF || 0) || null,
            effect: row.Effect || row.Effetto || null,
            extra_deck: isExtraDeck,
            art_link: row['Art Link'] || row.Immagine || row.Image || null,
            // Nuovi campi dalla struttura Excel
            frame: row.Frame || null,
            spellTrapIcon: row['Spell/Trap Icon'] || null,
            typeAbility: row['Type Ability'] || null
          };
        });

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
      <h3 className="text-lg font-semibold text-white mb-3">Database Carte Personali</h3>
      
      <div className="mb-3 p-3 bg-blue-900/30 rounded border border-blue-400">
        <p className="text-blue-200 text-sm">
          <FileText size={16} className="inline mr-2" />
          <strong>Gestisci il tuo database di carte:</strong> Importa carte qui per aggiungerle al tuo database personale. 
          Supporta Excel con colonne: Frame, Name, Attribute, Star, Spell/Trap Icon, Art Link, Type Ability, Effect, ATK, DEF.
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
              Importa Carte JSON
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
              Importa Carte Excel
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
          Esporta Database JSON
        </Button>

        {/* Clear button */}
        <Button
          onClick={clearCustomCards}
          variant="destructive"
          size="sm"
          disabled={customCards.length === 0}
        >
          <Trash2 size={16} />
          Svuota Database
        </Button>
      </div>

      <div className="flex gap-4 text-sm">
        <Badge className="bg-blue-600">
          Carte Personali: {customCards.length}
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
