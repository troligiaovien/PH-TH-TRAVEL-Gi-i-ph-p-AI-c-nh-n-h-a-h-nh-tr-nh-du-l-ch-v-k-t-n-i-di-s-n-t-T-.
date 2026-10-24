/**
 * Verified Tourism Data and Geo-Routing Knowledge Base for Phú Thọ
 * Used by the AI Travel Planner to guarantee realistic, factual itineraries.
 */

export interface VerifiedLocationKnowledge {
  id: string;
  name: string;
  category: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  openHours: string;
  ticketPriceVND: number | 'free';
  ticketNote: string;
  recommendedDurationMinutes: number;
  physicalDemand: 'light' | 'moderate' | 'strenuous';
  suitableForKids: boolean;
  suitableForSeniors: boolean;
  bestTimeOfDay: string;
  officialSource: string;
  verifiedHighlights: string[];
  diningNearby: {
    name: string;
    specialty: string;
    priceRangeVND: string;
    address: string;
    verified: boolean;
  }[];
  lodgingNearby: {
    name: string;
    type: 'resort' | 'hotel' | 'homestay';
    priceRangeVND: string;
    address: string;
    verified: boolean;
  }[];
}

export const VERIFIED_LOCATIONS: VerifiedLocationKnowledge[] = [
  {
    id: 'den-hung',
    name: 'Khu Di tích Lịch sử Đền Hùng',
    category: 'Lịch sử & Tâm linh',
    district: 'TP. Việt Trì',
    address: 'Thôn Cổ Tích, xã Hy Cương, TP. Việt Trì, Phú Thọ',
    lat: 21.3644,
    lng: 105.3283,
    openHours: '06:00 - 18:00 hàng ngày',
    ticketPriceVND: 'free',
    ticketNote: 'Miễn phí vé vào cổng khu di tích. Vé tham quan Bảo tàng Hùng Vương: 15.000 VNĐ/người. Vé xe điện di chuyển nội khu: 20.000 - 50.000 VNĐ/lượt.',
    recommendedDurationMinutes: 180,
    physicalDemand: 'moderate',
    suitableForKids: true,
    suitableForSeniors: true,
    bestTimeOfDay: '07:00 - 10:30 (sáng sớm mát mẻ, tránh nắng gắt leo bậc đá)',
    officialSource: 'Ban Quản lý Khu Di tích Lịch sử Quốc gia đặc biệt Đền Hùng',
    verifiedHighlights: [
      'Đền Hạ, Đền Trung, Đền Thượng và Lăng Hùng Vương trên đỉnh núi Nghĩa Lĩnh',
      'Đền Giếng dưới chân núi rợp bóng cây cổ thụ hàng trăm năm tuổi',
      'Đền thờ Quốc Tổ Lạc Long Quân và Đền Mẫu Âu Cơ',
      'Bảo tàng Hùng Vương lưu giữ hiện vật thời đại đồ đồng Đông Sơn'
    ],
    diningNearby: [
      {
        name: 'Nhà hàng Cá lăng Việt Trì (Đoạn Cầu Việt Trì - Bạch Hạc)',
        specialty: 'Cá lăng sông Đà nướng than hoa, lòng cá lăng xào dưa, lẩu cá lăng măng chua',
        priceRangeVND: '180.000 - 300.000 VNĐ/người',
        address: 'Đường Lạc Long Quân, P. Bạch Hạc, TP. Việt Trì',
        verified: true
      },
      {
        name: 'Nhà hàng Cọ Xanh / Đền Hùng Quán',
        specialty: 'Cơm lam, gà đồi hấp lá chanh, thịt chua Thanh Sơn ăn kèm lá sung',
        priceRangeVND: '120.000 - 200.000 VNĐ/người',
        address: 'Khu vực cổng vào Khu Di tích Đền Hùng',
        verified: true
      }
    ],
    lodgingNearby: [
      {
        name: 'Khách sạn Mường Thanh Luxury Phú Thọ (5 sao)',
        type: 'hotel',
        priceRangeVND: '950.000 - 1.600.000 VNĐ/đêm',
        address: 'Lô CC17, Quảng trường Hùng Vương, P. Gia Cẩm, TP. Việt Trì (cách Đền Hùng 8km)',
        verified: true
      },
      {
        name: 'Khách sạn Sài Gòn - Phú Thọ (4 sao)',
        type: 'hotel',
        priceRangeVND: '700.000 - 1.200.000 VNĐ/đêm',
        address: 'Số 17A Trần Phú, P. Gia Cẩm, TP. Việt Trì',
        verified: true
      }
    ]
  },
  {
    id: 'doi-che-long-coc',
    name: 'Đồi chè Long Cốc',
    category: 'Thiên nhiên & Sinh thái',
    district: 'Huyện Tân Sơn',
    address: 'Xã Long Cốc, huyện Tân Sơn, tỉnh Phú Thọ',
    lat: 21.1965,
    lng: 105.0872,
    openHours: 'Mở cửa tự do cả ngày',
    ticketPriceVND: 'free',
    ticketNote: 'Miễn phí tham quan ngắm cảnh. Phí thuê trang phục dân tộc Mường/Dao chụp ảnh: 30.000 - 50.000 VNĐ/bộ.',
    recommendedDurationMinutes: 120,
    physicalDemand: 'light',
    suitableForKids: true,
    suitableForSeniors: true,
    bestTimeOfDay: '05:30 - 07:30 (săn biển mây bồng bềnh và đón bình minh), 16:30 - 17:45 (hoàng hôn rực rỡ)',
    officialSource: 'UBND Huyện Tân Sơn & Trung tâm Xúc tiến Du lịch Phú Thọ',
    verifiedHighlights: [
      'Quần thể hàng trăm ốc đảo chè hình bát úp nhấp nhô tuyệt mỹ',
      'Điểm săn mây và chụp ảnh bình minh đẹp bậc nhất miền Bắc',
      'Trải nghiệm văn hóa trà Shan tuyết và chè búp tím bản địa',
      'Đường bê tông nông thôn mới uốn lượn dễ dàng di chuyển bằng ô tô và xe máy'
    ],
    diningNearby: [
      {
        name: 'Ẩm thực Nhà sàn Homestay Long Cốc',
        specialty: 'Xôi ngũ sắc, gà đồi nướng than, cá suối chiên giòn, măng đắng xào nấm',
        priceRangeVND: '120.000 - 180.000 VNĐ/người',
        address: 'Xóm Măng 1, xã Long Cốc, Tân Sơn',
        verified: true
      }
    ],
    lodgingNearby: [
      {
        name: 'Long Cốc Homestay & Camping đồi chè',
        type: 'homestay',
        priceRangeVND: '150.000 VNĐ/người (phòng cộng đồng) hoặc 400.000 - 600.000 VNĐ/phòng riêng',
        address: 'Xã Long Cốc, huyện Tân Sơn',
        verified: true
      }
    ]
  },
  {
    id: 'vuon-quoc-gia-xuan-son',
    name: 'Vườn Quốc gia Xuân Sơn',
    category: 'Rừng nguyên sinh & Khám phá',
    district: 'Huyện Tân Sơn',
    address: 'Xã Xuân Sơn, huyện Tân Sơn, tỉnh Phú Thọ',
    lat: 21.1278,
    lng: 104.9458,
    openHours: '07:00 - 17:30 hàng ngày',
    ticketPriceVND: 'free',
    ticketNote: 'Vào cổng vườn quốc gia miễn phí. Thuê người bản địa dẫn đường khám phá hang động hoặc trekking rừng: 200.000 - 400.000 VNĐ/đoàn.',
    recommendedDurationMinutes: 240,
    physicalDemand: 'moderate',
    suitableForKids: true,
    suitableForSeniors: false,
    bestTimeOfDay: '08:00 - 16:00 (thời tiết râm mát, khí hậu 4 mùa trong 1 ngày)',
    officialSource: 'Ban Quản lý Vườn Quốc gia Xuân Sơn',
    verifiedHighlights: [
      'Rừng nguyên sinh trên núi đá vôi với hệ sinh thái phong phú',
      'Hệ thống hang động tự nhiên kỳ vĩ: Hang Lạng, Hang Sơn Dương, Hang Na',
      'Thác Chín Tầng, Thác Lưng Trời nước trong vắt mát lạnh mùa hè',
      'Bản Dù, Bản Lấp - không gian sinh sống đậm đà bản sắc của đồng bào Dao Tiền và Mường'
    ],
    diningNearby: [
      {
        name: 'Bếp Mường Homestay Xuân Sơn',
        specialty: 'Gà nhiều cựa nướng mắc khén, lợn mọi quay lá móc mật, rau dớn xào tỏi, cá suối nấu măng chua',
        priceRangeVND: '130.000 - 200.000 VNĐ/người',
        address: 'Bản Dù, xã Xuân Sơn, Tân Sơn',
        verified: true
      }
    ],
    lodgingNearby: [
      {
        name: 'Homestay Quỳnh Nga / Homestay Lâm Tới Xuân Sơn',
        type: 'homestay',
        priceRangeVND: '120.000 VNĐ/người (nhà sàn) - 450.000 VNĐ/bungalow',
        address: 'Bản Dù, xã Xuân Sơn, Tân Sơn',
        verified: true
      }
    ]
  },
  {
    id: 'suoi-khoang-nong-thanh-thuy',
    name: 'Suối khoáng nóng Thanh Thủy',
    category: 'Nghỉ dưỡng & Sức khỏe',
    district: 'Huyện Thanh Thủy',
    address: 'Thị trấn Thanh Thủy và xã Bảo Yên, huyện Thanh Thủy, Phú Thọ',
    lat: 21.1456,
    lng: 105.2934,
    openHours: 'Mở cửa phục vụ quanh năm (07:00 - 21:00 tại các khu tắm Onsen)',
    ticketPriceVND: 150000,
    ticketNote: 'Giá vé tắm khoáng công cộng: 100.000 - 150.000 VNĐ/người. Vé tổ hợp khoáng nóng Onsen chuẩn Nhật Bản (Wyndham Lynn Times): 350.000 - 550.000 VNĐ/người (tùy gói dịch vụ).',
    recommendedDurationMinutes: 180,
    physicalDemand: 'light',
    suitableForKids: true,
    suitableForSeniors: true,
    bestTimeOfDay: '15:00 - 18:00 hoặc 07:00 - 09:00 sáng (thư giãn cơ bắp và lưu thông khí huyết tốt nhất)',
    officialSource: 'Sở Văn hóa Thể thao và Du lịch Phú Thọ & Hiệp hội Du lịch Thanh Thủy',
    verifiedHighlights: [
      'Nguồn khoáng nóng Radon quý hiếm tự nhiên với nhiệt độ từ 37°C - 53°C',
      'Công dụng tuyệt vời hỗ trợ điều trị xương khớp, tim mạch và phục hồi năng lượng',
      'Tổ hợp nghỉ dưỡng chuẩn phong cách Onsen Nhật Bản hiện đại',
      'Rất phù hợp cho đoàn có ông bà lớn tuổi và gia đình cần tái tạo sức khỏe'
    ],
    diningNearby: [
      {
        name: 'Nhà hàng Dê núi Thanh Thủy & Cá sông Đà',
        specialty: 'Dê tái chanh, dê nướng tảng, cá ngạnh om chuối đậu, gà đồi hấp xôi',
        priceRangeVND: '150.000 - 250.000 VNĐ/người',
        address: 'Khu 1, thị trấn Thanh Thủy, Phú Thọ',
        verified: true
      }
    ],
    lodgingNearby: [
      {
        name: 'Wyndham Lynn Times Thanh Thủy (Tổ hợp khoáng nóng 5 sao)',
        type: 'resort',
        priceRangeVND: '1.200.000 - 2.800.000 VNĐ/đêm (bao gồm vé tắm Onsen)',
        address: 'Xã Bảo Yên, huyện Thanh Thủy, Phú Thọ',
        verified: true
      },
      {
        name: 'Tre Nguồn Resort Thanh Thủy',
        type: 'resort',
        priceRangeVND: '650.000 - 1.100.000 VNĐ/đêm',
        address: 'Khu 3, thị trấn Thanh Thủy',
        verified: true
      }
    ]
  },
  {
    id: 'lang-co-hung-lo',
    name: 'Làng cổ & Đình Hùng Lô',
    category: 'Văn hóa & Di sản',
    district: 'TP. Việt Trì',
    address: 'Xã Hùng Lô, thành phố Việt Trì, tỉnh Phú Thọ',
    lat: 21.3412,
    lng: 105.3956,
    openHours: '07:30 - 17:30 hàng ngày',
    ticketPriceVND: 'free',
    ticketNote: 'Miễn phí vào đình và làng cổ. Thưởng thức biểu diễn Hát Xoan Phú Thọ theo đoàn (khi đăng ký trước với BQL đình làng): 500.000 - 1.000.000 VNĐ/buổi biểu diễn.',
    recommendedDurationMinutes: 120,
    physicalDemand: 'light',
    suitableForKids: true,
    suitableForSeniors: true,
    bestTimeOfDay: '08:30 - 11:00 hoặc 14:00 - 16:30',
    officialSource: 'UBND Xã Hùng Lô & Sở Văn hóa Thể thao và Du lịch tỉnh Phú Thọ',
    verifiedHighlights: [
      'Quần thể Đình cổ Hùng Lô niên đại hơn 300 năm còn nguyên vẹn nét chạm khắc tinh xảo',
      'Chiêm ngưỡng nghệ thuật Hát Xoan - Di sản văn hóa phi vật thể đại diện của nhân loại',
      'Trải nghiệm làng nghề làm mì gạo truyền thống, làm bánh chưng, bánh giầy lâu đời',
      'Hệ thống nhà cổ dân gian Bắc Bộ bằng gỗ lim cổ kính bình yên bên bờ sông Lô'
    ],
    diningNearby: [
      {
        name: 'Ẩm thực Làng nghề Bánh Tai & Mì Hùng Lô',
        specialty: 'Bánh tai nóng chấm mắm tiêu, mì gạo Hùng Lô nấu sườn, chè lam truyền thống',
        priceRangeVND: '30.000 - 80.000 VNĐ/người',
        address: 'Chợ làng Hùng Lô, TP. Việt Trì',
        verified: true
      }
    ],
    lodgingNearby: [
      {
        name: 'Khách sạn Tiên Cát / Khách sạn Hồng Ngọc Việt Trì',
        type: 'hotel',
        priceRangeVND: '350.000 - 600.000 VNĐ/đêm',
        address: 'Trung tâm TP. Việt Trì (cách làng cổ Hùng Lô 6km)',
        verified: true
      }
    ]
  },
  {
    id: 'tay-thien',
    name: 'Khu danh thắng Tây Thiên',
    category: 'Lịch sử & Tâm linh',
    district: 'Xã Đại Đình, Tam Đảo',
    address: 'Xã Đại Đình, huyện Tam Đảo, tỉnh Phú Thọ (trước đây thuộc tỉnh Vĩnh Phúc)',
    lat: 21.4678,
    lng: 105.6139,
    openHours: '06:30 - 18:30 hàng ngày',
    ticketPriceVND: 260000,
    ticketNote: 'Vào cổng tham quan tự do. Vé cáp treo khứ hồi người lớn: 260.000 VNĐ/vé (có thể thay đổi theo thời điểm). Xe điện di chuyển nội khu: 20.000 - 40.000 VNĐ/lượt.',
    recommendedDurationMinutes: 240,
    physicalDemand: 'moderate',
    suitableForKids: true,
    suitableForSeniors: true,
    bestTimeOfDay: '07:30 - 11:30 (sáng sớm mát mẻ chiêm bái Đền Thõng, đi cáp treo lên Đền Thượng)',
    officialSource: 'Ban Quản lý Di tích Quốc gia đặc biệt Tây Thiên',
    verifiedHighlights: [
      'Đền Thượng Quốc Mẫu: Nơi thờ Quốc Mẫu Tây Thiên Lăng Thị Tiêu trên đỉnh núi Thạch Bàn',
      'Thiền viện Trúc Lâm Tây Thiên: Thiền viện lớn với kiến trúc truyền thống giữa núi rừng',
      'Đền Thõng: Điểm dâng hương quen thuộc tại khu vực chân núi',
      'Đại Bảo tháp Mandala Tây Thiên: Công trình Phật giáo nổi bật với kiến trúc Mandala Kim Cương Thừa',
      'Trải nghiệm tuyến cáp treo vượt núi ngắm toàn cảnh rừng nguyên sinh Tam Đảo và suối Bát Nhã'
    ],
    diningNearby: [
      {
        name: 'Nhà hàng rau su su & Gà đồi Tây Thiên',
        specialty: 'Rau su su xào tỏi, gà đồi nướng mọi than hoa, bánh gio chấm mật mía',
        priceRangeVND: '100.000 - 180.000 VNĐ/người',
        address: 'Khu vực bến xe điện Đền Thõng, xã Đại Đình',
        verified: true
      }
    ],
    lodgingNearby: [
      {
        name: 'Nhà nghỉ & Khách sạn Chân Mây Tây Thiên',
        type: 'hotel',
        priceRangeVND: '300.000 - 550.000 VNĐ/đêm',
        address: 'Xã Đại Đình (chân núi Tây Thiên)',
        verified: true
      },
      {
        name: 'Khu nghỉ dưỡng Venus Hotel / Tam Đảo Belvedere',
        type: 'resort',
        priceRangeVND: '1.200.000 - 2.600.000 VNĐ/đêm',
        address: 'Thị trấn Tam Đảo (cách Tây Thiên 15km)',
        verified: true
      }
    ]
  }
];

/**
 * Inter-destination distance & driving duration matrix (accurate road routes)
 */
export interface RouteLeg {
  fromId: string;
  toId: string;
  distanceKm: number;
  durationMinutes: number;
  routeRoads: string;
  roadCondition: string;
}

export const VERIFIED_ROUTES: RouteLeg[] = [
  { fromId: 'hanoi', toId: 'den-hung', distanceKm: 82, durationMinutes: 75, routeRoads: 'Cao tốc CT05 (Nội Bài - Lào Cai) -> Nút giao IC7 -> Phù Đổng', roadCondition: 'Cao tốc êm thuận, 4 làn xe' },
  { fromId: 'hanoi', toId: 'tay-thien', distanceKm: 72, durationMinutes: 70, routeRoads: 'Cao tốc CT05 (Nội Bài - Lào Cai) -> Nút giao IC4 -> Hợp Châu -> ĐT302 Tây Thiên', roadCondition: 'Đường cao tốc và tỉnh lộ thảm nhựa 4 làn xe' },
  { fromId: 'hanoi', toId: 'suoi-khoang-nong-thanh-thuy', distanceKm: 68, durationMinutes: 70, routeRoads: 'QL32 qua Sơn Tây -> Cầu Đồng Quang -> ĐT317', roadCondition: 'Đường nhựa phẳng, cầu mới thông thoáng' },
  { fromId: 'hanoi', toId: 'doi-che-long-coc', distanceKm: 115, durationMinutes: 130, routeRoads: 'QL32 qua Thanh Sơn -> ĐT316 -> ĐT315 Long Cốc', roadCondition: 'Đường nhựa trải đều, đoạn vào đồi chè dốc nhẹ' },
  { fromId: 'den-hung', toId: 'tay-thien', distanceKm: 28, durationMinutes: 35, routeRoads: 'Cầu Việt Trì / Cầu Hạc Trì -> QL2C -> ĐT302 qua Đại Đình', roadCondition: 'Đường bằng phẳng, kết nối rất nhanh giữa Đất Tổ và Tây Thiên' },
  { fromId: 'den-hung', toId: 'lang-co-hung-lo', distanceKm: 9, durationMinutes: 15, routeRoads: 'Đường Hùng Vương -> ĐT325B -> Hùng Lô', roadCondition: 'Đường đô thị và làng nghề bằng phẳng' },
  { fromId: 'den-hung', toId: 'suoi-khoang-nong-thanh-thuy', distanceKm: 36, durationMinutes: 45, routeRoads: 'QL32C xuôi đê sông Đà hoặc ĐT317', roadCondition: 'Đường tỉnh lộ êm thuận' },
  { fromId: 'den-hung', toId: 'doi-che-long-coc', distanceKm: 68, durationMinutes: 85, routeRoads: 'QL32 qua Tam Nông, Thanh Sơn -> ĐT316', roadCondition: 'Đường quốc lộ và tỉnh lộ trải nhựa' },
  { fromId: 'tam-dao', toId: 'tay-thien', distanceKm: 16, durationMinutes: 25, routeRoads: 'QL2B xuôi núi -> ĐT302 đến Đại Đình', roadCondition: 'Đường đèo dốc uốn lượn phong cảnh hữu tình' },
  { fromId: 'suoi-khoang-nong-thanh-thuy', toId: 'doi-che-long-coc', distanceKm: 48, durationMinutes: 60, routeRoads: 'ĐT317 nối QL32 qua Thanh Sơn -> Long Cốc', roadCondition: 'Đường tỉnh lộ miền đồi trung du thông thoáng' },
  { fromId: 'doi-che-long-coc', toId: 'vuon-quoc-gia-xuan-son', distanceKm: 22, durationMinutes: 35, routeRoads: 'ĐT315 nối thẳng vào trung tâm VQG Xuân Sơn (Bản Dù)', roadCondition: 'Đường nhựa uốn lượn rừng núi, phong cảnh đẹp' },
  { fromId: 'den-hung', toId: 'vuon-quoc-gia-xuan-son', distanceKm: 85, durationMinutes: 110, routeRoads: 'QL32 -> Tân Sơn -> ĐT315', roadCondition: 'Quốc lộ kết hợp đường miền núi' }
];

export function getRouteLeg(fromId: string, toId: string): RouteLeg | undefined {
  return VERIFIED_ROUTES.find(
    (r) => (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId)
  );
}
