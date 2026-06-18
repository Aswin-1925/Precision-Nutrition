import * as XLSX from 'xlsx';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ShieldCheck, Pill, Utensils, HeartPulse, FileText, Upload, Users, ChevronRight } from 'lucide-react';

export default function App() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New States for Dynamic Dataset Upload
  const [csvData, setCsvData] = useState([]);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [uploadError, setUploadError] = useState(null);

// 1. Handle the Excel (.xlsx) File Upload with Cross-Sheet Mapping
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError(null);
    setReport(null); 

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // 1. Read Sheet 0 (Master) and Sheet 2 (Test Set)
        const masterSheetName = workbook.SheetNames[0]; 
        const testSheetName = workbook.SheetNames[2]; 
        
        const masterData = XLSX.utils.sheet_to_json(workbook.Sheets[masterSheetName], { defval: 0 });
        const testData = XLSX.utils.sheet_to_json(workbook.Sheets[testSheetName], { defval: 0 });

        // 2. Build a unique "Fingerprint Map" from Sheet 0
        // We use 3 highly specific floats to perfectly identify the patient across sheets
        const masterLookup = {};
        masterData.forEach(row => {
            const fingerprint = `${row.Acetate}_${row.Butyrate}_${row.Propionate}`;
            masterLookup[fingerprint] = row.Disease; // Captures the exact string (e.g., "Type 2 Diabetes")
        });

        // 3. Inject the exact Disease string into the Test Data
        const enrichedTestData = testData.map(row => {
            const fingerprint = `${row.Acetate}_${row.Butyrate}_${row.Propionate}`;
            let exactCondition = masterLookup[fingerprint];

            // If fingerprint mapping misses, fallback to the row's own Disease column
            if (exactCondition === undefined) {
                exactCondition = row.Disease;
            }

            // Normalize all variations of "Healthy"
            if (
                exactCondition === 0 || 
                exactCondition === "0" || 
                exactCondition === 0.0 || 
                exactCondition === "No disease" || 
                !exactCondition
            ) {
                exactCondition = "Healthy";
            }

            return {
                ...row,
                Disease_Name: exactCondition
            };
        });
        
        if (enrichedTestData && enrichedTestData.length > 0) {
          setCsvData(enrichedTestData);
          setSelectedPatientIndex(0);
        } else {
          setUploadError("No usable rows found in the workbook.");
        }
      } catch (error) {
        console.error(error);
        setUploadError("Failed to parse the Excel file. Please ensure it is a valid .xlsx document.");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  // 2. Run AI Analysis with Crash Protection
  const analyzePatient = async () => {
    if (csvData.length === 0) return;
    
    setLoading(true);
    setUploadError(null); // Clear any old errors
    const activePatientProfile = csvData[selectedPatientIndex];

    try {
      const response = await fetch('https://presonalized-nutrition.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: activePatientProfile })
      });
      
      const data = await response.json();

      // PROTECT REACT: If Python crashed, throw the error to the screen!
      if (!response.ok) {
        throw new Error(data.detail || "Unknown Python Backend Error");
      }

      setReport(data);
    } catch (err) {
      console.error(err);
      setUploadError(`AI Engine Error: ${err.message}`);
      setReport(null); // Keep report null so React doesn't crash
    }
    setLoading(false);
  };
  const activePatient = csvData[selectedPatientIndex];

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="text-blue-600"/> Personalized Nutrition Platform
            </h1>
            <p className="text-slate-500 font-medium mt-1">Multi-Omics Patient Analysis</p>
          </div>
          <div className="text-right">
             <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cohort Size</div>
             <div className="text-2xl font-black text-blue-900">{csvData.length > 0 ? csvData.length : "0"} Patients</div>
          </div>
        </div>

        {uploadError && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg font-bold border border-red-200">
            {uploadError}
          </div>
        )}

        {/* INTAKE PORTAL & CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* File Upload Area */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Upload size={18}/> 1.  Clinical Data (XLSX/CSV)
             </h2>
             <input 
                type="file" 
                accept=".csv, .xlsx , .xls" 
                onChange={handleFileUpload}
               className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
             />
          </div>

          {/* Patient Selector Area */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={18}/> 2. Select Patient Profile
             </h2>
             {csvData.length > 0 ? (
               <div className="flex gap-4 items-end">
                 <div className="flex-1">
                   <select 
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                      value={selectedPatientIndex}
                      onChange={(e) => {
                        setSelectedPatientIndex(Number(e.target.value));
                        setReport(null); // Clear report when switching patients
                      }}
                   >
                     {csvData.map((_, index) => (
                       <option key={index} value={index}>
                         De-identified Record #{index}
                       </option>
                     ))}
                   </select>
                 </div>
                 <button 
                    onClick={analyzePatient}
                    disabled={loading}
                    className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Analyzing..." : "Run"} <ChevronRight size={18}/>
                  </button>
               </div>
             ) : (
               <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-400 text-sm font-medium">
                 Awaiting dataset upload...
               </div>
             )}
          </div>
        </div>

        {/* DYNAMIC CLINICAL REPORT */}
        {report && activePatient && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            
            {/* LEFT COLUMN: Doctor's Note & Status */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Vitals Summary Card */}
              <div className="bg-slate-800 text-white p-6 rounded-xl shadow-md">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Patient Target Profile</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-xs">Assigned ID</div>
                    <div className="font-bold">Record #{selectedPatientIndex}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Reported Age</div>
                    <div className="font-bold">{activePatient.Age === 0 ? "Not Disclosed" : activePatient.Age}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Biological Sex</div>
                    <div className="font-bold">{activePatient.Sex === 0 ? "Female" : activePatient.Sex === 1 ? "Male" : activePatient.Sex}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Diet Ontology</div>
                    <div className="font-bold">{activePatient.Diet_Type === 1 ? "Plant" : activePatient.Diet_Type === 0 ? "Animal" : "Unknown"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Condition</div>
                    <div className={`font-bold ${activePatient.Disease_Name === "Healthy" ? "text-emerald-400" : "text-rose-400"}`}>
                      {activePatient.Disease_Name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <HeartPulse size={18}/> Systemic Status
                </h2>
                <div className={`p-4 rounded-lg border ${report.dysbiosis_risk_score > 50 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                  <div className="text-4xl font-black mb-1">{report.dysbiosis_risk_score}%</div>
                  <div className="font-bold uppercase tracking-wide text-sm">Dysbiosis Risk Factor</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={18}/> Dietician's Summary
                </h2>
                <p className="text-slate-700 leading-relaxed font-medium text-sm">
                  {report.clinical_recommendations.consultation_summary}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Biological Mapping & Prescriptions */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Biomarker Mapping */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity size={18}/> Target Biomarkers (Patient #{selectedPatientIndex})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(report.clinical_recommendations.biomarker_status).map(([key, data]) => (
                    <div key={key} className="flex flex-col p-3 bg-slate-50 rounded-md border border-slate-100">
                      <span className="font-bold text-slate-700 text-sm mb-1">{key}</span>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-mono text-xs">{data.value.toFixed(4)}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase
                          ${data.status === 'Deficient' ? 'bg-red-100 text-red-700' : 
                            data.status === 'Excessive' ? 'bg-orange-100 text-orange-700' : 
                            'bg-emerald-100 text-emerald-700'}`}>
                          {data.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Prescription */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Utensils size={18}/> Targeted Nutritional Intervention
                </h2>

                <div className="mb-6">
                  <h3 className="text-slate-800 font-bold mb-2 flex items-center gap-2">
                    <ShieldCheck className="text-emerald-600" size={18}/> Biological Goals
                  </h3>
                  <ul className="list-disc list-inside text-slate-600 font-medium space-y-1 text-sm">
                    {report.clinical_recommendations.vitals_management.length > 0 
                      ? report.clinical_recommendations.vitals_management.map((goal, i) => <li key={i}>{goal}</li>)
                      : <li>Maintain current dietary diversity; no critical interventions required.</li>
                    }
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <h3 className="font-bold text-emerald-800 mb-3 border-b border-emerald-200 pb-2 text-sm">Prescribed Foods (Add)</h3>
                    <ul className="space-y-2">
                      {report.clinical_recommendations.dietary_prescription.foods_to_add.map((food, i) => (
                        <li key={i} className="text-xs text-emerald-900 flex items-start gap-2 font-medium">
                          <span className="text-emerald-500 mt-0.5">•</span> {food}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <h3 className="font-bold text-red-800 mb-3 border-b border-red-200 pb-2 text-sm">Restricted Foods (Reduce)</h3>
                    <ul className="space-y-2">
                      {report.clinical_recommendations.dietary_prescription.foods_to_reduce.map((food, i) => (
                        <li key={i} className="text-xs text-red-900 flex items-start gap-2 font-medium">
                          <span className="text-red-500 mt-0.5">•</span> {food}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                    <Pill size={16}/> Clinical Rationale
                  </h3>
                  <ul className="space-y-2">
                    {report.clinical_recommendations.dietary_prescription.clinical_rationale.map((rationale, i) => (
                      <li key={i} className="text-xs text-blue-900 font-medium leading-relaxed">{rationale}</li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
      {/* FOOTER - AUTHOR CREDIT */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center pb-4">
          <p className="text-slate-500 text-sm font-medium">
            Architected & Developed by <span className="font-bold text-slate-700">Aswin vs</span>
          </p>
          <p className="text-slate-400 text-xs mt-1">
            B.Tech Biotechnology, Karunya Institute of Technology and Sciences
          </p>
        </div>
    </div>
  );
}
