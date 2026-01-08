import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react'; 
import { getCases, approveCase, rejectCase } from '../services/api';
import { CaseResponse } from '../../types'; // หรือ '../types' เช็ค path อีกทีนะครับ

export const AdminApproval: React.FC = () => {
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ รวมเหลือฟังก์ชันเดียว (ใช้ชื่อ loadCases ตามที่ปุ่มเรียกใช้)
  const loadCases = async () => {
    try {
      setLoading(true);
      // ดึงเฉพาะสถานะที่รออนุมัติ (SUBMITTED)
      const data = await getCases('SUBMITTED');
      setCases(data);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ useEffect เรียกครั้งเดียวพอ
  useEffect(() => {
    loadCases();
  }, []);

  // ฟังก์ชันกดปุ่ม Approve
  const handleApprove = async (id: string) => {
    if (!confirm('ยืนยันการอนุมัติ?')) return;
    try {
      await approveCase(id);
      alert('อนุมัติสำเร็จ ✅');
      loadCases(); // โหลดข้อมูลใหม่
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  // ฟังก์ชันสำหรับปุ่ม Reject
  const handleReject = async (id: string) => {
    const reason = prompt('กรุณาระบุเหตุผลที่ไม่อนุมัติ (ถ้ามี):');
    if (reason === null) return; // กด Cancel ไม่ทำอะไร

    try {
      await rejectCase(id, reason); // ส่งเหตุผลไปด้วย
      alert('ดำเนินการยกเลิกเรียบร้อย ❌');
      loadCases(); // โหลดข้อมูลใหม่
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
                  {/* แสดง Doc No */}
                  <td className="py-3 px-4 border-b font-mono text-blue-600">
                    {item.doc_no || '-'}
                  </td>
                  
                  <td className="py-3 px-4 border-b">
                    <div className="font-medium">{item.requester_name}</div>
                    <div className="text-xs text-gray-500">{item.department || 'General'}</div>
                  </td>
                  <td className="py-3 px-4 border-b">{item.description}</td>
                  <td className="py-3 px-4 border-b text-right font-bold">
                    {item.requested_amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border-b text-center text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('th-TH')}
                  </td>
                  
                  {/* ปุ่ม Action */}
                  <td className="py-3 px-4 border-b text-center space-x-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      อนุมัติ
                    </button>

                    <button
                      onClick={() => handleReject(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
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