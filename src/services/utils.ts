/**
 * Converts a number to Thai Baht text format.
 * Example: 121.50 -> หนึ่งร้อยยี่สิบเอ็ดบาทห้าสิบสตางค์
 */
export const toThaiBaht = (amount: number): string => {
  if (Number.isNaN(amount) || amount === null) return "ศูนย์บาทถ้วน";
  if (amount === 0) return "ศูนย์บาทถ้วน";

  const ThaiNumber = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const ThaiUnit = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  const convert = (numStr: string): string => {
    let result = "";
    const len = numStr.length;
    for (let i = 0; i < len; i++) {
        const digit = Number.parseInt(numStr[i]);
        if (digit !== 0) {
            if (i === len - 1 && digit === 1 && len > 1) {
                result += "เอ็ด";
            } else if (i === len - 2 && digit === 2) {
                result += "ยี่สิบ";
            } else if (i === len - 2 && digit === 1) {
                result += "สิบ";
            } else {
                result += ThaiNumber[digit] + ThaiUnit[len - i - 1];
            }
        }
    }
    return result;
  };

  // Split into Baht and Satang
  const parts = amount.toFixed(2).split(".");
  let bahtStr = parts[0];
  const satangStr = parts[1];

  let bahtText = "";
  
  // Handle millions grouping
  if (bahtStr.length > 6) {
    const millionPart = bahtStr.slice(0, -6);
    bahtStr = bahtStr.slice(-6);
    bahtText = convert(millionPart) + "ล้าน" + convert(bahtStr);
  } else {
    bahtText = convert(bahtStr);
  }

  if (bahtText === "") bahtText = "ศูนย์";
  
  let result = bahtText + "บาท";

  if (satangStr === "00") {
    result += "ถ้วน";
  } else {
    result += convert(satangStr) + "สตางค์";
  }

  return result;
};
