import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import VocabList from './components/VocabList';
import Discover from './components/Discover';
import { AppTab, VocabularyWord } from './types';

const STORAGE_KEY = 'wordcross_vocab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);

  // Load vocabulary from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setVocabulary(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse vocabulary", e);
      }
    }
  }, []);

  // Save to local storage whenever vocab changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabulary));
  }, [vocabulary]);

  const addWord = (word: string, def: string) => {
    const newWord: VocabularyWord = {
      id: Date.now().toString(),
      word,
      definition: def,
      addedAt: Date.now()
    };
    setVocabulary(prev => [...prev, newWord]);
  };

  const deleteWord = (id: string) => {
    setVocabulary(prev => prev.filter(w => w.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return <Home userVocab={vocabulary} />;
      case AppTab.VOCAB:
        return <VocabList words={vocabulary} onAdd={addWord} onDelete={deleteWord} />;
      case AppTab.DISCOVER:
        return <Discover existingWords={vocabulary} onAddWord={addWord} />;
      default:
        return <Home userVocab={vocabulary} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
