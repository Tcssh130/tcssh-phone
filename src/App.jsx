import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  Calendar, 
  BookOpen, 
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowRight, 
  FileSpreadsheet,
  Edit3,
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
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';

// --- 💡 Firebase 配置資訊 (已根據您的專案填入) 💡 ---
const myFirebaseConfig = {
  apiKey: "AIzaSyADZTCAgLvcGyfdwROGjFI3L4yUY77kqRA",
  authDomain: "tc2h-phone-system.firebaseapp.com",
  projectId: "tc2h-phone-system",
  storageBucket: "tc2h-phone-system.firebasestorage.app",
  messagingSenderId: "535190243184",
  appId: "1:535190243184:web:a9cfff5c3453ee697f31b5"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : myFirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'tc2h-phone-stats';

// --- 子元件 ---

const StatsView = ({ stats, dateRange, setDateRange }) => (
  <div className="space-y-6 pb-20 animate-in fade-in duration-500">
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-center gap-2 text-blue-600 mb-4 font-bold text-sm">
        <Calendar size={18} /> 日期查詢區間
      </div>
      <div className="flex items-center justify-center gap-2">
        <input type="date" value={dateRange.start} onChange={(e) => setDateRange(p=>({...p, start: e.target.value}))} className="bg-slate-50 p-2 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-200" />
        <ArrowRight size={14} className="text-slate-300" />
        <input type="date" value={dateRange.end} onChange={(e) => setDateRange(p=>({...p, end: e.target.value}))} className="bg-slate-50 p-2 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-200" />
      </div>
    </div>

    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600"></div>
      <p className="text-slate-400 text-sm font-medium mb-1 tracking-wider uppercase">區間總違規件數</p>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-7xl font-black text-slate-800 tracking-tighter">{stats.total}</span>
        <span className="text-slate-400 font-bold">件</span>
      </div>
    </div>

    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <p className="text-slate-400 text-xs font-bold mb-6 text-center uppercase tracking-widest">年級違規比例分配</p>
      
      {/* 圓形甜甜圈圖區塊 */}
      <div 
        className="relative w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-1000"
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
        <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
          <span className="text-slate-400 font-black text-[9px] tracking-widest uppercase">總計</span>
          <span className="text-slate-700 font-black text-xl leading-none mt-1">{stats.total}</span>
        </div>
      </div>

      {/* 圖例與百分比 */}
      <div className="grid grid-cols-3 text-[10px] font-black text-center mt-2">
        <div className="border-r border-slate-100 text-emerald-500 flex flex-col items-center">
          <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full mb-1.5 shadow-sm"></div>
          高一 ({stats.gradeCounts.g1})
          <span className="text-slate-400 text-[9px] mt-0.5">{stats.total ? Math.round((stats.gradeCounts.g1/stats.total)*100) : 0}%</span>
        </div>
        <div className="border-r border-slate-100 text-amber-500 flex flex-col items-center">
          <div className="w-2.5 h-2.5 bg-[#f59e0b] rounded-full mb-1.5 shadow-sm"></div>
          高二 ({stats.gradeCounts.g2})
          <span className="text-slate-400 text-[9px] mt-0.5">{stats.total ? Math.round((stats.gradeCounts.g2/stats.total)*100) : 0}%</span>
        </div>
        <div className="text-indigo-500 flex flex-col items-center">
          <div className="w-2.5 h-2.5 bg-[#6366f1] rounded-full mb-1.5 shadow-sm"></div>
          高三 ({stats.gradeCounts.g3})
          <span className="text-slate-400 text-[9px] mt-0.5">{stats.total ? Math.round((stats.gradeCounts.g3/stats.total)*100) : 0}%</span>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6 text-blue-900 font-black">
        <LayoutDashboard className="text-blue-500" size={22} />
        <span>各班明細統計</span>
      </div>
      <div className="space-y-3">
        {Object.entries(stats.classStats).sort((a,b)=>b[1]-a[1]).map(([cls, count]) => (
          <div key={cls} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-black text-slate-700">{cls} 班</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md">{count} 件</span>
          </div>
        ))}
        {Object.keys(stats.classStats).length === 0 && <div className="text-center py-10 opacity-20 italic">目前尚未有資料</div>}
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
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 text-blue-900 font-bold text-2xl mb-8">
        <PlusCircle className="text-blue-500" size={28} />
        <span>違規登記登錄</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-slate-500 text-xs font-bold ml-1">違規日期</label>
          <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-slate-700 outline-none">
            {['第 1 節', '第 2 節', '第 3 節', '第 4 節', '午休時間', '第 5 節', '第 6 節', '第 7 節'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-slate-700 outline-none">
            <option value="下課時間">下課時間</option>
            <option value="上課中">上課中</option>
          </select>
        </div>

        <div className="space-y-4">
          <div className="px-1">
            <label className="text-slate-500 text-xs font-bold">違規學生名單</label>
          </div>
          
          {formData.students.map((student, idx) => (
            <div key={idx} className="p-4 border-2 border-dashed border-slate-200 rounded-3xl space-y-4 bg-slate-50/50 shadow-inner relative">
              {formData.students.length > 1 && (
                <button type="button" onClick={() => handleRemoveStudent(idx)} className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50 transition-colors border border-red-100">
                  <XCircle size={20} />
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="班級 (必填)" value={student.className} onChange={(e) => updateStudent(idx, 'className', e.target.value)} className="w-full bg-white p-4 rounded-xl border border-slate-200 outline-none shadow-sm font-bold" />
                <input placeholder="座號 (必填)" value={student.seatNumber} onChange={(e) => updateStudent(idx, 'seatNumber', e.target.value)} className="w-full bg-white p-4 rounded-xl border border-slate-200 outline-none shadow-sm font-bold" />
              </div>
              <input placeholder="學生姓名 (選填)" value={student.studentName} onChange={(e) => updateStudent(idx, 'studentName', e.target.value)} className="w-full bg-white p-4 rounded-xl border border-slate-200 outline-none shadow-sm font-bold" />
            </div>
          ))}

          <button type="button" onClick={handleAddStudent} className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 bg-blue-50/50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors shadow-sm">
            <PlusCircle size={18} /> 新同學
          </button>
        </div>

        <input placeholder="登記人單位或姓名" value={formData.registrar} onChange={(e) => setFormData({...formData, registrar: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-bold shadow-sm" />
        <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 active:scale-95 transition-all">確認完成登錄</button>
      </form>
    </div>
  );
};

const SearchView = ({ records, exportToCSV }) => {
  const [search, setSearch] = useState('');
  const now = new Date();
  const curMonth = now.toISOString().slice(0, 7);
  const monthly = records.filter(r => (r.date || '').startsWith(curMonth));
  const filtered = records.filter(r => (r.className||'').includes(search) || (r.studentName||'').includes(search) || (r.date||'').includes(search));

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2 text-blue-900 font-black text-xl mb-8">
          <FileSpreadsheet className="text-blue-500" size={24} /> <span>資料查詢與匯出</span>
        </div>
        <div className="flex items-center gap-2 mb-8">
           <button onClick={() => exportToCSV(monthly)} className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl text-xs font-black shadow-lg shadow-blue-100">依月下載</button>
           <button onClick={() => exportToCSV(records)} className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl text-xs font-black shadow-lg">全部下載</button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input placeholder="搜尋班級、姓名或日期..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl outline-none font-bold" />
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-sm">
            <thead className="bg-slate-50 text-slate-400 font-black">
              <tr><th className="px-4 py-4">日期節次</th><th className="px-4 py-4">狀態</th><th className="px-4 py-4">班級座號</th><th className="px-4 py-4">姓名</th><th className="px-4 py-4">登記人</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.id} className="text-slate-600 font-bold hover:bg-slate-50/50">
                  <td className="px-4 py-4 whitespace-nowrap">{r.date}<br/><span className="text-[10px] text-slate-400">{r.period}</span></td>
                  <td className="px-4 py-4 whitespace-nowrap"><span className={r.status==='上課中'?'text-red-500':'text-blue-500'}>{r.status}</span></td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.className} ({r.seatNumber})</td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.studentName || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-slate-400 italic">{r.registrar || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 主應用程式 ---

export default function App() {
  const [tab, setTab] = useState('stats');
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [isShareMode, setIsShareMode] = useState(false); // 新增：判斷是否為分享模式
  
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ start: firstDay, end: today });
  
  const [formData, setFormData] = useState({ 
    date: today, 
    period: '第 1 節', 
    status: '下課時間', 
    registrar: '',
    students: [{ className: '', seatNumber: '', studentName: '' }] 
  });

  // 偵測網址參數是否為分享模式
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'form') {
      setIsShareMode(true);
      setTab('register'); // 強制將分頁設為「登錄」
    }
  }, []);

  // 初始化匿名登入
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Firebase Auth failed:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 即時監聽資料庫
  useEffect(() => {
    if (!user) return; 

    const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'violations');
    const unsubscribe = onSnapshot(collectionRef, 
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRecords(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setMsg({ text: "資料庫連線中...", type: "error" });
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validStudents = formData.students.filter(s => s.className.trim() !== '' && s.seatNumber.trim() !== '');
    
    if (validStudents.length === 0) {
      return setMsg({ text: '請至少填寫一位同學的班級與座號', type: 'error' });
    }

    try {
      const promises = validStudents.map(student => {
        return addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'violations'), { 
          date: formData.date,
          period: formData.period,
          status: formData.status,
          registrar: formData.registrar,
          className: student.className.trim(),
          seatNumber: student.seatNumber.trim(),
          studentName: student.studentName.trim(),
          createdAt: Timestamp.now() 
        });
      });

      await Promise.all(promises);
      
      setMsg({ text: `成功登錄 ${validStudents.length} 筆違規紀錄`, type: 'success' });
      setFormData({ ...formData, students: [{ className: '', seatNumber: '', studentName: '' }] });
      setTimeout(()=>setMsg(null), 3000);
    } catch (err) { 
      setMsg({ text: '儲存失敗，請檢查網路連線', type: 'error' }); 
    }
  };

  const exportCSV = (data) => {
    if (data.length === 0) return setMsg({ text: '此條件下無資料', type: 'error' });
    const body = data.map(r => [r.date, r.period, r.status, r.className, r.seatNumber, r.studentName, r.registrar || '']);
    let csv = "data:text/csv;charset=utf-8,\uFEFF日期,節次,狀態,班級,座號,姓名,登記人\n" + body.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csv); link.download = `phone_stats_${today}.csv`; link.click();
  };

  const statsData = useMemo(() => {
    const filtered = records.filter(r => (r.date || '') >= dateRange.start && (r.date || '') <= dateRange.end);
    const g = { g1: 0, g2: 0, g3: 0 };
    const c = {};
    filtered.forEach(r => { 
      const first = (r.className || '').charAt(0);
      if (first === '1') g.g1++; else if (first === '2') g.g2++; else if (first === '3') g.g3++;
      c[r.className] = (c[r.className] || 0) + 1; 
    });
    return { total: filtered.length, gradeCounts: g, classStats: c };
  }, [records, dateRange]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <header className="bg-[#1a202c] text-white pt-6 pb-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-md mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-500 rounded-2xl flex items-center justify-center border-2 border-blue-400 shadow-inner">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-base uppercase leading-none">二中手機管理系統</h1>
              {/* 如果是分享模式，顯示不同的副標題 */}
              <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-widest uppercase">
                {isShareMode ? 'Violation Registration Form' : 'Public Access Version'}
              </p>
            </div>
          </div>
        </div>
        
        {/* 核心修改：只有在「非分享模式」時，才顯示切換選單 */}
        {!isShareMode && (
          <nav className="max-w-md mx-auto px-4 mt-5 flex gap-1 bg-[#2d3748] rounded-2xl p-1.5 mx-4 shadow-inner">
            {[
              { id: 'stats', label: '統計', icon: <LayoutDashboard size={18}/> },
              { id: 'register', label: '登錄', icon: <PlusCircle size={18}/> },
              { id: 'search', label: '查詢', icon: <Search size={18}/> }
            ].map(btn => (
              <button key={btn.id} onClick={() => setTab(btn.id)} className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all duration-300 ${tab === btn.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                {btn.icon}<span className="text-[9px] font-black mt-1.5">{btn.label}</span>
              </button>
            ))}
          </nav>
        )}
      </header>

      {msg && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-2xl font-black text-sm text-white transition-all ${msg.type === 'error' ? 'bg-red-500' : 'bg-green-600 animate-bounce'}`}>
          {msg.text}
        </div>
      )}

      <main className="max-w-md mx-auto p-4 mt-2">
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center gap-4 text-slate-300 font-black uppercase tracking-widest">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            Connecting Cloud
          </div>
        ) : (
          <>
            {tab === 'stats' && !isShareMode && <StatsView stats={statsData} dateRange={dateRange} setDateRange={setDateRange} />}
            {tab === 'register' && <RegisterView formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} />}
            {tab === 'search' && !isShareMode && <SearchView records={records} exportToCSV={exportCSV} />}
          </>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-white/95 border-t py-3 px-5 flex justify-between items-center text-[10px] text-slate-400 font-black z-50">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="tracking-tight uppercase">{user ? 'Cloud Database Connected' : 'Connecting...'}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <Database size={12} className="text-blue-500" />
          <span>REALTIME SYNC</span>
        </div>
      </footer>
    </div>
  );
}