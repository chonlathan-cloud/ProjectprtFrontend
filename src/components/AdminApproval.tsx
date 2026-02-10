// src/components/AdminApproval.tsx
import React, { useState, useEffect } from 'react';
import { getCases, approveCase, rejectCase } from '../services/api';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  AlertCircle,
  Clock,
  Briefcase,
  Building2,
  CheckCircle2
} from 'lucide-react';
// สร้าง Interface ใหม่ให้ตรงกับข้อมูลที่ Backend ส่งมา (CaseAdminView)
interface AdminCaseView {
  id: string;
  case_no: string;
  doc_no?: string;
  requester_name: string;
  description: string;
  requested_amount: number;
  created_at: string;
  status: string;
  department?: string;
  ps_url?: string | null;
}

export const AdminApproval: React.FC = () => {
  const [cases, setCases] = useState<AdminCaseView[]>([]);
  const [loading, setLoading] = useState(true);


  const loadPendingCases = async () => {
    try {
      setLoading(true);
      const data = await getCases('SUBMITTED');
      setCases(data as any); 
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCases();
  }, []);

  const handleApprove = async (caseId: string) => {
    if (!confirm('ยืนยันการอนุมัติ?')) return;

    try {
      const response = await approveCase(caseId);
      alert(`อนุมัติสำเร็จ! เลขที่เอกสารคือ: ${response.doc_no}`);
      loadPendingCases();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('กรุณาระบุเหตุผลที่ไม่อนุมัติ (ถ้ามี):');
    if (reason === null) return;
    try {
      await rejectCase(id, reason);
      alert('ดำเนินการยกเลิกเรียบร้อย ❌');
      loadPendingCases();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">รายการรออนุมัติ</h2>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
            <Clock size={18} />
            <p>ตรวจสอบและอนุมัติคำขอเบิกจ่าย (Admin Approval)</p>
          </div>
        </div>
        
        {/* Summary Card */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-amber-100 rounded-full text-amber-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{cases.length}</div>
            <div className="text-sm font-medium text-amber-600">รายการรอดำเนินการ</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-500 w-[180px]">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    หมายเลขเอกสาร
                  </div>
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    ผู้ทำรายการ
                  </div>
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-500">รายละเอียด</th>
                <th className="py-4 px-6 text-right text-sm font-semibold text-slate-500 w-[150px]">
                  <div className="flex items-center justify-end gap-2">
                    <span>$</span>
                    จำนวนเงิน
                  </div>
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-500 w-[150px]">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar size={16} />
                    วันที่สร้าง
                  </div>
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-slate-500 w-[240px]">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>กำลังโหลดข้อมูล...</p>
                    </div>
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-slate-100 p-4 rounded-full">
                        <CheckCircle className="w-12 h-12 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">ไม่มีรายการรอดำเนินการ</p>
                        <p className="text-slate-500">ข้อมูลที่รออนุมัติทั้งหมดถูกจัดการเรียบร้อยแล้ว</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-5 px-6 whitespace-nowrap">
                      <div className="font-mono text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-lg inline-block">
                        {item.doc_no || item.case_no}
                      </div>
                    </td>
                    
                    <td className="py-5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          {(item.requester_name || 'U')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.requester_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {item.department || 'ไม่ระบุแผนก'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                    </td>
                    <td className="py-5 px-6 whitespace-nowrap text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-lg font-bold text-slate-900 tracking-tight">
                          {item.requested_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400 font-medium uppercase">THB</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 whitespace-nowrap text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-medium text-slate-700">
                          {new Date(item.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-5 px-6 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-lg shadow-emerald-600/20 active:scale-95 group/btn"
                        >
                          <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>อนุมัติ</span>
                        </button>

                        <button
                          onClick={() => handleReject(item.id)}
                          className="flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold py-2 px-4 rounded-xl transition duration-200 active:scale-95 group/btn"
                        >
                          <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>ปฏิเสธ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <p className="text-xs text-slate-400 text-center">
            &copy; {new Date().getFullYear()} Financial Dashboard System &bull; PRT Project
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminApproval;