import React, { useEffect, useState } from 'react';
import { CheckSquare } from 'lucide-react';

const FocusTimer = ({ session, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(session.timeBound * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="pixel-card p-6 mb-8 text-center max-w-2xl w-full border-4">
        <div className="text-xs font-bold bg-black text-white inline-block px-2 py-1 mb-4">CURRENT_TASK</div>
        <h2 className="text-2xl font-bold mb-2">{session.specific}</h2>
        <p className="text-gray-600 border-t-2 border-dashed border-gray-400 pt-2 mt-2">&gt;&gt; {session.action}</p>
      </div>

      <div className={`text-9xl font-bold mb-12 tracking-tighter tabular-nums ${timeLeft === 0 ? 'text-red-600 animate-pulse' : 'text-black'}`}>
        {formatTime(timeLeft)}
      </div>

      <button 
        onClick={onComplete}
        className="pixel-btn w-full max-w-md bg-pixel-green text-black py-4 flex items-center justify-center gap-2 hover:bg-green-400"
      >
        <CheckSquare size={20} /> MISSION_COMPLETE
      </button>
      
      <p className="mt-4 text-xs text-gray-500 uppercase">System Monitor: Active</p>
    </div>
  );
};

export default FocusTimer;