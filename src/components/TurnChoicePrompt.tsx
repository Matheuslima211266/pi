import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TurnChoicePromptProps {
  isWinner: boolean;
  onChoose: (goFirst: boolean) => void;
}

const TurnChoicePrompt: React.FC<TurnChoicePromptProps> = ({ isWinner, onChoose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <Card className="bg-slate-800 p-6 w-80 text-center space-y-4 border-purple-400">
        {isWinner ? (
          <>
            <h2 className="text-white text-lg font-bold">Hai vinto il mini-game!</h2>
            <p className="text-gray-300 text-sm">Scegli se iniziare per primo o secondo.</p>
            <div className="flex flex-col gap-3">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onChoose(true)}>
                🚀 Voglio partire per primo
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => onChoose(false)}>
                🛡️ Preferisco secondo
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-white text-lg font-bold">L'avversario sta decidendo…</h2>
            <p className="text-gray-300 text-sm">Attendi la sua scelta.</p>
          </>
        )}
      </Card>
    </div>
  );
};

export default TurnChoicePrompt; 