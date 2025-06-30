import React from 'react';
import { SIDEBAR_WIDTH_PX } from '@/config/dimensions';
import ChatBox from '@/components/ChatBox';
import ActionHistory from '@/components/ActionHistory';
import DiceAndCoin from '@/components/DiceAndCoin';

interface RightSidebarProps {
  chatMessages: any[];
  actionLog: any[];
  onSendMessage: (message: string) => void;
  onDiceRoll: (result: number) => void;
  onCoinFlip: (result: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ chatMessages, actionLog, onSendMessage, onDiceRoll, onCoinFlip }) => {
  return (
    <aside style={{width: SIDEBAR_WIDTH_PX}} className="fixed top-0 right-0 h-full bg-slate-900/95 border-l border-slate-700 z-50 flex flex-col p-2 gap-3 shadow-xl">
      <div className="flex-1 bg-slate-800/90 rounded-lg p-2 border border-slate-700 flex flex-col min-h-[120px] max-h-60 overflow-auto">
        <ChatBox messages={chatMessages} onSendMessage={onSendMessage} />
      </div>
      <div className="flex-1 bg-slate-800/90 rounded-lg p-2 border border-slate-700 flex flex-col min-h-[80px] max-h-40 overflow-auto">
        <ActionHistory actions={actionLog} />
      </div>
      <div className="bg-slate-800/90 rounded-lg p-2 border border-slate-700">
        <DiceAndCoin onDiceRoll={onDiceRoll} onCoinFlip={onCoinFlip} onSendMessage={onSendMessage} />
      </div>
    </aside>
  );
};

export default RightSidebar; 