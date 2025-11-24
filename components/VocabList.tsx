import React, { useState } from 'react';
import { VocabularyWord } from '../types';

interface VocabListProps {
  words: VocabularyWord[];
  onAdd: (word: string, def: string) => void;
  onDelete: (id: string) => void;
}

const VocabList: React.FC<VocabListProps> = ({ words, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newDef, setNewDef] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim() && newDef.trim()) {
      onAdd(newWord.trim(), newDef.trim());
      setNewWord("");
      setNewDef("");
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4 min-h-full bg-gray-50 pb-20">
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">My Words</h2>
           <p className="text-gray-500 text-sm">{words.length} words collected</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-indigo-700 transition-colors"
        >
          {isAdding ? '✕' : '+'}
        </button>
      </div>

      {/* Add Word Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md border border-indigo-100 mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Word</label>
              <input 
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g., Ephemeral"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Definition</label>
              <input 
                value={newDef}
                onChange={e => setNewDef(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Brief meaning..."
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm mt-2">
              Save Word
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {words.length === 0 && !isAdding && (
        <div className="text-center py-12 px-6">
          <div className="text-5xl mb-4 grayscale opacity-50">📖</div>
          <p className="text-gray-500 mb-2">Your vocabulary book is empty.</p>
          <p className="text-gray-400 text-sm">Add words manually or use the Discover tab to find new ones.</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {[...words].reverse().map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between group">
            <div className="pr-4">
              <h3 className="font-bold text-gray-800 text-lg">{item.word}</h3>
              <p className="text-gray-600 text-sm leading-snug">{item.definition}</p>
            </div>
            <button 
              onClick={() => onDelete(item.id)}
              className="text-gray-300 hover:text-red-500 self-start p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocabList;
