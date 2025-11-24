import React, { useState, useEffect, useRef } from 'react';
import { CrosswordData, CrosswordWord, GridCell } from '../types';

interface CrosswordBoardProps {
  data: CrosswordData;
  onComplete: () => void;
  onBack: () => void;
}

const GRID_SIZE = 12;

const CrosswordBoard: React.FC<CrosswordBoardProps> = ({ data, onComplete, onBack }) => {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<CrosswordWord | null>(null);
  const [solved, setSolved] = useState(false);
  
  // Initialize Grid
  useEffect(() => {
    const newGrid: GridCell[][] = Array(GRID_SIZE).fill(null).map((_, r) => 
      Array(GRID_SIZE).fill(null).map((_, c) => ({
        row: r,
        col: c,
        value: '',
        isBlack: true
      }))
    );

    let wordCounter = 1;
    const wordStartMap = new Map<string, number>();

    data.words.forEach(word => {
      const key = `${word.row}-${word.col}`;
      if (!wordStartMap.has(key)) {
        wordStartMap.set(key, wordCounter++);
      }
      
      const num = wordStartMap.get(key);

      // Place word on grid
      for (let i = 0; i < word.answer.length; i++) {
        const r = word.orientation === 'across' ? word.row : word.row + i;
        const c = word.orientation === 'across' ? word.col + i : word.col;
        
        if (r < GRID_SIZE && c < GRID_SIZE) {
          newGrid[r][c].isBlack = false;
          newGrid[r][c].value = word.answer[i].toUpperCase();
          if (i === 0) newGrid[r][c].num = num;
        }
      }
    });

    setGrid(newGrid);
    setUserInputs({});
    setSolved(false);
    setSelectedCell(null);
    setSelectedWord(null);
  }, [data]);

  // Handle Input
  const handleCellClick = (r: number, c: number) => {
    if (grid[r][c].isBlack) return;

    setSelectedCell({ row: r, col: c });

    // Find if this cell belongs to a word, prefer the direction of current selection if overlapping
    const wordsAtCell = data.words.filter(w => {
      const isAcross = w.orientation === 'across';
      const len = w.answer.length;
      if (isAcross) return r === w.row && c >= w.col && c < w.col + len;
      else return c === w.col && r >= w.row && r < w.row + len;
    });

    if (wordsAtCell.length > 0) {
      // Logic to toggle direction if clicked again or pick best fit
      if (selectedWord && wordsAtCell.includes(selectedWord) && wordsAtCell.length > 1) {
         const otherWord = wordsAtCell.find(w => w !== selectedWord);
         if (otherWord) setSelectedWord(otherWord);
      } else {
         setSelectedWord(wordsAtCell[0]);
      }
    }
  };

  const handleInputChange = (char: string) => {
    if (!selectedCell || solved) return;
    
    const val = char.toUpperCase();
    if (!/^[A-Z]$/.test(val)) return;

    const key = `${selectedCell.row}-${selectedCell.col}`;
    const newInputs = { ...userInputs, [key]: val };
    setUserInputs(newInputs);

    checkCompletion(newInputs);

    // Auto-advance
    if (selectedWord) {
      const isAcross = selectedWord.orientation === 'across';
      const nextR = isAcross ? selectedCell.row : selectedCell.row + 1;
      const nextC = isAcross ? selectedCell.col + 1 : selectedCell.col;
      
      // Check boundaries and if next cell is valid part of word
      const wordEndR = isAcross ? selectedWord.row : selectedWord.row + selectedWord.answer.length;
      const wordEndC = isAcross ? selectedWord.col + selectedWord.answer.length : selectedWord.col;

      if (nextR < wordEndR && nextC < wordEndC) {
         setSelectedCell({ row: nextR, col: nextC });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    
    if (e.key === 'Backspace') {
       const key = `${selectedCell.row}-${selectedCell.col}`;
       const newInputs = { ...userInputs };
       delete newInputs[key];
       setUserInputs(newInputs);
       
       // Move back
       if (selectedWord) {
         const isAcross = selectedWord.orientation === 'across';
         const prevR = isAcross ? selectedCell.row : selectedCell.row - 1;
         const prevC = isAcross ? selectedCell.col - 1 : selectedCell.col;
         
         if (prevR >= selectedWord.row && prevC >= selectedWord.col) {
            setSelectedCell({ row: prevR, col: prevC });
         }
       }
    }
  };

  // Virtual Keyboard Input for Mobile
  const handleVirtualKey = (key: string) => {
    if (key === 'DEL') {
      handleKeyDown({ key: 'Backspace' } as any);
    } else {
      handleInputChange(key);
    }
  };

  const checkCompletion = (inputs: Record<string, string>) => {
    let allCorrect = true;
    let filledCount = 0;
    let totalLetters = 0;

    data.words.forEach(w => {
      for(let i=0; i<w.answer.length; i++) {
        totalLetters++;
        const r = w.orientation === 'across' ? w.row : w.row + i;
        const c = w.orientation === 'across' ? w.col + i : w.col;
        const key = `${r}-${c}`;
        if (inputs[key] !== w.answer[i].toUpperCase()) {
          allCorrect = false;
        }
        if (inputs[key]) filledCount++;
      }
    });

    if (allCorrect && filledCount === totalLetters) {
      setSolved(true);
      onComplete();
    }
  };

  // Render Helpers
  const isSelected = (r: number, c: number) => selectedCell?.row === r && selectedCell?.col === c;
  const isPartOfSelectedWord = (r: number, c: number) => {
    if (!selectedWord) return false;
    const isAcross = selectedWord.orientation === 'across';
    const len = selectedWord.answer.length;
    if (isAcross) return r === selectedWord.row && c >= selectedWord.col && c < selectedWord.col + len;
    else return c === selectedWord.col && r >= selectedWord.row && r < selectedWord.row + len;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white p-3 shadow-sm flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium text-sm flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Exit
        </button>
        <span className="font-bold text-indigo-700">{data.theme}</span>
        <div className="w-12"></div>
      </div>

      {/* Clue Display */}
      <div className="bg-indigo-600 px-4 py-3 text-white shadow-md">
        <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider block mb-1">Current Clue</span>
        <p className="text-sm font-medium h-10 overflow-y-auto">
          {selectedWord ? selectedWord.clue : "Tap a white box to start"}
        </p>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-100/50">
        <div 
          className="grid gap-[2px] bg-gray-300 p-[2px] rounded shadow-lg border border-gray-300 select-none"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, width: 'min(100%, 360px)', aspectRatio: '1/1' }}
        >
          {grid.map((row, rIdx) => (
            row.map((cell, cIdx) => {
              const isActive = isSelected(rIdx, cIdx);
              const isWordPart = isPartOfSelectedWord(rIdx, cIdx);
              const inputValue = userInputs[`${rIdx}-${cIdx}`] || '';
              
              if (cell.isBlack) {
                return <div key={`${rIdx}-${cIdx}`} className="bg-gray-800/90 rounded-sm" />;
              }

              return (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  className={`
                    relative flex items-center justify-center text-lg font-bold uppercase cursor-pointer transition-colors duration-100
                    ${isActive ? 'bg-yellow-200 text-yellow-900' : isWordPart ? 'bg-indigo-100 text-indigo-900' : 'bg-white text-gray-800'}
                    ${solved ? 'text-green-600 bg-green-50' : ''}
                  `}
                >
                  {cell.num && <span className="absolute top-0.5 left-0.5 text-[0.55rem] font-normal text-gray-500 leading-none">{cell.num}</span>}
                  {inputValue}
                </div>
              );
            })
          ))}
        </div>
      </div>

      {/* Virtual Keyboard (Bottom Sheet) */}
      {!solved && (
        <div className="bg-white border-t border-gray-200 p-2 pb-6">
          <div className="flex justify-center flex-wrap gap-1.5 max-w-sm mx-auto">
            {['Q','W','E','R','T','Y','U','I','O','P'].map(char => (
               <KeyBtn key={char} char={char} onClick={handleVirtualKey} />
            ))}
            <div className="w-full flex justify-center gap-1.5 mt-1">
              {['A','S','D','F','G','H','J','K','L'].map(char => (
                 <KeyBtn key={char} char={char} onClick={handleVirtualKey} />
              ))}
            </div>
            <div className="w-full flex justify-center gap-1.5 mt-1">
              <KeyBtn char="Z" onClick={handleVirtualKey} />
              <KeyBtn char="X" onClick={handleVirtualKey} />
              <KeyBtn char="C" onClick={handleVirtualKey} />
              <KeyBtn char="V" onClick={handleVirtualKey} />
              <KeyBtn char="B" onClick={handleVirtualKey} />
              <KeyBtn char="N" onClick={handleVirtualKey} />
              <KeyBtn char="M" onClick={handleVirtualKey} />
              <button 
                className="w-12 h-10 bg-gray-200 rounded text-xs font-bold text-gray-600 flex items-center justify-center active:bg-gray-300 shadow-sm border-b-2 border-gray-300 active:border-b-0 active:translate-y-[2px]"
                onClick={() => handleVirtualKey('DEL')}
              >
                ⌫
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {solved && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-xs mx-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Puzzle Solved!</h2>
            <p className="text-gray-600 mb-6">Great job mastering these words.</p>
            <button 
              onClick={onBack}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface KeyBtnProps {
  char: string;
  onClick: (k: string) => void;
}

const KeyBtn: React.FC<KeyBtnProps> = ({ char, onClick }) => (
  <button 
    className="w-8 h-10 bg-white border border-gray-200 rounded text-sm font-bold text-gray-700 active:bg-indigo-50 active:text-indigo-600 shadow-sm border-b-2 border-gray-300 active:border-b-0 active:translate-y-[2px] transition-all"
    onClick={(e) => {
      e.preventDefault(); // prevent focus loss
      onClick(char);
    }}
  >
    {char}
  </button>
);

export default CrosswordBoard;