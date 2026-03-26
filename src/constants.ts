export interface Ore {
  id: string;
  name: string;
  formula: string;
  description: string;
  targetMetal: string;
  image: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  insight: string;
}

export const ORES: Ore[] = [
  {
    id: 'hematite',
    name: 'Quặng Hematit',
    formula: '$Fe_2O_3$',
    description: 'Quặng sắt quan trọng nhất, có màu đỏ nâu đặc trưng.',
    targetMetal: 'Sắt (Fe)',
    image: 'https://picsum.photos/seed/hematite/400/300'
  },
  {
    id: 'bauxite',
    name: 'Quặng Boxit',
    formula: '$Al_2O_3.nH_2O$',
    description: 'Nguồn nguyên liệu chính để sản xuất nhôm trên thế giới.',
    targetMetal: 'Nhôm (Al)',
    image: 'https://picsum.photos/seed/bauxite/400/300'
  },
  {
    id: 'chalcopyrite',
    name: 'Quặng Cancopirit',
    formula: '$CuFeS_2$',
    description: 'Quặng đồng phổ biến nhất, có ánh kim vàng như đồng thau.',
    targetMetal: 'Đồng (Cu)',
    image: 'https://picsum.photos/seed/copper/400/300'
  },
  {
    id: 'sphalerite',
    name: 'Quặng Sphalerit',
    formula: '$ZnS$',
    description: 'Quặng kẽm chính, thường chứa sắt thay thế kẽm trong cấu trúc.',
    targetMetal: 'Kẽm (Zn)',
    image: 'https://picsum.photos/seed/zinc/400/300'
  }
];

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Bản chất của quá trình điều chế kim loại là gì?",
    options: ["Oxi hóa nguyên tử kim loại thành ion", "Khử ion kim loại thành nguyên tử", "Oxi hóa ion kim loại thành nguyên tử", "Khử nguyên tử kim loại thành ion"],
    correctAnswer: 1,
    insight: "Điều chế kim loại là quá trình khử các ion kim loại trong hợp chất thành nguyên tử tự do: $M^{n+} + ne \\rightarrow M$."
  },
  {
    id: 2,
    text: "Phương pháp nào thường được dùng để điều chế các kim loại hoạt động mạnh như Na, Mg, Al?",
    options: ["Nhiệt luyện", "Thủy luyện", "Điện phân nóng chảy", "Điện phân dung dịch"],
    correctAnswer: 2,
    insight: "Các kim loại kiềm, kiềm thổ và nhôm có tính khử rất mạnh, không thể khử bằng C, CO hay H₂ ở nhiệt độ cao. Do đó, điện phân nóng chảy là phương pháp duy nhất khả thi."
  },
  {
    id: 3,
    text: "Trong phương pháp nhiệt luyện, chất nào sau đây thường KHÔNG được dùng làm chất khử?",
    options: ["CO", "H₂", "C", "O₂"],
    correctAnswer: 3,
    insight: "O₂ là chất oxi hóa, không phải chất khử. Trong nhiệt luyện, ta cần các chất khử như C, CO, H₂ hoặc các kim loại mạnh (như Al trong phản ứng nhiệt nhôm) để chiếm lấy oxi của oxit kim loại."
  },
  {
    id: 4,
    text: "Tại sao không dùng phương pháp nhiệt luyện để điều chế Al từ Al₂O₃?",
    options: ["Al₂O₃ quá đắt", "Al có tính khử mạnh hơn các chất khử thông thường", "Phản ứng tỏa quá nhiều nhiệt", "Al₂O₃ không nóng chảy"],
    correctAnswer: 1,
    insight: "Al là kim loại hoạt động mạnh. Các chất khử như CO hay C không đủ mạnh để khử được ion Al³⁺ trong Al₂O₃ ở điều kiện nhiệt luyện thông thường."
  },
  {
    id: 5,
    text: "Trong quá trình điện phân nhôm nóng chảy, vai trò của criolit (Na₃AlF₆) là gì?",
    options: ["Tăng nhiệt độ nóng chảy của Al₂O₃", "Hạ nhiệt độ nóng chảy của Al₂O₃ và tăng độ dẫn điện", "Làm chất xúc tác cho phản ứng", "Ngăn cản nhôm bị oxi hóa"],
    correctAnswer: 1,
    insight: "Criolit giúp hạ nhiệt độ nóng chảy của hỗn hợp từ khoảng 2050°C xuống 900°C, giúp tiết kiệm năng lượng và tạo hỗn hợp dẫn điện tốt hơn."
  },
  {
    id: 6,
    text: "Kim loại nào sau đây có thể được điều chế bằng phương pháp thủy luyện?",
    options: ["Na", "Mg", "Al", "Ag"],
    correctAnswer: 3,
    insight: "Thủy luyện thường dùng cho các kim loại có độ hoạt động hóa học yếu như Ag, Au, Cu... bằng cách dùng kim loại mạnh đẩy kim loại yếu ra khỏi dung dịch muối."
  },
  {
    id: 7,
    text: "Phản ứng nào sau đây là phản ứng nhiệt nhôm?",
    options: ["2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂", "2Al + 3CuO → Al₂O₃ + 3Cu", "4Al + 3O₂ → 2Al₂O₃", "2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂"],
    correctAnswer: 1,
    insight: "Phản ứng nhiệt nhôm là phản ứng dùng Al làm chất khử để khử các oxit kim loại (như Fe₂O₃, CuO, Cr₂O₃...) ở nhiệt độ cao."
  },
  {
    id: 8,
    text: "Ở catot (cực âm) trong bình điện phân nóng chảy NaCl, xảy ra quá trình gì?",
    options: ["Sự oxi hóa ion Na⁺", "Sự khử ion Na⁺", "Sự oxi hóa ion Cl⁻", "Sự khử ion Cl⁻"],
    correctAnswer: 1,
    insight: "Ở catot (cực âm) luôn xảy ra quá trình khử: $Na^+ + 1e \\rightarrow Na$."
  },
  {
    id: 9,
    text: "Phương pháp nhiệt luyện thường dùng để điều chế các kim loại đứng sau kim loại nào trong dãy hoạt động hóa học?",
    options: ["Mg", "Al", "Zn", "Fe"],
    correctAnswer: 1,
    insight: "Nhiệt luyện dùng để điều chế các kim loại có độ hoạt động trung bình và yếu, đứng sau Al trong dãy hoạt động hóa học."
  },
  {
    id: 10,
    text: "Thành phần chính của quặng hematit đỏ là gì?",
    options: ["Fe₃O₄", "FeS₂", "Fe₂O₃", "FeCO₃"],
    correctAnswer: 2,
    insight: "Quặng hematit đỏ chứa thành phần chính là $Fe_2O_3$ khan. Nếu có ngậm nước gọi là hematit nâu."
  },
  {
    id: 11,
    text: "Dãy kim loại nào sau đây đều có thể điều chế bằng phương pháp điện phân dung dịch?",
    options: ["Na, Mg, Al", "Cu, Ag, Au", "K, Ca, Ba", "Al, Fe, Zn"],
    correctAnswer: 1,
    insight: "Điện phân dung dịch dùng để điều chế các kim loại đứng sau Al trong dãy hoạt động hóa học."
  },
  {
    id: 12,
    text: "Trong công nghiệp, Magie được điều chế bằng cách nào?",
    options: ["Điện phân nóng chảy MgCl₂", "Nhiệt luyện MgO với CO", "Thủy luyện dùng Fe đẩy Mg", "Điện phân dung dịch MgCl₂"],
    correctAnswer: 0,
    insight: "Magie là kim loại hoạt động mạnh, được điều chế bằng phương pháp điện phân nóng chảy muối clorua của nó."
  },
  {
    id: 13,
    text: "Để thu được đồng tinh khiết từ dung dịch CuSO₄ bằng phương pháp thủy luyện, ta có thể dùng kim loại nào làm chất khử?",
    options: ["Ag", "Au", "Fe", "Hg"],
    correctAnswer: 2,
    insight: "Ta cần dùng kim loại đứng trước Cu trong dãy hoạt động (như Fe, Zn) để đẩy Cu ra khỏi dung dịch muối."
  },
  {
    id: 14,
    text: "Khí nào thoát ra ở anot (cực dương) khi điện phân nóng chảy NaCl?",
    options: ["H₂", "O₂", "Cl₂", "CO₂"],
    correctAnswer: 2,
    insight: "Ở anot xảy ra sự oxi hóa ion $Cl^-$: $2Cl^- \\rightarrow Cl_2 + 2e$."
  },
  {
    id: 15,
    text: "Kim loại nào sau đây có thể điều chế được bằng cả 3 phương pháp: nhiệt luyện, thủy luyện, điện phân?",
    options: ["Al", "Na", "Cu", "Ca"],
    correctAnswer: 2,
    insight: "Cu là kim loại có độ hoạt động yếu, có thể dùng nhiệt luyện (khử CuO), thủy luyện (Fe + CuSO₄) hoặc điện phân (dung dịch CuSO₄)."
  },
  {
    id: 16,
    text: "Quặng boxit là nguyên liệu chính để sản xuất kim loại nào?",
    options: ["Sắt", "Đồng", "Nhôm", "Kẽm"],
    correctAnswer: 2,
    insight: "Boxit ($Al_2O_3.nH_2O$) là nguồn nguyên liệu quan trọng nhất để sản xuất nhôm bằng phương pháp điện phân nóng chảy."
  },
  {
    id: 17,
    text: "Trong lò cao, khí nào đóng vai trò là chất khử chính để khử oxit sắt thành sắt?",
    options: ["CO₂", "CO", "H₂", "N₂"],
    correctAnswer: 1,
    insight: "Khí CO được tạo ra từ sự cháy không hoàn toàn của than cốc là chất khử chính trong quá trình luyện gang thép."
  },
  {
    id: 18,
    text: "Để tách vàng (Au) ra khỏi quặng, người ta thường dùng dung dịch NaCN vì vàng có khả năng tạo phức tan. Đây là ứng dụng của phương pháp nào?",
    options: ["Nhiệt luyện", "Thủy luyện", "Điện phân", "Vật lý"],
    correctAnswer: 1,
    insight: "Sử dụng dung dịch hóa chất để hòa tan kim loại sau đó thu hồi gọi là phương pháp thủy luyện."
  },
  {
    id: 19,
    text: "Khi điện phân dung dịch CuSO₄ với điện cực trơ, tại catot thu được chất gì?",
    options: ["H₂", "O₂", "Cu", "S"],
    correctAnswer: 2,
    insight: "Ion $Cu^{2+}$ có tính oxi hóa mạnh hơn nước nên bị khử tại catot tạo thành kim loại Cu bám vào điện cực."
  },
  {
    id: 20,
    text: "Kim loại nào sau đây có thể dùng để điều chế Cr từ Cr₂O₃ bằng phương pháp nhiệt luyện?",
    options: ["C", "CO", "Al", "Tất cả đều đúng"],
    correctAnswer: 3,
    insight: "Các chất khử như C, CO, H₂ hoặc Al đều có thể khử được oxit crom ở nhiệt độ cao."
  },
  {
    id: 21,
    text: "Dãy các kim loại được điều chế bằng phương pháp điện phân nóng chảy là:",
    options: ["K, Mg, Ca, Al", "Fe, W, Cu, Ag", "Al, Cu, Fe, Zn", "Ba, Ag, Au, Cu"],
    correctAnswer: 0,
    insight: "Các kim loại đứng trước và bao gồm Al trong dãy hoạt động hóa học bắt buộc phải dùng điện phân nóng chảy."
  },
  {
    id: 22,
    text: "Trong phương pháp thủy luyện, kim loại được dùng để đẩy kim loại khác ra khỏi dung dịch muối phải thỏa mãn điều kiện gì?",
    options: ["Đứng sau kim loại trong muối", "Đứng trước kim loại trong muối và không tan trong nước", "Là kim loại kiềm", "Có tính khử yếu hơn"],
    correctAnswer: 1,
    insight: "Kim loại làm chất khử phải đứng trước kim loại trong muối và không được phản ứng với nước (như Na, K, Ca, Ba) vì chúng sẽ phản ứng với nước trước."
  }
];

export const LAB_METALS = [
  { id: 'Na', name: 'Natri (Na)', method: 'electrolysis' },
  { id: 'Fe', name: 'Sắt (Fe)', method: 'pyro' },
  { id: 'Au', name: 'Vàng (Au)', method: 'hydro' },
  { id: 'Al', name: 'Nhôm (Al)', method: 'electrolysis' },
  { id: 'Cu', name: 'Đồng (Cu)', method: 'hydro' },
  { id: 'Zn', name: 'Kẽm (Zn)', method: 'pyro' },
];

export const EXAM_CATEGORIES = [
  "Chương 1: Este - Lipit",
  "Chương 2: Cacbohiđrat",
  "Chương 3: Amin, Amino Axit và Protein",
  "Chương 4: Polime và Vật liệu Polime",
  "Chương 5: Đại cương về Kim loại",
  "Chương 6: Kim loại Kiềm, Kiềm thổ, Nhôm",
  "Chương 7: Sắt và một số Kim loại quan trọng",
  "Chương 8: Phân biệt một số chất vô cơ"
];

export const THEMES = [
  { id: 'default', name: 'Mặc định (Tối)', from: 'from-slate-900', to: 'to-slate-900' },
  { id: 'professional_blue', name: 'Professional Blue', from: 'from-blue-900', to: 'to-slate-900' },
  { id: 'ocean_breeze', name: 'Ocean Breeze', from: 'from-cyan-900', to: 'to-blue-900' },
  { id: 'deep_space', name: 'Deep Space', from: 'from-indigo-950', to: 'to-purple-950' },
  { id: 'emerald_city', name: 'Emerald City', from: 'from-emerald-900', to: 'to-slate-900' },
  { id: 'calm-verdant', name: 'Calm Verdant', from: 'from-emerald-50', to: 'to-emerald-100' },
  { id: 'sunrise-glow', name: 'Sunrise Glow', from: 'from-orange-50', to: 'to-orange-100' },
  { id: 'cyber-neon', name: 'Cyber Neon', from: 'from-slate-950', to: 'to-slate-950' },
  { id: 'lavender-soft', name: 'Lavender Soft', from: 'from-purple-50', to: 'to-purple-100' },
  { id: 'midnight-forest', name: 'Midnight Forest', from: 'from-slate-900', to: 'to-slate-900' },
  { id: 'mint-fresh', name: 'Mint Fresh', from: 'from-teal-50', to: 'to-teal-100' },
  { id: 'crimson-night', name: 'Crimson Night', from: 'from-rose-950', to: 'to-rose-950' },
];

export const EFFECTS = [
  { id: 'none', name: 'Không có' },
  { id: 'snow', name: 'Tuyết rơi' },
  { id: 'cherry_blossoms', name: 'Hoa anh đào' },
  { id: 'fireflies', name: 'Đom đóm' },
  { id: 'electrons', name: 'Electrons' },
  { id: 'neural-network', name: 'Neural Network' },
  { id: 'fireworks', name: 'Pháo hoa' },
  { id: 'neutral-air', name: 'Neutral Air' },
  { id: 'math-symbols', name: 'Math Symbols' },
  { id: 'autumn-leaves', name: 'Lá thu' },
  { id: 'starry-sky', name: 'Bầu trời sao' },
  { id: 'classic', name: 'Cổ điển (Trắng)' },
  { id: 'bubbles', name: 'Kỹ thuật (Tech)' },
  { id: 'hearts', name: 'Trái tim' },
];
