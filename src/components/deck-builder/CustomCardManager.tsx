import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useFirebaseCardDB } from '@/hooks/useFirebaseCardDB';
import { EXCEL_COLUMN_MAPPING, EXTRA_DECK_KEYWORDS } from '@/config/cardImport';

interface CustomCardManagerProps {
  onCardsUpdate: (cards: any[]) => void;
  availableCards: any[];
  isHost?: boolean;
}

// Helper configuration inspired by excelJson.py for robust Excel → Card mapping
// MOVED TO a SEPARATE CONFIGURATION FILE

// Keywords that identify Extra deck cards (same list of excelJson.py)
// MOVED TO a SEPARATE CONFIGURATION FILE

// Utility helpers mirroring excelJson.py behaviour
const determineCardType = (spellTrapValue: any): 'monster' | 'spell' | 'trap' => {
  if (spellTrapValue == null) return 'monster';
  const str = String(spellTrapValue).toLowerCase();
  if (str.includes('spell') || str.includes('magia')) return 'spell';
  if (str.includes('trap') || str.includes('trappola')) return 'trap';
  return 'monster';
};

const determineExtraDeck = (typeAbility: any): 0 | 1 => {
  if (typeAbility == null) return 0;
  const str = String(typeAbility).toLowerCase();
  return EXTRA_DECK_KEYWORDS.some(keyword => str.includes(keyword)) ? 1 : 0;
};

const normalizeStat = (value: any): number => {
  if (value == null || value === '') return 0;
  const intVal = parseInt(value as string, 10);
  if (isNaN(intVal)) return 0;
  return intVal >= 100 ? Math.floor(intVal / 100) : intVal;
};

// Finds the matching column name of the sheet for each desired field
const mapExcelColumns = (sheetHeaders: string[]): Record<string, string | undefined> => {
  const lowerHeaders = sheetHeaders.map(h => h.toLowerCase());
  const mapped: Record<string, string | undefined> = {};
  Object.entries(EXCEL_COLUMN_MAPPING).forEach(([key, possible]) => {
    const idx = lowerHeaders.findIndex(h => possible.map(p => p.toLowerCase()).includes(h));
    if (idx !== -1) {
      mapped[key] = sheetHeaders[idx];
    }
  });
  return mapped;
};

const CustomCardManager = ({ onCardsUpdate, availableCards, isHost = false }: CustomCardManagerProps) => {
  const [customCards, setCustomCards] = useState<any[]>([]);
  const [showSampleCards, setShowSampleCards] = useState(false);
  const { saveCard } = useFirebaseCardDB();

  useEffect(() => {
    loadCustomCards();
  }, []);

  const loadCustomCards = async () => {
    const saved = localStorage.getItem('simsupremo_custom_cards');
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
    localStorage.setItem('simsupremo_custom_cards', JSON.stringify(cards));
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

    // Salva anche su Firebase (ignore errors silently)
    uniqueCards.forEach(card => {
      saveCard(card, isHost).catch(err => console.error('saveCard error', err));
    });
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
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          alert('Il file Excel è vuoto o non contiene dati leggibili.');
          return;
        }

        // Mappa le colonne del foglio usando la configurazione avanzata
        const headers = Object.keys(jsonData[0]);
        const mappedColumns = mapExcelColumns(headers);

        // Determina l'archetipo dal nome del file (senza estensione)
        const archetypeName = file.name.replace(/\.[^.]+$/, '');

        const newCards = jsonData.map((row: any, index: number) => {
          const getVal = (key: string) => {
            const col = mappedColumns[key];
            return col ? row[col] : '';
          };

          const rawId = getVal('id');
          const rawName = getVal('name');
          const rawAttribute = getVal('attribute');
          const rawStar = getVal('star');
          const rawSpellTrap = getVal('spell_trap');
          const rawIcon = getVal('icon') || 'NO ICON';
          const rawArtLink = getVal('art_link');
          const rawFinalCardArt = getVal('final_card_art');
          const rawTypeAbility = getVal('type_ability');
          const rawEffect = getVal('effect');
          const rawAtk = getVal('atk');
          const rawDef = getVal('def');

          const cardType = determineCardType(rawSpellTrap);
          const extraDeck = determineExtraDeck(rawTypeAbility);

          return {
            id: rawId !== '' ? parseInt(rawId, 10) : index + 1 + Date.now(),
            name: rawName || `Carta ${index + 1}`,
            attribute: rawAttribute || '',
            star: rawStar !== '' ? (parseInt(rawStar, 10) || 0) : 0,
            type: rawTypeAbility || cardType, // descrizione completa tipo/abilità o fallback
            effect: rawEffect || '',
            atk: normalizeStat(rawAtk),
            def: normalizeStat(rawDef),
            icon: rawIcon,
            art_link: rawArtLink || '',
            final_card_art: rawFinalCardArt || '',
            card_type: cardType,
            extra_deck: extraDeck,
            // campo opzionale se presente
            ...(rawSpellTrap ? { spell_trap_type: rawSpellTrap } : {}),
            archetype: archetypeName
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
