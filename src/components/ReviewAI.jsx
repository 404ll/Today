import React, { useState } from 'react';
import { Brain, Save, Terminal } from 'lucide-react';
import { AI_PROMPTS } from '../constants';

const ReviewAI = ({ session, onFinish }) => {
  const [reviewText, setReviewText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async (prompt) => {
    setIsLoading(true);
    setAiResponse('Connecting to Neural Net...\nAnalyzing data packets...');
    setTimeout(() => {
      const mockResponse = `> SYSTEM RESPONSE:\n\n针对 "${session.specific}" 的分析报告：\n\n[SUCCESS] 核心概念已捕获。\n[INFO] 建议进一步研究该实现的边界情况。\n\n> END OF LINE.`;
      setAiResponse(mockResponse);
      setIsLoading(false);
    }, 1500);
  };

  const handleSave = () => {
    onFinish({ ...session, review: reviewText, aiInsights: aiResponse, status: 'completed' });
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 h-full pb-10">
      {/* 左侧：自我复盘 */}
      <div className="pixel-card p-0 flex flex-col h-[500px]">
        <div className="bg-black text-white p-3 font-bold border-b-2 border-black flex items-center gap-2">
          <Save size={18}/> REVIEW.TXT
        </div>
        <textarea 
          className="flex-1 w-full p-4 resize-none focus:outline-none bg-white text-base leading-relaxed font-mono"
          placeholder="在此输入你的学习总结..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
      </div>

      {/* 右侧：AI 终端 */}
      <div className="pixel-card p-0 flex flex-col h-[500px] bg-black">
        <div className="bg-gray-200 text-black p-3 font-bold border-b-2 border-black flex items-center gap-2">
          <Brain size={18}/> AI_CONSOLE
        </div>
        
        {/* AI 显示屏 */}
        <div className="flex-1 overflow-y-auto p-4 text-sm font-mono text-green-500 whitespace-pre-wrap leading-relaxed">
           <span className="opacity-50">root@learning-bot:~$ </span>
           {isLoading ? <span className="animate-pulse">_</span> : (aiResponse || "Waiting for input...")}
        </div>

        {/* 按钮组 */}
        <div className="bg-white border-t-2 border-black p-4 space-y-2">
          {AI_PROMPTS.map((prompt, idx) => (
            <button 
              key={idx}
              onClick={() => handleAskAI(prompt)}
              disabled={isLoading}
              className="w-full text-left px-3 py-2 text-xs border border-black hover:bg-black hover:text-white transition flex items-center gap-2 truncate"
            >
              <Terminal size={12} /> {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <button onClick={handleSave} className="pixel-btn w-full bg-black text-white py-4 text-xl hover:bg-gray-800">
          SAVE && EXIT
        </button>
      </div>
    </div>
  );
};

export default ReviewAI;