import React, { useState } from 'react';
import { Play } from 'lucide-react';

type PlanForm = {
  specific: string;
  measurable: string;
  timeBound: number;
  action: string;
};

type PlanDraft = PlanForm & {
  id: string;
  review: string;
  aiInsights: string;
  status: string;
  startTime: number;
};

type PlanCardProps = {
  onStart: (plan: PlanDraft) => void;
};

const PlanCard: React.FC<PlanCardProps> = ({ onStart }) => {
  const [form, setForm] = useState<PlanForm>({
    specific: '',
    measurable: '',
    timeBound: 25,
    action: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.specific || !form.action) return;
    onStart({
      id: Date.now().toString(),
      ...form,
      review: '',
      aiInsights: '',
      status: 'focusing',
      startTime: Date.now(),
    });
  };

  return (
    <div className="pixel-card p-8 max-w-xl mx-auto relative">
      {/* 装饰性标题栏 */}
      <div className="absolute top-0 left-0 w-full bg-black text-white px-2 py-1 text-xs font-bold border-b-2 border-black flex justify-between">
        <span>SETUP.EXE</span>
        <span>X</span>
      </div>

      <h2 className="text-2xl font-bold mb-8 mt-4 uppercase tracking-tighter">
        &gt; INITIALIZE_SMTAR
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase mb-2">S - Specific (目标)</label>
          <input 
            className="pixel-input"
            placeholder="例如：搞懂 React useEffect"
            value={form.specific}
            onChange={e => setForm({...form, specific: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-2">M - Measurable</label>
            <input 
              className="pixel-input"
              placeholder="输出一篇笔记"
              value={form.measurable}
              onChange={e => setForm({...form, measurable: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-2">T - Time (Min)</label>
            <input 
              type="number"
              className="pixel-input"
            value={form.timeBound}
            onChange={(e) =>
              setForm({
                ...form,
                timeBound: parseInt(e.target.value, 10) || 0,
              })
            }
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase mb-2">A - Action (行动)</label>
          <input 
            className="pixel-input"
            placeholder="阅读文档并手写 Demo"
            value={form.action}
            onChange={e => setForm({...form, action: e.target.value})}
            required
          />
        </div>

        <div className="border-l-4 border-black pl-4 py-2 bg-gray-100 text-xs">
           WARNING: 不设期限 = 不会开始。<br/>STATUS: 等待指令...
        </div>

        <button type="submit" className="pixel-btn w-full bg-black text-white py-4 flex items-center justify-center gap-2 hover:bg-gray-800">
          <Play size={18} /> EXECUTE_PLAN
        </button>
      </form>
    </div>
  );
};

export default PlanCard;