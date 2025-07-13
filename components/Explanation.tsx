import React, { useState, useEffect } from 'react';

interface ExplanationProps {
  text: string;
  isLoading: boolean;
  code: string;
  highlightedLine: number | null;
}

const Typewriter: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, 20);
      return () => clearInterval(intervalId);
    }
  }, [text]);

  return <p className="text-gray-700 whitespace-pre-wrap">{displayedText}</p>;
};

const CodeDisplay: React.FC<{ code: string; highlightedLine: number | null }> = ({ code, highlightedLine }) => {
  if (!code) {
    return (
      <div className="text-gray-500 flex items-center justify-center h-full p-4">
        <p>Perform an operation to see the code.</p>
      </div>
    );
  }

  const lines = code.split('\n');

  return (
    <pre className="language-java text-sm overflow-auto h-full bg-gray-50/50">
      <code className="font-mono">
        {lines.map((line, index) => {
          const isHighlighted = index + 1 === highlightedLine;
          return (
            <div
              key={index}
              className={`block transition-colors duration-300 px-4 ${isHighlighted ? 'bg-blue-500 bg-opacity-20' : 'bg-transparent'}`}
            >
              <span className="table-cell w-6 text-right text-gray-400 pr-4 select-none">{index + 1}</span>
              <span className="table-cell text-gray-800">{line || '\u00A0'}</span>
            </div>
          );
        })}
      </code>
    </pre>
  );
};

export const Explanation: React.FC<ExplanationProps> = ({ text, isLoading, code, highlightedLine }) => {
  const [activeTab, setActiveTab] = useState<'explanation' | 'code'>('explanation');

  useEffect(() => {
    if (code) {
      setActiveTab('code');
    } else {
      setActiveTab('explanation');
    }
  }, [code]);
  
  const getTabClass = (tabName: 'explanation' | 'code') => `
    w-1/2 py-3 text-center font-semibold cursor-pointer transition-colors duration-200 border-b-2
    ${activeTab === tabName
      ? 'text-blue-600 border-blue-600'
      : 'text-gray-500 border-transparent hover:bg-gray-200/50'
    }
  `;

  return (
    <div className="bg-white/60 rounded-2xl shadow-lg h-full border border-gray-200 backdrop-blur-sm flex flex-col">
      <div className="flex border-b border-gray-200">
        <div className={getTabClass('explanation')} onClick={() => setActiveTab('explanation')}>
          <i className="fa-solid fa-brain mr-2"></i> Explanation
        </div>
        <div className={getTabClass('code')} onClick={() => setActiveTab('code')}>
          <i className="fa-solid fa-code mr-2"></i> Code
        </div>
      </div>
      <div className="flex-grow min-h-[250px] relative">
        {activeTab === 'explanation' && (
          <div className="p-6 h-full overflow-y-auto">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-500">Thinking...</p>
                </div>
              </div>
            )}
            {!isLoading && text && <Typewriter text={text} />}
            {!isLoading && !text && (
              <div className="text-gray-400">
                <p>Perform an operation to see an explanation here.</p>
                <p className="mt-4 text-sm">For example, type a number and click 'Insert Head'.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'code' && <CodeDisplay code={code} highlightedLine={highlightedLine} />}
      </div>
    </div>
  );
};
