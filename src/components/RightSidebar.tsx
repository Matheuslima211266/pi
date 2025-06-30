import React from 'react';
import { SIDEBAR_WIDTH_PX } from '@/config/dimensions';
import ChatBox from '@/components/ChatBox';
import ActionHistory from '@/components/ActionHistory';
import ToolsPanel from './ToolsPanel';

interface RightSidebarProps {
  chatMessages: any[];
  actionLog: any[];
  onSendMessage: (message: string) => void;
  onDiceRoll: (result: number) => void;
  onCoinFlip: (result: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ chatMessages, actionLog, onSendMessage, onDiceRoll, onCoinFlip }) => {
  return (
    <aside 
      style={{width: SIDEBAR_WIDTH_PX}} 
      className="fixed top-0 right-0 h-full bg-background/95 border-l border-border z-50 flex flex-col p-2 gap-3 shadow-xl"
    >
      <div className="bg-card/90 rounded-lg p-2 border border-border flex flex-col flex-grow min-h-0">
        <ChatBox messages={chatMessages} onSendMessage={onSendMessage} />
      </div>
      <div className="bg-card/90 rounded-lg p-2 border border-border flex flex-col flex-shrink-0" style={{maxHeight: '33%'}}>
        <ActionHistory actions={actionLog} />
      </div>
      <div className="flex-shrink-0">
        <ToolsPanel 
          onDiceRoll={onDiceRoll} 
          onCoinFlip={onCoinFlip} 
          onSendMessage={onSendMessage} 
        />
      </div>
    </aside>
  );
};

export default RightSidebar; 