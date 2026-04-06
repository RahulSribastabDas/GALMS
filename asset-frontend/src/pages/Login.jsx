import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
  Shield, User, Lock, Globe, Phone, AlertTriangle, 
  KeyRound, CheckCircle, Bell, Info, ChevronRight, Loader2
} from 'lucide-react';

// --- FULL TRANSLATION DICTIONARY ---
const translations = {
  en: {
    govtOfIndia: "Government of India",
    meity: "Ministry of Electronics & IT",
    screenReader: "Screen Reader",
    title: "Govt. Asset Lifecycle Management System",
    subtitle: "Ministry of Electronics & Information Technology",
    home: "Home",
    about: "About GALMS",
    notifications: "Notifications",
    new: "New",
    userManual: "User Manual",
    directory: "Department Directory",
    support: "Support",
    announcements: "Latest Announcements",
    signIn: "Sign In",
    accessPortal: "Access the Secure Asset Portal",
    officialTab: "Official / Admin",
    employeeTab: "Employee",
    roleLabel: "Role / Designation",
    userIdLabel: "User ID",
    employeeIdLabel: "Employee ID / Username",
    passwordLabel: "Password",
    proceedBtn: "Proceed to Security Check",
    loginBtn: "Login Securely",
    helpdesk: "Technical Helpdesk",
    footer: "Content Owned by Ministry of Electronics & IT, Government of India."
  },
  hi: {
    govtOfIndia: "भारत सरकार",
    meity: "इलेक्ट्रॉनिक्स और आईटी मंत्रालय",
    screenReader: "स्क्रीन रीडर",
    title: "सरकारी संपत्ति जीवनचक्र प्रबंधन प्रणाली",
    subtitle: "इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय",
    home: "मुख्य पृष्ठ",
    about: "GALMS के बारे में",
    notifications: "सूचनाएं",
    new: "नया",
    userManual: "उपयोगकर्ता मैनुअल",
    directory: "विभाग निर्देशिका",
    support: "सहायता",
    announcements: "नवीनतम घोषणाएं",
    signIn: "साइन इन करें",
    accessPortal: "सुरक्षित संपत्ति पोर्टल तक पहुंचें",
    officialTab: "अधिकारी / व्यवस्थापक",
    employeeTab: "कर्मचारी",
    roleLabel: "भूमिका / पदनाम",
    userIdLabel: "उपयोगकर्ता आईडी",
    employeeIdLabel: "कर्मचारी आईडी / उपयोगकर्ता नाम",
    passwordLabel: "पासवर्ड",
    proceedBtn: "सुरक्षा जांच के लिए आगे बढ़ें",
    loginBtn: "सुरक्षित रूप से लॉगिन करें",
    helpdesk: "तकनीकी सहायता डेस्क",
    footer: "सामग्री इलेक्ट्रॉनिक्स और आईटी मंत्रालय, भारत सरकार के स्वामित्व में है।"
  }
};

const Login = () => {
  const navigate = useNavigate();
  
  // --- UI & LANGUAGE STATE ---
  const [lang, setLang] = useState('en');
  const t = translations[lang]; 
  const [loginType, setLoginType] = useState('authority'); 
  const [step, setStep] = useState(1); 
  const [showNotifications, setShowNotifications] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  // --- DATA STATE ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DEPT_HEAD'); 
  const [error, setError] = useState(''); 
  
  // --- OTP STATE ---
  const [otp, setOtp] = useState('');
  const [targetEmail, setTargetEmail] = useState(''); 

  // --- LIVE ANNOUNCEMENTS STATE ---
  const [liveAnnouncements, setLiveAnnouncements] = useState([]);

  // --- FETCH ANNOUNCEMENTS FROM POSTGRESQL ---
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/announcements/public');
        setLiveAnnouncements(response.data);
      } catch (error) {
        console.error("Could not fetch announcements:", error);
        setLiveAnnouncements([
          { id: 0, type: "INFO", title: "System Connection", date: new Date().toLocaleDateString(), text: "Operating in secure offline mode. Live updates paused." }
        ]);
      }
    };
    fetchAnnouncements();
  }, []);

  // --- INTEGRATED: SMART LOGIN LOGIC ---
  const handleCredentialsCheck = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: username,
        password: password
      });

      // ALWAYS show the OTP screen now
      if (response.data.message === "OTP_REQUIRED") {
          setTargetEmail(response.data.email || 'your registered email');
          setStep(2); 
      } else {
          setError('Unexpected response from server.');
      }

    } catch (err) {
      setError('Invalid Credentials. Access Denied.');
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/verify-otp', {
        username: username,
        otp: otp
      });
      completeLogin(response.data);
    } catch (err) {
      setError('Invalid or Expired OTP. Access Denied.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- INTEGRATED: SMART ROUTING LOGIC ---
  const completeLogin = (userData) => {
    localStorage.setItem('token', userData.token); 
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('isLoggedIn', 'true');

    // If it's a first-time login, force them to the password setup page
    if (userData.firstLogin === true) {
      navigate('/employee'); 
      return; 
    }

    const userRole = (userData.role || '').toUpperCase();
    if (userRole === 'SUPER_ADMIN') navigate('/super-admin');
    else if (userRole === 'CAG_AUDITOR' || userRole === 'AUDITOR') navigate('/cag-dashboard');
    else if (userRole === 'PROCUREMENT_OFFICER' || userRole === 'PO') navigate('/po-dashboard');
    else if (userRole === 'DEPT_HEAD' || userRole === 'HEAD') navigate('/dept-dashboard');
    else navigate('/employee'); 
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      
      {/* --- 1. TOP ACCESSIBILITY BAR (Retained Full UI) --- */}
      <div className="bg-[#333] text-white text-[11px] py-1.5 px-4 md:px-16 flex justify-between items-center border-b border-gray-600">
         <div className="flex gap-4">
            <span className="hover:underline cursor-pointer border-r border-gray-500 pr-4">{t.govtOfIndia}</span>
            <span className="hover:underline cursor-pointer">{t.meity}</span>
         </div>
         <div className="flex gap-3 items-center">
            <span className="bg-white text-black px-1 font-bold text-[9px] cursor-pointer">A+</span>
            <span className="bg-white text-black px-1 font-bold text-[9px] cursor-pointer">A-</span>
            
            <div className="flex items-center gap-1 hover:text-yellow-400">
              <Globe size={10}/>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-xs font-bold appearance-none text-white"
              >
                <option value="en" className="text-black">English</option>
                <option value="hi" className="text-black">हिन्दी</option>
              </select>
            </div>
            <span className="bg-orange-600 px-2 py-0.5 rounded text-white font-bold cursor-pointer">{t.screenReader}</span>
         </div>
      </div>

      {/* --- 2. MINISTRY HEADER (Retained Emblems & Logos) --- */}
      <div className="bg-white py-3 px-4 md:px-16 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" alt="Ashoka Emblem" className="h-16 md:h-20 drop-shadow-sm"/>
                <span className="text-[10px] font-bold mt-1 text-gray-700">सत्यमेव जयते</span>
            </div>
            <div className="flex flex-col justify-center border-l-2 border-gray-100 pl-4 ml-2">
                <h2 className="text-sm md:text-lg font-extrabold text-[#0b1e3c] uppercase tracking-tight leading-tight">{t.title}</h2>
                <h3 className="text-xs md:text-sm font-semibold text-gray-500">{t.subtitle}</h3>
                <p className="text-[10px] text-orange-600 font-black uppercase tracking-[0.2em] mt-1">{t.govtOfIndia}</p>
            </div>
         </div>
         <div className="flex items-center gap-4 md:gap-6">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeiYL8dnSQZExuB8Xq8X57FaZyeErqQLWj4Q&s" alt="Digital India" className="h-8 md:h-12 hover:scale-105 transition-transform"/>
            <img src="https://www.uxdt.nic.in/wp-content/uploads/2022/12/stronga-hrefhttpsuxdt-nic-inwp-adminpost-phppost4464ampactioneditindias-g20-presidencyastrong-g20-preview.jpg" alt="G20 Logo" className="h-8 md:h-12"/>
         </div>
      </div>

      {/* --- 3. NAVIGATION BAR --- */}
      <div className="bg-[#0b1e3c] text-white text-sm font-medium shadow-md border-t-4 border-orange-500 relative z-50">
         <div className="container mx-auto px-4 md:px-16 py-3 flex flex-wrap items-center gap-6 md:gap-8">
            <button onClick={() => handleNavClick('/')} className="hover:text-yellow-400 transition-colors uppercase font-bold tracking-wider">{t.home}</button>
            <button className="hover:text-yellow-400 transition-colors uppercase font-bold tracking-wider">{t.about}</button>
            
            <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`flex items-center gap-1.5 transition-colors uppercase font-bold tracking-wider ${showNotifications ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                >
                    <Bell size={16} /> {t.notifications} 
                    <span className="bg-red-500 text-[9px] px-1.5 py-0.5 rounded-full animate-pulse shadow-sm font-bold">
                        {liveAnnouncements.length}
                    </span>
                </button>

                {showNotifications && (
                    <div className="absolute top-full left-0 mt-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[100] text-black">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-gray-800 font-bold text-sm">System Updates</h4>
                            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-800 font-bold">✕</button>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                            {liveAnnouncements.map(notif => (
                                <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer text-left">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                            {notif.type || 'Update'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">{notif.date}</span>
                                    </div>
                                    <h5 className="text-xs font-bold text-gray-800 mb-1">{notif.title}</h5>
                                    <p className="text-[11px] text-gray-600 line-clamp-2">{notif.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button className="hover:text-yellow-400 transition-colors uppercase font-bold tracking-wider">{t.userManual}</button>
            <button className="hover:text-yellow-400 transition-colors uppercase font-bold tracking-wider ml-auto flex items-center gap-1 text-orange-400">
                <Phone size={14}/> Support: 1800-111-555
            </button>
         </div>
      </div>

      {/* --- 4. MAIN LOGIN SECTION --- */}
      <div className="flex-grow bg-[#f4f7fa] flex items-center justify-center p-6 relative z-10">
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-6xl w-full min-h-[550px]">
            
            {/* NOTICE BOARD SIDE */}
            <div className="w-full md:w-5/12 bg-blue-50/50 border-r border-gray-200 flex flex-col relative">
               <div className="bg-[#1b3a6b] text-white p-5 font-black uppercase tracking-widest flex items-center gap-2">
                  <Info size={18}/> {t.announcements}
               </div>
               
               <div className="p-0 overflow-y-auto h-full max-h-[450px]">
                  {liveAnnouncements.map((item, index) => (
                      <div key={item.id} className={`p-6 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === 0 ? 'border-l-8 border-l-red-600' : 'border-l-8 border-l-blue-800'}`}>
                         <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">{item.type || 'Live'}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">{item.date}</p>
                         </div>
                         <h4 className="text-sm font-black text-gray-800 mb-2 leading-tight uppercase tracking-tight">{item.title}</h4>
                         <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.text}</p>
                      </div>
                  ))}
               </div>

               <div className="mt-auto bg-gray-100 p-6 text-center border-t border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.helpdesk}</p>
                  <p className="text-2xl font-black text-[#1b3a6b] tracking-tighter">1800-111-555</p>
                  <p className="text-[10px] text-gray-500 mt-1 italic font-medium">Mon - Sat | 09:00 AM - 06:00 PM</p>
               </div>
            </div>

            {/* LOGIN PORTAL SIDE */}
            <div className="w-full md:w-7/12 p-10 md:p-16 flex flex-col justify-center bg-white relative">
               
               <div className="mb-10 text-center">
                  <div className="inline-block bg-orange-100 p-3 rounded-full mb-4">
                     <ShieldCheck className="text-orange-600" size={32}/>
                  </div>
                  <h2 className="text-3xl font-black text-[#0b1e3c] uppercase tracking-tighter">
                      {step === 1 ? t.signIn : 'Security Check'}
                  </h2>
                  <p className="text-sm text-gray-400 font-medium mt-1">
                      {step === 1 ? t.accessPortal : `Verification code sent to ${targetEmail}`}
                  </p>
               </div>

               {error && (
                  <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 mb-8 text-xs font-bold flex items-center gap-3 rounded shadow-sm">
                    <AlertTriangle size={18}/> {error}
                  </div>
               )}

               {/* --- FORM STEP 1: CREDENTIALS --- */}
               {step === 1 && (
                   <form onSubmit={handleCredentialsCheck} className="space-y-6">
                      <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 shadow-inner">
                        <button 
                            type="button"
                            onClick={() => setLoginType('authority')} 
                            className={`flex-1 py-3 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${loginType === 'authority' ? 'bg-[#0b1e3c] text-white shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Shield size={14} className="inline mr-2"/> {t.officialTab}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setLoginType('employee')} 
                            className={`flex-1 py-3 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${loginType === 'employee' ? 'bg-[#0b1e3c] text-white shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <User size={14} className="inline mr-2"/> {t.employeeTab}
                        </button>
                      </div>

                      {loginType === 'authority' && (
                          <div className="animate-in fade-in duration-300">
                             <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{t.roleLabel}</label>
                             <div className="relative">
                                <Building2 size={16} className="absolute left-4 top-3.5 text-gray-400"/>
                                <select 
                                    className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-[#1b3a6b] transition-all bg-white appearance-none" 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="DEPT_HEAD">Dept. Head / Joint Secretary</option>
                                    <option value="PROCUREMENT_OFFICER">Procurement Officer (PO)</option>
                                    <option value="SUPER_ADMIN">System Administrator (NIC)</option>
                                    <option value="CAG_AUDITOR">CAG Auditor</option>
                                </select>
                             </div>
                          </div>
                      )}

                      <div>
                         <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{loginType === 'authority' ? t.userIdLabel : t.employeeIdLabel}</label>
                         <div className="relative">
                            <User size={18} className="absolute left-4 top-3.5 text-gray-400"/>
                            <input 
                                type="text" 
                                required
                                placeholder="Enter Username"
                                className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-[#1b3a6b] transition-all" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                            />
                         </div>
                      </div>

                      <div>
                         <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{t.passwordLabel}</label>
                         <div className="relative">
                            <Lock size={18} className="absolute left-4 top-3.5 text-gray-400"/>
                            <input 
                                type="password" 
                                required
                                placeholder="••••••••"
                                className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-[#1b3a6b] transition-all" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                            />
                         </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#1b3a6b] hover:bg-[#0b1e3c] text-white font-black py-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm"
                      >
                         {isLoading ? <Loader2 className="animate-spin" size={20}/> : <>{t.loginBtn} <ChevronRight size={18}/></>}
                      </button>
                   </form>
               )}

               {/* --- FORM STEP 2: OTP VERIFICATION --- */}
               {step === 2 && (
                   <form onSubmit={handleOtpVerify} className="space-y-8 text-center animate-in zoom-in duration-300">
                      <div className="flex justify-center mb-4">
                         <div className="bg-green-100 p-6 rounded-full border-4 border-white shadow-xl">
                            <KeyRound size={48} className="text-green-600"/>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Enter 6-Digit OTP</p>
                         <input 
                            type="text" 
                            className="w-full text-center text-4xl font-mono font-black tracking-[0.6em] border-b-4 border-gray-200 focus:border-green-600 outline-none py-4 bg-transparent transition-all"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="000000"
                            autoFocus
                         />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-xl shadow-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest"
                      >
                         {isLoading ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle size={20}/> Verify & Secure Access</>}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setStep(1); setOtp(''); }} 
                        className="text-[10px] font-black text-gray-400 hover:text-[#0b1e3c] uppercase tracking-[0.2em] transition-colors"
                      >
                         ← Back to Login
                      </button>
                   </form>
               )}
            </div>
        </div>
      </div>

      {/* --- 5. FOOTER --- */}
      <div className="bg-[#111] text-gray-500 py-6 text-center border-t-8 border-orange-600">
         <div className="container mx-auto px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-white">{t.footer}</p>
            <div className="flex justify-center gap-6 text-[9px] font-bold">
               <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
               <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
               <span className="hover:text-white cursor-pointer transition-colors">Help Center</span>
            </div>
            <p className="text-[9px] text-gray-600 mt-4 italic font-medium">Platform version: GALMS-V2.0.4.NIC (Build 2026)</p>
         </div>
      </div>
    </div>
  );
};

// Helper Icon for Dept Selection
const Building2 = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/></svg>
);

// Helper Icon for Branding
const ShieldCheck = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Login;