
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download } from 'lucide-react';

const DeckBuilder = ({ onDeckLoad }: { onDeckLoad?: (deckData: any) => void }) => {
  const [deckInfo, setDeckInfo] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const deckData = JSON.parse(result);
            setDeckInfo({
              name: deckData.name || 'Deck Personalizzato',
              cards: deckData.cards || [],
              totalCards: deckData.cards?.length || 0
            });
            onDeckLoad && onDeckLoad(deckData);
          }
        } catch (error) {
          console.error('Errore nel caricamento del deck:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const exportDeck = () => {
    // Placeholder per export deck
    const deckData = {
      name: "Il Mio Deck",
      cards: [] // qui andrebbero le carte attuali
    };
    const dataStr = JSON.stringify(deckData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-deck.json';
    link.click();
  };

  return (
    <Card className="p-4 bg-slate-800/70 border-purple-400">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="text-purple-400" size={20} />
        <h3 className="text-lg font-semibold">Deck Builder</h3>
      </div>
      
      <div className="space-y-3">
        {deckInfo && (
          <div className="p-3 bg-purple-900/30 rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{deckInfo.name}</div>
                <Badge variant="outline" className="text-xs">
                  {deckInfo.totalCards} carte
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={() => document.getElementById('deck-upload')?.click()}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
          >
            <Upload size={16} />
            Carica Deck
          </Button>
          <Button
            onClick={exportDeck}
            variant="outline"
            className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
          >
            <Download size={16} />
            Export
          </Button>
        </div>
        
        <input
          id="deck-upload"
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
};

export default DeckBuilder;
