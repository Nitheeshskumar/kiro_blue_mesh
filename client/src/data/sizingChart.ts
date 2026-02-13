export interface SizeChart {
  size: string;
  chest: string;
  waist: string;
  hip: string;
  length: string;
  age?: string;
}

export const INDIAN_SIZE_CHART: SizeChart[] = [
  // Baby sizes (in cm)
  { size: "0-3 months", chest: "40-43", waist: "40-43", hip: "42-45", length: "35-40", age: "0-3 months" },
  { size: "3-6 months", chest: "43-46", waist: "43-46", hip: "45-48", length: "40-45", age: "3-6 months" },
  { size: "6-9 months", chest: "46-49", waist: "46-49", hip: "48-51", length: "45-50", age: "6-9 months" },
  { size: "9-12 months", chest: "49-52", waist: "49-52", hip: "51-54", length: "50-55", age: "9-12 months" },
  { size: "12-18 months", chest: "52-55", waist: "52-55", hip: "54-57", length: "55-60", age: "12-18 months" },
  { size: "18-24 months", chest: "55-58", waist: "55-58", hip: "57-60", length: "60-65", age: "18-24 months" },
  
  // Kids sizes (in cm)
  { size: "4", chest: "58-61", waist: "56-59", hip: "62-65", length: "65-70", age: "3-4 years" },
  { size: "5", chest: "61-64", waist: "59-62", hip: "65-68", length: "70-75", age: "4-5 years" },
  { size: "6", chest: "64-67", waist: "62-65", hip: "68-71", length: "75-80", age: "5-6 years" },
  { size: "7", chest: "67-70", waist: "65-68", hip: "71-74", length: "80-85", age: "6-7 years" },
  { size: "8", chest: "70-73", waist: "68-71", hip: "74-77", length: "85-90", age: "7-8 years" },
  { size: "10", chest: "73-78", waist: "71-76", hip: "77-82", length: "90-95", age: "9-10 years" },
  { size: "12", chest: "78-83", waist: "76-81", hip: "82-87", length: "95-100", age: "11-12 years" },
  { size: "14", chest: "83-88", waist: "81-86", hip: "87-92", length: "100-105", age: "13-14 years" },
  { size: "16", chest: "88-93", waist: "86-91", hip: "92-97", length: "105-110", age: "15-16 years" },
  
  // Adult sizes (in cm)
  { size: "XS", chest: "81-86", waist: "66-71", hip: "86-91", length: "60-65" },
  { size: "S", chest: "86-91", waist: "71-76", hip: "91-96", length: "62-67" },
  { size: "M", chest: "91-96", waist: "76-81", hip: "96-101", length: "64-69" },
  { size: "L", chest: "96-102", waist: "81-87", hip: "101-107", length: "66-71" },
  { size: "XL", chest: "102-108", waist: "87-93", hip: "107-113", length: "68-73" },
  { size: "XXL", chest: "108-114", waist: "93-99", hip: "113-119", length: "70-75" },
  { size: "3XL", chest: "114-120", waist: "99-105", hip: "119-125", length: "72-77" }
];

export const SIZE_GUIDE_TIPS = [
  "All measurements are in centimeters (cm)",
  "Chest: Measure around the fullest part of the chest",
  "Waist: Measure around the natural waistline",
  "Hip: Measure around the fullest part of the hips",
  "Length: Measure from shoulder to desired length",
  "For best fit, compare your measurements with the size chart",
  "If between sizes, choose the larger size for comfort",
  "Contact us for custom sizing if needed"
];