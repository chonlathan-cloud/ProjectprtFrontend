
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithAI } from '../services/api';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(([
    { role: 'model', content: 'สวัสดีครับ! ผมคือผู้ช่วย AI ด้านการเงินของคุณ มีอะไรให้ช่วยวางแผนการเงินในวันนี้ไหมครับ?' }
  ]));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // [CHANGE] เรียกใช้ API ของเราเอง แทนการเรียก Gemini โดยตรง
      // ไม่ต้องส่ง history ทั้งหมดไป เพราะ Backend เราจัดการ context หรือรับแค่ message ล่าสุดในเฟสแรก
      const responseText = await chatWithAI(input);

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "เกิดข้อผิดพลาดในการเชื่อมต่อ" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Bot className="text-blue-500" />
          Financial AI Assistant
        </h1>
        <p className="text-slate-500 dark:text-slate-400">ถามข้อมูลเกี่ยวกับงบประมาณ การออม หรือวิเคราะห์รายจ่ายของคุณได้เลย</p>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                }`}
                // ให้ ai ตอบข้อความให้มีการเว้นบรรทัด
                style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex gap-3 items-center text-slate-400 text-sm">
                 <Loader2 className="animate-spin" size={20} />
                 กำลังคิดคำตอบ...
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ถาม AI เกี่ยวกับบัญชีของคุณ..."
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
