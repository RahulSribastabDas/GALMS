import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { Shield, User, Lock, Globe, Phone, AlertCircle, KeyRound, CheckCircle } from 'lucide-react';

// --- TRANSLATION DICTIONARY ---
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
    auditNotice: "Audit for FY 2025-26 initiated. All Departments to update stock registers.",
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
    auditNotice: "वित्तीय वर्ष 2025-26 के लिए ऑडिट शुरू। सभी विभाग स्टॉक रजिस्टर अपडेट करें।",
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
  
  // --- LANGUAGE STATE ---
  const [lang, setLang] = useState('en');
  const t = translations[lang]; // Pulls the correct language words!

  // UI Toggles
  const [loginType, setLoginType] = useState('authority'); 
  const [step, setStep] = useState(1); 
  
  // DATA STATE
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DEPT_HEAD'); 
  const [error, setError] = useState(''); 
  
  // OTP STATE
  const [otp, setOtp] = useState('');
  const [targetEmail, setTargetEmail] = useState(''); 

  // --- STEP 1: CHECK CREDENTIALS ---
  const handleCredentialsCheck = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: username,
        password: password
      });

      if (response.data.message === "OTP_REQUIRED") {
          setTargetEmail(response.data.email || 'your registered email');
          setStep(2); 
      } else if (response.data.token) {
          completeLogin(response.data);
      } else {
          setError('Unexpected response from server.');
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError('Invalid Credentials or Server Error');
    }
  };

  // --- STEP 2: VERIFY REAL OTP ---
  const handleOtpVerify = async (e) => {
      e.preventDefault();
      setError('');
      try {
          const response = await axios.post('http://localhost:8080/api/auth/verify-otp', {
              username: username,
              otp: otp
          });
          completeLogin(response.data);
      } catch (err) {
          setError('Invalid or Expired OTP. Access Denied.');
      }
  };

  // --- FINAL: SAVE & REDIRECT ---
  const completeLogin = (userData) => {
      localStorage.setItem('token', userData.token); 
      localStorage.setItem('user', JSON.stringify({ username: userData.username, role: userData.role }));
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('isLoggedIn', 'true');

      if (loginType === 'employee') {
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      
      {/* --- 1. TOP ACCESSIBILITY BAR --- */}
      <div className="bg-[#333] text-white text-[11px] py-1.5 px-4 md:px-16 flex justify-between items-center border-b border-gray-600">
         <div className="flex gap-4">
            <span className="hover:underline cursor-pointer border-r border-gray-500 pr-4">{t.govtOfIndia}</span>
            <span className="hover:underline cursor-pointer">{t.meity}</span>
         </div>
         <div className="flex gap-3 items-center">
            <span className="bg-white text-black px-1 font-bold text-[9px] cursor-pointer">A+</span>
            <span className="bg-white text-black px-1 font-bold text-[9px] cursor-pointer">A-</span>
            
            {/* --- LANGUAGE DROPDOWN --- */}
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

      {/* --- 2. MINISTRY HEADER --- */}
      <div className="bg-white py-3 px-4 md:px-16 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" alt="Ashoka Emblem" className="h-16 md:h-20 drop-shadow-sm"/>
                <span className="text-[10px] font-bold mt-1 text-gray-700">सत्यमेव जयते</span>
            </div>
            <div className="flex flex-col justify-center">
                <h2 className="text-sm md:text-lg font-bold text-gray-800">{t.title}</h2>
                <h3 className="text-xs md:text-sm font-medium text-gray-500">{t.subtitle}</h3>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-0.5">{t.govtOfIndia}</p>
            </div>
         </div>
         <div className="flex items-center gap-4 md:gap-6">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeiYL8dnSQZExuB8Xq8X57FaZyeErqQLWj4Q&s" alt="Digital India" className="h-8 md:h-12 hover:grayscale transition-all"/>
            <img src="https://www.uxdt.nic.in/wp-content/uploads/2022/12/stronga-hrefhttpsuxdt-nic-inwp-adminpost-phppost4464ampactioneditindias-g20-presidencyastrong-g20-preview.jpg" alt="G20 Logo" className="h-8 md:h-12"/>
         </div>
      </div>

      {/* --- 3. NAVIGATION BAR --- */}
      <div className="bg-[#0b1e3c] text-white text-sm font-medium shadow-md border-t-4 border-orange-500">
         <div className="container mx-auto px-4 md:px-16 py-3 flex flex-wrap gap-6 md:gap-8">
            <a href="#" className="hover:text-yellow-400 flex items-center gap-1">{t.home}</a>
            <a href="#" className="hover:text-yellow-400">{t.about}</a>
            <a href="#" className="hover:text-yellow-400">{t.notifications} <span className="bg-red-500 text-[9px] px-1 rounded animate-pulse">{t.new}</span></a>
            <a href="#" className="hover:text-yellow-400">{t.userManual}</a>
            <a href="#" className="hover:text-yellow-400">{t.directory}</a>
            <a href="#" className="hover:text-yellow-400 ml-auto flex items-center gap-1"><Phone size={14}/> {t.support}</a>
         </div>
      </div>

      {/* --- 4. MAIN CONTENT --- */}
      <div className="flex-grow bg-[#f4f7fa] flex items-center justify-center p-6">
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-5xl w-full">
            
            {/* LEFT SIDE: NOTICE BOARD */}
            <div className="w-full md:w-5/12 bg-blue-50 border-r border-gray-200 flex flex-col relative">
               <div className="bg-[#1b3a6b] text-white p-4 font-bold flex items-center gap-2">
                  <AlertCircle size={18}/> {t.announcements}
               </div>
               <div className="p-6 space-y-4 overflow-y-auto h-full max-h-[400px]">
                  <div className="bg-white p-3 rounded border-l-4 border-red-500 shadow-sm">
                     <p className="text-xs text-red-600 font-bold mb-1">27 Jan 2026</p>
                     <p className="text-sm text-gray-700">{t.auditNotice}</p>
                  </div>
               </div>
               <div className="mt-auto bg-[#eef2f8] p-4 text-center border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-500">{t.helpdesk}</p>
                  <p className="text-lg font-bold text-[#0b1e3c]">1800-111-555</p>
               </div>
            </div>

            {/* RIGHT SIDE: LOGIN FORMS */}
            <div className="w-full md:w-7/12 p-8 md:p-10">
               <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                      {step === 1 ? t.signIn : 'Security Check'}
                  </h2>
                  <p className="text-sm text-gray-500">
                      {step === 1 ? t.accessPortal : 'Enter One-Time Password'}
                  </p>
               </div>

               {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm rounded">
                    <p>{error}</p>
                  </div>
               )}

               {/* SHOW TABS ONLY ON STEP 1 */}
               {step === 1 && (
                   <div className="flex bg-gray-100 p-1 rounded-md mb-6">
                      <button 
                         onClick={() => setLoginType('authority')}
                         className={`flex-1 py-2 text-sm font-bold rounded transition-all flex items-center justify-center gap-2 ${loginType === 'authority' ? 'bg-[#0b1e3c] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                         <Shield size={14}/> {t.officialTab}
                      </button>
                      <button 
                         onClick={() => setLoginType('employee')}
                         className={`flex-1 py-2 text-sm font-bold rounded transition-all flex items-center justify-center gap-2 ${loginType === 'employee' ? 'bg-[#0b1e3c] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                         <User size={14}/> {t.employeeTab}
                      </button>
                   </div>
               )}

               {/* --- STEP 1 FORM (Credentials) --- */}
               {step === 1 && (
                   <form onSubmit={handleCredentialsCheck} className="space-y-5">
                      {loginType === 'authority' ? (
                          <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.roleLabel}</label>
                                <select 
                                   className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none"
                                   value={role}
                                   onChange={(e) => setRole(e.target.value)}
                                >
                                   <option value="DEPT_HEAD">Dept. Head (Joint Secretary)</option>
                                   <option value="PROCUREMENT_OFFICER">Procurement Officer (PO)</option>
                                   <option value="SUPER_ADMIN">System Administrator (NIC)</option>
                                   <option value="CAG_AUDITOR">CAG Auditor</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.userIdLabel}</label>
                                <input 
                                   type="text" 
                                   className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800" 
                                   value={username}
                                   onChange={(e) => setUsername(e.target.value)}
                                />
                             </div>
                          </div>
                      ) : (
                          <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.employeeIdLabel}</label>
                                <input 
                                   type="text" 
                                   className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800" 
                                   value={username}
                                   onChange={(e) => setUsername(e.target.value)}
                                />
                             </div>
                          </div>
                      )}

                      <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.passwordLabel}</label>
                          <div className="relative">
                             <Lock size={16} className="absolute left-3 top-3 text-gray-400"/>
                             <input 
                                type="password" 
                                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                             />
                          </div>
                      </div>

                      <button type="submit" className="w-full bg-[#1b3a6b] hover:bg-[#12294d] text-white font-bold py-3 rounded-md shadow-lg transition-all">
                          {loginType === 'authority' ? t.proceedBtn : t.loginBtn}
                      </button>
                   </form>
               )}

               {/* --- STEP 2 FORM (OTP) --- */}
               {step === 2 && (
                   <form onSubmit={handleOtpVerify} className="space-y-6 text-center animate-in zoom-in duration-300">
                      <div className="flex justify-center mb-2">
                          <div className="bg-green-100 p-3 rounded-full">
                              <KeyRound size={32} className="text-green-600"/>
                          </div>
                      </div>
                      <p className="text-xs text-gray-500">
                          Secure OTP sent to <span className="font-bold text-black">{targetEmail}</span>.
                      </p>
                      <div>
                          <input 
                             type="text" 
                             className="w-2/3 text-center text-2xl font-mono font-bold tracking-[0.3em] border-b-4 border-gray-300 focus:border-green-500 outline-none py-2 mx-auto block uppercase"
                             maxLength={6}
                             value={otp}
                             onChange={(e) => setOtp(e.target.value)}
                             autoFocus
                          />
                      </div>
                      <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md shadow-lg flex items-center justify-center gap-2">
                          <CheckCircle size={16}/> Verify & Access
                      </button>
                      <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); }} className="text-xs text-gray-500 underline hover:text-black mt-4 inline-block">
                          Cancel
                      </button>
                   </form>
               )}
            </div>
        </div>
      </div>

      <div className="bg-[#2a2a2a] text-gray-300 py-6 text-center border-t-4 border-yellow-500">
         <p className="text-[10px] text-gray-400">{t.footer}</p>
      </div>
    </div>
  );
};

export default Login;