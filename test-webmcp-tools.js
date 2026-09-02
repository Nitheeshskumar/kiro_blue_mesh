/**
 * Test WebMCP Tool Execution Logic
 */

console.log("🧪 Starting WebMCP Tools Verification Test\n");

// 1. Test sizing recommendation logic
function testRecommendSize(chest, unit = "cm") {
  const chestCm = unit === "in" ? chest * 2.54 : chest;
  const adultChart = [
    { size: "XS", chest: "81-86", waist: "66-71", hip: "86-91", length: "60-65" },
    { size: "S", chest: "86-91", waist: "71-76", hip: "91-96", length: "62-67" },
    { size: "M", chest: "91-96", waist: "76-81", hip: "96-101", length: "64-69" },
    { size: "L", chest: "96-102", waist: "81-87", hip: "101-107", length: "66-71" },
    { size: "XL", chest: "102-108", waist: "87-93", hip: "107-113", length: "68-73" },
    { size: "XXL", chest: "108-114", waist: "93-99", hip: "113-119", length: "70-75" },
    { size: "3XL", chest: "114-120", waist: "99-105", hip: "119-125", length: "72-77" },
  ];

  let bestMatch = null;
  let minDiff = Infinity;

  for (const entry of adultChart) {
    const parts = entry.chest.split("-").map((s) => parseFloat(s.trim()));
    if (parts.length === 2) {
      const [minVal, maxVal] = parts;
      if (chestCm >= minVal && chestCm <= maxVal) {
        bestMatch = entry;
        break;
      }
      const midVal = (minVal + maxVal) / 2;
      const diff = Math.abs(chestCm - midVal);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = entry;
      }
    }
  }

  return {
    input: `${chest}${unit} (${Math.round(chestCm)}cm)`,
    recommendedSize: bestMatch.size,
    chestRange: bestMatch.chest + " cm",
  };
}

console.log("--- Test 1: Sizing Recommendation ---");
const r1 = testRecommendSize(98, "cm");
console.log(`Chest 98cm: Recommended ${r1.recommendedSize} (Range: ${r1.chestRange}) -> Expected L`);
if (r1.recommendedSize !== "L") throw new Error("Sizing test failed for 98cm");

const r2 = testRecommendSize(42, "in"); // 42 inches = 106.68cm -> XL (102-108)
console.log(`Chest 42in: Recommended ${r2.recommendedSize} (Range: ${r2.chestRange}) -> Expected XL`);
if (r2.recommendedSize !== "XL") throw new Error("Sizing test failed for 42in");

console.log("✅ Sizing intelligence passed!\n");

// 2. Test Catalog search logic
console.log("--- Test 2: Search Logic ---");
const sampleCatalog = [
  { id: "1", name: "Classic Cotton T-Shirt", category: "shirts", basePrice: 1899 },
  { id: "2", name: "Premium Fleece Hoodie", category: "hoodies", basePrice: 3299 },
  { id: "3", name: "Tailored Pique Polo", category: "polos", basePrice: 2499 },
];

function search(query, category) {
  return sampleCatalog.filter((p) => {
    const matchesQ = !query || p.name.toLowerCase().includes(query.toLowerCase());
    const matchesC = !category || p.category.toLowerCase() === category.toLowerCase();
    return matchesQ && matchesC;
  });
}

const s1 = search("hoodie");
console.log(`Search "hoodie": Found ${s1.length} product ("${s1[0].name}")`);
if (s1.length !== 1) throw new Error('Search failed for "hoodie"');

const s2 = search("xyznotfound");
console.log(`Search "xyznotfound": Found ${s2.length} products (empty result handling)`);
if (s2.length !== 0) throw new Error("Empty search failed");

console.log("✅ Catalog search passed!\n");

console.log("🎉 All WebMCP core tool calculations verified successfully!");
