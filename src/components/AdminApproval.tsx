// src/components/AdminApproval.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { getCases, approveCase } from '../services/api';
import { CaseResponse } from '../../types';

export const AdminApproval: React.FC = () => {
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ฟังก์ชันโหลดข้อมูล (ดึงเฉพาะที่สถานะ SUBMITTED)
  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await getCases('SUBMITTED');
      setCases(data);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // ฟังก์ชันกดปุ่ม Approve
  const handleApprove = async (caseId: string) => {
    if (!confirm(`ยืนยันการอนุมัติเอกสารนี้?`)) return;
    
    setProcessingId(caseId);
    try {
      const result = await approveCase(caseId);
      alert(`✅ อนุมัติสำเร็จ!\nสร้างเอกสารเลขที่: ${result.doc_no}\nสถานะใหม่: ${result.status}`);
      // รีโหลดข้อมูลหลังอนุมัติเสร็จ (รายการนั้นควรจะหายไปจาก list)
      fetchCases();
    } catch (error: any) {
      console.error("Approve failed:", error);
      alert(`❌ อนุมัติไม่สำเร็จ: ${error.response?.data?.detail || error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <CheckCircle className="text-green-500" size={32} />
            อนุมัติรายการ (Finance Approval)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">รายการที่รอการตรวจสอบและสร้าง Voucher (PV/RV)</p>
        </div>
        <button 
          onClick={fetchCases} 
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={20} className={`text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* ตารางรายการ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">วันที่แจ้ง</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">เลขที่ Case</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ผู้ขอเบิก</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">รายละเอียด</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">จำนวนเงิน</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cases.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle size={48} className="opacity-20" />
                      <p>ไม่มีรายการที่รออนุมัติ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.case_no}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      {item.requester_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {item.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.requested_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">บาท</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={processingId === item.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-green-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                      >
                        {processingId === item.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        อนุมัติ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};