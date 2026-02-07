import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import axios from 'axios';

const ProcurementForm = () => {
  const navigate = useNavigate();
  
  // 1. STATE MATCHES BACKEND MODEL
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Hardware',
    estimatedCost: '',
    vendorName: '',       // <--- NEW: For Asset Supplier Logic
    requesterName: 'Amit Kumar (PO)', // In real app, get from localStorage
    type: 'PROCUREMENT',  // <--- NEW: Enum for Controller Routing
    justification: ''
  });

  // 2. GENERIC CHANGE HANDLER
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. SUBMIT TO JAVA BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pass 'username' query param as expected by your new Controller logic
      await axios.post(`http://localhost:8080/api/workflow/submit?username=amit_po`, formData);
      alert("✅ Indent Created Successfully! Sent to Dept. Head for Approval.");
      navigate('/procurement'); // Go back to dashboard
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to submit request. Ensure Backend is running.");
    }
  };

  return (
    <DashboardLayout role="PROCUREMENT_OFFICER">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/procurement')} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-[#0b1e3c]">Create New Indent (Form GFR-101)</h2>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 border-t-4 border-orange-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ROW 1: Item & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Item Name / Description</label>
                <input 
                  required 
                  type="text" 
                  name="itemName"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-900 outline-none"
                  placeholder="e.g. Dell Latitude 5420"
                  onChange={handleChange} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                    name="category"
                    className="w-full border border-gray-300 rounded p-2 bg-white outline-none"
                    onChange={handleChange}
                >
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Furniture</option>
                  <option>Vehicle</option>
                </select>
              </div>
            </div>

            {/* ROW 2: Vendor & Cost (CRITICAL FOR LOGIC) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Proposed Vendor / Source</label>
                    <div className="relative">
                        <Building2 size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                            type="text" 
                            name="vendorName" 
                            required 
                            list="vendors"
                            placeholder="e.g. GeM - Dell India"
                            className="w-full border border-gray-300 rounded p-2 pl-9 focus:ring-2 focus:ring-blue-900 outline-none"
                            onChange={handleChange}
                        />
                    </div>
                    {/* Auto-Suggestions for Govt Vendors */}
                    <datalist id="vendors">
                        <option value="GeM Portal (Direct Purchase)"/>
                        <option value="Kendriya Bhandar"/>
                        <option value="NCCF India"/>
                        <option value="L1 Bidder - Open Tender"/>
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Total Estimated Cost (₹)</label>
                    <input 
                        type="number" 
                        name="estimatedCost"
                        required
                        className="w-full border border-gray-300 rounded p-2 outline-none"
                        placeholder="50000"
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* ROW 3: Justification */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Justification / Reason</label>
              <textarea 
                name="justification"
                rows="3"
                className="w-full border border-gray-300 rounded p-2 outline-none"
                placeholder="Why is this purchase required?"
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => navigate('/procurement')} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-[#0b1e3c] text-white font-bold rounded shadow-md hover:bg-blue-900 flex items-center gap-2">
                <Save size={18} /> Submit Indent
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProcurementForm;