import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { Shield, User, Lock, Globe, Phone, AlertCircle, KeyRound, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  // UI Toggles
  const [loginType, setLoginType] = useState('authority'); 
  const [step, setStep] = useState(1); // 1 = Credentials, 2 = OTP
  
  // DATA STATE
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DEPT_HEAD'); // Default selection for UI
  const [error, setError] = useState(''); 
  
  // OTP STATE
  const [otp, setOtp] = useState('');
  const [tempUser, setTempUser] = useState(null); 

  // --- STEP 1: CHECK CREDENTIALS ---
  const handleCredentialsCheck = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. THE REAL BACKEND CALL
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: username,
        password: password
      });

      console.log("CREDENTIALS VALID:", response.data);

      const user = response.data;
      const userRole = (user.role || '').toUpperCase();

      // 2. SECURITY CHECK: Tab Mismatch?
      // Block Employees trying to use Admin Tab
      if (loginType === 'authority' && (userRole === 'EMPLOYEE' || userRole === 'GOVT_EMPLOYEE')) {
          setError('Access Denied: Employees must use the "Employee" tab.');
          return;
      }
      // Block Admins trying to use Employee Tab
      if (loginType === 'employee' && userRole !== 'EMPLOYEE' && userRole !== 'GOVT_EMPLOYEE') {
          setError('Security Alert: Please use the "Official / Admin" tab.');
          return;
      }

      // 3. DECIDE NEXT STEP
      if (loginType === 'authority') {
          // Authority -> Go to Step 2 (OTP)
          setTempUser(user);
          setStep(2);
      } else {
          // Employee -> Login Immediately
          completeLogin(user);
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError('Invalid Credentials or Server Error');
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleOtpVerify = (e) => {
      e.preventDefault();
      // Mock OTP Check
      if (otp === '123456') {
          completeLogin(tempUser);
      } else {
          setError('Invalid OTP. Access Denied.');
      }
  };

  // --- FINAL: SAVE & REDIRECT ---
  const completeLogin = (user) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role); // Important for Route Protection
      localStorage.setItem('isLoggedIn', 'true');

      // Safe Redirect Logic based on BACKEND ROLE
      const userRole = (user.role || '').toUpperCase();

      if (userRole === 'DEPT_HEAD' || userRole === 'HEAD') {
          navigate('/admin');
      } else if (userRole === 'SUPER_ADMIN') {
          navigate('/super-admin');
      } else if (userRole === 'PROCUREMENT_OFFICER' || userRole === 'PO') {
          navigate('/procurement');
      } else if (userRole === 'AUDITOR') {
          navigate('/auditor');
      } else if (userRole === 'EMPLOYEE' || userRole === 'GOVT_EMPLOYEE') {
          navigate('/employee'); // Redirect Rahul here
      } else {
          // Fallback
          navigate('/');
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      
      {/* --- 1. TOP ACCESSIBILITY BAR --- */}
      <div className="bg-[#333] text-white text-[11px] py-1.5 px-4 md:px-16 flex justify-between items-center border-b border-gray-600">
         <div className="flex gap-4">
            <span className="hover:underline cursor-pointer border-r border-gray-500 pr-4">Government of India</span>
            <span className="hover:underline cursor-pointer">Ministry of Electronics & IT</span>
         </div>
         <div className="flex gap-3 items-center">
            <span className="bg-white text-black px-1 font-bold text-[9px] cursor-pointer">A+</span>
            <span className="bg-white text-black px-1 font-bold text-[9px] cursor-pointer">A-</span>
            <span className="hover:underline cursor-pointer flex items-center gap-1"><Globe size={10}/> English <span className="text-[9px]">▼</span></span>
            <span className="bg-orange-600 px-2 py-0.5 rounded text-white font-bold cursor-pointer">Screen Reader</span>
         </div>
      </div>

      {/* --- 2. MINISTRY HEADER --- */}
      <div className="bg-white py-3 px-4 md:px-16 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col items-center">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
                    alt="Ashoka Emblem" 
                    className="h-16 md:h-20 drop-shadow-sm"
                />
                <span className="text-[10px] font-bold mt-1 text-gray-700">सत्यमेव जयते</span>
            </div>
            <div className="flex flex-col justify-center">
                <h2 className="text-sm md:text-lg font-bold text-gray-800">Govt. Asset Lifecycle Management System</h2>
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Ministry of Electronics & Information Technology</h3>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-0.5">Government of India</p>
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
            <a href="#" className="hover:text-yellow-400 flex items-center gap-1">Home</a>
            <a href="#" className="hover:text-yellow-400">About GALMS</a>
            <a href="#" className="hover:text-yellow-400">Notifications <span className="bg-red-500 text-[9px] px-1 rounded animate-pulse">New</span></a>
            <a href="#" className="hover:text-yellow-400">User Manual</a>
            <a href="#" className="hover:text-yellow-400">Department Directory</a>
            <a href="#" className="hover:text-yellow-400 ml-auto flex items-center gap-1"><Phone size={14}/> Support</a>
         </div>
      </div>

      {/* --- 4. MAIN CONTENT --- */}
      <div className="flex-grow bg-[#f4f7fa] flex items-center justify-center p-6">
        
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-5xl w-full">
            
            {/* LEFT SIDE: NOTICE BOARD */}
            <div className="w-full md:w-5/12 bg-blue-50 border-r border-gray-200 flex flex-col relative">
               <div className="bg-[#1b3a6b] text-white p-4 font-bold flex items-center gap-2">
                  <AlertCircle size={18}/> Latest Announcements
               </div>
               <div className="p-6 space-y-4 overflow-y-auto h-full max-h-[400px]">
                  <div className="bg-white p-3 rounded border-l-4 border-red-500 shadow-sm">
                     <p className="text-xs text-red-600 font-bold mb-1">27 Jan 2026</p>
                     <p className="text-sm text-gray-700">Audit for FY 2025-26 initiated. All Departments to update stock registers.</p>
                  </div>
                  {loginType === 'authority' && (
                     <div className="bg-blue-100 p-3 rounded border border-blue-200 shadow-sm animate-pulse">
                         <p className="text-xs text-blue-800 font-bold mb-1">Security Notice</p>
                         <p className="text-sm text-gray-700">Authority Login now requires 2-Factor Authentication (OTP).</p>
                     </div>
                  )}
               </div>
               <div className="mt-auto bg-[#eef2f8] p-4 text-center border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-500">Technical Helpdesk</p>
                  <p className="text-lg font-bold text-[#0b1e3c]">1800-111-555</p>
               </div>
            </div>

            {/* RIGHT SIDE: LOGIN FORMS */}
            <div className="w-full md:w-7/12 p-8 md:p-10">
               <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                      {step === 1 ? 'Sign In' : 'Security Check'}
                  </h2>
                  <p className="text-sm text-gray-500">
                      {step === 1 ? 'Access the Secure Asset Portal' : 'Enter One-Time Password'}
                  </p>
               </div>

               {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm rounded">
                    <p className="font-bold">Login Failed</p>
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
                         <Shield size={14}/> Official / Admin
                      </button>
                      <button 
                         onClick={() => setLoginType('employee')}
                         className={`flex-1 py-2 text-sm font-bold rounded transition-all flex items-center justify-center gap-2 ${loginType === 'employee' ? 'bg-[#0b1e3c] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                         <User size={14}/> Employee
                      </button>
                   </div>
               )}

               {/* --- STEP 1 FORM (Credentials) --- */}
               {step === 1 && (
                   <form onSubmit={handleCredentialsCheck} className="space-y-5">
                      
                      {loginType === 'authority' ? (
                          <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role / Designation</label>
                                <select 
                                   className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none"
                                   value={role}
                                   onChange={(e) => setRole(e.target.value)}
                                >
                                   <option value="DEPT_HEAD">Dept. Head (Joint Secretary)</option>
                                   <option value="PROCUREMENT_OFFICER">Procurement Officer (PO)</option>
                                   <option value="SUPER_ADMIN">System Administrator (NIC)</option>
                                   <option value="AUDITOR">CAG Auditor</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">User ID / Email</label>
                                <input 
                                   type="text" 
                                   className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800" 
                                   placeholder="e.g. priya_head"
                                   value={username}
                                   onChange={(e) => setUsername(e.target.value)}
                                />
                             </div>
                          </div>
                      ) : (
                          <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Employee ID / Username</label>
                                <input 
                                   type="text" 
                                   className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800" 
                                   placeholder="e.g. rahul"
                                   value={username}
                                   onChange={(e) => setUsername(e.target.value)}
                                />
                             </div>
                          </div>
                      )}

                      <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                          <div className="relative">
                             <Lock size={16} className="absolute left-3 top-3 text-gray-400"/>
                             <input 
                                type="password" 
                                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-800" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                             />
                          </div>
                      </div>

                      <button className="w-full bg-[#1b3a6b] hover:bg-[#12294d] text-white font-bold py-3 rounded-md shadow-lg transition-all">
                          {loginType === 'authority' ? 'Proceed to Security Check' : 'Login Securely'}
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
                          Secure OTP sent to ******8821.
                      </p>

                      <div>
                          <input 
                             type="text" 
                             className="w-2/3 text-center text-2xl font-mono font-bold tracking-[0.3em] border-b-4 border-gray-300 focus:border-green-500 outline-none py-2 mx-auto block uppercase"
                             placeholder="------"
                             maxLength={6}
                             value={otp}
                             onChange={(e) => setOtp(e.target.value)}
                             autoFocus
                          />
                          <p className="text-xs text-gray-400 mt-2">Test Code: <span className="font-bold text-black">123456</span></p>
                      </div>

                      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md shadow-lg flex items-center justify-center gap-2">
                          <CheckCircle size={16}/> Verify & Access
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => { setStep(1); setError(''); }} 
                        className="text-xs text-gray-500 underline hover:text-black"
                      >
                          Cancel
                      </button>
                   </form>
               )}

            </div>
        </div>
      </div>

      <div className="bg-[#2a2a2a] text-gray-300 py-6 text-center border-t-4 border-yellow-500">
         <p className="text-[10px] text-gray-400">Content Owned by Ministry of Electronics & IT, Government of India.</p>
      </div>
    </div>
  );
};

export default Login;