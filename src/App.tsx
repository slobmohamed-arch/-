/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, RotateCcw, Equal, Plus, Minus, X, Divide, Percent, History } from 'lucide-react';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<{ eq: string; res: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isResult, setIsResult] = useState(false);

  const handleNumber = useCallback((num: string) => {
    if (isResult) {
      setDisplay(num);
      setIsResult(false);
    } else {
      setDisplay(prev => (prev === '0' ? num : prev + num));
    }
  }, [isResult]);

  const handleOperator = useCallback((op: string) => {
    setIsResult(false);
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  }, [display]);

  const calculate = useCallback(() => {
    try {
      const fullEquation = equation + display;
      // Using Function constructor as a safer alternative to eval for simple math
      // In a real app, use a math parser library
      const result = new Function(`return ${fullEquation.replace(/×/g, '*').replace(/÷/g, '/')}`)();
      const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
      
      setHistory(prev => [{ eq: fullEquation, res: formattedResult }, ...prev].slice(0, 10));
      setDisplay(formattedResult);
      setEquation('');
      setIsResult(true);
    } catch (error) {
      setDisplay('Error');
      setEquation('');
      setIsResult(true);
    }
  }, [equation, display]);

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsResult(false);
  };

  const deleteLast = () => {
    if (isResult) {
      clear();
    } else {
      setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }
  };

  const handlePercent = () => {
    setDisplay(prev => (parseFloat(prev) / 100).toString());
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (/[0-9]/.test(e.key)) handleNumber(e.key);
    if (['+', '-', '*', '/'].includes(e.key)) {
      const ops: Record<string, string> = { '*': '×', '/': '÷', '+': '+', '-': '-' };
      handleOperator(ops[e.key] || e.key);
    }
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Escape') clear();
    if (e.key === 'Backspace') deleteLast();
    if (e.key === '.') handleNumber('.');
  }, [handleNumber, handleOperator, calculate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const Button = ({ children, onClick, className = "", variant = "default" }: any) => {
    const variants: any = {
      default: "bg-white hover:bg-gray-50 text-gray-800",
      operator: "bg-orange-500 hover:bg-orange-600 text-white",
      action: "bg-gray-200 hover:bg-gray-300 text-gray-800",
      danger: "bg-red-100 hover:bg-red-200 text-red-600"
    };

    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`h-16 rounded-2xl text-xl font-medium transition-colors shadow-sm flex items-center justify-center ${variants[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 relative">
        
        {/* Header / History Toggle */}
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-gray-400 font-medium tracking-tight">الآلة الحاسبة</h1>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <History size={20} />
          </button>
        </div>

        {/* Display Area */}
        <div className="px-8 py-4 text-right min-h-[160px] flex flex-col justify-end">
          <AnimatePresence mode="wait">
            <motion.div 
              key={equation}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-400 text-lg h-8 mb-1 overflow-hidden whitespace-nowrap"
            >
              {equation}
            </motion.div>
          </AnimatePresence>
          <motion.div 
            key={display}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-light tracking-tighter text-gray-900 break-all leading-tight"
          >
            {display}
          </motion.div>
        </div>

        {/* Keypad */}
        <div className="p-6 grid grid-cols-4 gap-3 bg-gray-50/50">
          <Button variant="action" onClick={clear}><RotateCcw size={24} /></Button>
          <Button variant="action" onClick={deleteLast}><Delete size={24} /></Button>
          <Button variant="action" onClick={handlePercent}><Percent size={20} /></Button>
          <Button variant="operator" onClick={() => handleOperator('÷')}><Divide size={24} /></Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button variant="operator" onClick={() => handleOperator('×')}><X size={24} /></Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button variant="operator" onClick={() => handleOperator('-')}><Minus size={24} /></Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button variant="operator" onClick={() => handleOperator('+')}><Plus size={24} /></Button>

          <Button className="col-span-2" onClick={() => handleNumber('0')}>0</Button>
          <Button onClick={() => handleNumber('.')}>.</Button>
          <Button variant="operator" onClick={calculate} className="bg-orange-600"><Equal size={24} /></Button>
        </div>

        {/* History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="absolute inset-0 bg-white z-10 flex flex-col"
            >
              <div className="p-6 border-bottom flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">السجل</h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">لا يوجد سجل حالياً</div>
                ) : (
                  history.map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={i} 
                      className="text-right border-b border-gray-50 pb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        setDisplay(item.res);
                        setShowHistory(false);
                      }}
                    >
                      <div className="text-gray-400 text-sm">{item.eq}</div>
                      <div className="text-xl font-medium text-gray-800">= {item.res}</div>
                    </motion.div>
                  ))
                )}
              </div>
              {history.length > 0 && (
                <div className="p-6">
                  <Button variant="danger" className="w-full" onClick={() => setHistory([])}>مسح السجل</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

