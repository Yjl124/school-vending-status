export const shelves = [
  { id: 6, name: "SNACKS & CHIPS" },
  { id: 5, name: "JELLIES & DRINKS" },
  { id: 4, name: "DRINKS & SODAS" },
  { id: 3, name: "CANS & JUICES" },
  { id: 2, name: "ENERGY & PROTEIN BARS" },
  { id: 1, name: "LARGE BOXES & WAFERS" },
];

// v:3 — stock status updated to match actual machine photos (June 2026)
// Changing v triggers a Firestore migration/reseed so cloud data stays in sync
export const initialVendingItems = [
  // ── SHELF 1: Large Boxes & Wafers (slots 11, 13, 15, 17) ──
  // Photo: 11=white cookie(✓), 13=item visible(✓), 15=empty coil(✗), 17=empty(✗)
  {
    id: "11", name: "화이트하임", price: 1200, category: "Snack", type: "box", shelf: 1, v: 3,
    brandColor: "#3A5FA8", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "53g", calories: 280, carbs: 36, sugar: 14, protein: 4, fat: 13, sodium: 95 }
  },
  {
    id: "13", name: "화이트하임", price: 1000, category: "Snack", type: "box", shelf: 1, v: 3,
    brandColor: "#3A5FA8", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "53g", calories: 280, carbs: 36, sugar: 14, protein: 4, fat: 13, sodium: 95 }
  },
  {
    id: "15", name: "웨하스", price: 800, category: "Snack", type: "bag", shelf: 1, v: 3,
    brandColor: "#D4569A", accentColor: "#FFE4F0", inStock: false,
    nutrition: { servingSize: "60g", calories: 300, carbs: 42, sugar: 18, protein: 3, fat: 13, sodium: 110 }
  },
  {
    id: "17", name: "웨하스", price: 800, category: "Snack", type: "bag", shelf: 1, v: 3,
    brandColor: "#D4569A", accentColor: "#FFE4F0", inStock: false,
    nutrition: { servingSize: "60g", calories: 300, carbs: 42, sugar: 18, protein: 3, fat: 13, sodium: 110 }
  },

  // ── SHELF 2: Energy & Protein Bars (slots 20–27) ──
  // Photo: all 8 slots have bars visible (all ✓)
  {
    id: "20", name: "닥터유 에너지바", price: 1200, category: "Snack", type: "bar", shelf: 2, v: 3,
    brandColor: "#E07822", accentColor: "#1A3A6E", inStock: true,
    nutrition: { servingSize: "40g", calories: 170, carbs: 24, sugar: 10, protein: 6, fat: 6, sodium: 90 }
  },
  {
    id: "21", name: "닥터유 에너지바", price: 1000, category: "Snack", type: "bar", shelf: 2, v: 3,
    brandColor: "#E07822", accentColor: "#1A3A6E", inStock: true,
    nutrition: { servingSize: "40g", calories: 170, carbs: 24, sugar: 10, protein: 6, fat: 6, sodium: 90 }
  },
  {
    id: "22", name: "닥터유 단백질바", price: 1200, category: "Snack", type: "bar", shelf: 2, v: 3,
    brandColor: "#1A2E5A", accentColor: "#E07822", inStock: true,
    nutrition: { servingSize: "40g", calories: 160, carbs: 18, sugar: 7, protein: 12, fat: 5, sodium: 120 }
  },
  {
    id: "23", name: "닥터유 단백질바", price: 1200, category: "Snack", type: "bar", shelf: 2, v: 3,
    brandColor: "#1A2E5A", accentColor: "#E07822", inStock: true,
    nutrition: { servingSize: "40g", calories: 160, carbs: 18, sugar: 7, protein: 12, fat: 5, sodium: 120 }
  },
  {
    id: "24", name: "오! 그래놀라바", price: 1200, category: "Snack", type: "bar", shelf: 2, v: 3,
    brandColor: "#D4621A", accentColor: "#3A6EA8", inStock: true,
    nutrition: { servingSize: "35g", calories: 155, carbs: 22, sugar: 9, protein: 3, fat: 6, sodium: 70 }
  },
  {
    id: "25", name: "오! 그래놀라바", price: 1100, category: "Snack", type: "bar", shelf: 2, v: 3,
    brandColor: "#D4621A", accentColor: "#3A6EA8", inStock: true,
    nutrition: { servingSize: "35g", calories: 155, carbs: 22, sugar: 9, protein: 3, fat: 6, sodium: 70 }
  },
  {
    id: "26", name: "콘푸라이트바", price: 1100, category: "Snack", type: "bar", shelf: 2, v: 3,
    brandColor: "#F4C430", accentColor: "#1A3A6E", inStock: true,
    nutrition: { servingSize: "35g", calories: 145, carbs: 26, sugar: 11, protein: 2, fat: 4, sodium: 85 }
  },
  {
    id: "27", name: "콘푸라이트바", price: 1100, category: "Snack", type: "bar", shelf: 2, v: 3,
    brandColor: "#F4C430", accentColor: "#1A3A6E", inStock: true,
    nutrition: { servingSize: "35g", calories: 145, carbs: 26, sugar: 11, protein: 2, fat: 4, sodium: 85 }
  },

  // ── SHELF 3: Cans & Juices (slots 30–37) ──
  // Photo: all 8 slots have tube/bar snacks visible (all ✓)
  {
    id: "30", name: "구운감자", price: 1000, category: "Snack", type: "bag", shelf: 3, v: 3,
    brandColor: "#C8A820", accentColor: "#CC2200", inStock: true,
    nutrition: { servingSize: "55g", calories: 255, carbs: 36, sugar: 2, protein: 4, fat: 10, sodium: 420 }
  },
  {
    id: "31", name: "칸초", price: 1300, category: "Snack", type: "bag", shelf: 3, v: 3,
    brandColor: "#4A2C10", accentColor: "#D4890A", inStock: true,
    nutrition: { servingSize: "42g", calories: 215, carbs: 28, sugar: 12, protein: 3, fat: 10, sodium: 100 }
  },
  {
    id: "32", name: "스퀴즈 사과", price: 800, category: "Drink", type: "can", shelf: 3, v: 3,
    brandColor: "#2ECC71", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "240ml", calories: 110, carbs: 28, sugar: 26, protein: 0, fat: 0, sodium: 15 }
  },
  {
    id: "33", name: "스퀴즈 사과", price: 800, category: "Drink", type: "can", shelf: 3, v: 3,
    brandColor: "#2ECC71", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "240ml", calories: 110, carbs: 28, sugar: 26, protein: 0, fat: 0, sodium: 15 }
  },
  {
    id: "34", name: "스퀴즈 포도", price: 400, category: "Drink", type: "can", shelf: 3, v: 3,
    brandColor: "#8E44AD", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "240ml", calories: 115, carbs: 29, sugar: 27, protein: 0, fat: 0, sodium: 15 }
  },
  {
    id: "35", name: "스퀴즈 포도", price: 1000, category: "Drink", type: "can", shelf: 3, v: 3,
    brandColor: "#8E44AD", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "240ml", calories: 115, carbs: 29, sugar: 27, protein: 0, fat: 0, sodium: 15 }
  },
  {
    id: "36", name: "토레타", price: 1000, category: "Drink", type: "can", shelf: 3, v: 3,
    brandColor: "#1ABC9C", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "350ml", calories: 70, carbs: 18, sugar: 17, protein: 0, fat: 0, sodium: 55 }
  },
  {
    id: "37", name: "토레타", price: 1000, category: "Drink", type: "can", shelf: 3, v: 3,
    brandColor: "#1ABC9C", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "350ml", calories: 70, carbs: 18, sugar: 17, protein: 0, fat: 0, sodium: 55 }
  },

  // ── SHELF 4: Drinks & Sodas (slots 40–47) ──
  // Photo: 40✓ 41✓ 42✓ 43✓ 44✓ 45✓ 46✗(empty) 47✓
  {
    id: "40", name: "게토레이", price: 1000, category: "Drink", type: "can", shelf: 4, v: 3,
    brandColor: "#1DA0E0", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "600ml", calories: 150, carbs: 40, sugar: 34, protein: 0, fat: 0, sodium: 240 }
  },
  {
    id: "41", name: "게토레이", price: 1000, category: "Drink", type: "can", shelf: 4, v: 3,
    brandColor: "#1DA0E0", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "600ml", calories: 150, carbs: 40, sugar: 34, protein: 0, fat: 0, sodium: 240 }
  },
  {
    id: "42", name: "비타 500", price: 1000, category: "Drink", type: "can", shelf: 4, v: 3,
    brandColor: "#E8772A", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "100ml", calories: 50, carbs: 12, sugar: 12, protein: 0, fat: 0, sodium: 5 }
  },
  {
    id: "43", name: "비타 500", price: 1000, category: "Drink", type: "can", shelf: 4, v: 3,
    brandColor: "#E8772A", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "100ml", calories: 50, carbs: 12, sugar: 12, protein: 0, fat: 0, sodium: 5 }
  },
  {
    id: "44", name: "2%", price: 1000, category: "Drink", type: "can", shelf: 4, v: 3,
    brandColor: "#E8709A", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "500ml", calories: 100, carbs: 25, sugar: 23, protein: 0, fat: 0, sodium: 40 }
  },
  {
    id: "45", name: "2%", price: 1000, category: "Drink", type: "can", shelf: 4, v: 3,
    brandColor: "#E8709A", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "500ml", calories: 100, carbs: 25, sugar: 23, protein: 0, fat: 0, sodium: 40 }
  },
  {
    id: "46", name: "델몬트 망고", price: 800, category: "Drink", type: "can", shelf: 4, v: 3,
    brandColor: "#DAA520", accentColor: "#FFFFFF", inStock: false,
    nutrition: { servingSize: "240ml", calories: 130, carbs: 32, sugar: 30, protein: 0, fat: 0, sodium: 20 }
  },
  {
    id: "47", name: "델몬트 망고", price: 800, category: "Drink", type: "can", shelf: 4, v: 3,
    brandColor: "#DAA520", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "240ml", calories: 130, carbs: 32, sugar: 30, protein: 0, fat: 0, sodium: 20 }
  },

  // ── SHELF 5: Jellies & Drinks (slots 50–57) ──
  // Photo: 50✓ 51✓ 52✓ 53✓ 54✓ 55✗(empty) 56✗(empty) 57✓
  {
    id: "50", name: "콘닥켈리 사과", price: 1000, category: "Snack", type: "bag", shelf: 5, v: 3,
    brandColor: "#C0392B", accentColor: "#FF6B6B", inStock: true,
    nutrition: { servingSize: "108g", calories: 80, carbs: 20, sugar: 16, protein: 0, fat: 0, sodium: 5 }
  },
  {
    id: "51", name: "콘닥켈리 사과", price: 1000, category: "Snack", type: "bag", shelf: 5, v: 3,
    brandColor: "#C0392B", accentColor: "#FF6B6B", inStock: true,
    nutrition: { servingSize: "108g", calories: 80, carbs: 20, sugar: 16, protein: 0, fat: 0, sodium: 5 }
  },
  {
    id: "52", name: "콘닥켈리 청포도", price: 1800, category: "Snack", type: "bag", shelf: 5, v: 3,
    brandColor: "#27AE60", accentColor: "#A8E6C0", inStock: true,
    nutrition: { servingSize: "108g", calories: 80, carbs: 20, sugar: 16, protein: 0, fat: 0, sodium: 5 }
  },
  {
    id: "53", name: "포카리스웨트", price: 1000, category: "Drink", type: "bottle", shelf: 5, v: 3,
    brandColor: "#0054A6", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "340ml", calories: 82, carbs: 20, sugar: 18, protein: 0, fat: 0, sodium: 120 }
  },
  {
    id: "54", name: "포카리스웨트", price: 1200, category: "Drink", type: "bottle", shelf: 5, v: 3,
    brandColor: "#0054A6", accentColor: "#FFFFFF", inStock: true,
    nutrition: { servingSize: "340ml", calories: 82, carbs: 20, sugar: 18, protein: 0, fat: 0, sodium: 120 }
  },
  {
    id: "55", name: "파워에이드", price: 1200, category: "Drink", type: "bottle", shelf: 5, v: 3,
    brandColor: "#1C3FA8", accentColor: "#FFFFFF", inStock: false,
    nutrition: { servingSize: "600ml", calories: 160, carbs: 43, sugar: 38, protein: 0, fat: 0, sodium: 210 }
  },
  {
    id: "56", name: "파워에이드", price: 1000, category: "Drink", type: "bottle", shelf: 5, v: 3,
    brandColor: "#1C3FA8", accentColor: "#FFFFFF", inStock: false,
    nutrition: { servingSize: "600ml", calories: 160, carbs: 43, sugar: 38, protein: 0, fat: 0, sodium: 210 }
  },
  {
    id: "57", name: "몬스터 에너지", price: 1000, category: "Drink", type: "can", shelf: 5, v: 3,
    brandColor: "#1A1A1A", accentColor: "#6ABF00", inStock: true,
    nutrition: { servingSize: "355ml", calories: 160, carbs: 43, sugar: 27, protein: 0, fat: 0, sodium: 370 }
  },

  // ── SHELF 6: Snacks & Chips (slots 60–67) ──
  // Photo: all 8 slots stocked — 60-63 silver foil bags, 64-67 OP chip bags
  {
    id: "60", name: "고래밥", price: 800, category: "Snack", type: "bag", shelf: 6, v: 3,
    brandColor: "#D4710A", accentColor: "#F5C842", inStock: true,
    nutrition: { servingSize: "55g", calories: 245, carbs: 38, sugar: 3, protein: 5, fat: 8, sodium: 380 }
  },
  {
    id: "61", name: "고래밥", price: 800, category: "Snack", type: "bag", shelf: 6, v: 3,
    brandColor: "#D4710A", accentColor: "#F5C842", inStock: true,
    nutrition: { servingSize: "55g", calories: 245, carbs: 38, sugar: 3, protein: 5, fat: 8, sodium: 380 }
  },
  {
    id: "62", name: "고래밥", price: 800, category: "Snack", type: "bag", shelf: 6, v: 3,
    brandColor: "#D4710A", accentColor: "#F5C842", inStock: true,
    nutrition: { servingSize: "55g", calories: 245, carbs: 38, sugar: 3, protein: 5, fat: 8, sodium: 380 }
  },
  {
    id: "63", name: "고래밥", price: 800, category: "Snack", type: "bag", shelf: 6, v: 3,
    brandColor: "#D4710A", accentColor: "#F5C842", inStock: true,
    nutrition: { servingSize: "55g", calories: 245, carbs: 38, sugar: 3, protein: 5, fat: 8, sodium: 380 }
  },
  {
    id: "64", name: "치킨팝 치즈맛", price: 1200, category: "Snack", type: "bag", shelf: 6, v: 3,
    brandColor: "#C8820A", accentColor: "#FFD166", inStock: true,
    nutrition: { servingSize: "68g", calories: 355, carbs: 44, sugar: 2, protein: 6, fat: 16, sodium: 530 }
  },
  {
    id: "65", name: "치킨팝", price: 1200, category: "Snack", type: "bag", shelf: 6, v: 3,
    brandColor: "#E8832A", accentColor: "#FFBC42", inStock: true,
    nutrition: { servingSize: "68g", calories: 340, carbs: 45, sugar: 1, protein: 6, fat: 15, sodium: 520 }
  },
  {
    id: "66", name: "치킨팝", price: 1200, category: "Snack", type: "bag", shelf: 6, v: 3,
    brandColor: "#E8832A", accentColor: "#FFBC42", inStock: true,
    nutrition: { servingSize: "68g", calories: 340, carbs: 45, sugar: 1, protein: 6, fat: 15, sodium: 520 }
  },
  {
    id: "67", name: "치킨팝", price: 1200, category: "Snack", type: "bag", shelf: 6, v: 3,
    brandColor: "#E8832A", accentColor: "#FFBC42", inStock: true,
    nutrition: { servingSize: "68g", calories: 340, carbs: 45, sugar: 1, protein: 6, fat: 15, sodium: 520 }
  },
];
