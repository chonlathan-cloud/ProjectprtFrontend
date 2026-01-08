// src/components/Form.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, MoreHorizontal, Plus, Trash2, Download, Save, 
  Loader2 
} from 'lucide-react';
import { PaymentVoucherTemplate, ReceiveVoucherTemplate, JournalVoucherTemplate, DocumentData } from './DocumentTemplates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createCase, submitCase, getCategories, getUsers, getBankAccounts, searchDocumentsByNo } from '../services/api'; // Import API
import { Category, User, BankAccount } from '../../types'; // Import Types

const INITIAL_DATA: DocumentData = {
  type: 'pv', 
  docNo: '',
  date: new Date().getDate().toString().padStart(2, '0'),
  month: new Date().toLocaleString('th-TH', { month: 'long' }),
  year: (new Date().getFullYear() + 543).toString(),
  name: '',
  position: '',
  bankAccount: '',
  makerName: '',
  department: '',
  subject: '',
  purpose: '',
  psNo: '',
  items: [
    { id: '1', description: '', quantity: '', unit: '', price: '', refNo: '' }
  ]
};

export const Form: React.FC = () => {
  const [data, setData] = useState<DocumentData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  
  // JV Consolidation States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingDocs, setIsSearchingDocs] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  // 1. โหลดข้อมูลเมื่อเข้าหน้า Form
  useEffect(() => {
    // A. ดึง User จาก LocalStorage มาเป็น Default
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.name) {
          setData(prev => ({ ...prev, name: userObj.name }));
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    // B. ดึง Categories ตาม transactionType
    const fetchCats = async () => {
      try {
        const cats = await getCategories(transactionType);
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCats();

    // C. ดึง Users และ Bank Accounts
    const fetchOtherData = async () => {
      try {
        const [u, b] = await Promise.all([getUsers(), getBankAccounts()]);
        setUsers(u);
        setBankAccounts(b);
      } catch (error) {
        console.error("Error fetching other data:", error);
      }
    };
    fetchOtherData();
  }, [transactionType]);

  const handleInputChange = (field: keyof DocumentData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: string, value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: Date.now().toString(), 
        description: '', 
        quantity: '', 
        unit: '', 
        price: '',
        refNo: ''
      }]
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length === 1) return;
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // 2. Logic การ Save ไป Backend
  const handleSaveToBackend = async () => {
    if (!selectedCategoryId) {
      alert("กรุณาเลือกหมวดหมู่บัญชี (Category) ก่อนบันทึก");
      return;
    }

    setIsSaving(true);
    try {
      // 2.1 คำนวณยอดรวม (Items vs Amount)
      const totalAmount = data.items.reduce((sum, item) => {
        const q = Number(item.quantity) || 0;
        const p = Number(item.price) || 0;
        return sum + (q * p);
      }, 0);

      // 2.2 รวมชื่อรายการสินค้าใส่ Purpose (เพื่อให้ Search เจอในอนาคต)
      // เอา Purpose ที่ user กรอก + รายการสินค้า
      const itemsDescription = data.items
        .map(i => i.description)
        .filter(d => d.trim() !== '')
        .join(', ');
      
      let finalPurpose = data.purpose;
      if (itemsDescription) {
        finalPurpose = `${finalPurpose ? finalPurpose + ' : ' : ''}${itemsDescription}`;
      }
      
      // ถ้า finalPurpose ว่างจริงๆ ให้ใส่ default
      if (!finalPurpose.trim()) finalPurpose = "ค่าใช้จ่ายทั่วไป";

      // 2.3 สร้าง Payload
      const casePayload = {
        category_id: selectedCategoryId,
        requested_amount: totalAmount,
        purpose: finalPurpose,
        department_id: data.department,
        funding_type: 'OPERATING' as const,
      };

      console.log("Creating Case with:", casePayload);

      // 2.4 Call API Create Case
      const newCase = await createCase(casePayload);
      
      // 2.5 Call API Submit Case (ถ้าต้องการ Submit เลย)
      const submitResult = await submitCase(newCase.id);

      // 2.6 อัปเดตเลขที่เอกสารในหน้าจอ
      const finalDocNO = submitResult.doc_no || newCase.case_no;

      setData(prev => ({ ...prev, docNo: finalDocNO }));
      
      alert(`บันทึกสำเร็จ! ได้เลขที่เอกสาร: ${finalDocNO}`);
      return true; // Return true บอกว่าสำเร็จ

    } catch (error: any) {
      console.error('Save failed:', error);
      const msg = error.response?.data?.error?.message || error.message;
      alert(`บันทึกไม่สำเร็จ: ${msg}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Logic การค้นหาและดึงข้อมูลเอกสาร (Consolidation)
  const handleSearchDocs = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingDocs(true);
    try {
      const results = await searchDocumentsByNo(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        alert("ไม่พบเอกสารที่ระบุ");
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setIsSearchingDocs(false);
    }
  };

  const pullDocumentData = (doc: any) => {
    // ดึงค่ารายการสินค้า (Items)
    // หมายเหตุ: mapping field ตามโครงสร้าง data จาก backend
    const pulledItems = (doc.items || []).map((item: any) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      description: item.description || item.purpose || '',
      quantity: item.quantity || '1',
      unit: item.unit || 'รายการ',
      price: item.price || item.amount || '0',
      refNo: doc.doc_no || doc.case_no || ''
    }));

    setData(prev => ({
      ...prev,
      items: [...prev.items.filter(i => i.description !== ''), ...pulledItems]
    }));
    
    // แจ้งเตือนเล็กน้อย
    alert(`ดึงข้อมูลจาก ${doc.doc_no || doc.case_no} เรียบร้อยแล้ว`);
  };

  const generatePDF = async (action: 'submit' | 'download') => {
    // ถ้ากด Submit ให้ Save ลง Backend ก่อน
    if (action === 'submit') {
        const success = await handleSaveToBackend();
        if (!success) return; // ถ้า Save ไม่ผ่าน ไม่ต้อง Generate PDF ต่อ
        
        // รอแป๊บนึงให้ State docNo อัปเดตก่อน generate PDF
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!printRef.current) return;

    try {
      // Ensure fonts are loaded before capturing
      await document.fonts.ready;
      
      const canvas = await html2canvas(printRef.current, {
        scale: 3, // 3 is usually enough and more stable than 4
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200, // Wider window for better layout stability during capture
        onclone: (clonedDoc) => {
          const element = clonedDoc.querySelector('.transform.scale-90');
          if (element instanceof HTMLElement) {
            element.style.transform = 'none';
            element.style.fontFamily = "'Sarabun', sans-serif";
          }
        }
      } as any);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const fileName = `${data.type}_${data.docNo || 'draft'}.pdf`;

      if (action === 'download') {
        pdf.save(fileName);
      } else {
        // กรณี Submit บันทึก PDF ลงเครื่องด้วย (หรือจะอัปโหลดกลับไป Backend ก็ได้ในอนาคต)
        pdf.save(fileName);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF');
    }
  };

  const inputStyle = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm";
  const labelStyle = "block text-sm font-semibold text-gray-600 mb-2";

  return (
    <div className="h-full bg-gray-50/50 p-6 overflow-y-auto">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Form</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex gap-6 h-auto min-h-[calc(100vh-140px)]">
          {/* Left Side - Input Form */}
          <div className="w-5/12 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-8">กรอกข้อมูลเอกสาร</h2>
            
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              
              {/* --- 1. Category Dropdown (เพิ่มใหม่ตาม Requirement) --- */}
              {/* --- 1.ลักษณะเอกสาร (Moved to Top) --- */}
              <div>
                <label className={labelStyle}>ลักษณะเอกสาร</label>
                <div className="relative">
                  <select 
                    className={`${inputStyle} appearance-none cursor-pointer`}
                    value={data.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="pv">ใบเบิกเงิน (Payment Voucher - PV)</option>
                    <option value="rv">ใบรับเงิน (Receive Voucher - RV)</option>
                    <option value="jv">ใบสำคัญรายวันทั่วไป (Journal Voucher - JV)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* --- 2. หมวดหมู่บัญชี (Moved below Document Style) --- */}
              <div>
                <label className={labelStyle}>หมวดหมู่บัญชี (Category) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    className={`${inputStyle} appearance-none cursor-pointer border-blue-200 bg-blue-50`}
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    <option value="">-- กรุณาเลือกหมวดหมู่ --</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name_th}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* --- 3. JV Document Consolidation Search (Show only for JV) --- */}
              {data.type === 'jv' && (
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-black text-blue-700 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    ดึงข้อมูลเอกสารเพื่อรวมใบเดียว (Consolidate)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className={`${inputStyle} bg-white border-blue-200`}
                      placeholder="กรอกเลขที่ ปส... (เช่น ปส.2567/001)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchDocs()}
                    />
                    <button 
                      onClick={handleSearchDocs}
                      disabled={isSearchingDocs}
                      className="px-6 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center shrink-0"
                    >
                      {isSearchingDocs ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ค้นหา'}
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {searchResults.map((res) => (
                        <div key={res.id || res.case_no || Math.random()} className="flex justify-between items-center p-3 bg-white border border-blue-100 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                          <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-800 truncate">{res.doc_no || res.case_no}</p>
                            <p className="text-[10px] text-slate-500 truncate">{res.purpose}</p>
                          </div>
                          <button 
                            onClick={() => pullDocumentData(res)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black hover:bg-blue-200 transition-colors shrink-0 ml-2"
                          >
                            ดึงข้อมูล (Pull)
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Date Selection Block (เหมือนเดิม) */}
              <div className="grid grid-cols-1 gap-4">
                <div className="col-span-1">
                  <label className={labelStyle}>วันที่</label>
                  <div className="flex gap-2">
                     <div className="relative w-1/4">
                       <select
                        className={`${inputStyle} appearance-none cursor-pointer ${!data.date ? 'text-gray-400' : ''}`}
                        value={data.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                       >
                         <option value="" disabled>วันที่</option>
                         {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                           <option key={d} value={d.toString().padStart(2, '0')} className="text-gray-900">{d}</option>
                         ))}
                       </select>
                     </div>
                     <div className="relative w-1/2">
                       <select
                        className={`${inputStyle} appearance-none cursor-pointer ${!data.month ? 'text-gray-400' : ''}`}
                        value={data.month}
                        onChange={(e) => handleInputChange('month', e.target.value)}
                       >
                         <option value="" disabled>เดือน</option>
                         {[
                           'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                         ].map(m => (
                           <option key={m} value={m} className="text-gray-900">{m}</option>
                         ))}
                       </select>
                     </div>
                     <div className="relative w-1/4">
                       <select
                        className={`${inputStyle} appearance-none cursor-pointer ${!data.year ? 'text-gray-400' : ''}`}
                        value={data.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                       >
                         <option value="" disabled>ปี</option>
                         {Array.from({ length: 11 }, (_, i) => 2565 + i).map(y => (
                           <option key={y} value={y.toString()} className="text-gray-900">{y}</option>
                         ))}
                       </select>
                     </div>
                  </div>
                </div>
              </div>



               {/* Bank Account Dropdown for RV */}
               {data.type === 'rv' && (
                  <div>
                    <label className={labelStyle}>เลขที่บัญชีธนาคาร/เงินสด</label>
                    <div className="relative">
                      <select 
                        className={`${inputStyle} appearance-none cursor-pointer`}
                        value={data.bankAccount}
                        onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                      >
                        <option value="">-- เลือกเลขที่บัญชี --</option>
                        {bankAccounts.map(b => (
                          <option key={b.id} value={b.account_number}>{b.bank_name} - {b.account_number} ({b.account_name})</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
               )}

               {/* PS No for PV */}
               {data.type === 'pv' && (
                 <div>
                   <label htmlFor="psNo" className={labelStyle}>เลขที่ ปส (ปส 03011007/...)</label>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-gray-500 shrink-0">ปส 03011007/</span>
                     <input 
                      id="psNo"
                      type="text" 
                      className={inputStyle}
                      value={data.psNo}
                      onChange={(e) => handleInputChange('psNo', e.target.value)}
                      placeholder="กรอกเลขที่ต่อท้าย"
                    />
                   </div>
                 </div>
               )}

              <div>
                <label htmlFor="name" className={labelStyle}>ข้าพเจ้า (ผู้ขอเบิก/ผู้รับเงิน)</label>
                <input 
                  id="name"
                  type="text" 
                  className={inputStyle}
                  value={data.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

               <div>
                <label htmlFor="position" className={labelStyle}>ตำแหน่ง</label>
                <input 
                  id="position"
                  type="text" 
                  className={inputStyle}
                  value={data.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="กรอกตำแหน่ง"
                />
              </div>



              <div>
                <div className="flex justify-between items-center mb-4">
                   <label className={labelStyle}>รายการที่เบิก / ทำ</label>
                   <button onClick={addItem} className="text-blue-500 text-sm font-medium flex items-center hover:text-blue-600">
                     <Plus size={16} className="mr-1" /> เพิ่มรายการ
                   </button>
                </div>
                
                <div className="space-y-3">
                  {data.items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl group relative border border-gray-100 hover:border-blue-100 transition-colors">
                       <div className="flex gap-3 items-start">
                          <div className="flex-1">
                             <div className="flex gap-3 mb-4">
                                <span className="text-xs text-gray-400 mt-3">{index + 1}.</span>
                                <div className="flex-1">
                                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">รายการสินค้า / รายละเอียด</label>
                                  <input 
                                    type="text" 
                                    placeholder="กรอกชื่อรายการ"
                                    className={`${inputStyle} bg-white`}
                                    value={item.description}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                  />
                                </div>
                             </div>
                             <div className="flex gap-3 pl-6">
                                <div className="w-24">
                                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">จำนวน</label>
                                   <input 
                                    type="text" 
                                    className={`${inputStyle} bg-white`}
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                  />
                                </div>
                                <div className="w-24">
                                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">ราคา (บาท)</label>
                                   <input 
                                    type="text" 
                                    className={`${inputStyle} bg-white`}
                                    value={item.price}
                                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                  />
                                </div>
                                 <div className="flex-1">
                                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                     {data.type === 'pv' ? 'หน่วยสินค้า' : 'เลขที่อ้างอิง'}
                                   </label>
                                   <input 
                                    type="text" 
                                    className={`${inputStyle} bg-white`}
                                    value={data.type === 'pv' ? item.unit : item.refNo}
                                    onChange={(e) => handleItemChange(item.id, data.type === 'pv' ? 'unit' : 'refNo', e.target.value)}
                                  />
                                </div>
                             </div>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="w-7/12 flex flex-col gap-6">
              <div className="flex-1 bg-gray-100 rounded-3xl overflow-hidden shadow-inner p-8 flex items-start justify-center overflow-y-auto">
                <div className="transform scale-90 origin-top shadow-xl bg-white" style={{ 
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  backfaceVisibility: 'hidden'
                }}>
                  {data.type === 'pv' && <PaymentVoucherTemplate ref={printRef} data={data} />}
                  {data.type === 'rv' && <ReceiveVoucherTemplate ref={printRef} data={data} />}
                  {data.type === 'jv' && <JournalVoucherTemplate ref={printRef} data={data} />}
                </div>
              </div>

             <div className="flex justify-between gap-4">
                <button 
                  onClick={() => generatePDF('submit')}
                  disabled={isSaving}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : (
                    <Save size={20} />
                  )}
                  บันทึกเอกสาร & ส่งอนุมัติ
                </button>
                <button 
                  onClick={() => generatePDF('download')}
                  disabled={isSaving}
                  className="flex-1 bg-[#0099FF] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50"
                >
                  <Download size={20} />
                  ดาวน์โหลด PDF
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};