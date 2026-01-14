// src/components/AdminApproval.tsx
import React, { useState, useEffect } from 'react';
import { getCases, approveCase, rejectCase } from '../services/api';
// import { CaseResponse } from '../../types'; // เราจะใช้ Interface ภายในไฟล์นี้แทนเพื่อให้ตรงกับ Backend View

// สร้าง Interface ใหม่ให้ตรงกับข้อมูลที่ Backend ส่งมา (CaseAdminView)
interface AdminCaseView {
  id: string;
  case_no: string;
  doc_no?: string;
  requester_name: string; // Backend ส่งมาเป็น requester_name
  description: string;    // Backend ส่งมาเป็น description (จาก purpose)
  requested_amount: number;
  created_at: string;
  status: string;
  department?: string;
}

export const AdminApproval: React.FC = () => {
  const [cases, setCases] = useState<AdminCaseView[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ดึงเฉพาะรายการที่รออนุมัติ
  const loadPendingCases = async () => {
    try {
      setLoading(true);
      // ส่ง 'SUBMITTED' ไปเพื่อให้ Backend กรองเฉพาะรายการที่รออนุมัติ
      const data = await getCases('SUBMITTED');
      // cast type as any ชั่วคราวเพื่อให้ผ่าน TS check หาก types.ts ยังไม่อัปเดต
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

  // 2. Handle Approve และแสดงเลขเอกสาร
  const handleApprove = async (caseId: string) => {
    if (!confirm('ยืนยันการอนุมัติ?')) return;

    try {
      const response = await approveCase(caseId);
      // ✅ แสดง Alert พร้อมเลขที่เอกสาร (PV/RV) ที่ได้จาก Backend
      alert(`อนุมัติสำเร็จ! เลขที่เอกสารคือ: ${response.doc_no}`);
      loadPendingCases(); // โหลดข้อมูลใหม่หลังอนุมัติ
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  // ฟังก์ชันสำหรับปุ่ม Reject
  const handleReject = async (id: string) => {
    const reason = prompt('กรุณาระบุเหตุผลที่ไม่อนุมัติ (ถ้ามี):');
    if (reason === null) return; // กด Cancel ไม่ทำอะไร

    try {
      await rejectCase(id, reason);
      alert('ดำเนินการยกเลิกเรียบร้อย ❌');
      loadPendingCases(); // โหลดข้อมูลใหม่
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">รายการรออนุมัติ (Admin Approval)</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left border-b">Doc No.</th>
              <th className="py-3 px-4 text-left border-b">ผู้ขอเบิก</th>
              <th className="py-3 px-4 text-left border-b">รายละเอียด</th>
              <th className="py-3 px-4 text-right border-b">จำนวนเงิน</th>
              <th className="py-3 px-4 text-center border-b">วันที่</th>
              <th className="py-3 px-4 text-center border-b">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4">กำลังโหลด...</td></tr>
            ) : cases.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">ไม่มีรายการรออนุมัติ</td></tr>
            ) : (
              cases.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* แสดง Case No (Doc No จะมาหลังอนุมัติ) */}
                  <td className="py-3 px-4 border-b font-mono text-blue-600">
                    {item.doc_no || item.case_no}
                  </td>
                  
                  <td className="py-3 px-4 border-b">
                    <div className="font-medium">{item.requester_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{item.department || '-'}</div>
                  </td>
                  <td className="py-3 px-4 border-b">{item.description}</td>
                  <td className="py-3 px-4 border-b text-right font-bold">
                    {item.requested_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 border-b text-center text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('th-TH')}
                  </td>
                  
                  {/* ปุ่ม Action */}
                  <td className="py-3 px-4 border-b text-center space-x-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                    >
                      อนุมัติ (ออก PV)
                    </button>

                    <button
                      onClick={() => handleReject(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                    >
                      ไม่อนุมัติ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApproval;