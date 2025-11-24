import React, { useState } from 'react';
import { discoverNewWords } from '../services/geminiService';
import { VocabularyWord } from '../types';

interface DiscoverProps {
  existingWords: VocabularyWord[];
  onAddWord: (word: string, def: string) => void;
}

const Discover: React.FC<DiscoverProps> = ({ existingWords, onAddWord }) => {
  const [topic, setTopic] = useState("");
  const [suggestions, setSuggestions] = useState<Omit<VocabularyWord, 'id' | 'addedAt'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIndices, setAddedIndices] = useState<number[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setSuggestions([]);
    setAddedIndices([]);

    try {
      const results = await discoverNewWords(topic, existingWords);
      setSuggestions(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (word: string, def: string, index: number) => {
    onAddWord(word, def);
    setAddedIndices([...addedIndices, index]);
  };

  return (
    <div className="p-5 pb-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Discover New Words</h2>
      
      <form onSubmit={handleSearch} className="mb-8">
        <label className="text-sm font-semibold text-gray-500 mb-2 block">What are you interested in?</label>
        <div className="relative">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Cooking, Space, Office Politics..."
            className="w-full p-4 pr-12 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none shadow-sm text-lg"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white rounded-lg px-4 font-bold disabled:bg-gray-300"
          >
            {loading ? '...' : 'Go'}
          </button>
        </div>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
           {[1,2,3].map(i => (
             <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
           ))}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {suggestions.map((item, idx) => {
          const isAdded = addedIndices.includes(idx);
          return (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-lg text-gray-800">{item.word}</h3>
                <p className="text-sm text-gray-500">{item.definition}</p>
              </div>
              <button
                onClick={() => !isAdded && handleAdd(item.word, item.definition, idx)}
                disabled={isAdded}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors shrink-0
                  ${isAdded 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
              >
                {isAdded ? '✓' : '+'}
              </button>
            </div>
          );
        })}
      </div>

      {!loading && suggestions.length === 0 && topic && (
         <div className="text-center text-gray-400 mt-10">
           Enter a topic to generate words.
         </div>
      )}
    </div>
  );
};

export default Discover;
