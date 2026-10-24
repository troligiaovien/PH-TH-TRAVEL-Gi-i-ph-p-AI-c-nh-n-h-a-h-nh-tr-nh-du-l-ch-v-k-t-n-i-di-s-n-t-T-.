import { TravelGuideArticle } from '../types';

export const TRAVEL_GUIDE_ARTICLES: TravelGuideArticle[] = [
  {
    id: 'di-chuyen-den-phu-tho',
    title: 'Phương tiện di chuyển đến Phú Thọ thuận tiện nhất',
    category: 'transport',
    categoryLabel: 'Giao thông & Di chuyển',
    summary:
      'Chỉ cách Hà Nội khoảng 80km, Phú Thọ có hệ thống kết nối giao thông đồng bộ qua cao tốc Nội Bài - Lào Cai, Quốc lộ 2, Quốc lộ 32 và tuyến đường sắt liên vận.',
    steps: [
      {
        heading: '1. Ô tô cá nhân hoặc xe khách (Tuyến cao tốc Nội Bài - Lào Cai CT05)',
        details:
          'Từ trung tâm Hà Nội qua cầu Thăng Long/Nhật Tân lên cao tốc CT05. Xuống nút giao IC7 để vào thẳng TP. Việt Trì và Đền Hùng (thời gian di chuyển chỉ khoảng 1h15p). Xe khách xuất bến liên tục tại bến xe Mỹ Đình, Giáp Bát và Yên Nghĩa.'
      },
      {
        heading: '2. Đi xe máy phượt theo Quốc lộ 2 hoặc Quốc lộ 32',
        details:
          'Lộ trình QL2 (Hà Nội - Vĩnh Yên - Việt Trì) dài khoảng 85km, mặt đường bằng phẳng. Nếu đi mạn phía Nam như Suối khoáng Thanh Thủy, Đồi chè Long Cốc hay VQG Xuân Sơn, lộ trình QL32 qua Sơn Tây và cầu Đồng Quang/cầu Trung Hà sẽ thuận tiện hơn rất nhiều.'
      },
      {
        heading: '3. Trải nghiệm tàu hỏa Hà Nội - Việt Trì',
        details:
          'Tuyến tàu hỏa Hà Nội - Lào Cai (ga Hà Nội hoặc ga Long Biên dừng tại ga Việt Trì và ga Tiên Kiên). Đây là trải nghiệm hoài niệm thú vị dành cho học sinh, sinh viên với chi phí tiết kiệm.'
      }
    ],
    importantNotice:
      'Lưu ý kiểm tra áp suất lốp và phanh xe cẩn thận nếu tự lái xe vào các cung đường dốc tại Tân Sơn và đồi chè Long Cốc.',
    source: 'Tổng cục Đường bộ Việt Nam & Sở Giao thông Vận tải Phú Thọ'
  },
  {
    id: 'quy-tac-ung-xu-di-tich',
    title: 'Quy tắc ứng xử văn minh và bảo vệ di sản nơi Đất Tổ',
    category: 'etiquette',
    categoryLabel: 'Văn hóa & Ứng xử',
    summary:
      'Đền Hùng và các điểm di tích tâm linh tại Phú Thọ là chốn linh thiêng phụng thờ tổ tiên bách gia trăm họ. Hãy gìn giữ lòng thành kính và hành xử văn minh.',
    steps: [
      {
        heading: '1. Trang phục chỉnh tề và đoan trang',
        details:
          'Không mặc quần short ngắn, áo sát nách hay váy ngắn qua đầu gối khi bước vào khu vực nội tự các đền, chùa. Giữ mũ nón cầm tay khi vào gian làm lễ.'
      },
      {
        heading: '2. Giữ trật tự và hạn chế thắp hương quá mức',
        details:
          'Nói năng nhẹ nhàng, không chen lấn xô đẩy trên các bậc đá dốc núi Nghĩa Lĩnh. Mỗi người chỉ nên cắm 1 nén hương tại lư hương chung ngoài sân đền để phòng tránh hỏa hoạn và ô nhiễm khói.'
      },
      {
        heading: '3. Bảo vệ cảnh quan di tích và không xả rác',
        details:
          'Tuyệt đối không khắc vẽ bậy lên thân cây cổ thụ, bia đá, cột gỗ lim hay vách hang động. Mang theo túi đựng rác cá nhân và bỏ đúng nơi quy định.'
      }
    ],
    importantNotice:
      'Nghiêm cấm các hành vi mê tín dị đoan, đổi tiền lẻ cược phí cao hoặc chèo kéo du khách theo Nội quy Khu di tích Đền Hùng.',
    source: 'Quy chế Quản lý Di tích Lịch sử Văn hóa tỉnh Phú Thọ'
  },
  {
    id: 'thoi-diem-kham-pha-ly-tuong',
    title: 'Thời điểm vàng khám phá vẻ đẹp từng mùa tại Phú Thọ',
    category: 'seasons',
    categoryLabel: 'Thời điểm & Mùa du lịch',
    summary:
      'Mỗi mùa trong năm, Phú Thọ lại khoác lên mình một tấm áo riêng: mùa xuân trẩy hội, mùa hạ thác mát, mùa thu săn mây đồi chè, mùa đông tắm khoáng thư giãn.',
    steps: [
      {
        heading: 'Mùa Xuân (Tháng 1 đến tháng 3 Âm lịch): Mùa hành hương về cội nguồn',
        details:
          'Thời tiết mát mẻ, cây cối đâm chồi nảy lộc. Không khí lễ hội rộn ràng với Giỗ Tổ Hùng Vương (10/3 âm lịch), hội đền Mẫu Âu Cơ (tháng Giêng) và các canh hát Xoan rộn rã cửa đình.'
      },
      {
        heading: 'Mùa Thu (Tháng 9 đến tháng 11): Mùa săn mây Long Cốc & VQG Xuân Sơn',
        details:
          'Đây là thời điểm đẹp nhất để ngắm những quả đồi chè hình bát úp Long Cốc bồng bềnh trong biển sương sớm. Trời trong xanh, nắng vàng dịu nhẹ thích hợp chụp ảnh và trekking.'
      },
      {
        heading: 'Mùa Đông (Tháng 11 đến tháng 2 năm sau): Mùa nghỉ dưỡng khoáng nóng',
        details:
          'Khi gió đông bắc tràn về, việc đắm mình trong làn nước khoáng nóng tự nhiên Thanh Thủy ở nhiệt độ 38-45°C là trải nghiệm hồi phục sức khỏe tuyệt vời cho gia đình.'
      }
    ],
    importantNotice:
      'Trước chuyến đi dã ngoại hay cắm trại ở VQG Xuân Sơn hoặc thác nước, hãy xem dự báo thời tiết 24h để tránh những ngày mưa giông lớn thượng nguồn.',
    source: 'Trung tâm Xúc tiến Du lịch Phú Thọ & Đài KTTV Khu vực Việt Bắc'
  }
];
