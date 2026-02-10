import React, { forwardRef } from 'react';
import { toThaiBaht } from '../services/utils';

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
  timestamp?: string;
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
  const ITEMS_PER_PAGE = 10;
  const chunkedItems = [];
  for (let i = 0; i < data.items.length; i += ITEMS_PER_PAGE) {
    chunkedItems.push(data.items.slice(i, i + ITEMS_PER_PAGE));
  }
  if (chunkedItems.length === 0) chunkedItems.push([]);

  const total = data.items.reduce((sum, item) => {
    const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity as string) || 0;
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
    return sum + (q * p);
  }, 0);

  return (
    <div ref={ref} className="flex flex-col gap-8 bg-gray-100 p-8 print:p-0 print:bg-white no-shadow">
      {chunkedItems.map((pageItems, pageIndex) => (
        <div 
          key={pageIndex} 
          className="bg-white p-12 text-black text-[13pt] relative shadow-lg print:shadow-none pdf-page" 
          style={{ width: '210mm', height: '297mm', fontFamily: "'Sarabun', sans-serif", lineHeight: '1.5', overflow: 'hidden' }}
        >
          {/* Header - Only on First Page */}
          {pageIndex === 0 && (
            <>
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
                  <span className="border-b border-black border-dotted min-w-[120px] text-center px-2">{data.psNo}</span>
                </div>
                <span>{data.date} {data.month} {data.year}</span>
              </div>

              <div className="mb-8 space-y-4">
                <div className="flex gap-4 items-end">
                  <span className="shrink-0 mb-[2px]">ข้าพเจ้า</span>
                  <span className="border-b border-black border-dotted flex-1 min-h-[28px] px-2 text-center pb-3">{data.name}</span>
                  <span className="shrink-0 mb-[2px]">ตำแหน่ง</span>
                  <span className="border-b border-black border-dotted flex-1 min-h-[28px] px-2 text-center pb-3">{data.position}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <span className="shrink-0">ได้รับมอบหมายให้ดำเนินการ :</span>
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-gray-400">
                    <span>หน้า {pageIndex + 1} / {chunkedItems.length}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Continuation Header */}
          {pageIndex > 0 && (
            <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
              <span className="font-bold text-sm">ใบเบิกเงิน (PV) : {data.docNo}</span>
              <span className="font-bold text-sm">หน้า {pageIndex + 1} / {chunkedItems.length}</span>
            </div>
          )}

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
              {pageItems.map((item, index) => {
                const globalIndex = pageIndex * ITEMS_PER_PAGE + index + 1;
                const q = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity as string) || 0;
                const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
                return (
                  <tr key={item.id} className="h-8">
                    <td className="border border-black p-2 text-center">{globalIndex}</td>
                    <td className="border border-black p-2">{item.description}</td>
                    <td className="border border-black p-2 text-center">{item.quantity} {item.unit}</td>
                    <td className="border border-black p-2 text-right">{p.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="border border-black p-2 text-right">{(q * p).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
              {/* Fill empty rows only on the last page or to maintain height */}
              {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - pageItems.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}
            </tbody>
            {/* Show Footer only on the last page */}
            {pageIndex === chunkedItems.length - 1 && (
              <tfoot>
                <tr className="h-10">
                  <td className="border border-black p-2 text-center font-bold">รวม</td>
                  <td colSpan={3} className="border border-black p-2 text-center font-bold">{toThaiBaht(total)}</td>
                  <td className="border border-black p-2 text-right font-bold">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Signatures - Only on the last page */}
          {pageIndex === chunkedItems.length - 1 && <TemplateSignature data={data} />}
        </div>
      ))}
    </div>
  );
});

const TemplateSignature = ({ data }: { data: DocumentData }) => (
  <div className="absolute bottom-24 left-0 right-0">
    <div className="text-center space-y-2">
      <h3 className="text-base font-bold">ผู้ทำรายการ</h3>
      <div className="inline-block min-w-[250px] space-y-1">
        <div className="border-b border-black border-dotted w-full min-h-[40px] flex items-end justify-center px-4 pb-3">
          {data.name}
        </div>
        <p className="text-base pt-1">{data.makerName || ''}</p>
      </div>
      {data.timestamp && (
        <div className="text-[10pt] text-gray-500 mt-2">
          ( บันทึกเมื่อ: {data.timestamp} )
        </div>
      )}
    </div>
  </div>
);

export const ReceiveVoucherTemplate = forwardRef<HTMLDivElement, { data: DocumentData }>(({ data }, ref) => {
  const ITEMS_PER_PAGE = 10;
  const chunkedItems = [];
  for (let i = 0; i < data.items.length; i += ITEMS_PER_PAGE) {
    chunkedItems.push(data.items.slice(i, i + ITEMS_PER_PAGE));
  }
  if (chunkedItems.length === 0) chunkedItems.push([]);

  const total = data.items.reduce((sum, item) => {
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
    return sum + p;
  }, 0);

  return (
    <div ref={ref} className="flex flex-col gap-8 bg-gray-100 p-8 print:p-0 print:bg-white no-shadow">
      {chunkedItems.map((pageItems, pageIndex) => (
        <div 
          key={pageIndex} 
          className="bg-white p-12 text-black text-[13pt] relative shadow-lg print:shadow-none pdf-page" 
          style={{ width: '210mm', height: '297mm', fontFamily: "'Sarabun', sans-serif", lineHeight: '1.5', overflow: 'hidden' }}
        >
          {/* Header - Only on First Page */}
          {pageIndex === 0 && (
            <>
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
                <div className="flex gap-4 items-end">
                  <span className="shrink-0 mb-[2px]">ข้าพเจ้า</span>
                  <span className="border-b border-black border-dotted flex-1 min-h-[28px] px-2 text-center pb-3">{data.name}</span>
                  <span className="shrink-0 mb-[2px]">ตำแหน่ง</span>
                  <span className="border-b border-black border-dotted flex-1 min-h-[28px] px-2 text-center pb-3">{data.position}</span>
                </div>
                <div className="flex gap-4">
                  <span className="shrink-0 text-sm font-bold">ได้รับรายการเงินเข้าบัญชีธนาคาร/เงินสด ตามรายละเอียด ดังนี้</span>
                </div>
                <div className="flex gap-4 pl-8 items-end">
                  <span className="shrink-0 mb-[2px]">เลขที่บัญชีธนาคาร/เงินสด</span>
                  <span className="border-b border-black border-dotted flex-1 min-h-[28px] font-bold px-2 pb-3 text-center">{data.bankAccount}</span>
                </div>
                <div className="flex gap-4 text-sm font-bold mt-2">
                  <span>หน้าที่ {pageIndex + 1} / {chunkedItems.length}</span>
                </div>
              </div>
            </>
          )}

          {/* Continuation Header */}
          {pageIndex > 0 && (
            <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
              <span className="font-bold text-sm">ใบรับเงิน (RV) : {data.docNo}</span>
              <span className="font-bold text-sm">หน้า {pageIndex + 1} / {chunkedItems.length}</span>
            </div>
          )}

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
              {pageItems.map((item, index) => {
                const globalIndex = pageIndex * ITEMS_PER_PAGE + index + 1;
                const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
                return (
                  <tr key={item.id} className="h-8">
                    <td className="border border-black p-2 text-center">{globalIndex}</td>
                    <td className="border border-black p-2">{item.description}</td>
                    <td className="border border-black p-2 text-center">{item.refNo}</td>
                    <td className="border border-black p-2 text-right">{p.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
              {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - pageItems.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}
            </tbody>
            {/* Footer Summary on Last Page */}
            {pageIndex === chunkedItems.length - 1 && (
              <tfoot>
                <tr className="h-10">
                  <td className="border border-black p-2 text-center font-bold">รวม</td>
                  <td colSpan={2} className="border border-black p-2 text-center font-bold">{toThaiBaht(total)}</td>
                  <td className="border border-black p-2 text-right font-bold">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Signatures on Last Page */}
          {pageIndex === chunkedItems.length - 1 && <TemplateSignature data={data} />}
        </div>
      ))}
    </div>
  );
});

export const JournalVoucherTemplate = forwardRef<HTMLDivElement, { data: DocumentData }>(({ data }, ref) => {
  const ITEMS_PER_PAGE = 10;
  const chunkedItems = [];
  for (let i = 0; i < data.items.length; i += ITEMS_PER_PAGE) {
    chunkedItems.push(data.items.slice(i, i + ITEMS_PER_PAGE));
  }
  if (chunkedItems.length === 0) chunkedItems.push([]);

  const total = data.items.reduce((sum, item) => {
    const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
    return sum + p;
  }, 0);

  return (
    <div ref={ref} className="flex flex-col gap-8 bg-gray-100 p-8 print:p-0 print:bg-white no-shadow">
      {chunkedItems.map((pageItems, pageIndex) => (
        <div 
          key={pageIndex} 
          className="bg-white p-12 text-black text-[13pt] relative shadow-lg print:shadow-none pdf-page" 
          style={{ width: '210mm', height: '297mm', fontFamily: "'Sarabun', sans-serif", lineHeight: '1.5', overflow: 'hidden' }}
        >
          {/* Header - Only on First Page */}
          {pageIndex === 0 && (
            <>
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
                <div className="flex gap-4 items-end">
                  <span className="shrink-0 mb-[2px]">ข้าพเจ้า</span>
                  <span className="border-b border-black border-dotted flex-1 min-h-[28px] px-2 text-center pb-3">{data.name}</span>
                  <span className="shrink-0 mb-[2px]">ตำแหน่ง</span>
                  <span className="border-b border-black border-dotted flex-1 min-h-[28px] px-2 text-center pb-3">{data.position}</span>
                </div>
                <div className="flex gap-4">
                  <span className="shrink-0 text-sm font-bold">ได้ดำเนินการปรับปรุง/แก้ไข รายการดังต่อไปนี้</span>
                </div>
                <div className="flex gap-4 text-sm font-bold mt-2">
                  <span>หน้าที่ {pageIndex + 1} / {chunkedItems.length}</span>
                </div>
              </div>
            </>
          )}

          {/* Continuation Header */}
          {pageIndex > 0 && (
            <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
              <span className="font-bold text-sm">ใบสำคัญรายวัน (JV) : {data.docNo}</span>
              <span className="font-bold text-sm">หน้า {pageIndex + 1} / {chunkedItems.length}</span>
            </div>
          )}

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
              {pageItems.map((item, index) => {
                const globalIndex = pageIndex * ITEMS_PER_PAGE + index + 1;
                const p = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price as string) || 0;
                return (
                  <tr key={item.id} className="h-8">
                    <td className="border border-black p-2 text-center">{globalIndex}</td>
                    <td className="border border-black p-2">{item.description}</td>
                    <td className="border border-black p-2 text-center">{item.refNo}</td>
                    <td className="border border-black p-2 text-right">{p.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
              {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - pageItems.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}
            </tbody>
            {/* Footer Summary on Last Page */}
            {pageIndex === chunkedItems.length - 1 && (
              <tfoot>
                <tr className="h-10">
                  <td className="border border-black p-2 text-center font-bold">รวม</td>
                  <td colSpan={2} className="border border-black p-2 text-center font-bold">{toThaiBaht(total)}</td>
                  <td className="border border-black p-2 text-right font-bold">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Signatures on Last Page */}
          {pageIndex === chunkedItems.length - 1 && <TemplateSignature data={data} />}
        </div>
      ))}
    </div>
  );
});
