import React, { forwardRef } from 'react';

export interface DocumentData {
  type: 'pv' | 'rv' | 'jv';
  docNo: string;
  date: string;
  month: string;
  year: string;
  name: string;
  position: string;
  bankAccount?: string;
  makerName?: string;
  department?: string;
  subject?: string;
  purpose?: string;
  psNo?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number | string;
    unit: string;

    price: number | string; // For withdrawal/purchase
    note?: string; // For return/purchase
    receiveNo?: string; // For return
    receiptDate?: string; // For return
    receiptNo?: string; // For return
    refNo?: string;
  }>;
}


export const PaymentVoucherTemplate = forwardRef<HTMLDivElement, { data: DocumentData }>(({ data }, ref) => {
  const total = data.items.reduce((sum, item) => {
    const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity as string) || 0;
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
    return sum + (q * p);
  }, 0);

  return (
    <div ref={ref} className="bg-white p-12 text-black text-[13pt] relative" style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Sarabun', sans-serif", lineHeight: '1.5' }}>
      <div className="text-center mb-2">
        <h1 className="text-lg font-bold">บันทึกข้อความ</h1>
        <h2 className="text-base font-bold">ใบเบิกเงิน (Payment Voucher)</h2>
      </div>

      <div className="absolute top-12 right-12 flex items-center gap-2">
        <span>เลขที่ PV :</span>
        <div className="border border-black px-2 py-1 w-32 min-h-[28px] flex items-center justify-center">
          {data.docNo}
        </div>
      </div>

      <div className="text-center mb-6">
        <p>โรงเรียนพระปริยัติธรรมวัดธรรมมงคล แผนกสามัญศึกษา</p>
        <p>132 ถนนสุขุมวิท 101 แขวงบางจาก เขตพระโขนง กรุงเทพฯ 10260</p>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div className="flex gap-1">
          <span className="font-bold">ปส 03011007/</span>
          <span className="border-b border-black border-dotted min-w-[80px] text-center">{data.psNo || '..........'}</span>
        </div>

        <span>{data.date} {data.month} {data.year}</span>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <span className="shrink-0">ข้าพเจ้า</span>
          <span className="border-b border-black border-dotted flex-1 min-h-[20px]">{data.name}</span>
          <span className="shrink-0">ตำแหน่ง</span>
          <span className="border-b border-black border-dotted flex-1 min-h-[20px]">{data.position}</span>
        </div>
        <div className="flex gap-4">
          <span className="shrink-0">ได้รับมอบหมายให้ดำเนินการ :</span>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr>
            <th className="border border-black p-2 w-10">ที่</th>
            <th className="border border-black p-2">รายการ</th>
            <th className="border border-black p-2 w-20">จำนวน</th>
            <th className="border border-black p-2 w-20">หน่วยละ</th>
            <th className="border border-black p-2 w-32">จำนวนเงิน<br/>( บาท )</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => {
            const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity as string) || 0;
            const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
            return (
              <tr key={item.id} className="h-8">
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2">{item.description}</td>
                <td className="border border-black p-2 text-center">{item.quantity} {item.unit}</td>
                <td className="border border-black p-2 text-right">{p.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="border border-black p-2 text-right">{(q * p).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 12 - data.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>

            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="h-10">
            <td className="border border-black p-2 text-center font-bold">รวม</td>
            <td colSpan={3} className="border border-black p-2 text-center font-bold">ศูนย์บาทถ้วน</td>
            <td className="border border-black p-2 text-right font-bold">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>
      <div className="mt-20 text-center space-y-8">
        <h3 className="text-lg font-bold">ผู้ทำรายการ</h3>
        <div className="mb-2 relative">
           <p>........................................................</p>
           <p className="absolute bottom-1 left-0 right-0">{data.name}</p>
        </div>
        <p className="text-xl">{data.makerName || 'code_name'}</p>
      </div>
    </div>
  );
});

export const ReceiveVoucherTemplate = forwardRef<HTMLDivElement, { data: DocumentData }>(({ data }, ref) => {
  const total = data.items.reduce((sum, item) => {
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
    return sum + p;
  }, 0);

  return (
    <div ref={ref} className="bg-white p-12 text-black text-[13pt] relative" style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Sarabun', sans-serif", lineHeight: '1.5' }}>
      <div className="text-center mb-2">
        <h1 className="text-lg font-bold">บันทึกข้อความ</h1>
        <h2 className="text-base font-bold">ใบรับเงิน (Receive Voucher)</h2>
      </div>

      <div className="absolute top-12 right-12 flex items-center gap-2">
        <span>เลขที่ RV :</span>
        <div className="border border-black px-2 py-1 w-32 min-h-[28px] flex items-center justify-center">
          {data.docNo}
        </div>
      </div>

      <div className="text-center mb-6">
        <p>โรงเรียนพระปริยัติธรรมวัดธรรมมงคล แผนกสามัญศึกษา</p>
        <p>132 ถนนสุขุมวิท 101 แขวงบางจาก เขตพระโขนง กรุงเทพฯ 10260</p>
      </div>

      <div className="flex justify-end mb-6">
        <span>{data.date} {data.month} {data.year}</span>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <span className="shrink-0">ข้าพเจ้า</span>
          <span className="border-b border-black border-dotted flex-1 min-h-[20px]">{data.name}</span>
          <span className="shrink-0">ตำแหน่ง</span>
          <span className="border-b border-black border-dotted flex-1 min-h-[20px]">{data.position}</span>
        </div>
        <div className="flex gap-4">
          <span className="shrink-0">ได้รับรายการเงินเข้าบัญชีธนาคาร/เงินสด ตามรายละเอียด ดังนี้</span>
        </div>
        <div className="flex gap-4 pl-8">
          <span className="shrink-0">เลขที่บัญชีธนาคาร/เงินสด</span>
          <span className="border-b border-black border-dotted flex-1 min-h-[20px] font-bold">{data.bankAccount}</span>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr>
            <th className="border border-black p-2 w-10">ที่</th>
            <th className="border border-black p-2">รายการ</th>
            <th className="border border-black p-2 w-40">เลขที่อ้างอิง</th>
            <th className="border border-black p-2 w-32">จำนวนเงิน<br/>( บาท )</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => {
            const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
            return (
              <tr key={item.id} className="h-8">
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2">{item.description}</td>
                <td className="border border-black p-2 text-center">{item.refNo}</td>
                <td className="border border-black p-2 text-right">{p.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 12 - data.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="h-10">
            <td className="border border-black p-2 text-center font-bold">รวม</td>
            <td colSpan={2} className="border border-black p-2 text-center font-bold">ศูนย์บาทถ้วน</td>
            <td className="border border-black p-2 text-right font-bold">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-20 text-center space-y-8">
        <h3 className="text-lg font-bold">ผู้ทำรายการ</h3>
        <div className="mb-2 relative">
           <p>........................................................</p>
           <p className="absolute bottom-1 left-0 right-0">{data.name}</p>
        </div>
        <p className="text-xl">{data.makerName || 'code_name'}</p>
      </div>
    </div>
  );
});

export const JournalVoucherTemplate = forwardRef<HTMLDivElement, { data: DocumentData }>(({ data }, ref) => {
  const total = data.items.reduce((sum, item) => {
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
    return sum + p;
  }, 0);

  return (
    <div ref={ref} className="bg-white p-12 text-black text-[13pt] relative" style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Sarabun', sans-serif", lineHeight: '1.5' }}>
      <div className="text-center mb-2">
        <h1 className="text-lg font-bold">บันทึกข้อความ</h1>
        <h2 className="text-base font-bold">ใบสำคัญรายวันทั่วไป (Journal Voucher)</h2>
      </div>

      <div className="absolute top-12 right-12 flex items-center gap-2">
        <span>เลขที่ JV :</span>
        <div className="border border-black px-2 py-1 w-32 min-h-[28px] flex items-center justify-center">
          {data.docNo}
        </div>
      </div>

      <div className="text-center mb-6">
        <p>โรงเรียนพระปริยัติธรรมวัดธรรมมงคล แผนกสามัญศึกษา</p>
        <p>132 ถนนสุขุมวิท 101 แขวงบางจาก เขตพระโขนง กรุงเทพฯ 10260</p>
      </div>

      <div className="flex justify-end mb-6">
        <span>{data.date} {data.month} {data.year}</span>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <span className="shrink-0">ข้าพเจ้า</span>
          <span className="border-b border-black border-dotted flex-1 min-h-[20px]">{data.name}</span>
          <span className="shrink-0">ตำแหน่ง</span>
          <span className="border-b border-black border-dotted flex-1 min-h-[20px]">{data.position}</span>
        </div>
        <div className="flex gap-4">
          <span className="shrink-0">ได้ดำเนินการปรับปรุง/แก้ไข รายการดังต่อไปนี้</span>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr>
            <th className="border border-black p-2 w-10">ที่</th>
            <th className="border border-black p-2">รายการ</th>
            <th className="border border-black p-2 w-40">เอกสารอ้างอิง</th>
            <th className="border border-black p-2 w-32">จำนวนเงิน<br/>( บาท )</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => {
            const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
            return (
              <tr key={item.id} className="h-8">
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2">{item.description}</td>
                <td className="border border-black p-2 text-center">{item.refNo}</td>
                <td className="border border-black p-2 text-right">{p.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 12 - data.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="h-10">
            <td className="border border-black p-2 text-center font-bold">รวม</td>
            <td colSpan={2} className="border border-black p-2 text-center font-bold">ศูนย์บาทถ้วน</td>
            <td className="border border-black p-2 text-right font-bold">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-20 text-center space-y-8">
        <h3 className="text-lg font-bold">ผู้ทำรายการ</h3>
        <div className="mb-2 relative">
           <p>........................................................</p>
           <p className="absolute bottom-1 left-0 right-0">{data.name}</p>
        </div>
        <p className="text-xl">{data.makerName || 'code_name'}</p>
      </div>
    </div>
  );
});
