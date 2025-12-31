import React, { forwardRef } from 'react';

export interface DocumentData {
  type: 'withdrawal' | 'return' | 'purchase';
  docNo: string;
  date: string;
  month: string;
  year: string;
  name: string;
  position: string;
  department?: string; // For purchase request
  subject?: string; // For purchase request
  to?: string; // For purchase request
  purpose?: string; // For purchase request
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
  }>;
}

export const WithdrawalTemplate = forwardRef<HTMLDivElement, { data: DocumentData }>(({ data }, ref) => {
  const total = data.items.reduce((sum, item) => {
    const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity) || 0;
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price) || 0;
    return sum + (q * p);
  }, 0);

  return (
    <div ref={ref} className="bg-white p-8 text-black text-sm font-serif" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">บันทึกข้อความ</h1>
        <h2 className="text-lg font-bold">ใบเบิกเงิน</h2>
      </div>

      <div className="flex justify-end mb-4">
        <div className="border border-black px-2 py-1 w-32">
          เลขที่ CR : {data.docNo || '................'}
        </div>
      </div>

      <div className="text-center mb-4">
        <p>โรงเรียนพระปริยัติธรรมวัดธรรมมงคล แผนกสามัญศึกษา</p>
        <p>132 ถนนสุขุมวิท 101 แขวงบางจาก เขตพระโขนง กรุงเทพฯ 10260</p>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <span>วันที่ {data.date || '........'}</span>
        <span>เดือน {data.month || '................'}</span>
        <span>พ.ศ. {data.year || '........'}</span>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-2">
          <span className="w-16">ข้าพเจ้า</span>
          <span className="border-b border-black border-dotted flex-1">{data.name}</span>
          <span className="w-16">ตำแหน่ง</span>
          <span className="border-b border-black border-dotted flex-1">{data.position}</span>
        </div>
        <div>
          <span>ได้รับมอบหมายให้ดำเนินการ :</span>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr>
            <th className="border border-black p-2 w-12">ที่</th>
            <th className="border border-black p-2">รายการ</th>
            <th className="border border-black p-2 w-20">จำนวน</th>
            <th className="border border-black p-2 w-20">หน่วยละ</th>
            <th className="border border-black p-2 w-32">จำนวนเงิน <br/>( บาท )</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => {
            const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity) || 0;
            const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price) || 0;
            return (
              <tr key={item.id} className="h-8">
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2">{item.description}</td>
                <td className="border border-black p-2 text-center">{item.quantity} {item.unit}</td>
                <td className="border border-black p-2 text-right">{p.toLocaleString()}</td>
                <td className="border border-black p-2 text-right">{(q * p).toLocaleString()}</td>
              </tr>
            );
          })}
          {/* Empty rows to fill table */}
          {Array.from({ length: Math.max(0, 10 - data.items.length) }).map((_, i) => (
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
          <tr>
            <td className="border border-black p-2 text-center">รวม</td>
            <td colSpan={3} className="border border-black p-2 text-center">ศูนย์บาทถ้วน</td>
            <td className="border border-black p-2 text-right font-bold">{total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div>
          <p className="mb-8">ลงชื่อ .......................................................</p>
          <div className="text-center">
            <p>( {data.name || '...................................'} )</p>
            <p>ผู้ขอเบิก</p>
            <p>......../......../........</p>
          </div>
        </div>
        <div>
          <p className="mb-8">ลงชื่อ .......................................................</p>
          <div className="text-center">
            <p>( พระครูธรรมญาณโกวิท )</p>
            <p>ผู้อนุมัติ</p>
            <p>......../......../........</p>
          </div>
        </div>
      </div>
       <div className="grid grid-cols-2 gap-8 mt-12">
        <div>
          <p className="mb-8">ลงชื่อ .......................................................</p>
          <div className="text-center">
            <p>( พระอนุรักษ์ อภิธมฺโม )</p>
            <p>ผู้จ่ายเงิน</p>
            <p>......../......../........</p>
          </div>
        </div>
        <div>
          <p className="mb-8">ลงชื่อ .......................................................</p>
          <div className="text-center">
            <p>( ................................... )</p>
            <p>ผู้รับเงิน</p>
            <p>......../......../........</p>
          </div>
        </div>
      </div>
      <div className="text-right mt-4 text-xs">
          ผู้พิมพ์ : {data.name}
      </div>
    </div>
  );
});

export const ReturnTemplate = forwardRef<HTMLDivElement, { data: DocumentData }>(({ data }, ref) => {
    const total = data.items.reduce((sum, item) => {
    const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity) || 0;
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price) || 0;
    return sum + (q * p);
  }, 0);
  return (
    <div ref={ref} className="bg-white p-8 text-black text-sm font-serif" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">ใบนำส่งเงินคืน</h1>
      </div>
      
       <div className="flex justify-between mb-4">
        <div>ปส.</div>
        <div className="border border-black px-2 py-1 w-32">
          เลขที่ DB : {data.docNo || '................'}
        </div>
      </div>

      <div className="text-center mb-4">
        <p>โรงเรียนพระปริยัติธรรมวัดธรรมมงคล แผนกสามัญศึกษา</p>
        <p>132 ถนนสุขุมวิท 101 แขวงบางจาก เขตพระโขนง กรุงเทพฯ 10260</p>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <span>วันที่ {data.date || '........'}</span>
        <span>เดือน {data.month || '................'}</span>
        <span>พ.ศ. {data.year || '........'}</span>
      </div>

      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr>
            <th className="border border-black p-2 w-10">ที่</th>
            <th className="border border-black p-2">เลขที่<br/>ใบเบิกเงิน</th>
            <th className="border border-black p-2">วันที่</th>
            <th className="border border-black p-2">ใบเสร็จเลขที่</th>
            <th className="border border-black p-2">รายการ</th>
            <th className="border border-black p-2 w-24">จำนวนเงิน<br/>(บาท)</th>
            <th className="border border-black p-2 w-20">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
           {data.items.map((item, index) => {
             const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity) || 0;
             const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price) || 0;
             return (
               <tr key={item.id} className="h-8">
                 <td className="border border-black p-2 text-center">{index + 1}</td>
                 <td className="border border-black p-2">{item.receiveNo}</td>
                 <td className="border border-black p-2">{item.receiptDate}</td>
                 <td className="border border-black p-2">{item.receiptNo}</td>
                 <td className="border border-black p-2">{item.description}</td>
                 <td className="border border-black p-2 text-right">{(q * p).toLocaleString()}</td>
                 <td className="border border-black p-2">{item.note}</td>
               </tr>
             );
           })}
           {/* Empty rows */}
          {Array.from({ length: Math.max(0, 10 - data.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
               <td className="border border-black p-2"></td>
                <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
               <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border border-black p-2 text-center">รวม</td>
            <td colSpan={4} className="border border-black p-2 text-center">ศูนย์บาทถ้วน</td>
            <td className="border border-black p-2 text-right font-bold">{total.toLocaleString()}</td>
             <td className="border border-black p-2"></td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div>
          <p className="mb-6">ลงชื่อ .......................................................</p>
          <div className="text-center">
            <p>( {data.name || '...................................'} )</p>
            <p>ผู้นำส่งเงินคืน</p>
            <p>......../......../........</p>
          </div>
             <p className="mt-8 mb-6 text-center">ลงชื่อ .......................................................</p>
             <div className="text-center">
               <p>( พระครูสมุห์บุญเนาว์ การปุญโญ )</p>
               <p>หัวฝ่ายบริหารงบประมาณ</p>
               <p>......../......../........</p>
             </div>
        </div>
        <div>
          <p className="mb-6">ลงชื่อ .......................................................</p>
          <div className="text-center">
            <p>( พระอนุรักษ์ อภิธมฺโม )</p>
            <p>เจ้าหน้าที่การเงิน</p>
            <p>......../......../........</p>
          </div>
        </div>
      </div>
       <div className="text-right mt-12 text-xs">
          ผู้พิมพ์ : {data.name}
      </div>
    </div>
  );
});


export const PurchaseTemplate = forwardRef<HTMLDivElement, { data: DocumentData }>(({ data }, ref) => {
     const total = data.items.reduce((sum, item) => {
    const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity) || 0;
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price) || 0;
    return sum + (q * p);
  }, 0);
  return (
    <div ref={ref} className="bg-white p-8 text-black text-sm font-serif" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="flex mb-4">
        <div className="flex-1 text-center pt-4">
            <h1 className="text-xl font-bold">บันทึกข้อความ</h1>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex">
            <span className="w-24 font-bold">ส่วนราชการ</span>
            <span>โรงเรียนพระปริยัติธรรมวัดธรรมมงคล แผนกสามัญศึกษา กรุงเทพมหานคร โทร. 02-332-8227</span>
        </div>
         <div className="flex gap-4">
             <div className="flex-1 flex">
                 <span className="w-24 font-bold">ที่</span>
                 <span>ปส 03011007 / {data.docNo}</span>
             </div>
             <div className="flex-1 flex">
                 <span className="w-16 font-bold">วันที่</span>
                 <span>{data.date || '........'} {data.month || '................'} {data.year || '........'}</span>
             </div>
        </div>
        <div className="flex">
            <span className="w-24 font-bold">เรื่อง</span>
            <span>{data.subject}</span>
        </div>
      </div>
      <hr className="border-black mb-4"/>

      <div className="mb-4">
        <div className="flex mb-1">
             <span className="w-24 font-bold">เรียน</span>
             <span>พระครูธรรมญาณโกวิท รองผู้อำนวยการโรงเรียนพระปริยัติธรรมวัดธรรมมงคล</span>
        </div>
         <div className="flex mb-1">
             <span className="w-24 font-bold">ข้าพเจ้า</span>
             <span className="mr-8">{data.name}</span>
             <span className="mr-4 font-bold">ฉายา/นามสกุล</span>
             <span>...................................</span>
        </div>
        <div className="flex mb-1">
             <span className="w-24 font-bold">ตำแหน่ง</span>
             <span className="mr-8">{data.position}</span>
             <span className="mr-4 font-bold">หมวด/ฝ่าย</span>
             <span>{data.department}</span>
        </div>
         <div className="flex mb-1">
             <span className="w-24 font-bold">มีความประสงค์</span>
             <span>{data.purpose}</span>
        </div>
      </div>
      
      <p className="font-bold mb-2">ได้เสนอขอให้จัดซื้อ พัสดุ - ครุภัณฑ์ / หรือสาธารณูปโภค ดังรายการต่อไปนี้</p>

      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr>
            <th className="border border-black p-2 w-10">ที่</th>
            <th className="border border-black p-2">รายการ</th>
            <th className="border border-black p-2 w-20">จำนวน</th>
            <th className="border border-black p-2 w-20">หน่วยละ</th>
            <th className="border border-black p-2 w-24">ราคา/บาท</th>
            <th className="border border-black p-2 w-24">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => {
            const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity) || 0;
            const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price) || 0;
            return (
              <tr key={item.id} className="h-8">
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2">{item.description}</td>
                <td className="border border-black p-2 text-center">{item.quantity} {item.unit}</td>
                <td className="border border-black p-2 text-center">{p.toLocaleString()}</td>
                <td className="border border-black p-2 text-right">{(q * p).toLocaleString()}</td>
                <td className="border border-black p-2">{item.note}</td>
              </tr>
            );
          })}
           {Array.from({ length: Math.max(0, 5 - data.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
           <tr>
            <td colSpan={4} className="border border-black p-2 text-right font-bold">รวมเป็นเงินทั้งสิ้น</td>
            <td className="border border-black p-2 text-right font-bold">{total.toLocaleString()}</td>
            <td className="border border-black p-2"></td>
          </tr>
        </tfoot>
      </table>

      <div className="flex mb-6">
          <span>รวมเป็นจำนวนเงินทั้งสิ้น .................................... บาท (ตัวหนังสือ) .....................................................................................</span>
      </div>
      
      <div className="pl-12 mb-8">
          <p>จึงเรียนมาเพื่อขออนุมัติ</p>
      </div>

       <div className="grid grid-cols-2 gap-8 mb-8">
        <div></div>
        <div>
          <div className="flex justify-between px-4">
            <span>ลงชื่อ</span>
            <span>ผู้ขอเบิก</span>
          </div>
           <div className="text-center my-2">
            <span>( {data.name} )</span>
          </div>
           <div className="flex justify-between px-4">
            <span>ตำแหน่ง</span>
            <span>{data.position}</span>
          </div>
        </div>
      </div>
      
      <hr className="border-black border-dotted mb-4" />

      <div className="grid grid-cols-2 gap-8 mt-4">
        <div className="text-center">
            <div className="flex justify-between px-4 mb-4">
                <span>ลงชื่อ</span>
                <span>ผู้เห็นชอบ</span>
            </div>
            <p>( พระพิชิตชัย ชิตชโย )</p>
            <p>ผู้ตรวจสอบรายการคำสั่งซื้อ</p>
        </div>
         <div className="text-center">
            <div className="flex justify-between px-4 mb-4">
                <span>ลงชื่อ</span>
                <span>ผู้เห็นชอบ</span>
            </div>
            <p>( นายบุญฤทธิ์ จันทร์ทอง )</p>
            <p>หัวหน้าพัสดุ - ครุภัณฑ์</p>
        </div>
      </div>

       <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="text-center">
            <div className="flex justify-between px-4 mb-4">
                <span>ลงชื่อ</span>
                <span>ผู้เห็นชอบ</span>
            </div>
            <p>( พระครูสมุห์บุญเนาว์ การปุญโญ )</p>
            <p>หัวหน้าฝ่ายงานงบประมาณ</p>
        </div>
         <div className="text-center">
            <div className="flex justify-between px-4 mb-4">
                <span>ลงชื่อ</span>
                <span>ผู้อนุมัติ</span>
            </div>
            <p>( พระครูธรรมญาณโกวิท )</p>
            <p>รองผู้อำนวยการโรงเรียน</p>
        </div>
      </div>

    </div>
  );
});
