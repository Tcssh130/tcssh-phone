import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  Calendar, 
  BookOpen, 
  Download,
  CheckCircle2,
  ArrowRight, 
  FileSpreadsheet,
  XCircle,
  Database
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from 'firebase/auth';

// --- 💡 Firebase 配置資訊 💡 ---
const myFirebaseConfig = {
  apiKey: "AIzaSyADZTCAgLvcGyfdwROGjFI3L4yUY77kqRA",
  authDomain: "tc2h-phone-system.firebaseapp.com",
  projectId: "tc2h-phone-system",
  storageBucket: "tc2h-phone-system.firebasestorage.app",
  messagingSenderId: "535190243184",
  appId: "1:535190243184:web:a9cfff5c3453ee697f31b5"
};

// 💡 永遠強制使用您的 Firebase，完全避開預覽環境的層級限制與權限干擾
const app = initializeApp(myFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 💡 永遠使用 'violations' 作為單一資料庫集合名稱
const getViolationsRef = () => {
  return collection(db, 'violations');
};

// --- 子元件 ---

const StatsView = ({ stats, dateRange, setDateRange }) => (
  <div className="space-y-6 pb-20 animate-in fade-in duration-500">
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
        <Calendar size={18} /> 日期查詢區間
      </div>
      <div className="flex items-center gap-2">
        <input type="date" value={dateRange.start} onChange={(e) => setDateRange(p=>({...p, start: e.target.value}))} className="bg-slate-50 p-2.5 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-blue-200 cursor-pointer" />
        <ArrowRight size={16} className="text-slate-300" />
        <input type="date" value={dateRange.end} onChange={(e) => setDateRange(p=>({...p, end: e.target.value}))} className="bg-slate-50 p-2.5 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-blue-200 cursor-pointer" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden flex flex-col justify-center min-h-[200px]">
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600"></div>
          <p className="text-slate-400 text-sm font-medium mb-2 tracking-wider uppercase">區間總違規件數</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-8xl font-black text-slate-800 tracking-tighter">{stats.total}</span>
            <span className="text-slate-400 font-bold text-xl">件</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-sm font-bold mb-8 text-center uppercase tracking-widest">年級違規比例分配</p>
          
          <div 
            className="relative w-40 h-40 mx-auto mb-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-1000"
            style={{
              background: stats.total === 0 
                ? '#f1f5f9' 
                : `conic-gradient(
                    #10b981 0% ${(stats.gradeCounts.g1/(stats.total||1))*100}%, 
                    #f59e0b ${(stats.gradeCounts.g1/(stats.total||1))*100}% ${((stats.gradeCounts.g1+stats.gradeCounts.g2)/(stats.total||1))*100}%, 
                    #6366f1 ${((stats.gradeCounts.g1+stats.gradeCounts.g2)/(stats.total||1))*100}% 100%
                  )`
            }}
          >
            <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <span className="text-slate-400 font-black text-xs tracking-widest uppercase">總計</span>
              <span className="text-slate-700 font-black text-3xl leading-none mt-1">{stats.total}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 text-xs md:text-sm font-black text-center mt-4">
            <div className="border-r border-slate-100 text-emerald-500 flex flex-col items-center">
              <div className="w-3 h-3 bg-[#10b981] rounded-full mb-2 shadow-sm"></div>
              高一 ({stats.gradeCounts.g1})
              <span className="text-slate-400 text-[10px] md:text-xs mt-1">{stats.total ? Math.round((stats.gradeCounts.g1/stats.total)*100) : 0}%</span>
            </div>
            <div className="border-r border-slate-100 text-amber-500 flex flex-col items-center">
              <div className="w-3 h-3 bg-[#f59e0b] rounded-full mb-2 shadow-sm"></div>
              高二 ({stats.gradeCounts.g2})
              <span className="text-slate-400 text-[10px] md:text-xs mt-1">{stats.total ? Math.round((stats.gradeCounts.g2/stats.total)*100) : 0}%</span>
            </div>
            <div className="text-indigo-500 flex flex-col items-center">
              <div className="w-3 h-3 bg-[#6366f1] rounded-full mb-2 shadow-sm"></div>
              高三 ({stats.gradeCounts.g3})
              <span className="text-slate-400 text-[10px] md:text-xs mt-1">{stats.total ? Math.round((stats.gradeCounts.g3/stats.total)*100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-6 text-blue-900 font-black text-lg">
          <LayoutDashboard className="text-blue-500" size={24} />
          <span>各班違規件數排行榜</span>
        </div>
        <div className="space-y-3 overflow-y-auto flex-1 pr-2 max-h-[600px] custom-scrollbar">
          {Object.entries(stats.classStats).sort((a,b)=>b[1]-a[1]).map(([cls, count], idx) => (
            <div key={cls} className="flex justify-between items-center p-4 bg-slate-50 hover:bg-blue-50/50 transition-colors rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black ${idx < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                  {idx + 1}
                </span>
                <span className="font-black text-slate-700 text-base">{cls} 班</span>
              </div>
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-md">{count} 件</span>
            </div>
          ))}
          {Object.keys(stats.classStats).length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
              <Search size={48} className="mb-4 text-slate-300" />
              <div className="italic font-bold">目前區間尚未有違規資料</div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const RegisterView = ({ formData, setFormData, handleSubmit }) => {
  const handleAddStudent = () => {
    setFormData({ 
      ...formData, 
      students: [...formData.students, { className: '', seatNumber: '', studentName: '' }] 
    });
  };

  const handleRemoveStudent = (index) => {
    const newStudents = formData.students.filter((_, i) => i !== index);
    setFormData({ ...formData, students: newStudents });
  };

  const updateStudent = (index, field, value) => {
    const newStudents = [...formData.students];
    newStudents[index][field] = value;
    setFormData({ ...formData, students: newStudents });
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 mb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 text-blue-900 font-black text-2xl md:text-3xl mb-8 border-b pb-6">
        <PlusCircle className="text-blue-500" size={32} />
        <span>違規登記登錄</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          
          <div className="lg:col-span-4 space-y-5 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 h-fit">
            <h3 className="font-black text-slate-700 flex items-center gap-2 mb-6">
              <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
              基本資料設定
            </h3>

            <div className="space-y-2">
              <label className="text-slate-500 text-sm font-bold ml-1">違規日期</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-white hover:bg-slate-50 p-3.5 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200