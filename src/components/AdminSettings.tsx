import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, ShieldAlert, Save, CheckCircle2, Moon, Sun, Monitor } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark-teal',
    showParticles: true,
    particleType: 'electrons',
    antiCheat: true,
    examDuration: 50,
    allowReview: true,
    geminiApiKey: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system_settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'system_settings', 'config'), settings, { merge: true });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Lỗi khi lưu cài đặt.');
    } finally {
      setIsSaving(false);
    }
  };

  const themes = [
    { id: 'dark-teal', name: 'Dark Teal Glow', color: 'bg-teal-500' },
    { id: 'dark-blue', name: 'Deep Ocean', color: 'bg-blue-600' },
    { id: 'dark-purple', name: 'Royal Purple', color: 'bg-purple-600' },
    { id: 'dark-emerald', name: 'Emerald Forest', color: 'bg-emerald-600' },
    { id: 'light', name: 'Light Mode (Coming Soon)', color: 'bg-slate-200', disabled: true }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Palette className="w-8 h-8 text-teal-400" />
            Cấu hình Hệ thống
          </h2>
          <p className="text-slate-400 mt-1 text-lg">Tùy chỉnh giao diện và bảo mật phòng thi</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg",
            showSuccess 
              ? "bg-emerald-500 text-white" 
              : "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/20"
          )}
        >
          {isSaving ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : showSuccess ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {showSuccess ? "Đã lưu!" : "Lưu cấu hình"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theme Selection */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-teal-400" />
            Chủ đề hiển thị
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                disabled={t.disabled}
                onClick={() => setSettings({ ...settings, theme: t.id })}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  settings.theme === t.id 
                    ? "bg-teal-500/10 border-teal-500 text-white" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700",
                  t.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded-full", t.color)} />
                  <span className="font-medium">{t.name}</span>
                </div>
                {settings.theme === t.id && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* System Toggles */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-teal-400" />
            Tính năng hệ thống
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white">Hiệu ứng lơ lửng nền tảng</div>
                <div className="text-xs text-slate-500">Hiển thị các hạt, bong bóng hoặc hoa rơi ở nền trang web</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, showParticles: !settings.showParticles })}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                  settings.showParticles ? "bg-teal-500" : "bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.showParticles ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {settings.showParticles && (
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                 <div className="w-full">
                  <div className="font-bold text-white mb-2">Loại hiệu ứng</div>
                  <select
                    value={settings.particleType || 'electrons'}
                    onChange={(e) => setSettings({ ...settings, particleType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500 transition-all"
                  >
                    <option value="classic">Cổ điển (+, .)</option>
                    <option value="electrons">Điện tử (●)</option>
                    <option value="snow">Tuyết rơi (❄)</option>
                    <option value="cherry_blossoms">Hoa anh đào (🌸)</option>
                    <option value="bubbles">Bong bóng (○)</option>
                    <option value="hearts">Trái tim (❤️)</option>
                    <option value="fireworks">Pháo hoa (✨)</option>
                    <option value="autumn-leaves">Lá mùa thu (🍂)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  Chống gian lận
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xs text-slate-500">Cảnh báo khi học sinh rời khỏi tab thi</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, antiCheat: !settings.antiCheat })}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  settings.antiCheat ? "bg-rose-500" : "bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.antiCheat ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white">Xem lại bài làm</div>
                <div className="text-xs text-slate-500">Cho phép học sinh xem đáp án sau khi nộp</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowReview: !settings.allowReview })}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  settings.allowReview ? "bg-teal-500" : "bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.allowReview ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Config */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
        <h3 className="text-xl font-bold text-white mb-6">Cấu hình nâng cao</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium">Thời gian thi mặc định (phút)</label>
            <input 
              type="number" 
              value={settings.examDuration}
              onChange={(e) => setSettings({ ...settings, examDuration: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium">Gemini API Key (Dùng cho tính năng AI)</label>
            <input 
              type="password" 
              value={settings.geminiApiKey || ''}
              onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
              placeholder="Nhập API Key của bạn..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
