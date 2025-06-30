import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ATKEditModalProps {
  isOpen: boolean;
  card: any;
  newATK: number;
  setNewATK: (value: number) => void;
  onSave: () => void;
  onClose: () => void;
}

const ATKEditModal: React.FC<ATKEditModalProps> = ({
  isOpen,
  card,
  newATK,
  setNewATK,
  onSave,
  onClose
}) => {
  const [prefHost,  setPrefHost]  = useState<boolean|null>(null);
  const [prefGuest, setPrefGuest] = useState<boolean|null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/50 z-50"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-popover p-4 rounded-lg border border-border min-w-64">
        <h3 className="text-foreground font-bold mb-3">Edit ATK - {card.name}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground text-sm">Current ATK: {card.atk}</label>
            <Input
              type="number"
              value={newATK}
              onChange={(e) => setNewATK(parseInt(e.target.value) || 0)}
              className="bg-input text-foreground border-border"
              placeholder="New ATK value"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} className="bg-accent text-accent-foreground">
              Save
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ATKEditModal;
