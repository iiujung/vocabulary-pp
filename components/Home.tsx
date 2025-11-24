import React, { useState } from 'react';
import { generateDailyChallenge, generateCrosswordFromList } from '../services/geminiService';
import { CrosswordData, VocabularyWord } from '../types';
import CrosswordBoard from './CrosswordBoard';

interface HomeProps {
  userVocab: VocabularyWord[];
}

const Home: React.FC<HomeProps> = ({ userVocab }) => {
  const [activePuzzle, setActivePuzzle] = useState<CrosswordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDailyChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateDailyChallenge();
      setActivePuzzle(data);
    } catch (err) {
      setError("Failed to create puzzle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startMyVocabPuzzle = async () => {
    if (userVocab.length < 5) {
      setError("Add at least 5 words to your vocabulary first!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Pick random 15 words if vocab is large, to keep prompt concise
      const shuffled = [...userVocab].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 15);
      
      const data = await generateCrosswordFromList(selected);
      setActivePuzzle({ ...data, theme: "My Vocabulary" });
    } catch (err) {
      setError("Could not generate a puzzle from your words. Try adding more variety.");
    } finally {
      setLoading(false);
    }
  };

  if (activePuzzle) {
    return (
      <div className="absolute inset-0 z-50 bg-white">
        <CrosswordBoard 
          data={activePuzzle} 
          onComplete={() => {}} 
          onBack={() => setActivePuzzle(null)} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Intro */}
      <div className="text-center mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Ready to Play?</h2>
        <p className="text-gray-500">Challenge yourself with daily puzzles or review your own words.</p>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <CardButton 
          title="Daily Challenge" 
          description="A fresh puzzle generated just for today."
          color="bg-orange-500"
          icon="☀️"
          onClick={startDailyChallenge}
        />
        
        <CardButton 
          title="My Vocab Puzzle" 
          description="Review words from your personal collection."
          color="bg-indigo-600"
          icon="📚"
          onClick={startMyVocabPuzzle}
        />
      </div>

      {/* Loading State Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-800 font-medium animate-pulse">Generating Puzzle...</p>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg border border-red-200 text-sm font-medium z-50 flex items-center">
          <span className="mr-2">⚠️</span> {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-800 font-bold">✕</button>
        </div>
      )}
    </div>
  );
};

const CardButton = ({ title, description, color, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-left group"
  >
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-3xl shadow-sm text-white shrink-0 group-hover:rotate-6 transition-transform`}>
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 leading-tight mt-1">{description}</p>
    </div>
  </button>
);

export default Home;
