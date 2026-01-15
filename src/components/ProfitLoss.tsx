import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  ChevronDown, 
  Download,
  AlertCircle,
  Table as TableIcon,
  Printer
} from 'lucide-react';
import { 
  getProfitLossData, 
  ProfitLossBackendData, 
  ProfitLossEntry 
} from '../services/api';

const TEMPLATES: ProfitLossBackendData = {
  'งบดำเนินการ': [
    { label: 'รายได้จากการดำเนินงาน', value: 0, isHeader: true },
    { label: 'รายได้จากเงินงบประมาณ (ก)', value: 0, isSubHeader: true },
    { label: 'เงินอุดหนุนโรงเรียนพระปริยัติธรรมฯ', value: 0 },
    { label: 'เงินอุดหนุนโรงเรียนพระปริยัติธรรมฯ ธรรม-บาลี', value: 0 },
    { label: 'อุดหนุนสมทบ โควิด', value: 0 },
    { label: 'รายได้จากแหล่งอื่น (ข)', value: 0, isSubHeader: true },
    { label: 'แม่กองธรรมสนามหลวง นักธรรมดีเด่น', value: 0 },
    { label: 'รายได้จากการบริจาค', value: 0 },
    { label: 'รายได้อื่นๆ', value: 0 },
    { label: 'รายได้จากดอกเบี้ย', value: 0 },
    { label: 'รวมรายได้ (ก)+(ข)', value: 0, isTotal: true },
    { label: 'ค่าใช้จ่ายจากการดำเนินงาน', value: 0, isHeader: true },
    { label: 'ค่าธรรมเนียมการโอน', value: 0 },
    { label: 'รวมค่าใช้จ่ายจากการดำเนินงาน', value: 0, isTotal: true },
    { label: 'เงินสำรองค่าใช้จ่ายล่วงหน้า', value: 0 },
    { label: 'คงเหลือสุทธิ', value: 0, isTotal: true },
    { label: 'สรุปผลการดำเนินงาน', value: 0, isHeader: true },
    { label: 'รายได้ (สูง) กว่ารายจ่าย ณ. วันที่ 30 ก.ย. 64', value: 0, isTotal: true },
  ],
  'งบนอก': [
    { label: 'รายได้จากการดำเนินงาน', value: 0, isHeader: true },
    { label: 'รายได้จากแหล่งอื่น', value: 0, isSubHeader: true },
    { label: 'รายได้จากการบริจาค', value: 0 },
    { label: 'รายได้อื่นๆ', value: 0 },
    { label: 'รายได้จากดอกเบี้ย', value: 0 },
    { label: 'รวมรายได้', value: 0, isTotal: true },
    { label: 'ค่าใช้จ่ายจากการดำเนินงาน', value: 0, isHeader: true },
    { label: 'รวมค่าใช้จ่ายจากการดำเนินงาน', value: 0, isTotal: true },
    { label: 'คงเหลือสุทธิ', value: 0, isTotal: true },
    { label: 'สรุปผลการดำเนินงาน', value: 0, isHeader: true },
    { label: 'รายได้ (สูง) กว่ารายจ่าย ณ. วันที่ 30 ก.ย. 64', value: 0, isTotal: true },
    { label: 'หมายเหตุ : ไม่มี', value: 0, isSubHeader: true },
  ],
  'งบอุดหนุน': [
    { label: 'รายได้จากการดำเนินงาน ต.ค 63 - ก.ย 64', value: 0, isHeader: true },
    { label: 'รายได้จากเงินงบประมาณ (ก)', value: 0, isSubHeader: true },
    { label: 'เงินอุดหนุนโรงเรียนพระปริยัติธรรมฯ', value: 0 },
    { label: 'เงินอุดหนุนโรงเรียนพระปริยัติธรรมฯ ธรรม-บาลี', value: 0 },
    { label: 'อุดหนุนสมทบ โควิด', value: 0 },
    { label: 'รายได้จากแหล่งอื่น (ข)', value: 0, isSubHeader: true },
    { label: 'ไม่มีรายการ', value: 0 },
    { label: 'รวมรายได้ (ก)+(ข)', value: 0, isTotal: true },
    { label: 'ค่าใช้จ่ายจากการดำเนินงาน ต.ค 63 - ก.ย 64', value: 0, isHeader: true },
    { label: 'อื่น ๆ ค่าธรรมเนียมธนาคาร', value: 0 },
    { label: 'ส่วนต่างรายงานจำนวนเต็มบาท', value: 0 },
    { label: 'รวมค่าใช้จ่ายจากการดำเนินงาน', value: 0, isTotal: true },
    { label: 'คงเหลือสุทธิ', value: 0, isTotal: true },
    { label: 'สรุปผลการดำเนินงาน', value: 0, isHeader: true },
    { label: 'รายได้ (สูง) กว่ารายจ่าย ณ. วันที่ 30 ก.ย. 64', value: 0, isTotal: true },
    { label: 'หมายเหตุ : ไม่มี', value: 0, isSubHeader: true },
  ]
};

interface ProfitLossData {
  sheets: {
    [name: string]: { label: string; value: any }[];
  };
  sheetNames: string[];
}

export const ProfitLoss: React.FC = () => {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [manualData, setManualData] = useState<ProfitLossBackendData>(TEMPLATES);
  const [currentManualTemplate, setCurrentManualTemplate] = useState<string>('งบดำเนินการ');
  const [useXlsx, setUseXlsx] = useState(false);
  const [currentSheet, setCurrentSheet] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2565);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch from Backend
  useEffect(() => {
    const fetchData = async () => {
       if (useXlsx) return; 
       setIsLoading(true);
       try {
         const backendData = await getProfitLossData(selectedYear);
         if (backendData && Object.keys(backendData).length > 0) {
           // Ensure we have data for all 4 standard templates, merging with local if necessary
           const mergedData = { ...TEMPLATES, ...backendData };
           setManualData(mergedData);
         }
       } catch (err) {
         console.log("Backend P&L not found, using local templates.");
       } finally {
         setIsLoading(false);
       }
    };
    fetchData();
  }, [selectedYear, useXlsx]);

  const cleanData = (rows: any[][]) => {
    return rows
      .filter(row => {
        if (!row || row.length === 0) return false;
        
        // Filter out completely empty rows
        const hasContent = row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
        if (!hasContent) return false;

        // Filter out rows containing "ลงนาม" (signatures within the data)
        const isSignatureRow = row.some(cell => cell && typeof cell === 'string' && cell.includes('ลงนาม'));
        if (isSignatureRow) return false;

        return true;
      })
      .map(row => {
        // Smart Alignment: Combine all textual descriptions into a single label
        // and find the first number to be the value.
        let labelParts: string[] = [];
        let foundValue: any = '';
        
        row.forEach(cell => {
          if (cell === null || cell === undefined || cell === '') return;
          
          const strCell = cell.toString().trim();
          
          // Skip "บาท" or "บ." since we add it manually/format it
          if (strCell === 'บาท' || strCell === 'บ.') return;

          // If it's a number (or a number-like string that isn't a year like 2565)
          const isNumber = !isNaN(Number(strCell.replace(/,/g, ''))) && strCell.length > 0;
          
          if (isNumber && foundValue === '') {
            foundValue = Number(strCell.replace(/,/g, ''));
          } else if (isNaN(Number(strCell.replace(/,/g, '')))) {
            labelParts.push(strCell);
          }
        });

        return {
          label: labelParts.join(' ').trim(),
          value: foundValue
        };
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUseXlsx(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        
        const sheetData: { [name: string]: { label: string; value: any }[] } = {};
        workbook.SheetNames.forEach(name => {
          const worksheet = workbook.Sheets[name];
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          sheetData[name] = cleanData(rawRows);
        });

        setData({
          sheets: sheetData,
          sheetNames: workbook.SheetNames
        });
        setCurrentSheet(workbook.SheetNames[0]);
      } catch (err) {
        console.error('Error parsing XLSX:', err);
        setError('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  const currentSheetData = data?.sheets[currentSheet] || [];
  const activeData = useXlsx ? currentSheetData : manualData[currentManualTemplate];

  const handlePrint = () => {
    window.print();
  };

  const updateManualValue = (index: number, val: string) => {
    const updatedTemplates = { ...manualData };
    const newData = [...updatedTemplates[currentManualTemplate]];
    const numVal = parseFloat(val.replace(/,/g, '')) || 0;
    newData[index] = { ...newData[index], value: numVal };
    updatedTemplates[currentManualTemplate] = newData;
    setManualData(updatedTemplates);
  };

  const formatNumber = (val: any) => {
    if (val === '' || val === null || val === undefined) return '-';
    if (typeof val === 'number') {
      return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toString();
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 overflow-auto">
      {/* Header Section (Not for print) */}
      <div className="mx-auto max-w-5xl mb-8 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileSpreadsheet className="text-white" size={32} />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Profit & Loss Statement
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${useXlsx ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                  {useXlsx ? 'Mode: Excel Import' : `Mode: Official Template (${currentManualTemplate})`}
                </p>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             {/* Year Selector */}
             <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm">
                <button onClick={() => setSelectedYear(y => y-1)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                  <ChevronDown size={18} className="rotate-90" />
                </button>
                <span className="px-4 font-bold text-slate-700 dark:text-slate-200">{selectedYear}</span>
                <button onClick={() => setSelectedYear(y => y+1)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                  <ChevronDown size={18} className="-rotate-90" />
                </button>
             </div>

            <button
              onClick={() => setUseXlsx(!useXlsx)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
                useXlsx 
                  ? 'bg-amber-500 text-white hover:bg-amber-600' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {useXlsx ? 'Switch to Locked Template' : 'Switch to Excel Mode'}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm active:scale-95"
            >
              <Upload size={18} className="text-blue-500" />
              Import XLSX
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />

      {error && (
        <div className="mx-auto max-w-5xl mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 print:hidden animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Report View Container */}
      <div className="mx-auto max-w-5xl bg-white text-black p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 print:shadow-none print:border-none print:p-0 min-h-[297mm] rounded-[2.5rem] print:rounded-none relative">
        {isLoading && !useXlsx && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[2.5rem] print:hidden">
             <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Updating from server...</p>
             </div>
          </div>
        )}

        <div className="report-content">
          {/* Enhanced Dropdown (Not for print) */}
          <div className="mb-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center gap-6 bg-slate-50/50 print:hidden transition-all hover:bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <TableIcon size={24} />
              </div>
              <div>
                <div className="text-xs font-black text-blue-600 uppercase tracking-widest">Select Report Type</div>
                <div className="text-lg font-black text-slate-800">{useXlsx ? 'Excel Worksheets' : 'Standard Budget Files'}</div>
              </div>
            </div>
            
            <div className="relative flex-1">
              <select
                value={useXlsx ? currentSheet : currentManualTemplate}
                onChange={(e) => useXlsx ? setCurrentSheet(e.target.value) : setCurrentManualTemplate(e.target.value)}
                className="w-full appearance-none bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 pr-12 text-lg font-black text-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer transition-all hover:border-slate-300"
              >
                {useXlsx ? (
                  data?.sheetNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))
                ) : (
                  Object.keys(TEMPLATES).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          {/* Official Report Header */}
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-black tracking-tight">
              งบแสดงผลการดำเนินงาน {currentManualTemplate !== 'งบดำเนินการ' && `(${currentManualTemplate})`}
            </h2>
            <p className="text-xl font-bold text-slate-700">
              สำหรับรอบบัญชี สิ้นสุดวันที่ 30 กันยายน {selectedYear}
            </p>
            <div className="w-full h-0.5 bg-black mt-8"></div>
          </div>

          {/* Official Table with Stable Layout */}
          <table className="w-full mb-16 border-collapse table-fixed">
            <thead>
              <tr className="border-b-4 border-black">
                <th className="text-left py-4 font-black text-xl w-[60%]">รายการ</th>
                <th className="text-right py-4 font-black text-xl px-4 w-[30%]">จำนวนเงิน</th>
                <th className="text-center py-4 font-black text-xl w-[10%]">หน่วย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeData.map((rowVal: any, rowIndex: number) => {
                const label = rowVal.label;
                const value = rowVal.value;
                const isHeader = label.includes('รายได้') || label.includes('ค่าใช้จ่าย') || rowVal.isHeader;
                const isTotal = label.includes('รวม') || label.includes('คงเหลือ') || label.includes('สุทธิ') || rowVal.isTotal;
                const isSubHeader = rowVal.isSubHeader;
                
                if (label === '' && value === '' && !isHeader) return null;

                return (
                  <tr 
                    key={rowIndex} 
                    className={`
                      ${isHeader ? 'font-black bg-slate-50/50' : 'font-medium'} 
                      ${isTotal ? 'font-black' : ''}
                      ${isSubHeader ? 'font-bold' : ''}
                      group
                    `}
                  >
                    <td className={`py-3 align-top text-left text-lg leading-relaxed ${isSubHeader ? 'pl-8' : ''} ${!isHeader && !isSubHeader && !isTotal ? 'pl-12' : ''}`}>
                      {label}
                    </td>
                    <td className={`text-right py-3 pr-4 px-2 tabular-nums text-xl relative ${isTotal ? 'font-black' : ''}`}>
                      <div className="inline-flex flex-col items-end w-full">
                        {!useXlsx && !isHeader && !isSubHeader && !isTotal ? (
                          <input
                            type="text"
                            value={value === 0 ? '' : value}
                            onChange={(e) => updateManualValue(rowIndex, e.target.value)}
                            className="w-full text-right bg-transparent border-b border-transparent hover:border-blue-200 focus:border-blue-500 focus:outline-none print:hidden placeholder:text-slate-200 transition-colors font-black"
                            placeholder="0.00"
                          />
                        ) : null}
                        
                        {(!useXlsx && !isHeader && !isSubHeader && !isTotal) ? (
                          <span className="hidden print:inline">{formatNumber(value)}</span>
                        ) : (
                          <div className={`
                            ${isTotal ? 'border-b-4 border-double border-black pb-1 mb-1' : ''}
                            ${label.includes('รวมรายได้') || label.includes('รวมค่าใช้จ่าย') ? 'border-b-2 border-black pb-1 mb-1' : ''}
                          `}>
                            {formatNumber(value)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 font-bold text-lg text-slate-500">
                      {(value !== '' && value !== '-' && !isHeader && !isSubHeader) ? 'บาท' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-y-24 gap-x-16 mt-28">
            <div className="text-center group">
              <div className="mb-4 text-slate-300 group-hover:text-slate-400 transition-colors font-mono">ลงนาม ............................................................</div>
              <div className="font-black text-xl">( พระอนุรักษ์ อภิธมฺโม )</div>
              <div className="text-slate-600 font-bold mt-1">เจ้าหน้าที่การเงิน/การบัญชี</div>
              <div className="text-sm font-black text-blue-600 mt-2 uppercase tracking-widest bg-blue-50 py-1 px-3 rounded-full inline-block">ผู้จัดทำ</div>
            </div>
            <div className="text-center group">
              <div className="mb-4 text-slate-300 group-hover:text-slate-400 transition-colors font-mono">ลงนาม ............................................................</div>
              <div className="font-black text-xl">( พระบุญเนาว์ การกปุญโญ )</div>
              <div className="text-slate-600 font-bold mt-1">รองผู้อำนวยการบริหารงานงบประมาณ</div>
              <div className="text-sm font-black text-amber-600 mt-2 uppercase tracking-widest bg-amber-50 py-1 px-3 rounded-full inline-block">ผู้ตรวจสอบ</div>
            </div>
            <div className="text-center group">
              <div className="mb-4 text-slate-300 group-hover:text-slate-400 transition-colors font-mono">ลงนาม ............................................................</div>
              <div className="font-black text-xl">( พระวิทัน โกวิโท )</div>
              <div className="text-slate-600 font-bold mt-1">รองผู้อำนวยการบริหารงานบุคคล</div>
              <div className="text-sm font-black text-amber-600 mt-2 uppercase tracking-widest bg-amber-50 py-1 px-3 rounded-full inline-block">ผู้ตรวจสอบ</div>
            </div>
            <div className="text-center group">
              <div className="mb-4 text-slate-300 group-hover:text-slate-400 transition-colors font-mono">ลงนาม ............................................................</div>
              <div className="font-black text-xl">( พระภานุกร ธมฺมดฺโธ )</div>
              <div className="text-slate-600 font-bold mt-1">รองผู้อำนวยการบริหารงานทั่วไป</div>
              <div className="text-sm font-black text-amber-600 mt-2 uppercase tracking-widest bg-amber-50 py-1 px-3 rounded-full inline-block">ผู้ตรวจสอบ</div>
            </div>
            <div className="text-center group">
              <div className="mb-4 text-slate-300 group-hover:text-slate-400 transition-colors font-mono">ลงนาม ............................................................</div>
              <div className="font-black text-xl">( พระครูสังฆรักษ์บรรหาร กานต์ชนะ สนฺติการโธ )</div>
              <div className="text-slate-600 font-bold mt-1">รองผู้อำนวยการบริหารงานวิชาการ</div>
              <div className="text-sm font-black text-amber-600 mt-2 uppercase tracking-widest bg-amber-50 py-1 px-3 rounded-full inline-block">ผู้ตรวจสอบ</div>
            </div>
            <div className="text-center group">
              <div className="mb-4 text-slate-300 group-hover:text-slate-400 transition-colors font-mono">ลงนาม ............................................................</div>
              <div className="font-black text-xl">( พระครูวินัยธร บุญส่ง สิริธมฺโม )</div>
              <div className="text-slate-600 font-bold mt-1">ผู้จัดการโรงเรียน</div>
              <div className="text-sm font-black text-blue-400 mt-2 uppercase tracking-widest bg-slate-50 py-1 px-3 rounded-full inline-block">ผู้ตรวจสอบ</div>
            </div>
            <div className="col-span-2 mt-12 text-center group">
              <div className="mb-4 text-slate-300 group-hover:text-slate-400 transition-colors font-mono">ลงนาม ............................................................ / รับรองตามนี้</div>
              <div className="font-black text-2xl tracking-tighter">( พระครูปลัดมงคลวัฒน์ )</div>
              <div className="text-slate-800 font-black mt-1 text-lg">ผู้อำนวยการโรงเรียน</div>
              <div className="text-sm font-black text-green-600 mt-3 uppercase tracking-widest bg-green-50 py-1 px-4 rounded-full inline-block">ผู้อนุมัติ</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Sarabun', sans-serif !important;
        }

        @media print {
          body { background: white !important; color: black !important; font-size: 14pt !important; }
          .p-6, .md\\:p-10 { padding: 0 !important; }
          aside, nav, .print-hidden, .sidebar, select, input, button { display: none !important; }
          @page { margin: 2cm; size: A4; }
          .report-content { width: 100%; }
          .border-b-4 { border-bottom-width: 2pt !important; }
          .border-double { border-bottom-style: double !important; border-bottom-width: 6pt !important; }
          * { -webkit-print-color-adjust: exact; }
          .shadow-\\[0_20px_50px_rgba\\(0\\,0\\,0\\,0\\.1\\)\\] { shadow: none !important; }
        }
        
        .border-double {
          border-bottom-style: double !important;
          border-bottom-width: 4px !important;
        }

        input::placeholder { color: #e2e8f0; }
        
        select:focus { transform: scale(1.01); }
      `}</style>
    </div>
  );
};
