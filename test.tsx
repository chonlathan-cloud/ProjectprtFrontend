import React, { useState, useRef } from 'react';
import { 
  Search, MoreHorizontal, Plus, Trash2, Download, Save, 
  Printer, FileText, Calendar, Loader2 
} from 'lucide-react';
import { WithdrawalTemplate, ReturnTemplate, PurchaseTemplate, DocumentData } from './DocumentTemplates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveDocument } from '../services/documentService';

const INITIAL_DATA: DocumentData = {
  type: 'withdrawal',
  docNo: '',
  date: '',
  month: '',
  year: '',
  name: '',
  position: '',
  department: '',
  subject: '',
  to: '',
  purpose: '',
  items: [
    { id: '1', description: '', quantity: '', unit: '', price: '', note: '', receiveNo: '', receiptDate: '', receiptNo: '' }
  ]
};

export const Form: React.FC = () => {
  const [data, setData] = useState<DocumentData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // No longer fetching in advance - number comes from backend on save

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
        note: '',
        receiveNo: '',
        receiptDate: '',
        receiptNo: ''
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

  const generatePDF = async (action: 'submit' | 'download') => {
    if (!printRef.current) return;

    try {
      if (action === 'submit') {
        setIsSaving(true);
        const result = await saveDocument(data);
        if (!result.success) throw new Error('Save failed');
        
        // IMPORTANT: Update data with the confirmed docNo from backend
        // We update state first
        setData(prev => ({ ...prev, docNo: result.docNo }));
        
        // Wait for React to render the updated docNo in the template
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsSaving(false);
      }

      const canvas = await html2canvas(printRef.current, {
        scale: 4, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, // A4 width in pixels at 96 DPI
        onclone: (clonedDoc) => {
          // Remove potential scaling transforms from cloned document to capture at native size
          const element = clonedDoc.querySelector('.transform.scale-90');
          if (element instanceof HTMLElement) {
            element.style.transform = 'none';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0); // Use JPEG with max quality for better text anti-aliasing in some cases
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px', // Use pixels for more direct mapping
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      if (action === 'download') {
        pdf.save(`${data.type}_document.pdf`);
      } else {
        alert('Document recorded successfully and PDF generated!'); 
        pdf.save(`${data.type}_submitted_${data.docNo}.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to process document');
      setIsSaving(false);
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
              <div>
                <label className={labelStyle}>ลักษณะเอกสาร</label>
                <div className="relative">
                  <select 
                    className={`${inputStyle} appearance-none cursor-pointer`}
                    value={data.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="withdrawal">ใบเบิกเงิน (Withdrawal)</option>
                    <option value="return">ใบนำส่งเงินคืน (Return Money)</option>
                    <option value="purchase">ขอจัดซื้อ (Purchase Request)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

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
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
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
                       <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
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
                       <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="name" className={labelStyle}>ชื่อ-นามสกุล (ผู้เบิก/ผู้แจ้ง)</label>
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
                <label htmlFor="position" className={labelStyle}>ตำแหน่ง / แผนก</label>
                <input 
                  id="position"
                  type="text" 
                  className={inputStyle}
                  value={data.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="กรอกตำแหน่ง"
                />
              </div>



               {/* Extra fields for Purchase */}
               {data.type === 'purchase' && (
                  <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                      <h3 className="font-semibold text-gray-700">ข้อมูลจัดซื้อ</h3>
                      <div>
                        <input type="text" className={inputStyle} placeholder="เรื่อง" value={data.subject} onChange={(e) => handleInputChange('subject', e.target.value)} />
                      </div>
                      <div>
                        <input type="text" className={inputStyle} placeholder="ความประสงค์" value={data.purpose} onChange={(e) => handleInputChange('purpose', e.target.value)} />
                      </div>
                       <div>
                        <input type="text" className={inputStyle} placeholder="หมวด/ฝ่าย" value={data.department} onChange={(e) => handleInputChange('department', e.target.value)} />
                      </div>
                  </div>
               )}


              <div>
                <div className="flex justify-between items-center mb-4">
                   <label className={labelStyle}>รายการที่เบิก / ทำ</label>
                   <button onClick={addItem} className="text-blue-500 text-sm font-medium flex items-center hover:text-blue-600">
                     <Plus size={16} className="mr-1" /> เพิ่มรายการ
                   </button>
                </div>
                
                <div className="space-y-3">
                  {data.items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl group relative">
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
                                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">หน่วยสินค้า</label>
                                   <input 
                                    type="text" 
                                    className={`${inputStyle} bg-white`}
                                    value={item.unit}
                                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
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
               <div className="transform scale-90 origin-top shadow-xl">
                 {data.type === 'withdrawal' && <WithdrawalTemplate ref={printRef} data={data} />}
                 {data.type === 'return' && <ReturnTemplate ref={printRef} data={data} />}
                 {data.type === 'purchase' && <PurchaseTemplate ref={printRef} data={data} />}
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
                  บันทึกเอกสาร
                </button>
                <button 
                  onClick={() => generatePDF('download')}
                  disabled={isSaving}
                  className="flex-1 bg-[#0099FF] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50"
                >
                  <Download size={20} />
                  ดาวน์โหลด / ปริ้น
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
