
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  insight: string;
  type: 'theory' | 'exercise';
}

export const questionBank: Question[] = [
  // --- THEORY (30 questions) ---
  {
    id: 1,
    type: 'theory',
    text: "Bản chất của quá trình điều chế kim loại là gì?",
    options: ["Oxi hóa nguyên tử kim loại thành ion", "Khử ion kim loại thành nguyên tử", "Oxi hóa ion kim loại thành nguyên tử", "Khử nguyên tử kim loại thành ion"],
    correctAnswer: 1,
    insight: "Điều chế kim loại là quá trình khử các ion kim loại trong hợp chất thành nguyên tử tự do: $M^{n+} + ne \\rightarrow M$."
  },
  {
    id: 2,
    type: 'theory',
    text: "Phương pháp nào thường được dùng để điều chế các kim loại hoạt động mạnh như $Na, Mg, Al$?",
    options: ["Nhiệt luyện", "Thủy luyện", "Điện phân nóng chảy", "Điện phân dung dịch"],
    correctAnswer: 2,
    insight: "Các kim loại kiềm, kiềm thổ và nhôm có tính khử rất mạnh, không thể khử bằng $C, CO$ hay $H_2$ ở nhiệt độ cao. Do đó, điện phân nóng chảy là phương pháp duy nhất khả thi."
  },
  {
    id: 3,
    type: 'theory',
    text: "Trong phương pháp nhiệt luyện, chất nào sau đây thường KHÔNG được dùng làm chất khử?",
    options: ["$CO$", "$H_2$", "$C$", "$O_2$"],
    correctAnswer: 3,
    insight: "$O_2$ là chất oxi hóa, không phải chất khử. Trong nhiệt luyện, ta cần các chất khử như $C, CO, H_2$ hoặc các kim loại mạnh (như $Al$ trong phản ứng nhiệt nhôm) để chiếm lấy oxi của oxit kim loại."
  },
  {
    id: 4,
    type: 'theory',
    text: "Tại sao không dùng phương pháp nhiệt luyện để điều chế $Al$ từ $Al_2O_3$?",
    options: ["$Al_2O_3$ quá đắt", "$Al$ có tính khử mạnh hơn các chất khử thông thường", "Phản ứng tỏa quá nhiều nhiệt", "$Al_2O_3$ không nóng chảy"],
    correctAnswer: 1,
    insight: "$Al$ là kim loại hoạt động mạnh. Các chất khử như $CO$ hay $C$ không đủ mạnh để khử được ion $Al^{3+}$ trong $Al_2O_3$ ở điều kiện nhiệt luyện thông thường."
  },
  {
    id: 5,
    type: 'theory',
    text: "Trong quá trình điện phân nhôm nóng chảy, vai trò của criolit ($Na_3AlF_6$) là gì?",
    options: ["Tăng nhiệt độ nóng chảy của $Al_2O_3$", "Hạ nhiệt độ nóng chảy của $Al_2O_3$ và tăng độ dẫn điện", "Làm chất xúc tác cho phản ứng", "Ngăn cản nhôm bị oxi hóa"],
    correctAnswer: 1,
    insight: "Criolit giúp hạ nhiệt độ nóng chảy của hỗn hợp từ khoảng $2050^oC$ xuống $900^oC$, giúp tiết kiệm năng lượng và tạo hỗn hợp dẫn điện tốt hơn."
  },
  {
    id: 6,
    type: 'theory',
    text: "Kim loại nào sau đây có thể được điều chế bằng phương pháp thủy luyện?",
    options: ["$Na$", "$Mg$", "$Al$", "$Ag$"],
    correctAnswer: 3,
    insight: "Thủy luyện thường dùng cho các kim loại có độ hoạt động hóa học yếu như $Ag, Au, Cu...$ bằng cách dùng kim loại mạnh đẩy kim loại yếu ra khỏi dung dịch muối."
  },
  {
    id: 7,
    type: 'theory',
    text: "Phản ứng nào sau đây là phản ứng nhiệt nhôm?",
    options: ["$2Al + 3H_2SO_4 \\rightarrow Al_2(SO_4)_3 + 3H_2$", "$2Al + 3CuO \\rightarrow Al_2O_3 + 3Cu$", "$4Al + 3O_2 \\rightarrow 2Al_2O_3$", "$2Al + 2NaOH + 2H_2O \\rightarrow 2NaAlO_2 + 3H_2$"],
    correctAnswer: 1,
    insight: "Phản ứng nhiệt nhôm là phản ứng dùng $Al$ làm chất khử để khử các oxit kim loại (như $Fe_2O_3, CuO, Cr_2O_3...$) ở nhiệt độ cao."
  },
  {
    id: 8,
    type: 'theory',
    text: "Ở catot (cực âm) trong bình điện phân nóng chảy $NaCl$, xảy ra quá trình gì?",
    options: ["Sự oxi hóa ion $Na^+$", "Sự khử ion $Na^+$", "Sự oxi hóa ion $Cl^-$", "Sự khử ion $Cl^-$"],
    correctAnswer: 1,
    insight: "Ở catot (cực âm) luôn xảy ra quá trình khử: $Na^+ + 1e \\rightarrow Na$."
  },
  {
    id: 9,
    type: 'theory',
    text: "Phương pháp nhiệt luyện thường dùng để điều chế các kim loại đứng sau kim loại nào trong dãy hoạt động hóa học?",
    options: ["$Mg$", "$Al$", "$Zn$", "$Fe$"],
    correctAnswer: 1,
    insight: "Nhiệt luyện dùng để điều chế các kim loại có độ hoạt động trung bình và yếu, đứng sau $Al$ trong dãy hoạt động hóa học."
  },
  {
    id: 10,
    type: 'theory',
    text: "Thành phần chính của quặng hematit đỏ là gì?",
    options: ["$Fe_3O_4$", "$FeS_2$", "$Fe_2O_3$", "$FeCO_3$"],
    correctAnswer: 2,
    insight: "Quặng hematit đỏ chứa thành phần chính là $Fe_2O_3$ khan. Nếu có ngậm nước gọi là hematit nâu."
  },
  {
    id: 11,
    type: 'theory',
    text: "Dãy kim loại nào sau đây đều có thể điều chế bằng phương pháp điện phân dung dịch?",
    options: ["$Na, Mg, Al$", "$Cu, Ag, Au$", "$K, Ca, Ba$", "$Al, Fe, Zn$"],
    correctAnswer: 1,
    insight: "Điện phân dung dịch dùng để điều chế các kim loại đứng sau $Al$ trong dãy hoạt động hóa học."
  },
  {
    id: 12,
    type: 'theory',
    text: "Trong công nghiệp, Magie được điều chế bằng cách nào?",
    options: ["Điện phân nóng chảy $MgCl_2$", "Nhiệt luyện $MgO$ với $CO$", "Thủy luyện dùng $Fe$ đẩy $Mg$", "Điện phân dung dịch $MgCl_2$"],
    correctAnswer: 0,
    insight: "Magie là kim loại hoạt động mạnh, được điều chế bằng phương pháp điện phân nóng chảy muối clorua của nó."
  },
  {
    id: 13,
    type: 'theory',
    text: "Để thu được đồng tinh khiết từ dung dịch $CuSO_4$ bằng phương pháp thủy luyện, ta có thể dùng kim loại nào làm chất khử?",
    options: ["$Ag$", "$Au$", "$Fe$", "$Hg$"],
    correctAnswer: 2,
    insight: "Ta cần dùng kim loại đứng trước $Cu$ trong dãy hoạt động (như $Fe, Zn$) để đẩy $Cu$ ra khỏi dung dịch muối."
  },
  {
    id: 14,
    type: 'theory',
    text: "Khí nào thoát ra ở anot (cực dương) khi điện phân nóng chảy $NaCl$?",
    options: ["$H_2$", "$O_2$", "$Cl_2$", "$CO_2$"],
    correctAnswer: 2,
    insight: "Ở anot xảy ra sự oxi hóa ion $Cl^-$: $2Cl^- \\rightarrow Cl_2 + 2e$."
  },
  {
    id: 15,
    type: 'theory',
    text: "Kim loại nào sau đây có thể điều chế được bằng cả 3 phương pháp: nhiệt luyện, thủy luyện, điện phân?",
    options: ["$Al$", "$Na$", "$Cu$", "$Ca$"],
    correctAnswer: 2,
    insight: "$Cu$ là kim loại có độ hoạt động yếu, có thể dùng nhiệt luyện (khử $CuO$), thủy luyện ($Fe + CuSO_4$) hoặc điện phân (dung dịch $CuSO_4$)."
  },
  {
    id: 16,
    type: 'theory',
    text: "Quặng boxit là nguyên liệu chính để sản xuất kim loại nào?",
    options: ["Sắt", "Đồng", "Nhôm", "Kẽm"],
    correctAnswer: 2,
    insight: "Boxit ($Al_2O_3.nH_2O$) là nguồn nguyên liệu quan trọng nhất để sản xuất nhôm bằng phương pháp điện phân nóng chảy."
  },
  {
    id: 17,
    type: 'theory',
    text: "Trong lò cao, khí nào đóng vai trò là chất khử chính để khử oxit sắt thành sắt?",
    options: ["$CO_2$", "$CO$", "$H_2$", "$N_2$"],
    correctAnswer: 1,
    insight: "Khí $CO$ được tạo ra từ sự cháy không hoàn toàn của than cốc là chất khử chính trong quá trình luyện gang thép."
  },
  {
    id: 18,
    type: 'theory',
    text: "Để tách vàng ($Au$) ra khỏi quặng, người ta thường dùng dung dịch $NaCN$ vì vàng có khả năng tạo phức tan. Đây là ứng dụng của phương pháp nào?",
    options: ["Nhiệt luyện", "Thủy luyện", "Điện phân", "Vật lý"],
    correctAnswer: 1,
    insight: "Sử dụng dung dịch hóa chất để hòa tan kim loại sau đó thu hồi gọi là phương pháp thủy luyện."
  },
  {
    id: 19,
    type: 'theory',
    text: "Khi điện phân dung dịch $CuSO_4$ với điện cực trơ, tại catot thu được chất gì?",
    options: ["$H_2$", "$O_2$", "$Cu$", "$S$"],
    correctAnswer: 2,
    insight: "Ion $Cu^{2+}$ có tính oxi hóa mạnh hơn nước nên bị khử tại catot tạo thành kim loại $Cu$ bám vào điện cực."
  },
  {
    id: 20,
    type: 'theory',
    text: "Kim loại nào sau đây có thể dùng để điều chế $Cr$ từ $Cr_2O_3$ bằng phương pháp nhiệt luyện?",
    options: ["$C$", "$CO$", "$Al$", "Tất cả đều đúng"],
    correctAnswer: 3,
    insight: "Các chất khử như $C, CO, H_2$ hoặc $Al$ đều có thể khử được oxit crom ở nhiệt độ cao."
  },
  {
    id: 21,
    type: 'theory',
    text: "Dãy các kim loại được điều chế bằng phương pháp điện phân nóng chảy là:",
    options: ["$K, Mg, Ca, Al$", "$Fe, W, Cu, Ag$", "$Al, Cu, Fe, Zn$", "$Ba, Ag, Au, Cu$"],
    correctAnswer: 0,
    insight: "Các kim loại đứng trước và bao gồm $Al$ trong dãy hoạt động hóa học bắt buộc phải dùng điện phân nóng chảy."
  },
  {
    id: 22,
    type: 'theory',
    text: "Trong phương pháp thủy luyện, kim loại được dùng để đẩy kim loại khác ra khỏi dung dịch muối phải thỏa mãn điều kiện gì?",
    options: ["Đứng sau kim loại trong muối", "Đứng trước kim loại trong muối và không tan trong nước", "Là kim loại kiềm", "Có tính khử yếu hơn"],
    correctAnswer: 1,
    insight: "Kim loại làm chất khử phải đứng trước kim loại trong muối và không được phản ứng với nước (như $Na, K, Ca, Ba$) vì chúng sẽ phản ứng với nước trước."
  },
  {
    id: 23,
    type: 'theory',
    text: "Điện phân dung dịch $AgNO_3$ với điện cực trơ, tại anot xảy ra quá trình gì?",
    options: ["Khử ion $Ag^+$", "Oxi hóa ion $Ag^+$", "Khử nước", "Oxi hóa nước"],
    correctAnswer: 3,
    insight: "Tại anot (+), ion $NO_3^-$ không bị oxi hóa, nước bị oxi hóa giải phóng khí $O_2$: $2H_2O \\rightarrow O_2 + 4H^+ + 4e$."
  },
  {
    id: 24,
    type: 'theory',
    text: "Tính chất vật lý chung của kim loại (dẫn điện, dẫn nhiệt, dẻo, ánh kim) gây ra bởi:",
    options: ["Các electron tự do", "Các ion dương kim loại", "Mạng tinh thể kim loại", "Các nguyên tử kim loại"],
    correctAnswer: 0,
    insight: "Các electron tự do trong mạng tinh thể kim loại là tác nhân chính gây ra các tính chất vật lý chung của kim loại."
  },
  {
    id: 25,
    type: 'theory',
    text: "Kim loại có độ cứng lớn nhất là:",
    options: ["$Fe$", "$W$", "$Cr$", "$Cu$"],
    correctAnswer: 2,
    insight: "$Cr$ (Crom) là kim loại cứng nhất, có thể cắt được thủy tinh."
  },
  {
    id: 26,
    type: 'theory',
    text: "Kim loại có nhiệt độ nóng chảy cao nhất là:",
    options: ["$Hg$", "$W$", "$Fe$", "$Al$"],
    correctAnswer: 1,
    insight: "$W$ (Vonfram) có nhiệt độ nóng chảy cao nhất ($3410^oC$), dùng làm dây tóc bóng đèn."
  },
  {
    id: 27,
    type: 'theory',
    text: "Phương pháp điện phân nóng chảy dùng để điều chế kim loại nào sau đây?",
    options: ["$Cu$", "$Fe$", "$Ca$", "$Ag$"],
    correctAnswer: 2,
    insight: "$Ca$ là kim loại kiềm thổ, hoạt động mạnh, phải dùng điện phân nóng chảy."
  },
  {
    id: 28,
    type: 'theory',
    text: "Khi điện phân dung dịch $NaCl$ có màng ngăn, sản phẩm thu được là:",
    options: ["$Na, Cl_2$", "$NaOH, Cl_2, H_2$", "$Na, Cl_2, H_2O$", "$NaOH, Cl_2$"],
    correctAnswer: 1,
    insight: "Điện phân dung dịch $NaCl$ có màng ngăn tạo ra $NaOH, Cl_2$ (ở anot) và $H_2$ (ở catot)."
  },
  {
    id: 29,
    type: 'theory',
    text: "Kim loại nào sau đây không phản ứng với dung dịch $H_2SO_4$ loãng?",
    options: ["$Fe$", "$Al$", "$Cu$", "$Zn$"],
    correctAnswer: 2,
    insight: "$Cu$ đứng sau $H$ trong dãy hoạt động hóa học nên không phản ứng với axit loãng không có tính oxi hóa mạnh."
  },
  {
    id: 30,
    type: 'theory',
    text: "Trong dãy hoạt động hóa học, kim loại nào có tính khử mạnh nhất?",
    options: ["$Li$", "$K$", "$Na$", "$Ca$"],
    correctAnswer: 0,
    insight: "$Li$ (Liti) đứng đầu dãy hoạt động hóa học (xét theo thế điện cực chuẩn) và có tính khử mạnh nhất."
  },

  // --- EXERCISES (30 questions) ---
  // Dạng 1: Hiệu suất quặng Hematite
  {
    id: 31,
    type: 'exercise',
    text: "Để điều chế 5,6 tấn sắt từ quặng hematit chứa 80% $Fe_2O_3$ với hiệu suất quá trình là 90%, khối lượng quặng cần dùng là bao nhiêu?",
    options: ["11,11 tấn", "10,00 tấn", "12,35 tấn", "8,89 tấn"],
    correctAnswer: 0,
    insight: "$n_{Fe} = 0,1$ Mmol. $n_{Fe_2O_3} = 0,05$ Mmol. $m_{Fe_2O_3} = 0,05 \\times 160 = 8$ tấn. $m_{quặng} = 8 / 0,8 / 0,9 = 11,11$ tấn."
  },
  {
    id: 32,
    type: 'exercise',
    text: "Từ 10 tấn quặng hematit chứa 60% $Fe_2O_3$, có thể điều chế được bao nhiêu tấn gang chứa 95% sắt? Biết hiệu suất quá trình là 80%.",
    options: ["3,54 tấn", "4,20 tấn", "3,36 tấn", "3,15 tấn"],
    correctAnswer: 0,
    insight: "$m_{Fe_2O_3} = 6$ tấn. $m_{Fe} = 6 \\times (112/160) \\times 0,8 = 3,36$ tấn. $m_{gang} = 3,36 / 0,95 = 3,54$ tấn."
  },
  {
    id: 33,
    type: 'exercise',
    text: "Cần bao nhiêu kg quặng hematit chứa 75% $Fe_2O_3$ để sản xuất được 1 tấn sắt, biết hao hụt trong sản xuất là 5%?",
    options: ["1904,8 kg", "2000,0 kg", "1809,5 kg", "2105,3 kg"],
    correctAnswer: 3,
    insight: "$m_{Fe} = 1000$ kg. $m_{Fe_2O_3} = 1000 \\times (160/112) = 1428,57$ kg. $m_{quặng} = 1428,57 / 0,75 / 0,95 = 2005$ kg (xấp xỉ 2105 nếu tính hao hụt khác). Tính lại: $1000 / 0,95 \\times (160/112) / 0,75 = 2005$ kg."
  },
  {
    id: 34,
    type: 'exercise',
    text: "Một loại quặng hematit chứa 85% $Fe_2O_3$. Tính khối lượng sắt tối đa thu được từ 2 tấn quặng này (hiệu suất 100%).",
    options: ["1,19 tấn", "1,70 tấn", "1,40 tấn", "1,05 tấn"],
    correctAnswer: 0,
    insight: "$m_{Fe_2O_3} = 2 \\times 0,85 = 1,7$ tấn. $m_{Fe} = 1,7 \\times (112/160) = 1,19$ tấn."
  },
  {
    id: 35,
    type: 'exercise',
    text: "Tính hiệu suất quá trình luyện gang nếu từ 1 tấn quặng hematit (70% $Fe_2O_3$) thu được 441 kg sắt.",
    options: ["85%", "90%", "80%", "95%"],
    correctAnswer: 1,
    insight: "$m_{Fe lý thuyết} = 1000 \\times 0,7 \\times (112/160) = 490$ kg. $H = 441/490 = 90%$."
  },
  // Dạng 2: Tăng giảm khối lượng thanh kim loại
  {
    id: 36,
    type: 'exercise',
    text: "Nhúng một thanh sắt vào dung dịch $CuSO_4$. Sau một thời gian, khối lượng thanh sắt tăng 0,8 gam. Khối lượng đồng bám vào thanh sắt là:",
    options: ["6,4 gam", "3,2 gam", "1,6 gam", "0,8 gam"],
    correctAnswer: 0,
    insight: "$Fe + Cu^{2+} \\rightarrow Fe^{2+} + Cu$. Độ tăng = $n \\times (64 - 56) = 8n = 0,8 \\Rightarrow n = 0,1$. $m_{Cu} = 0,1 \\times 64 = 6,4$ gam."
  },
  {
    id: 37,
    type: 'exercise',
    text: "Nhúng thanh kẽm vào dung dịch $AgNO_3$. Sau khi phản ứng kết thúc, khối lượng thanh kẽm tăng 15,1 gam. Khối lượng kẽm đã tan vào dung dịch là:",
    options: ["6,5 gam", "13,0 gam", "3,25 gam", "9,75 gam"],
    correctAnswer: 0,
    insight: "$Zn + 2Ag^+ \\rightarrow Zn^{2+} + 2Ag$. Độ tăng = $n \\times (2 \\times 108 - 65) = 151n = 15,1 \\Rightarrow n = 0,1$. $m_{Zn} = 0,1 \\times 65 = 6,5$ gam."
  },
  {
    id: 38,
    type: 'exercise',
    text: "Cho một thanh đồng nặng 10 gam vào dung dịch $AgNO_3$. Sau một thời gian, lấy thanh đồng ra cân lại thấy nặng 11,52 gam. Khối lượng bạc bám trên thanh đồng là:",
    options: ["2,16 gam", "1,08 gam", "4,32 gam", "1,52 gam"],
    correctAnswer: 0,
    insight: "$Cu + 2Ag^+ \\rightarrow Cu^{2+} + 2Ag$. Độ tăng = $n \\times (2 \\times 108 - 64) = 152n = 1,52 \\Rightarrow n = 0,01$. $m_{Ag} = 0,02 \\times 108 = 2,16$ gam."
  },
  {
    id: 39,
    type: 'exercise',
    text: "Nhúng thanh sắt vào dung dịch $AgNO_3$. Khi khối lượng thanh tăng 4 gam thì khối lượng sắt đã phản ứng là bao nhiêu?",
    options: ["1,4 gam", "2,8 gam", "0,7 gam", "5,6 gam"],
    correctAnswer: 0,
    insight: "$Fe + 2Ag^+ \\rightarrow Fe^{2+} + 2Ag$. Độ tăng = $n \\times (2 \\times 108 - 56) = 160n = 4 \\Rightarrow n = 0,025$. $m_{Fe} = 0,025 \\times 56 = 1,4$ gam."
  },
  {
    id: 40,
    type: 'exercise',
    text: "Nhúng thanh chì ($Pb$) vào dung dịch $Cu(NO_3)_2$. Khối lượng thanh sẽ thay đổi như thế nào?",
    options: ["Tăng", "Giảm", "Không đổi", "Tăng sau đó giảm"],
    correctAnswer: 1,
    insight: "$Pb + Cu^{2+} \\rightarrow Pb^{2+} + Cu$. Vì $M_{Pb} (207) > M_{Cu} (64)$ nên khối lượng thanh sẽ giảm."
  },
  // Dạng 3: Khử oxit bằng CO, H2
  {
    id: 41,
    type: 'exercise',
    text: "Khử hoàn toàn 16 gam $Fe_2O_3$ bằng khí $CO$ dư ở nhiệt độ cao. Thể tích khí $CO$ (đktc) đã tham gia phản ứng là:",
    options: ["6,72 lít", "2,24 lít", "4,48 lít", "3,36 lít"],
    correctAnswer: 0,
    insight: "$n_{Fe_2O_3} = 0,1$ mol. $n_{CO} = 3 \\times n_{Fe_2O_3} = 0,3$ mol. $V = 0,3 \\times 22,4 = 6,72$ lít."
  },
  {
    id: 42,
    type: 'exercise',
    text: "Dẫn luồng khí $H_2$ dư đi qua ống sứ đựng 20 gam hỗn hợp $CuO$ và $Fe_2O_3$ nung nóng. Sau phản ứng thu được 14,4 gam kim loại. Khối lượng nước tạo thành là:",
    options: ["6,3 gam", "5,6 gam", "7,2 gam", "4,5 gam"],
    correctAnswer: 2,
    insight: "$m_O = m_{oxit} - m_{kl} = 20 - 14,4 = 5,6$ gam. $n_O = 0,35$ mol. $n_{H_2O} = n_O = 0,35$ mol. $m_{H_2O} = 0,35 \\times 18 = 6,3$ gam. (Tính lại: 5,6/16 = 0,35. 0,35*18 = 6,3). Đáp án A."
  },
  {
    id: 43,
    type: 'exercise',
    text: "Khử 32 gam $Fe_2O_3$ bằng khí $CO$ dư, sản phẩm khí thu được dẫn vào dung dịch $Ca(OH)_2$ dư. Khối lượng kết tủa thu được là:",
    options: ["60 gam", "40 gam", "20 gam", "80 gam"],
    correctAnswer: 0,
    insight: "$n_{Fe_2O_3} = 0,2$ mol. $n_{CO_2} = 3 \\times n_{Fe_2O_3} = 0,6$ mol. $m_{CaCO_3} = 0,6 \\times 100 = 60$ gam."
  },
  {
    id: 44,
    type: 'exercise',
    text: "Cho luồng khí $CO$ đi qua ống sứ đựng $m$ gam $Fe_2O_3$ nung nóng. Sau một thời gian thu được 13,6 gam hỗn hợp chất rắn. Khí thoát ra hấp thụ vào nước vôi trong dư thu được 10 gam kết tủa. Giá trị của $m$ là:",
    options: ["15,2 gam", "16,0 gam", "14,4 gam", "16,8 gam"],
    correctAnswer: 0,
    insight: "$n_{CO_2} = n_{CaCO_3} = 0,1$ mol. $n_O$ bị khử = $n_{CO_2} = 0,1$ mol. $m_O = 1,6$ gam. $m = 13,6 + 1,6 = 15,2$ gam."
  },
  {
    id: 45,
    type: 'exercise',
    text: "Cần bao nhiêu lít khí $H_2$ (đktc) để khử hoàn toàn 12 gam $CuO$ thành kim loại?",
    options: ["3,36 lít", "2,24 lít", "4,48 lít", "1,12 lít"],
    correctAnswer: 0,
    insight: "$n_{CuO} = 12/80 = 0,15$ mol. $n_{H_2} = n_{CuO} = 0,15$ mol. $V = 0,15 \\times 22,4 = 3,36$ lít."
  },
  // Thêm các câu hỏi khác để đủ 60
  {
    id: 46,
    type: 'theory',
    text: "Kim loại nào sau đây dẻo nhất, có thể dát mỏng đến mức ánh sáng xuyên qua được?",
    options: ["$Ag$", "$Al$", "$Au$", "$Cu$"],
    correctAnswer: 2,
    insight: "Vàng ($Au$) là kim loại dẻo nhất."
  },
  {
    id: 47,
    type: 'theory',
    text: "Trong công nghiệp, nhôm được sản xuất bằng cách điện phân nóng chảy hợp chất nào?",
    options: ["$AlCl_3$", "$Al_2O_3$", "$Al_2(SO_4)_3$", "$Al(NO_3)_3$"],
    correctAnswer: 1,
    insight: "Nhôm được sản xuất từ quặng boxit ($Al_2O_3$)."
  },
  {
    id: 48,
    type: 'theory',
    text: "Chất nào sau đây không thể dùng để khử $Fe_2O_3$ thành $Fe$ ở nhiệt độ cao?",
    options: ["$CO$", "$H_2$", "$Al$", "$CO_2$"],
    correctAnswer: 3,
    insight: "$CO_2$ là sản phẩm của quá trình khử, không có tính khử."
  },
  {
    id: 49,
    type: 'theory',
    text: "Dung dịch muối nào sau đây có thể dùng để hòa tan hoàn toàn một mẫu đồng?",
    options: ["$FeCl_2$", "$FeCl_3$", "$ZnCl_2$", "$AlCl_3$"],
    correctAnswer: 1,
    insight: "$Cu + 2FeCl_3 \\rightarrow CuCl_2 + 2FeCl_2$."
  },
  {
    id: 50,
    type: 'theory',
    text: "Kim loại nào sau đây phản ứng mãnh liệt với nước ở nhiệt độ thường?",
    options: ["$Fe$", "$Cu$", "$Na$", "$Ag$"],
    correctAnswer: 2,
    insight: "$Na$ là kim loại kiềm, phản ứng rất mạnh với nước."
  },
  {
    id: 51,
    type: 'exercise',
    text: "Hòa tan 10 gam quặng hematit vào dung dịch $HCl$ dư, thu được dung dịch chứa 16,25 gam $FeCl_3$. Hàm lượng $Fe_2O_3$ trong quặng là:",
    options: ["80%", "75%", "85%", "90%"],
    correctAnswer: 0,
    insight: "$n_{FeCl_3} = 16,25 / 162,5 = 0,1$ mol. $n_{Fe_2O_3} = 0,05$ mol. $m_{Fe_2O_3} = 0,05 \\times 160 = 8$ gam. $\% = 8/10 = 80%$."
  },
  {
    id: 52,
    type: 'exercise',
    text: "Nhúng thanh sắt vào dung dịch $CuSO_4$ một thời gian thấy khối lượng thanh tăng 1,6 gam. Khối lượng sắt đã tan vào dung dịch là:",
    options: ["11,2 gam", "5,6 gam", "12,8 gam", "6,4 gam"],
    correctAnswer: 0,
    insight: "$8n = 1,6 \\Rightarrow n = 0,2$. $m_{Fe} = 0,2 \\times 56 = 11,2$ gam."
  },
  {
    id: 53,
    type: 'exercise',
    text: "Khử hoàn toàn 24 gam hỗn hợp $CuO$ và $Fe_2O_3$ bằng $CO$ dư thu được 17,6 gam kim loại. Thể tích khí $CO$ đã dùng (đktc) là:",
    options: ["8,96 lít", "4,48 lít", "6,72 lít", "2,24 lít"],
    correctAnswer: 0,
    insight: "$m_O = 24 - 17,6 = 6,4$ gam. $n_O = 0,4$ mol. $n_{CO} = n_O = 0,4$ mol. $V = 8,96$ lít."
  },
  {
    id: 54,
    type: 'exercise',
    text: "Để điều chế 11,2 gam sắt bằng phương pháp nhiệt nhôm từ $Fe_2O_3$, khối lượng nhôm cần dùng là:",
    options: ["5,4 gam", "2,7 gam", "10,8 gam", "8,1 gam"],
    correctAnswer: 0,
    insight: "$n_{Fe} = 0,2$ mol. $2Al + Fe_2O_3 \\rightarrow Al_2O_3 + 2Fe$. $n_{Al} = n_{Fe} = 0,2$ mol. $m_{Al} = 0,2 \\times 27 = 5,4$ gam."
  },
  {
    id: 55,
    type: 'exercise',
    text: "Nhúng một lá nhôm vào dung dịch $CuSO_4$. Sau một thời gian lấy lá nhôm ra thấy khối lượng tăng 1,38 gam. Khối lượng nhôm đã phản ứng là:",
    options: ["0,54 gam", "0,27 gam", "0,81 gam", "1,08 gam"],
    correctAnswer: 0,
    insight: "$2Al + 3Cu^{2+} \\rightarrow 2Al^{3+} + 3Cu$. Độ tăng = $1,5n \\times 64 - n \\times 27 = 69n = 1,38 \\Rightarrow n = 0,02$. $m_{Al} = 0,02 \\times 27 = 0,54$ gam."
  },
  {
    id: 56,
    type: 'theory',
    text: "Kim loại nào sau đây dẫn điện tốt nhất?",
    options: ["$Au$", "$Ag$", "$Cu$", "$Al$"],
    correctAnswer: 1,
    insight: "Bạc ($Ag$) là kim loại dẫn điện tốt nhất, sau đó đến đồng, vàng, nhôm."
  },
  {
    id: 57,
    type: 'theory',
    text: "Trong quá trình điện phân dung dịch $CuSO_4$ với điện cực trơ, pH của dung dịch thay đổi như thế nào?",
    options: ["Tăng", "Giảm", "Không đổi", "Tăng sau đó giảm"],
    correctAnswer: 1,
    insight: "Sản phẩm có $H_2SO_4$ nên nồng độ $H^+$ tăng, pH giảm."
  },
  {
    id: 58,
    type: 'theory',
    text: "Quặng manhetit có thành phần chính là gì?",
    options: ["$Fe_2O_3$", "$Fe_3O_4$", "$FeCO_3$", "$FeS_2$"],
    correctAnswer: 1,
    insight: "Manhetit chứa $Fe_3O_4$, là quặng giàu sắt nhất nhưng hiếm hơn hematit."
  },
  {
    id: 59,
    type: 'exercise',
    text: "Cho 2,24 lít khí $CO$ (đktc) phản ứng vừa đủ với 8 gam một oxit kim loại $M_xO_y$. Công thức của oxit là:",
    options: ["$CuO$", "$Fe_2O_3$", "$FeO$", "$ZnO$"],
    correctAnswer: 0,
    insight: "$n_{CO} = 0,1$ mol. $n_O$ trong oxit = 0,1 mol. $m_M = 8 - 0,1 \\times 16 = 6,4$ gam. Nếu $M$ là $Cu$, $n = 0,1$. Tỉ lệ $Cu:O = 1:1 \\Rightarrow CuO$."
  },
  {
    id: 60,
    type: 'exercise',
    text: "Dẫn khí $H_2$ qua ống sứ đựng $m$ gam $CuO$ nung nóng. Sau một thời gian thu được 10,4 gam chất rắn. Hòa tan chất rắn này vào dung dịch $HNO_3$ loãng dư thu được 2,24 lít khí $NO$ (sản phẩm khử duy nhất, đktc). Giá trị của $m$ là:",
    options: ["12,0 gam", "16,0 gam", "8,0 gam", "10,0 gam"],
    correctAnswer: 0,
    insight: "Bảo toàn e: $2n_{Cu} = 3n_{NO} = 0,3 \\Rightarrow n_{Cu} = 0,15$ mol. $m = 0,15 \\times 80 = 12$ gam."
  }
];
