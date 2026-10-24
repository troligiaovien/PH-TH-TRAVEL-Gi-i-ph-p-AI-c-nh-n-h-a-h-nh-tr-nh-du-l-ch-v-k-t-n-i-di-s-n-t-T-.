import { SuggestedItinerary } from '../types';

export const SUGGESTED_ITINERARIES: SuggestedItinerary[] = [
  {
    id: 've-nguon-va-tam-linh-tay-thien',
    title: 'Hành trình Về nguồn Đất Tổ & Chiêm bái Quốc Mẫu Tây Thiên',
    tagline: 'Chuyến hành hương 1 ngày trọn vẹn mạch nguồn Hùng Vương và Quốc Mẫu',
    duration: '1_day',
    durationLabel: '1 Ngày (Sáng đi - Chiều về)',
    theme: 'culture',
    themeLabel: 'Lịch sử & Tâm linh',
    suitableFor: 'Gia đình, đoàn trường học, học sinh - sinh viên và du khách hành hương',
    overview:
      'Chuyến đi kết nối hai trung tâm tâm linh cội nguồn quan trọng nhất của vùng Đất Tổ: Khu di tích Đền Hùng trên núi Nghĩa Lĩnh và Đền thờ Quốc Mẫu Tây Thiên Lăng Thị Tiêu (Chính Vương phi Hùng Chiêu Vương) cùng Thiền viện Trúc Lâm trên dãy Tam Đảo.',
    stops: [
      {
        destinationId: 'den-hung',
        order: 1,
        timeEstimate: '07:30 - 11:30',
        activityTitle: 'Dâng hương tưởng niệm các Vua Hùng & Tham quan Bảo tàng Hùng Vương',
        description:
          'Khởi hành từ Hà Nội theo cao tốc Nội Bài - Lào Cai (CT05) đến Đền Hùng. Dâng hương tuần tự từ Đền Hạ, Đền Trung lên Đền Thượng và Lăng Hùng Vương, chiêm bái Đền Giếng và khám phá Bảo tàng Hùng Vương.',
        recommendedTransport: 'Ô tô hoặc xe du lịch theo cao tốc CT05 (nút giao IC7)',
        preTripCheck: 'Nên mặc trang phục lịch sự và đi giày thể thao thoải mái để leo gần 500 bậc đá.'
      },
      {
        destinationId: 'tay-thien',
        order: 2,
        timeEstimate: '12:30 - 17:00',
        activityTitle: 'Ăn trưa, dâng hương Quốc Mẫu Tây Thiên & Chiêm bái Thiền viện Trúc Lâm',
        description:
          'Từ Đền Hùng qua cầu Việt Trì hoặc cầu Vĩnh Phú sang huyện Tam Đảo (khoảng 28km, 35 phút). Đi cáp treo lên Đền Thượng Tây Thiên chiêm bái Quốc Mẫu, sau đó vãng cảnh Thiền viện Trúc Lâm Tây Thiên tĩnh tại giữa rừng thông.',
        recommendedTransport: 'Ô tô di chuyển liên tỉnh qua tuyến QL2C hoặc ĐT310',
        preTripCheck: 'Có thể mua vé cáp treo khứ hồi để tiết kiệm thời gian hoặc đi bộ vãng cảnh suối Bát Nhã.'
      }
    ],
    estimatedPacing: 'Vừa phải, kết hợp leo bậc và đi cáp treo ngắm cảnh đại ngàn.',
    advisoryNote:
      'Vào dịp lễ hội đầu xuân (tháng Giêng đến tháng 3 Âm lịch), lượng du khách tại cả hai điểm rất đông, nên xuất phát sớm từ 6:00 sáng.'
  },
  {
    id: 'kham-pha-tam-dao-ho-dai-lai-2-ngay',
    title: 'Tam Đảo trong sương & Nghỉ dưỡng ven Hồ Đại Lải',
    tagline: 'Kỳ nghỉ 2 ngày 1 đêm hòa mình vào biển mây mát lành và mặt nước hồ thông reo',
    duration: '2_days_1_night',
    durationLabel: '2 Ngày 1 Đêm',
    theme: 'wellness',
    themeLabel: 'Nghỉ dưỡng & Khám phá',
    suitableFor: 'Nhóm bạn trẻ, gia đình, cặp đôi cần nghỉ ngơi tái tạo năng lượng',
    overview:
      'Trải nghiệm trọn vẹn vẻ đẹp thiên nhiên vùng núi Tam Đảo và vùng hồ nước sinh thái Đại Lải: Tận hưởng 4 mùa trong 1 ngày tại thị trấn mờ sương, check-in Nhà thờ đá, Cổng Trời, sau đó xuôi xuống dã ngoại chèo thuyền ven rừng thông Hồ Đại Lải.',
    stops: [
      {
        destinationId: 'tam-dao',
        order: 1,
        timeEstimate: 'Ngày 1: 07:30 - Tối',
        activityTitle: 'Chinh phục cung đèo Tam Đảo, check-in Nhà thờ đá & Săn hoàng hôn Cổng Trời',
        description:
          'Khởi hành từ Hà Nội lên thị trấn Tam Đảo (75km, 1h45p). Nhận phòng khách sạn, đi dạo Quảng trường trung tâm, check-in Nhà thờ đá cổ kính, ngắm thung lũng mây tại Cổng Trời và thưởng thức thịt nướng, ngọn su su xào tỏi tại chợ đêm.',
        recommendedTransport: 'Xe ô tô cá nhân hoặc xe khách du lịch chuyên tuyến',
        preTripCheck: 'Đường đèo có dốc quanh co và sương mù, lái xe cần đi số thấp và chú ý quan sát.'
      },
      {
        destinationId: 'ho-dai-lai',
        order: 2,
        timeEstimate: 'Ngày 2: 08:30 - 16:30',
        activityTitle: 'Xuống núi ghé Hồ Đại Lải, đi du thuyền Đảo Ngọc & Cắm trại ven rừng thông',
        description:
          'Rời Tam Đảo di chuyển xuống TP. Phúc Yên đến Hồ Đại Lải (khoảng 35km). Đi thuyền máy ra tham quan Đảo Ngọc, chèo thuyền kayak trên mặt hồ trong vắt, tản bộ ngắm công viên nghệ thuật điêu khắc trong rừng thông trước khi về Hà Nội.',
        recommendedTransport: 'Ô tô hoặc xe máy theo đường ĐT310 và ĐT302',
        preTripCheck: 'Luôn mặc áo phao cứu sinh an toàn khi tham gia thể thao mặt nước trên hồ.'
      }
    ],
    estimatedPacing: 'Thư thái, nghỉ dưỡng, ngắm cảnh và chụp ảnh check-in.',
    advisoryNote:
      'Nhiệt độ Tam Đảo ban đêm se lạnh quanh năm, quý khách nên chuẩn bị sẵn áo khoác gió mỏng.'
  },
  {
    id: 'san-may-long-coc-den-hung-2-ngay',
    title: 'Ốc đảo chè Long Cốc & Non thiêng Đền Hùng',
    tagline: 'Khám phá kỳ quan đồi chè bát úp Tây Bắc và cội nguồn dân tộc Việt Nam',
    duration: '2_days_1_night',
    durationLabel: '2 Ngày 1 Đêm',
    theme: 'nature',
    themeLabel: 'Thiên nhiên & Di sản',
    suitableFor: 'Người đam mê nhiếp ảnh, thích trải nghiệm cảnh sắc sinh thái và văn hóa Đất Tổ',
    overview:
      'Hành trình kết hợp tuyệt mỹ giữa cảnh quan thiên nhiên kỳ ảo và chiều sâu văn hóa lịch sử: Đón bình minh săn mây trên hàng trăm quả đồi chè bát úp bồng bềnh tại Long Cốc (Tân Sơn), sau đó trở về TP. Việt Trì dâng hương tưởng niệm các Vua Hùng.',
    stops: [
      {
        destinationId: 'doi-che-long-coc',
        order: 1,
        timeEstimate: 'Ngày 1: 06:00 - Chiều',
        activityTitle: 'Săn mây bình minh trên đồi chè bát úp, giao lưu văn hóa Mường bản địa',
        description:
          'Khởi hành từ Hà Nội theo QL32 lên huyện Tân Sơn. Chiêm ngưỡng toàn cảnh đồi chè bát úp Long Cốc ngút ngàn trong sương sớm, nhâm nhi chén chè thơm ấm, chụp ảnh trang phục dân tộc và nghỉ ngơi homestay sinh thái.',
        recommendedTransport: 'Xe ô tô gầm cao hoặc xe máy phượt theo QL32',
        preTripCheck: 'Thời điểm ngắm mây và ánh sáng đẹp nhất là từ 5:30 đến 7:30 sáng.'
      },
      {
        destinationId: 'den-hung',
        order: 2,
        timeEstimate: 'Ngày 2: 08:00 - 15:30',
        activityTitle: 'Di chuyển về TP. Việt Trì, dâng hương Đền Hùng & Thăm Bảo tàng Hùng Vương',
        description:
          'Từ Long Cốc di chuyển về TP. Việt Trì (khoảng 68km). Dâng hương tại núi Nghĩa Lĩnh, viếng Đền Hạ, Đền Trung, Đền Thượng, Đền Giếng và tìm hiểu cổ vật văn hóa Đông Sơn thời Hùng Vương dựng nước.',
        recommendedTransport: 'Ô tô hoặc xe cá nhân theo tuyến QL32 và QL32C',
        preTripCheck: 'Giữ gìn sự trang nghiêm nơi đền thờ và kiểm tra trang phục lịch sự.'
      }
    ],
    estimatedPacing: 'Cường độ di chuyển vừa phải, phong cảnh đa dạng từ đồi núi đến rừng cổ.',
    advisoryNote:
      'Đường lên đồi chè có một số đoạn đường đất dốc nhẹ, du khách nên đi giày thể thao có độ bám tốt.'
  },
  {
    id: 'cung-duong-tam-dao-tay-thien-dai-lai',
    title: 'Tam giác Thắng cảnh: Tây Thiên – Tam Đảo – Đại Lải',
    tagline: 'Hành trình trọn vẹn khám phá vùng danh thắng nổi tiếng dưới chân dãy Tam Đảo',
    duration: '2_days_1_night',
    durationLabel: '2 Ngày 1 Đêm',
    theme: 'nature',
    themeLabel: 'Thiên nhiên & Tâm linh',
    suitableFor: 'Gia đình, bạn trẻ, đoàn du lịch dã ngoại cuối tuần',
    overview:
      'Lộ trình liên kết 3 điểm đến kề cận trong khu vực Tam Đảo: Bắt đầu từ không gian linh thiêng Quốc Mẫu Tây Thiên, lên đỉnh núi tận hưởng khí hậu châu Âu mát lạnh tại thị trấn Tam Đảo, và kết thúc bằng buổi dã ngoại thư thái bên mặt nước Hồ Đại Lải.',
    stops: [
      {
        destinationId: 'tay-thien',
        order: 1,
        timeEstimate: 'Ngày 1: 07:30 - 12:30',
        activityTitle: 'Chiêm bái Đền Thượng Quốc Mẫu & Đại Bảo Tháp Mandala Tây Thiên',
        description:
          'Từ Hà Nội di chuyển 70km lên khu danh thắng Tây Thiên. Đi cáp treo lên đỉnh núi Thạch Bàn chiêm bái Đền Thượng, vãng cảnh Thiền viện Trúc Lâm và chiêm ngưỡng kiến trúc Đại Bảo Tháp Mandala.',
        recommendedTransport: 'Ô tô theo cao tốc Nội Bài - Lào Cai rẽ nút giao IC4',
        preTripCheck: 'Chuẩn bị mũ nón và trang phục trang nghiêm.'
      },
      {
        destinationId: 'tam-dao',
        order: 2,
        timeEstimate: 'Ngày 1 (chiều) & Sáng ngày 2',
        activityTitle: 'Lên thị trấn Tam Đảo, check-in Nhà thờ đá, Cổng Trời & Thác Bạc',
        description:
          'Di chuyển 15km đường đèo lên thị trấn Tam Đảo. Nhận phòng khách sạn, dạo bước qua Nhà thờ đá Gothic, đón hoàng hôn trên mây và thưởng thức ẩm thực vùng cao.',
        recommendedTransport: 'Ô tô hoặc xe số vượt đèo 13km lên thị trấn',
        preTripCheck: 'Đặt phòng trước vào dịp cuối tuần để có phòng view thung lũng đẹp.'
      },
      {
        destinationId: 'ho-dai-lai',
        order: 3,
        timeEstimate: 'Ngày 2: 13:30 - 17:00',
        activityTitle: 'Xuôi về Hồ Đại Lải, chèo kayak, dạo chơi rừng thông & Trở về Hà Nội',
        description:
          'Xuôi đèo sang hồ Đại Lải (35km), tận hưởng làn gió mát lành từ lòng hồ nước ngọt 525 ha, tham quan Đảo Ngọc và cắm trại thư giãn dưới tán thông.',
        recommendedTransport: 'Ô tô theo tuyến ĐT310 về TP. Phúc Yên',
        preTripCheck: 'Thời gian di chuyển từ Đại Lải về trung tâm Hà Nội chỉ khoảng 50 phút.'
      }
    ],
    estimatedPacing: 'Linh hoạt, phong phú trải nghiệm từ tâm linh, leo đèo đến thể thao mặt nước.',
    advisoryNote:
      'Tuyến đường kết nối giữa Tây Thiên, Tam Đảo và Đại Lải rất thuận tiện với mặt đường trải nhựa tốt.'
  }
];
