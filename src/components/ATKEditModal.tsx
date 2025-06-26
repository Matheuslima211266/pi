
import React from 'react';
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
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 p-4 rounded-lg border border-gray-600 min-w-64">
        <h3 className="text-white font-bold mb-3">Edit ATK - {card.name}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-gray-300 text-sm">Current ATK: {card.atk}</label>
            <Input
              type="number"
              value={newATK}
              onChange={(e) => setNewATK(parseInt(e.target.value) || 0)}
              className="bg-gray-700 text-white border-gray-600"
              placeholder="New ATK value"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
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
