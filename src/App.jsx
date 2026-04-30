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
  signInWithCustomToken,
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

// 💡 智慧環境偵測：判斷目前是在預覽環境還是正式網頁
const isCanvasEnv = typeof __firebase_config !== 'undefined';
const firebaseConfig = isCanvasEnv ? JSON.parse(__firebase_config) : myFirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 💡 自動切換資料庫路徑，完美相容預覽與正式環境
const getViolationsRef = () => {
  if (isCanvasEnv) {
    const canvasAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    return collection(db, 'artifacts', canvasAppId, 'public', 'data', 'violations');
  }
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
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-white hover:bg-slate-50 p-3.5 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-blue-400 focus:ring-4 ring-blue-100 transition-all cursor-pointer shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-slate-500 text-sm font-bold ml-1">違規節次</label>
              <select value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} className="w-full bg-white hover:bg-slate-50 p-3.5 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-blue-400 focus:ring-4 ring-blue-100 transition-all cursor-pointer shadow-sm">
                {['第 1 節', '第 2 節', '第 3 節', '第 4 節', '午休時間', '第 5 節', '第 6 節', '第 7 節'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-500 text-sm font-bold ml-1">狀態</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-white hover:bg-slate-50 p-3.5 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-blue-400 focus:ring-4 ring-blue-100 transition-all cursor-pointer shadow-sm">
                <option value="下課時間">下課時間</option>
                <option value="上課中">上課中</option>
              </select>
            </div>

            <div className="space-y-2 pt-4 mt-2 border-t border-slate-200/60">
              <label className="text-slate-500 text-sm font-bold ml-1">登記人 / 巡堂教師 / 單位</label>
              <input placeholder="請輸入登記人資訊" value={formData.registrar} onChange={(e) => setFormData({...formData, registrar: e.target.value})} className="w-full bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-4 ring-blue-100 outline-none font-bold transition-all shadow-sm" />
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2 mb-4">
              <h3 className="font-black text-slate-700 flex items-center gap-2 text-lg">
                <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                違規學生名單
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                目前登錄：{formData.students.length} 名
              </span>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {formData.students.map((student, idx) => (
                <div key={idx} className="p-5 md:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
                  {formData.students.length > 1 && (
                    <button type="button" onClick={() => handleRemoveStudent(idx)} className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50 hover:scale-110 transition-all border border-red-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10">
                      <XCircle size={22} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 ml-1">班級 (必填)</label>
                      <input placeholder="例如: 101" value={student.className} onChange={(e) => updateStudent(idx, 'className', e.target.value)} className="w-full bg-slate-50 focus:bg-white p-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-400 shadow-inner focus:shadow-blue-100 font-bold transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 ml-1">座號 (必填)</label>
                      <input placeholder="例如: 05" value={student.seatNumber} onChange={(e) => updateStudent(idx, 'seatNumber', e.target.value)} className="w-full bg-slate-50 focus:bg-white p-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-400 shadow-inner focus:shadow-blue-100 font-bold transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 ml-1">學生姓名 (選填)</label>
                      <input placeholder="姓名" value={student.studentName} onChange={(e) => updateStudent(idx, 'studentName', e.target.value)} className="w-full bg-slate-50 focus:bg-white p-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-400 shadow-inner focus:shadow-blue-100 font-bold transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleAddStudent} className="w-full py-4 mt-4 border-2 border-dashed border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
              <PlusCircle size={20} /> 新增同時間違規同學
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 mt-8">
          <button type="submit" className="w-full lg:w-auto lg:min-w-[300px] lg:float-right bg-blue-600 text-white py-4 px-10 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <CheckCircle2 size={24} /> 確認完成登錄
          </button>
          <div className="clear-both"></div>
        </div>
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
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-blue-900 font-black text-2xl w-full md:w-auto shrink-0">
          <FileSpreadsheet className="text-blue-500" size={28} /> <span>資料查詢與匯出</span>
        </div>
        
        <div className="flex-1 w-full max-w-xl relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            placeholder="搜尋班級、姓名或日期 (例如: 101 或 王小明)..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)} 
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-400 pl-12 pr-4 py-4 rounded-2xl outline-none font-bold transition-all shadow-sm focus:shadow-md" 
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
           <button onClick={() => exportToCSV(monthly)} className="flex-1 md:flex-none bg-blue-100 text-blue-700 hover:bg-blue-200 px-6 py-4 rounded-2xl text-sm font-black transition-colors flex items-center justify-center gap-2">
             <Download size={18}/> 依月下載
           </button>
           <button onClick={() => exportToCSV(records)} className="flex-1 md:flex-none bg-slate-800 text-white hover:bg-slate-700 px-6 py-4 rounded-2xl text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2">
             <Download size={18}/> 全部下載
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-black border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5">日期 / 節次</th>
                <th className="px-6 py-5">狀態</th>
                <th className="px-6 py-5">班級 / 座號</th>
                <th className="px-6 py-5">姓名</th>
                <th className="px-6 py-5">登記人</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="text-slate-700 font-bold hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base">{r.date}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{r.period}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${r.status==='上課中'?'bg-red-100 text-red-600':'bg-blue-100 text-blue-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">{r.className} <span className="text-slate-400 text-sm">({r.seatNumber}號)</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">{r.studentName || <span className="text-slate-300">-</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400 italic">{r.registrar || <span className="text-slate-300">-</span>}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold italic">
                    沒有找到符合的紀錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState('stats');
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [isShareMode, setIsShareMode] = useState(false);
  
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'form') {
      setIsShareMode(true);
      setTab('register'); 
    }
  }, []);

  // 💡 關鍵修復：在預覽環境使用特製金鑰，在正式環境使用匿名登入
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

  useEffect(() => {
    if (!user) return; 

    try {
      const collectionRef = getViolationsRef();
      const unsubscribe = onSnapshot(collectionRef, 
        (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setRecords(data);
          setLoading(false);
        },
        (error) => {
          console.error("Firestore Error:", error);
          setMsg({ text: "資料庫連線失敗，請確認網路狀態", type: "error" });
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Collection Init Error:", err);
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setMsg({ text: '系統尚未連線，請稍後再試', type: 'error' });
    
    const validStudents = formData.students.filter(s => s.className.trim() !== '' && s.seatNumber.trim() !== '');
    
    if (validStudents.length === 0) {
      return setMsg({ text: '請至少填寫一位同學的班級與座號', type: 'error' });
    }

    try {
      const promises = validStudents.map(student => {
        return addDoc(getViolationsRef(), { 
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
    
    const headers = ['日期', '節次', '狀態', '班級', '座號', '姓名', '登記人'];
    const body = data.map(r => [
      r.date || '', 
      r.period || '', 
      r.status || '', 
      r.className || '', 
      r.seatNumber || '', 
      r.studentName || '', 
      r.registrar || ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`));
    
    const csvContent = "\uFEFF" + headers.join(',') + '\n' + body.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `二中手機違規紀錄_${today}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link); 
    URL.revokeObjectURL(url); 
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
      <header className="bg-[#1a202c] text-white pt-6 pb-6 sticky top-0 z-50 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center border-2 border-blue-400 shadow-inner shrink-0">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-xl uppercase leading-none mb-1">二中手機管理系統</h1>
              <p className="text-[10px] md:text-xs text-blue-300 font-bold tracking-widest uppercase">
                {isShareMode ? 'Violation Registration Form' : 'Public Access Version'}
              </p>
            </div>
          </div>
          
          {!isShareMode && (
            <nav className="flex gap-2 bg-[#2d3748] rounded-2xl p-1.5 shadow-inner w-full md:w-auto">
              {[
                { id: 'stats', label: '統計報表', icon: <LayoutDashboard size={18}/> },
                { id: 'register', label: '違規登錄', icon: <PlusCircle size={18}/> },
                { id: 'search', label: '資料查詢', icon: <Search size={18}/> }
              ].map(btn => (
                <button 
                  key={btn.id} 
                  onClick={() => setTab(btn.id)} 
                  className={`flex-1 md:flex-none md:w-32 flex items-center justify-center gap-2 py-3 md:py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${tab === btn.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                >
                  {btn.icon}<span className="mt-0.5">{btn.label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {msg && (
        <div className={`fixed top-28 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-lg px-8 py-5 rounded-2xl shadow-2xl font-black text-base text-white transition-all text-center leading-relaxed ${msg.type === 'error' ? 'bg-red-600' : 'bg-green-600 animate-bounce'}`}>
          {msg.text}
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-6 mt-4 md:mt-6">
        {loading ? (
          <div className="text-center py-32 flex flex-col items-center gap-6 text-slate-300 font-black uppercase tracking-widest text-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            Connecting Cloud Database
          </div>
        ) : (
          <>
            {tab === 'stats' && !isShareMode && <StatsView stats={statsData} dateRange={dateRange} setDateRange={setDateRange} />}
            {tab === 'register' && <RegisterView formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} />}
            {tab === 'search' && !isShareMode && <SearchView records={records} exportToCSV={exportCSV} />}
          </>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-white/95 backdrop-blur-sm border-t border-slate-200 py-3 px-6 flex justify-between items-center text-xs text-slate-400 font-black z-50">
        <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full shadow-inner ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="tracking-tight uppercase">{user ? 'Cloud Database Connected' : 'Connecting...'}</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-80 bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
            <Database size={14} />
            <span className="tracking-wider">REALTIME SYNC</span>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}} />
    </div>
  );
}