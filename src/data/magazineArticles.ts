import { MagazineArticle } from '../types/magazine';

export const MAGAZINE_ARTICLES_DATA: MagazineArticle[] = [
  // ==========================================
  // NHÓM A — CẨM NANG DU LỊCH TỔNG QUAN
  // ==========================================
  {
    id: 'cam-nang-du-lich-phu-tho-toan-dien',
    slug: 'cam-nang-du-lich-phu-tho-toan-dien-nhung-dieu-can-biet',
    title: 'Cẩm Nang Du Lịch Phú Thọ Toàn Diện: Những Điều Cần Biết Trước Chuyến Đi',
    subtitle: 'Bức tranh toàn cảnh về địa lý, văn hóa, phương tiện, chi phí và kinh nghiệm chuẩn bị chu đáo',
    excerpt: 'Hướng dẫn tổng hợp chuẩn xác từ cách lựa chọn cụm điểm đến theo thời gian, kiểm tra giờ hoạt động, chuẩn bị chi phí đến quy tắc an toàn khi khám phá vùng Đất Tổ.',
    category: 'general_guide',
    categoryLabel: 'Cẩm nang tổng quan',
    categoryBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    coverImage: '/images/den-hung/cover.jpg',
    readingTimeMinutes: 8,
    publishedDate: '15/01/2026',
    lastUpdated: '10/2026',
    editor: 'Ban Biên tập Du lịch Số PHU THO AI TRAVEL',
    targetAudience: 'Du khách lần đầu đến Phú Thọ, nhóm bạn trẻ và các gia đình đa thế hệ',
    difficultyLevel: 'Dễ tiếp cận',
    featured: true,
    keyTakeaways: [
      'Phú Thọ chỉ cách Hà Nội khoảng 80-120km, giao thông kết nối thuận lợi qua cao tốc CT05 và Quốc lộ 32.',
      'Địa phương sở hữu 2 Di sản văn hóa phi vật thể nhân loại (Thờ cúng Hùng Vương, Hát Xoan) cùng các danh thắng tự nhiên độc đáo.',
      'Nên chia lịch trình theo 2 cụm địa lý: Cụm Di sản trung du (Việt Trì - Đền Hùng - Hùng Lô - Tây Thiên) và Cụm Sinh thái nghỉ dưỡng (Thanh Thủy - Long Cốc - Xuân Sơn).',
      'Luôn kiểm tra lịch hoạt động thực tế và đặt dịch vụ sớm vào dịp Giỗ Tổ tháng 3 âm lịch.'
    ],
    tableOfContents: [
      { id: 'tong-quan-dia-ly', title: '1. Vị trí địa lý & Đặc trưng du lịch Phú Thọ' },
      { id: 'cac-cum-trai-nghiem', title: '2. Phân chia các cụm trải nghiệm tiêu biểu' },
      { id: 'phuong-tien-di-chuyen', title: '3. Phương tiện di chuyển & Kết nối giao thông' },
      { id: 'du-toan-ngan-sach', title: '4. Dự toán ngân sách thực tế theo ngày' },
      { id: 'luu-y-an-toan-thoi-tiet', title: '5. Lưu ý thời tiết, sức khỏe & bảo vệ môi trường' }
    ],
    sections: [
      {
        id: 'tong-quan-dia-ly',
        title: '1. Vị trí địa lý & Đặc trưng du lịch Phú Thọ',
        paragraphs: [
          'Tỉnh Phú Thọ tọa lạc tại vị trí cửa ngõ phía Tây Bắc của Thủ đô Hà Nội, là vùng đất chuyển tiếp giữa đồng bằng châu thổ sông Hồng và núi rừng Tây Bắc hiểm trở. Nơi đây là điểm hợp lưu lịch sử của ba con sông lớn: sông Thao (sông Hồng), sông Lô và sông Đà, tạo nên vùng đất ngã ba sông Bạch Hạc thiêng liêng giàu phù sa và trầm tích văn hóa.',
          'Với vị thế là cội nguồn của dân tộc Việt Nam thời đại các Vua Hùng dựng nước Văn Lang, du lịch Phú Thọ mang bản sắc rất riêng: sự giao thoa hài hòa giữa chiều sâu di sản tâm linh ngàn năm và cảnh quan thiên nhiên nguyên sơ của vùng trung du bán sơn địa.'
        ],
        callout: {
          type: 'info',
          title: 'Thông tin địa lý cốt lõi',
          text: 'Khoảng cách từ trung tâm Hà Nội đến TP. Việt Trì khoảng 80 km; đến Đồi chè Long Cốc khoảng 115 km; đến VQG Xuân Sơn khoảng 125 km.'
        }
      },
      {
        id: 'cac-cum-trai-nghiem',
        title: '2. Phân chia các cụm trải nghiệm tiêu biểu',
        paragraphs: [
          'Để chuyến đi không bị phân tán hoặc mất thời gian di chuyển vòng vèo, du khách nên phân chia kế hoạch theo hai cụm không gian chính:'
        ],
        bulletPoints: [
          {
            heading: 'Cụm Di sản & Văn hóa Lịch sử (Phía Đông & Đông Bắc)',
            detail: 'Tập trung quanh TP. Việt Trì, Khu di tích lịch sử Đền Hùng (xã Hy Cương), Làng cổ & Đình Hùng Lô bên bờ sông Lô, và quần thể Di tích Quốc gia đặc biệt Tây Thiên – Tam Đảo liền kề. Cung đường này chủ yếu là đường cao tốc và quốc lộ lớn bằng phẳng, thích hợp cho chuyến đi 1 ngày hoặc kết hợp nghỉ cuối tuần.'
          },
          {
            heading: 'Cụm Sinh thái, Nghỉ dưỡng & Khám phá Thiên nhiên (Phía Tây & Tây Nam)',
            detail: 'Kéo dài theo tuyến QL32 và sông Đà gồm Khu khoáng nóng Thanh Thủy, ốc đảo Đồi chè bát úp Long Cốc và rừng nguyên sinh Vườn Quốc gia Xuân Sơn. Phù hợp cho du khách thích trekking, săn mây bình minh, tắm khoáng Onsen phục hồi thể lực và tìm hiểu văn hóa bản Mường, Dao.'
          }
        ]
      },
      {
        id: 'phuong-tien-di-chuyen',
        title: '3. Phương tiện di chuyển & Kết nối giao thông',
        paragraphs: [
          'Giao thông đến Phú Thọ hiện nay rất đa dạng và thuận tiện:',
          '• Ô tô cá nhân / Taxi công nghệ: Lựa chọn tối ưu nhất là tuyến đường cao tốc Nội Bài – Lào Cai (CT05). Xuống tại Nút giao IC7 vào thẳng Việt Trì hoặc Đền Hùng chỉ mất 1 giờ 15 phút. Nếu đi Thanh Thủy hay Tân Sơn, lộ trình theo Đại lộ Thăng Long hoặc QL32 qua cầu Đồng Quang sẽ êm ái và rút ngắn cự ly.',
          '• Xe khách & Limousine: Các tuyến xe limousine đón trả tận nơi xuất bến liên tục từ Hà Nội (khu vực Mỹ Đình, Cầu Giấy, Hoàn Kiếm) đi Việt Trì, Thanh Thủy với giá vé niêm yết từ 130.000 – 160.000 VNĐ/người/lượt.',
          '• Tàu hỏa: Tuyến đường sắt Hà Nội – Lào Cai dừng tại Ga Việt Trì và Ga Tiên Kiên, mang lại trải nghiệm hoài niệm thú vị với chi phí tiết kiệm cho học sinh, sinh viên.'
        ]
      },
      {
        id: 'du-toan-ngan-sach',
        title: '4. Dự toán ngân sách thực tế theo ngày',
        paragraphs: [
          'Dưới đây là bảng ước tính chi phí thực tế cho 1 người lớn (dựa trên khảo sát biểu giá dịch vụ niêm yết tại các điểm tham quan năm 2026):'
        ],
        comparisonTable: {
          headers: ['Khoản chi phí', 'Chuyến đi 1 ngày (Tiết kiệm)', 'Chuyến đi 2 ngày 1 đêm (Tiêu chuẩn)', 'Nghỉ dưỡng Onsen cao cấp'],
          rows: [
            ['Di chuyển (Xăng/Xe khách)', '150.000 – 250.000 đ', '300.000 – 400.000 đ', '500.000 – 800.000 đ (Xe riêng)'],
            ['Vé tham quan / Cáp treo', '0 – 50.000 đ (Đền Hùng)', '100.000 – 350.000 đ (gồm cáp treo nếu đi Tây Thiên)', '350.000 – 600.000 đ (Vé Onsen chuẩn)'],
            ['Lưu trú (Khách sạn/Homestay)', 'Không lưu trú', '250.000 – 500.000 đ/người (phòng đôi)', '1.200.000 – 2.500.000 đ/phòng'],
            ['Ăn uống đặc sản', '150.000 – 250.000 đ', '400.000 – 600.000 đ (3 bữa)', '800.000 – 1.200.000 đ'],
            ['Tổng chi phí ước tính', '300.000 – 550.000 đ/người', '1.050.000 – 1.850.000 đ/người', '2.850.000 – 5.100.000 đ/người']
          ]
        }
      },
      {
        id: 'luu-y-an-toan-thoi-tiet',
        title: '5. Lưu ý thời tiết, sức khỏe & bảo vệ môi trường',
        paragraphs: [
          'Khu vực đồi núi Tân Sơn và rừng Xuân Sơn có thể có sương mù dày vào sáng sớm và mùa đông, gây hạn chế tầm nhìn khi lái xe đèo dốc. Hãy đảm bảo hệ thống đèn sương mù và phanh xe hoạt động hoàn hảo.',
          'Khi tham quan các công trình thờ tự tôn nghiêm, du khách cần ăn mặc lịch sự, đi nhẹ nói khẽ, không ngắt hoa bẻ cành tại các khu rừng cổ thụ Nghĩa Lĩnh. Tuyệt đối không xả rác tại các đồi chè và dòng suối sinh thái.'
        ],
        callout: {
          type: 'warning',
          title: 'Khuyến cáo cao điểm lễ hội',
          text: 'Vào ngày 10/3 âm lịch (Chính hội Đền Hùng), lượng khách đổ về có thể lên đến hàng triệu người. Nếu đi vào thời điểm này, hãy bắt đầu di chuyển từ sáng sớm (5:00 - 6:00), chuẩn bị nước uống cá nhân và trông nom trẻ nhỏ cẩn thận.'
        }
      }
    ],
    practicalAdvice: [
      {
        tip: 'Tải trước bản đồ ngoại tuyến hoặc lưu ảnh chụp lộ trình',
        why: 'Một số cung đường rừng sâu tại VQG Xuân Sơn và khe núi Tây Thiên có sóng 4G chập chờn.',
        howToApply: 'Sử dụng tính năng Bản đồ số trên PHU THO AI TRAVEL hoặc tải trước khu vực Phú Thọ trên ứng dụng Google Maps.'
      },
      {
        tip: 'Chuẩn bị tiền mặt mệnh giá nhỏ (10.000đ - 50.000đ)',
        why: 'Các bãi giữ xe, quán nước giải khát ven chân núi và xe điện địa phương đôi khi khó quét mã QR chuyển khoản khi nghẽn mạng.',
        howToApply: 'Đổi sẵn khoảng 200.000 – 300.000 VNĐ tiền mặt lẻ để thanh toán nhanh tại các điểm gửi xe và dịch vụ nhỏ.'
      }
    ],
    preTripChecklist: [
      'Kiểm tra dự báo thời tiết tỉnh Phú Thọ trước ngày khởi hành 24-48 giờ.',
      'Chuẩn bị giày thể thao hoặc sandal có độ ma sát tốt để leo bậc đá Đền Hùng hoặc dạo đồi chè.',
      'Trang phục kín đáo, lịch sự (quần dài hoặc váy dài quá gối, áo có tay) khi vào đền chùa.',
      'Mang theo áo khoác nhẹ nếu có kế hoạch nghỉ đêm tại Tam Đảo, Tây Thiên hoặc VQG Xuân Sơn.',
      'Sạc đầy pin điện thoại và chuẩn bị pin sạc dự phòng cho hành trình dã ngoại.'
    ],
    verifiedSources: [
      {
        name: 'Cổng thông tin điện tử Du lịch Phú Thọ',
        publisher: 'Trung tâm Thông tin Xúc tiến Du lịch tỉnh Phú Thọ',
        url: 'https://dulichphutho.com.vn',
        accessDate: '10/2026',
        verifiedNote: 'Nguồn thông tin chính thức về tuyến điểm, cơ sở lưu trú và hướng dẫn du khách'
      },
      {
        name: 'Báo cáo Thống kê Hiện trạng Hạ tầng Giao thông Kết nối Đất Tổ',
        publisher: 'Sở Giao thông Vận tải tỉnh Phú Thọ',
        accessDate: '2026',
        verifiedNote: 'Thông số các nút giao cao tốc CT05, cầu vượt sông Hồng và sông Lô'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc', 'tay-thien', 'tam-dao', 'ho-dai-lai'],
    suggestedAiPrompt: 'Lập lịch trình 2 ngày 1 đêm khám phá cội nguồn Đền Hùng kết hợp săn mây đồi chè Long Cốc cho gia đình 4 người, ngân sách khoảng 1.5 triệu/người',
    relatedArticleIds: ['du-lich-phu-tho-mua-nao-phu-hop', 'huong-dan-len-ke-hoach-du-lich-a-z', '15-bi-kip-du-lich-phu-tho-tiet-kiem']
  },

  {
    id: 'du-lich-phu-tho-mua-nao-phu-hop',
    slug: 'du-lich-phu-tho-mua-nao-phu-hop-cach-lua-chon-thoi-diem',
    title: 'Du Lịch Phú Thọ Mùa Nào Phù Hợp? Cách Lựa Chọn Thời Điểm Theo Mục Tiêu Chuyến Đi',
    subtitle: 'Phân tích khí hậu 4 mùa vùng trung du: Sắc xuân trẩy hội, hè trốn nóng vùng cao, thu săn mây đồi chè và đông ngâm khoáng nóng',
    excerpt: 'Không có mùa nào là "đẹp nhất tuyệt đối". Mỗi mùa tại vùng Đất Tổ đều mang một vẻ đẹp đặc trưng. Bài viết phân tích chi tiết ưu - nhược điểm của từng mùa để bạn chọn lịch trình ưng ý.',
    category: 'general_guide',
    categoryLabel: 'Thời điểm & Mùa du lịch',
    categoryBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    coverImage: '/images/long-coc/cover.jpg',
    readingTimeMinutes: 6,
    publishedDate: '18/01/2026',
    lastUpdated: '10/2026',
    editor: 'Ban Biên tập Du lịch Số PHU THO AI TRAVEL',
    targetAudience: 'Người lên kế hoạch du lịch theo mùa, nhiếp ảnh gia săn phong cảnh và du khách nghỉ dưỡng',
    difficultyLevel: 'Dễ tiếp cận',
    keyTakeaways: [
      'Mùa xuân (Tháng 2 - Tháng 4): Thời gian vàng của lễ hội truyền thống, rực rỡ nhất là Giỗ Tổ Hùng Vương và Lễ hội Tây Thiên.',
      'Mùa hè (Tháng 5 - Tháng 8): Thời điểm hoàn hảo để giải nhiệt tại VQG Xuân Sơn, tắm suối mát và nghỉ dưỡng trên đỉnh Tam Đảo mát lạnh.',
      'Mùa thu (Tháng 9 - Tháng 11): Khí hậu hanh hao mát mẻ, đồi chè Long Cốc xanh mướt mây giăng và bưởi Đoan Hùng vào mùa thu hoạch chín vàng.',
      'Mùa đông (Tháng 12 - Tháng 1): Thời tiết se lạnh lý tưởng nhất trong năm để trải nghiệm tắm khoáng nóng Radon tại Thanh Thủy.'
    ],
    tableOfContents: [
      { id: 'tong-quan-khi-hau', title: '1. Đặc điểm khí hậu trung du Bắc Bộ' },
      { id: 'mua-xuan-le-hoi', title: '2. Mùa xuân: Trẩy hội non thiêng & Dâng hương cội nguồn' },
      { id: 'mua-he-giai-nhiet', title: '3. Mùa hè: Trốn nóng giữa đại ngàn Xuân Sơn & Hồ Đại Lải' },
      { id: 'mua-thu-san-may', title: '4. Mùa thu: Mây ngàn Long Cốc & Mùa quả ngọt Đất Tổ' },
      { id: 'mua-dong-khoang-nong', title: '5. Mùa đông: Thư giãn suối khoáng nóng Thanh Thủy' }
    ],
    sections: [
      {
        id: 'tong-quan-khi-hau',
        title: '1. Đặc điểm khí hậu trung du Bắc Bộ',
        paragraphs: [
          'Phú Thọ mang khí hậu nhiệt đới gió mùa ẩm với sự phân hóa bốn mùa rõ rệt. Tuy nhiên, do địa hình có sự chuyển tiếp từ vùng đồng bằng ngã ba sông lên vùng đồi gò trung du và núi cao Tam Đảo, Tân Sơn (đỉnh cao trên 1.200m), nền nhiệt giữa các tiểu vùng có sự chênh lệch đáng kể.',
          'Ví dụ: Trong khi TP. Việt Trì có thể nắng nóng 36°C vào mùa hè, thì tại VQG Xuân Sơn hay thị trấn Tam Đảo, nhiệt độ thường thấp hơn 4 - 6°C, không khí trong lành với sương mù bay lãng đãng.'
        ]
      },
      {
        id: 'mua-xuan-le-hoi',
        title: '2. Mùa xuân: Trẩy hội non thiêng & Dâng hương cội nguồn',
        paragraphs: [
          'Từ tháng Giêng đến hết tháng Ba âm lịch là mùa du lịch tâm linh lớn nhất trong năm. Mọi ngả đường đều hướng về Đền Hùng với tâm thế "Nhớ ngày Giỗ Tổ mùng mười tháng ba". Không gian tràn ngập cờ hội ngũ sắc, tiếng trống đồng vang vọng và các canh Hát Xoan cửa đình rộn rã.',
          'Ưu điểm: Không khí lễ hội linh thiêng hào hùng, cây cối đâm chồi nảy lộc xanh tươi.',
          'Hạn chế: Những ngày cao điểm lượng du khách rất đông, các dịch vụ lưu trú và ăn uống quanh Đền Hùng có thể quá tải nếu không đặt trước.'
        ]
      },
      {
        id: 'mua-thu-san-may',
        title: '4. Mùa thu: Mây ngàn Long Cốc & Mùa quả ngọt Đất Tổ',
        paragraphs: [
          'Từ tháng 9 đến tháng 11 là thời điểm được các nhiếp ảnh gia đánh giá là đẹp nhất về mặt thị giác. Những ốc đảo chè bát úp Long Cốc bước vào độ thu hoạch xanh mướt, buổi sáng thường xuất hiện lớp sương mây bồng bềnh phủ ngang thung lũng tạo nên khung cảnh tựa chốn bồng lai.',
          'Đây cũng là mùa bưởi đặc sản Đoan Hùng vỏ mỏng tép mọng nước chín vàng thơm nức khắp các triền đồi.'
        ]
      },
      {
        id: 'mua-dong-khoang-nong',
        title: '5. Mùa đông: Thư giãn suối khoáng nóng Thanh Thủy',
        paragraphs: [
          'Khi gió mùa đông bắc tràn về khiến nhiệt độ ngoài trời hạ thấp, không gì tuyệt vời hơn cảm giác được ngâm mình trong dòng khoáng nóng tự nhiên giàu tinh chất Radon tại Thanh Thủy. Nước khoáng ở nhiệt độ 37°C – 53°C giúp cơ thể thả lỏng cơ bắp, hỗ trợ lưu thông khí huyết và tái tạo năng lượng sau một năm làm việc căng thẳng.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Chọn thời gian đi Đền Hùng vào các ngày lân cận nếu muốn vãng cảnh tĩnh lặng',
        why: 'Từ mùng 1 đến mùng 7 tháng 3 âm lịch hoặc các tháng mùa thu, không gian Đền Hùng rất tĩnh lặng, thanh bình, rợp bóng cây cổ thụ.',
        howToApply: 'Lên kế hoạch đi vào ngày thường hoặc sau dịp Giỗ Tổ để có thể leo bộ thư thái lên Đền Thượng mà không phải chen lấn.'
      }
    ],
    preTripChecklist: [
      'Theo dõi sát dự báo thời tiết cục bộ từng huyện (Việt Trì khác với Tân Sơn và Tam Đảo).',
      'Nếu đi mùa hè đến rừng núi Xuân Sơn, chuẩn bị kem chống muỗi, xịt côn trùng thảo dược.',
      'Nếu đi mùa đông ngâm khoáng nóng, chuẩn bị đồ bơi gọn gàng và khăn choàng giữ ấm ngay sau khi lên bờ.'
    ],
    verifiedSources: [
      {
        name: 'Đặc trưng Khí hậu & Du lịch 4 mùa Phú Thọ',
        publisher: 'Đài Khí tượng Thủy văn khu vực Việt Bắc & Cổng TTĐT Du lịch Phú Thọ',
        accessDate: '2026',
        verifiedNote: 'Chuỗi số liệu quan trắc khí hậu và mùa vụ du lịch thực tế'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc', 'tay-thien', 'tam-dao'],
    suggestedAiPrompt: 'Lập lịch trình du lịch mùa thu 2 ngày 1 đêm ngắm bình minh đồi chè Long Cốc và thăm làng cổ Hùng Lô',
    relatedArticleIds: ['cam-nang-du-lich-phu-tho-toan-dien', 'huong-dan-len-ke-hoach-du-lich-a-z']
  },

  {
    id: 'huong-dan-len-ke-hoach-du-lich-a-z',
    slug: 'huong-dan-len-ke-hoach-du-lich-phu-tho-tu-a-den-z',
    title: 'Hướng Dẫn Lên Kế Hoạch Du Lịch Phú Thọ Từ A Đến Z',
    subtitle: 'Khung phương pháp khoa học: Xác định mục tiêu, dự toán lộ trình, quản lý thời gian và ứng dụng AI thông minh',
    excerpt: 'Từng bước xây dựng một chuyến đi thực tế, tránh bẫy "nhồi nhét quá nhiều điểm đến", đảm bảo sự thoải mái cho các thành viên và tối ưu từng chặng đường.',
    category: 'general_guide',
    categoryLabel: 'Lập kế hoạch du lịch',
    categoryBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    coverImage: '/images/dai-lai/cover.jpg',
    readingTimeMinutes: 7,
    publishedDate: '20/01/2026',
    lastUpdated: '10/2026',
    editor: 'Ban Biên tập Du lịch Số PHU THO AI TRAVEL',
    targetAudience: 'Người tổ chức tour gia đình, nhóm bạn, trưởng đoàn tham quan dã ngoại',
    difficultyLevel: 'Cần chuẩn bị',
    keyTakeaways: [
      'Bước 1: Xác định mục tiêu chuyến đi (Hành hương cội nguồn, Nghỉ dưỡng chữa lành, hay Khám phá thiên nhiên mạo hiểm).',
      'Bước 2: Đo lường thời lượng thực tế và tính toán khoảng cách giữa các điểm (trung bình 30 - 45 km giữa các huyện).',
      'Bước 3: Dự toán thời gian đệm (buffer time) ít nhất 30-45 phút cho mỗi chặng dừng chân.',
      'Bước 4: Sử dụng công cụ AI Kiến tạo Lịch trình trên PHU THO AI TRAVEL để tối ưu cung đường mà không cần tính toán thủ công.'
    ],
    tableOfContents: [
      { id: 'quy-trinh-5-buoc', title: '1. Quy trình 5 bước lên kế hoạch chuyên nghiệp' },
      { id: 'sai-lam-ve-khoang-cach', title: '2. Nhận diện sai lầm về khoảng cách địa lý' },
      { id: 'du-toan-thoi-gian-dem', title: '3. Nguyên tắc tính thời gian đệm và nghỉ ngơi' },
      { id: 'ung-dung-ai-ho-tro', title: '4. Tận dụng AI Travel Planner để kiểm chứng tính khả thi' }
    ],
    sections: [
      {
        id: 'quy-trinh-5-buoc',
        title: '1. Quy trình 5 bước lên kế hoạch chuyên nghiệp',
        paragraphs: [
          'Một chuyến đi thành công bắt nguồn từ việc lên kế hoạch bài bản. Đừng bắt đầu bằng việc tích chọn một danh sách dài các địa danh nổi tiếng trên mạng, mà hãy đi theo 5 bước logic sau:'
        ],
        bulletPoints: [
          {
            heading: 'Bước 1: Xác định rõ trọng tâm trải nghiệm',
            detail: 'Đoàn có người lớn tuổi nên ưu tiên du lịch tâm linh, văn hóa nhẹ nhàng kết hợp khoáng nóng (Đền Hùng, Hùng Lô, Thanh Thủy). Nhóm bạn trẻ có thể chọn săn mây, dã ngoại đồi chè và khám phá hang động (Long Cốc, VQG Xuân Sơn).'
          },
          {
            heading: 'Bước 2: Lựa chọn khung thời gian và phương tiện',
            detail: 'Chuyến đi 1 ngày chỉ nên chọn 1-2 điểm đến trong cùng một huyện hoặc trục đường cao tốc. Chuyến đi 2 ngày 1 đêm mới nên kết hợp giữa 2 cụm địa phương khác nhau.'
          },
          {
            heading: 'Bước 3: Lập danh sách dịch vụ cần đặt trước',
            detail: 'Phòng lưu trú, bữa ăn chính và vé cáp treo (nếu đi Tây Thiên) cần được khảo sát và liên hệ xác nhận trước ít nhất 3-5 ngày.'
          }
        ]
      },
      {
        id: 'sai-lam-ve-khoang-cach',
        title: '2. Nhận diện sai lầm về khoảng cách địa lý',
        paragraphs: [
          'Nhiều du khách lầm tưởng từ TP. Việt Trì đi đồi chè Long Cốc hay VQG Xuân Sơn chỉ mất khoảng 30 phút. Trên thực tế, cự ly từ Việt Trì đến Xuân Sơn là hơn 85 km, trong đó có khoảng 30 km đường tỉnh lộ miền đồi uốn lượn, thời gian di chuyển bằng ô tô thường mất từ 1 giờ 45 phút đến 2 giờ.',
          'Nếu ghép Đền Hùng vào buổi sáng rồi dự định chạy thẳng lên VQG Xuân Sơn ăn trưa, đoàn sẽ rất mệt mỏi và không còn nhiều thời gian trải nghiệm rừng chiều.'
        ]
      },
      {
        id: 'ung-dung-ai-ho-tro',
        title: '4. Tận dụng AI Travel Planner để kiểm chứng tính khả thi',
        paragraphs: [
          'Tính năng "AI Kiến tạo Lịch trình" trên website PHU THO AI TRAVEL được xây dựng dựa trên ma trận dữ liệu khoảng cách thực tế giữa các trục đường CT05, QL32, ĐT315. Bạn chỉ cần nhập mong muốn tự nhiên (ví dụ: "Tôi đi 2 ngày với mẹ già và 2 con nhỏ, muốn dâng hương Đền Hùng và ngâm khoáng nóng"), AI sẽ tự động tính toán thời gian di chuyển chuẩn xác và cảnh báo nếu lịch trình quá tải.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Quy tắc 3 điểm đến tối đa cho mỗi ngày',
        why: 'Việc ghé thăm hơn 3 địa điểm trong 1 ngày sẽ biến chuyến đi thành cuộc chạy đua "điểm danh", gây kiệt sức cho tài xế và các thành viên.',
        howToApply: 'Sắp xếp 1 điểm chính vào buổi sáng (dành 2.5 - 3 tiếng), 1 điểm phụ buổi chiều (1.5 - 2 tiếng), và thời gian buổi tối hoàn toàn dành cho thư giãn, ẩm thực.'
      }
    ],
    preTripChecklist: [
      'Lập bảng phân công người phụ trách lái xe, thủ quỹ và liên hệ nhà hàng.',
      'Lưu số hotline của các ban quản lý di tích và trạm y tế địa phương.',
      'Kiểm tra lại xác nhận đặt phòng và dịch vụ ăn uống trước khi xuất phát.'
    ],
    verifiedSources: [
      {
        name: 'Tài liệu Hướng dẫn Thiết kế Tour Du lịch Nội địa',
        publisher: 'Hiệp hội Du lịch Việt Nam & Khoa Du lịch ĐHQG Hà Nội',
        accessDate: '2025',
        verifiedNote: 'Tiêu chuẩn quốc gia về phân bổ thời gian và khoảng cách di chuyển an toàn'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc', 'tay-thien', 'tam-dao'],
    suggestedAiPrompt: 'Tạo kế hoạch du lịch Phú Thọ 1 ngày khởi hành từ Hà Nội lúc 7h sáng, về trước 18h tối cho đoàn học sinh',
    relatedArticleIds: ['cam-nang-du-lich-phu-tho-toan-dien', '15-bi-kip-du-lich-phu-tho-tiet-kiem', 'nhung-sai-lam-thuong-gap-khi-du-lich-phu-tho']
  },

  // ==========================================
  // NHÓM B — BÍ KÍP DU LỊCH THỰC CHIẾN
  // ==========================================
  {
    id: '15-bi-kip-du-lich-phu-tho-tiet-kiem',
    slug: '15-bi-kip-giup-chuyen-du-lich-phu-tho-thuan-tien-tiet-kiem',
    title: '15 Bí Kíp Giúp Chuyến Du Lịch Phú Thọ Thuận Tiện, Tiết Kiệm & Ít Phát Sinh',
    subtitle: 'Kinh nghiệm thực chiến từ chuyên gia bản địa: Tối ưu chi phí, phòng ngừa rủi ro và tận hưởng trọn vẹn dịch vụ',
    excerpt: 'Tổng hợp 15 lời khuyên thực tế có phân tích rõ "Vì sao hữu ích" và "Cách áp dụng cụ thể", giúp bạn tiết kiệm đến 30% chi phí chuyến đi mà vẫn đảm bảo chất lượng trải nghiệm.',
    category: 'tips_hacks',
    categoryLabel: 'Bí kíp thực chiến',
    categoryBadgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
    coverImage: '/images/long-coc/cover.jpg',
    readingTimeMinutes: 9,
    publishedDate: '25/01/2026',
    lastUpdated: '10/2026',
    editor: 'Ban Biên tập Du lịch Số PHU THO AI TRAVEL',
    targetAudience: 'Người thích du lịch tự túc, gia đình muốn tối ưu ngân sách và các phượt thủ',
    difficultyLevel: 'Dễ tiếp cận',
    keyTakeaways: [
      'Chia cung đường theo trục cao tốc CT05 hoặc QL32 giúp tiết kiệm đáng kể nhiên liệu và phí cầu đường.',
      'Hỏi rõ giá niêm yết theo đĩa hoặc theo kilôgam trước khi gọi các món cá sông hoặc gà đồi.',
      'Sử dụng dịch vụ xe điện nội khu tại Đền Hùng đúng trạm để tránh mỏi chân khi có trẻ nhỏ.',
      'Đặt homestay bản Mường trực tiếp tại Bản Dù thay vì qua trung gian để nhận được mức giá gốc và sự hỗ trợ nhiệt tình nhất.'
    ],
    tableOfContents: [
      { id: 'bi-kip-di-chuyen', title: '1. Nhóm bí kíp di chuyển & Xăng xe' },
      { id: 'bi-kip-an-uong', title: '2. Nhóm bí kíp ẩm thực & Tránh bẫy giá' },
      { id: 'bi-kip-luu-tru', title: '3. Nhóm bí kíp lưu trú & Homestay' },
      { id: 'bi-kip-tham-quan', title: '4. Nhóm bí kíp tham quan & Mua sắm đặc sản' }
    ],
    sections: [
      {
        id: 'bi-kip-di-chuyen',
        title: '1. Nhóm bí kíp di chuyển & Xăng xe',
        paragraphs: [
          'Chi phí di chuyển thường chiếm từ 25% – 35% tổng ngân sách chuyến đi. Để tối ưu hóa, hãy lưu ý:'
        ]
      },
      {
        id: 'bi-kip-an-uong',
        title: '2. Nhóm bí kíp ẩm thực & Tránh bẫy giá',
        paragraphs: [
          'Ẩm thực Phú Thọ rất ngon và dân dã, tuy nhiên các món thủy sản sông Đà (cá lăng, cá chiên) và gà nhiều cựa Tân Sơn thường có giá biến động theo mùa vụ. Luôn thực hiện nguyên tắc hỏi rõ giá theo kg trước khi chế biến.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Bí kíp 1: Đi chung xe ô tô hoặc đặt Limousine khứ hồi theo nhóm',
        why: 'Chi phí chia theo đầu người cho chuyến xe 4-7 chỗ sẽ rẻ hơn rất nhiều so với tự đi xe máy nhiều xe hoặc bắt taxi lẻ từng chặng.',
        howToApply: 'Tập hợp nhóm từ 4-6 người và đặt dịch vụ trọn gói từ Hà Nội.'
      },
      {
        tip: 'Bí kíp 2: Mua thịt chua Thanh Sơn tại cơ sở có chứng nhận OCOP',
        why: 'Thịt chua chuẩn làm từ thịt lợn sạch ướp thính ngô rang thơm giòn, lên men tự nhiên. Các hàng trôi nổi ven đường có thể dùng chất bảo quản hoặc thính công nghiệp.',
        howToApply: 'Tìm mua tại các thương hiệu uy tín có tem mã QR truy xuất nguồn gốc tại Thanh Sơn hoặc các cửa hàng OCOP chính hãng TP. Việt Trì.'
      },
      {
        tip: 'Bí kíp 3: Thuê trang phục dân tộc Mường/Dao tại homestay thay vì điểm check-in',
        why: 'Giá thuê tại các homestay thường chỉ 30.000 – 40.000 VNĐ/bộ và không giới hạn thời gian chụp ảnh trên đồi chè.',
        howToApply: 'Hỏi mượn hoặc thuê trực tiếp từ chủ nhà homestay tại Bản Dù hoặc Long Cốc.'
      },
      {
        tip: 'Bí kíp 4: Dâng hương Đền Hùng vào buổi sáng sớm (6:30 - 8:30)',
        why: 'Leo gần 500 bậc đá dưới nắng trưa rất tốn sức và mất nước nhanh, trong khi sáng sớm không khí núi Nghĩa Lĩnh mát mẻ thanh tịnh.',
        howToApply: 'Nghỉ đêm tại TP. Việt Trì và xuất phát lên chân núi từ 6:15 sáng.'
      },
      {
        tip: 'Bí kíp 5: Mang theo bình nước cá nhân có thể nạp lại',
        why: 'Tiết kiệm chi phí mua nước đóng chai tại từng điểm dừng chân và chung tay giảm rác thải nhựa tại các khu di tích.',
        howToApply: 'Chuẩn bị mỗi người một bình giữ nhiệt 500ml - 1 lít.'
      }
    ],
    preTripChecklist: [
      'Chuẩn bị tiền mặt lẻ cho các khoản phí gửi xe và vé xe điện.',
      'Cài đặt ứng dụng tra cứu giao thông và camera phạt nguội trên cao tốc CT05.',
      'Lưu sẵn danh bạ các trạm xăng lớn trên tuyến đường QL32 và QL2.'
    ],
    verifiedSources: [
      {
        name: 'Sổ tay Kinh nghiệm Du lịch Bản địa Phú Thọ',
        publisher: 'Cộng đồng Lữ hành & Du lịch Trách nhiệm Đất Tổ',
        accessDate: '2026',
        verifiedNote: 'Tổng hợp từ thực tiễn hướng dẫn viên du lịch chuyên tuyến Phú Thọ'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc', 'tay-thien'],
    suggestedAiPrompt: 'Lập lịch trình du lịch bụi Phú Thọ 2 ngày 1 đêm tiết kiệm cho 2 sinh viên với tổng ngân sách dưới 1.5 triệu',
    relatedArticleIds: ['nhung-sai-lam-thuong-gap-khi-du-lich-phu-tho', 'cam-nang-du-lich-phu-tho-toan-dien']
  },

  {
    id: 'nhung-sai-lam-thuong-gap-khi-du-lich-phu-tho',
    slug: 'nhung-sai-lam-thuong-gap-khi-du-lich-phu-tho-va-cach-phong-tranh',
    title: 'Những Sai Lầm Thường Gặp Khi Du Lịch Phú Thọ Và Cách Phòng Tránh',
    subtitle: 'Nhận diện các bẫy hành trình: Nhồi nhét điểm đến, đánh giá thấp địa hình và chủ quan với thời tiết',
    excerpt: 'Bài học đắt giá từ các đoàn du khách: Vì sao bị kiệt sức, vì sao lỡ mất khoảnh khắc bình minh đẹp nhất và cách khắc phục để chuyến đi suôn sẻ tuyệt đối.',
    category: 'tips_hacks',
    categoryLabel: 'Lưu ý & Phòng ngừa rủi ro',
    categoryBadgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
    coverImage: '/images/den-hung/cover.jpg',
    readingTimeMinutes: 7,
    publishedDate: '28/01/2026',
    lastUpdated: '10/2026',
    editor: 'Ban Biên tập Du lịch Số PHU THO AI TRAVEL',
    targetAudience: 'Tất cả du khách chuẩn bị lên kế hoạch đi Phú Thọ',
    difficultyLevel: 'Dễ tiếp cận',
    keyTakeaways: [
      'Sai lầm lớn nhất: Cố gắng đi cả Đền Hùng, Long Cốc và VQG Xuân Sơn trong cùng một ngày.',
      'Đến đồi chè Long Cốc lúc 10h trưa: Lúc này nắng gắt, sương mây đã tan hết và ảnh chụp bị cháy sáng.',
      'Không kiểm tra trang phục: Mặc váy ngắn hoặc đồ bó sát khi leo đền chùa cổ kính.',
      'Quên kiểm tra bảo dưỡng phanh xe khi đổ đèo dốc quanh sườn Tam Đảo hoặc Tân Sơn.'
    ],
    tableOfContents: [
      { id: 'sai-lam-ve-tien-do', title: '1. Sai lầm về tiến độ & Số lượng điểm tham quan' },
      { id: 'sai-lam-ve-thoi-diem', title: '2. Sai lầm về "giờ vàng" ngắm cảnh' },
      { id: 'sai-lam-ve-trang-phuc', title: '3. Sai lầm về trang phục & Giày dép' },
      { id: 'giai-phap-khac-phuc', title: '4. Bộ giải pháp chuẩn bị phòng tránh rủi ro' }
    ],
    sections: [
      {
        id: 'sai-lam-ve-tien-do',
        title: '1. Sai lầm về tiến độ & Số lượng điểm tham quan',
        paragraphs: [
          'Nhiều du khách xem bản đồ thấy các điểm nằm cùng trong một tỉnh nên nghĩ rằng di chuyển rất nhanh. Hậu quả là đoàn dành tới 6-7 tiếng chỉ để ngồi trên xe ô tô, đến nơi thì trời đã tối muộn hoặc mệt mỏi không còn tinh thần tham quan.',
          'Hãy nhớ: Du lịch vùng bán sơn địa và rừng nguyên sinh cần sự thư thái. Hãy dành ít nhất 2.5 tiếng cho Đền Hùng, 2 tiếng cho đồi chè Long Cốc và nửa ngày cho VQG Xuân Sơn.'
        ]
      },
      {
        id: 'sai-lam-ve-thoi-diem',
        title: '2. Sai lầm về "giờ vàng" ngắm cảnh',
        paragraphs: [
          'Vẻ đẹp ngoạn mục của Đồi chè Long Cốc nằm ở thời khắc bình minh (5:30 - 7:00 sáng). Nếu bạn xuất phát từ Hà Nội lúc 7h sáng thì đến nơi đã là 9h30, lúc này sương mây huyền ảo đã tan biến và chỉ còn những quả đồi chè dưới nắng gắt. Giải pháp là hãy nghỉ đêm tại homestay Long Cốc từ tối hôm trước để sáng hôm sau thức dậy đón trọn bình minh.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Quy tắc trang phục 2 lớp khi đi vùng cao',
        why: 'Nhiệt độ sáng sớm trên đồi chè và trong rừng có thể chỉ 16-18°C nhưng đến trưa lên tới 28°C.',
        howToApply: 'Mặc áo phông cotton thoáng khí bên trong và một chiếc áo gió mỏng nhẹ bên ngoài dễ cởi bỏ khi leo dốc.'
      }
    ],
    preTripChecklist: [
      'Gạch bỏ bớt ít nhất 1 điểm đến nếu lịch trình dự kiến vượt quá 3 điểm trong ngày.',
      'Đặt báo thức sớm nếu mục tiêu là săn mây và đón bình minh.',
      'Chuẩn bị túi bọc chống nước cho máy ảnh, điện thoại nếu đi vào mùa mưa dông.'
    ],
    verifiedSources: [
      {
        name: 'Khuyến cáo An toàn Du khách Vùng Trung du & Miền núi',
        publisher: 'Sở Du lịch tỉnh Phú Thọ',
        accessDate: '2026',
        verifiedNote: 'Khuyến cáo thực tế phòng ngừa tai nạn và kiệt sức'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc', 'tay-thien'],
    suggestedAiPrompt: 'Tối ưu lại lịch trình du lịch Phú Thọ để không bị mệt và không phải di chuyển quá nhiều trên xe',
    relatedArticleIds: ['15-bi-kip-du-lich-phu-tho-tiet-kiem', 'huong-dan-len-ke-hoach-du-lich-a-z']
  },

  {
    id: 'checklist-hanh-ly-du-lich-phu-tho',
    slug: 'checklist-hanh-ly-du-lich-phu-tho-chuan-bi-gi-cho-tung-kieu-hanh-trinh',
    title: 'Checklist Hành Lý Du Lịch Phú Thọ: Chuẩn Bị Gì Cho Từng Kiểu Hành Trình?',
    subtitle: 'Bảng kiểm chi tiết phân loại theo chuyến đi trong ngày, cuối tuần, có trẻ nhỏ, người cao tuổi hay trekking dã ngoại',
    excerpt: 'Không thừa thãi, không thiếu sót. Danh sách đồ dùng thiết yếu đã được chuẩn hóa giúp bạn đóng gói hành lý nhanh chóng và tự tin lên đường.',
    category: 'tips_hacks',
    categoryLabel: 'Checklist hành lý',
    categoryBadgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
    coverImage: '/images/tay-thien/cover.jpg',
    readingTimeMinutes: 6,
    publishedDate: '02/02/2026',
    lastUpdated: '10/2026',
    editor: 'Ban Biên tập Du lịch Số PHU THO AI TRAVEL',
    targetAudience: 'Người chuẩn bị đồ dùng du lịch cho bản thân và gia đình',
    difficultyLevel: 'Dễ tiếp cận',
    keyTakeaways: [
      'Giày thể thao đế mềm hoặc giày trekking bám đá là món đồ quan trọng số 1 khi đi Đền Hùng hay Tây Thiên.',
      'Khăn ướt, nước rửa tay khô và thuốc chống dị ứng/đau bụng luôn cần có trong túi xách tay.',
      'Đoàn có trẻ nhỏ cần mang dư ít nhất 2 bộ quần áo dự phòng vì trẻ dễ nghịch nước suối hoặc vấy bẩn khi leo đồi.',
      'Đoàn có người cao tuổi cần chuẩn bị gậy chống gấp gọn và thuốc đặc trị tim mạch, huyết áp riêng.'
    ],
    tableOfContents: [
      { id: 'checklist-trong-ngay', title: '1. Hành lý gọn nhẹ cho chuyến đi trong ngày (Day Trip)' },
      { id: 'checklist-cuoi-tuan', title: '2. Hành lý cho chuyến đi 2 ngày 1 đêm (Weekend Trip)' },
      { id: 'checklist-tre-em-nguoi-gia', title: '3. Đồ dùng đặc biệt cho trẻ nhỏ & người cao tuổi' },
      { id: 'checklist-trekking-da-ngoai', title: '4. Đồ dùng chuyên dụng cho trekking rừng Xuân Sơn' }
    ],
    sections: [
      {
        id: 'checklist-trong-ngay',
        title: '1. Hành lý gọn nhẹ cho chuyến đi trong ngày (Day Trip)',
        paragraphs: [
          'Đối với chuyến đi trong ngày (ví dụ: Hà Nội – Đền Hùng hoặc Hà Nội – Thanh Thủy), hãy mang balo nhỏ không quá 3kg gồm:'
        ],
        checklist: [
          'Giấy tờ tùy thân (CCCD, bằng lái xe) và một ít tiền mặt lẻ.',
          '1 bộ trang phục lịch sự, kín đáo phù hợp dâng hương.',
          'Mũ rộng vành, kính râm và kem chống nắng.',
          'Bình nước cá nhân 500ml và khăn tay thấm mồ hôi.',
          'Pin sạc dự phòng dung lượng từ 10.000 mAh trở lên.'
        ]
      },
      {
        id: 'checklist-tre-em-nguoi-gia',
        title: '3. Đồ dùng đặc biệt cho trẻ nhỏ & người cao tuổi',
        paragraphs: [
          'Chăm sóc sức khỏe gia đình đa thế hệ đòi hỏi sự chuẩn bị kỹ lưỡng hơn về y tế và tiện nghi:'
        ],
        checklist: [
          'Hộp y tế cá nhân: Thuốc say xe, thuốc hạ sốt, men tiêu hóa, băng gạc cá nhân, dầu gió.',
          'Gậy leo núi dạng rút gọn hỗ trợ khớp gối cho ông bà khi lên bậc đá.',
          'Bình giữ nhiệt nước ấm pha sữa hoặc uống thuốc.',
          'Áo khoác gió nhẹ cản gió phòng khi thời tiết thay đổi đột ngột lúc chiều muộn.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Gói đồ theo túi zip chuyên dụng chống nước',
        why: 'Vùng đồi núi có thể xuất hiện cơn mưa rào bất chợt; túi zip giữ cho quần áo dự phòng và giấy tờ luôn khô ráo tuyệt đối.',
        howToApply: 'Phân loại đồ lót, thuốc men và đồ điện tử vào các túi zip có khóa kéo.'
      }
    ],
    preTripChecklist: [
      'Cân hành lý trước khi xếp vào cốp xe để không quá tải.',
      'Kiểm tra lại hạn sử dụng các loại thuốc mang theo.',
      'Đảm bảo mỗi thành viên đều có 1 đôi giày thoải mái nhất.'
    ],
    verifiedSources: [
      {
        name: 'Hướng dẫn Chuẩn bị Hành lý & An toàn Du lịch',
        publisher: 'Hiệp hội Lữ hành Việt Nam (VISTA)',
        accessDate: '2026',
        verifiedNote: 'Bảng kiểm an toàn du lịch tiêu chuẩn'
      }
    ],
    relatedDestinationIds: ['den-hung', 'tay-thien', 'tam-dao'],
    suggestedAiPrompt: 'Lập danh sách chuẩn bị đồ dùng chi tiết cho gia đình có con 3 tuổi và bà 70 tuổi đi du lịch Phú Thọ',
    relatedArticleIds: ['cam-nang-du-lich-phu-tho-toan-dien', 'du-lich-phu-tho-cung-gia-dinh']
  },

  // ==========================================
  // NHÓM C — VĂN HÓA, DI SẢN VÀ TRẢI NGHIỆM
  // ==========================================
  {
    id: 'kham-pha-den-hung-tin-nguong-tho-cung',
    slug: 'kham-pha-den-hung-tin-nguong-tho-cung-hung-vuong-tham-quan-co-trach-nhiem',
    title: 'Khám Phá Đền Hùng & Tín Ngưỡng Thờ Cúng Hùng Vương: Cẩm Nang Tham Quan Có Trách Nhiệm',
    subtitle: 'Tìm hiểu giá trị Di sản Văn hóa Phi vật thể Nhân loại, ý nghĩa các tầng đền trên non thiêng Nghĩa Lĩnh và quy tắc ứng xử chuẩn mực',
    excerpt: 'Bài viết chuyên sâu phân tích lịch sử, kiến trúc đền Hạ, đền Trung, đền Thượng, đền Giếng cùng cội nguồn tín ngưỡng thờ cúng tổ tiên chung độc nhất vô nhị của dân tộc Việt Nam.',
    category: 'culture_heritage',
    categoryLabel: 'Di sản & Văn hóa',
    categoryBadgeColor: 'bg-purple-100 text-purple-950 border-purple-300',
    coverImage: '/images/den-hung/den_thuong.jpg',
    readingTimeMinutes: 10,
    publishedDate: '05/02/2026',
    lastUpdated: '10/2026',
    editor: 'Chuyên gia Di sản Văn hóa & Ban Biên tập PHU THO AI TRAVEL',
    targetAudience: 'Du khách hành hương, người yêu văn hóa lịch sử, học sinh sinh viên tìm hiểu cội nguồn',
    difficultyLevel: 'Chuyên sâu',
    keyTakeaways: [
      'Tín ngưỡng thờ cúng Hùng Vương được UNESCO ghi danh là Di sản văn hóa phi vật thể đại diện của nhân loại vào năm 2012.',
      'Cả nước có hơn 1.400 di tích thờ Hùng Vương và các nhân vật thời đại Hùng Vương, trong đó Đền Hùng là trung tâm cội nguồn thiêng liêng nhất.',
      'Trục dâng hương leo núi Nghĩa Lĩnh theo trình tự: Cổng chính -> Đền Hạ & Chùa Thiên Quang -> Đền Trung -> Đền Thượng & Lăng Hùng Vương -> Đền Giếng.',
      'Tham quan có trách nhiệm: Giữ gìn sự tôn nghiêm, không thắp quá nhiều hương, không rải tiền lẻ bừa bãi và bảo vệ từng tán cây cổ thụ.'
    ],
    tableOfContents: [
      { id: 'nguon-goc-y-nghia', title: '1. Nguồn gốc & Giá trị Tín ngưỡng thờ cúng Hùng Vương' },
      { id: 'kien-truc-cac-den', title: '2. Không gian kiến trúc các ngôi đền trên núi Nghĩa Lĩnh' },
      { id: 'y-nghia-lang-hung-vuong', title: '3. Lăng Vua Hùng & Cột đá thề lịch sử' },
      { id: 'quy-tac-ung-xu-van-minh', title: '4. Quy tắc hành hương văn minh & Bảo tồn di sản' }
    ],
    sections: [
      {
        id: 'nguon-goc-y-nghia',
        title: '1. Nguồn gốc & Giá trị Tín ngưỡng thờ cúng Hùng Vương',
        paragraphs: [
          'Trên thế giới, hầu hết các dân tộc chỉ phụng thờ các vị thần linh siêu nhiên hoặc các đấng sáng thế trong tôn giáo hư cấu. Duy nhất dân tộc Việt Nam tôn kính những người có công khai sơn phá thạch dựng nước – các Vua Hùng – như những vị Quốc Tổ chung của toàn thể bách gia trăm họ.',
          'Dù sinh sống ở đồng bằng, miền núi, hải đảo hay kiều bào ở bốn phương trời, người Việt đều tự hào chung một bọc trăm trứng của Mẹ Âu Cơ, mang cùng dòng máu Lạc Hồng và hướng về ngày Giỗ Tổ mùng mười tháng ba.',
          'Ngày 06/12/2012, tại Paris (Pháp), UNESCO đã chính thức công nhận Tín ngưỡng thờ cúng Hùng Vương ở Phú Thọ là Di sản văn hóa phi vật thể đại diện của nhân loại, khẳng định sức sống trường tồn và giá trị nhân văn sâu sắc của đạo lý "Uống nước nhớ nguồn".'
        ]
      },
      {
        id: 'kien-truc-cac-den',
        title: '2. Không gian kiến trúc các ngôi đền trên núi Nghĩa Lĩnh',
        paragraphs: [
          'Quần thể di tích Đền Hùng tọa lạc trên ngọn núi Nghĩa Lĩnh (cao 175m so với mực nước biển) mang thế phong thủy rồng chầu hổ phục, hướng mặt ra ngã ba sông Hạc. Trục đường hành hương trải dài qua các tầng đền trầm mặc:'
        ],
        bulletPoints: [
          {
            heading: 'Cổng chính Đền Hùng (xây dựng năm 1917)',
            detail: 'Cổng tam quan uy nghi với bức đại tự chữ Hán "Cao Sơn Cảnh Hành" (Núi cao đường lớn), dẫn lối vào chân núi rợp bóng thông cổ kính.'
          },
          {
            heading: 'Đền Hạ & Chùa Thiên Quang',
            detail: 'Tương truyền là nơi Mẹ Âu Cơ sinh bọc trăm trứng, khởi nguồn cho hai tiếng thiêng liêng "Đồng bào". Kế bên là Chùa Thiên Quang cổ tự thanh tịnh thời nhà Trần và cây đại hơn 700 năm tuổi.'
          },
          {
            heading: 'Đền Trung (Hùng Vương Vương Cung)',
            detail: 'Nơi các Vua Hùng cùng triều thần bàn việc nước. Nơi đây từng diễn ra cuộc thi tài dâng lễ vật và chàng hoàng tử hiếu thảo Lang Liêu đã dâng hai thứ bánh trời đất: Bánh Chưng và Bánh Giầy.'
          },
          {
            heading: 'Đền Thượng (Kính Thiên Lĩnh Điện)',
            detail: 'Tọa lạc trên đỉnh non Nghĩa Lĩnh, nơi Vua Hùng tiến hành các nghi lễ tế trời đất, Thần Nông cầu mưa thuận gió hòa, quốc thái dân an.'
          },
          {
            heading: 'Đền Giếng (Ánh Nhuận Tỉnh)',
            detail: 'Nép mình dưới chân núi hướng Đông Nam, tương truyền là nơi hai công chúa Tiên Dung và Ngọc Hoa thường soi gương, vấn tóc khi theo vua cha kinh lý.'
          }
        ]
      },
      {
        id: 'quy-tac-ung-xu-van-minh',
        title: '4. Quy tắc hành hương văn minh & Bảo tồn di sản',
        paragraphs: [
          'Hành hương về Đền Hùng là hành trình của lòng thành kính. Ban Quản lý Di tích khuyến nghị du khách tuân thủ nghiêm ngặt các quy tắc văn minh:',
          '• Mỗi du khách chỉ thắp 01 nén hương tại lư hương chung ngoài sân, tuyệt đối không mang bó hương đang cháy vào bên trong nội tự để phòng ngừa nguy cơ hỏa hoạn và ngạt khói.',
          '• Đặt tiền công đức đúng vào các hòm công đức quy định, không rải tiền lẻ lên ban thờ, tượng Phật hay nhét vào khe đá, gốc cây gây mất mỹ quan di tích.',
          '• Tuyệt đối không khắc tên, vẽ bậy lên các phiến đá hoặc thân cây cổ thụ hàng trăm năm tuổi.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Khám phá Đền Lạc Long Quân & Đền Mẫu Âu Cơ trong quần thể',
        why: 'Ngoài núi Nghĩa Lĩnh, quần thể còn có Đền Quốc Tổ Lạc Long Quân trên đồi Sim và Đền Tổ Mẫu Âu Cơ trên núi Ốc Sơn rất bề thế, phong cảnh hữu tình và thanh tịnh hơn.',
        howToApply: 'Sử dụng xe điện di chuyển giữa các khu vực với giá vé niêm yết 20.000 – 40.000 VNĐ/chặng.'
      }
    ],
    preTripChecklist: [
      'Trang phục chỉnh tề, đoan trang (không mặc đồ hở hang, phản cảm).',
      'Đi giày thể thao đế mềm vì quãng đường leo bộ gần 500 bậc đá bậc thang dốc.',
      'Chuẩn bị lễ vật thanh tịnh (hoa quả tươi, bánh chưng bánh giầy), tránh đồ cúng mặn cầu kỳ.'
    ],
    verifiedSources: [
      {
        name: 'Hồ sơ Di sản Tín ngưỡng Thờ cúng Hùng Vương đệ trình UNESCO',
        publisher: 'Bộ Văn hóa, Thể thao và Du lịch Việt Nam',
        accessDate: '2012/2026',
        verifiedNote: 'Văn kiện chính thức được UNESCO công nhận là Di sản đại diện nhân loại'
      },
      {
        name: 'Giới thiệu Chung — Khu Di tích Lịch sử Đền Hùng',
        publisher: 'Ban Quản lý Khu Di tích Lịch sử Quốc gia đặc biệt Đền Hùng',
        url: 'https://dulichphutho.com.vn',
        accessDate: '10/2026',
        verifiedNote: 'Thông tin quy hoạch và nội quy di tích chính thức'
      }
    ],
    relatedDestinationIds: ['den-hung'],
    suggestedAiPrompt: 'Lập lịch trình 1 ngày dâng hương Đền Hùng kết hợp tham quan làng cổ Hùng Lô nghe hát Xoan',
    relatedArticleIds: ['du-lich-van-hoa-phu-tho-di-san-ngoai-quen-thuoc', 'cam-nang-du-lich-phu-tho-toan-dien']
  },

  {
    id: 'du-lich-van-hoa-phu-tho-di-san-ngoai-quen-thuoc',
    slug: 'du-lich-van-hoa-phu-tho-kham-pha-di-san-ngoai-diem-quen-thuoc',
    title: 'Du Lịch Văn Hóa Phú Thọ: Cách Khám Phá Di Sản Ngoài Những Điểm Quen Thuộc',
    subtitle: 'Hành trình vượt ra khỏi khuôn mẫu: Tìm về khúc dân ca Hát Xoan cửa đình, làng cổ Hùng Lô và không gian Tây Thiên Tam Đảo',
    excerpt: 'Khám phá chiều sâu văn hóa bản địa ngoài Đền Hùng: Trải nghiệm Hát Xoan Di sản UNESCO, dạo bước trong ngôi đình 300 năm tuổi và chiêm bái quần thể danh thắng Tây Thiên.',
    category: 'culture_heritage',
    categoryLabel: 'Khám phá di sản',
    categoryBadgeColor: 'bg-purple-100 text-purple-950 border-purple-300',
    coverImage: '/images/den-hung/toan_canh.jpg',
    readingTimeMinutes: 8,
    publishedDate: '10/02/2026',
    lastUpdated: '10/2026',
    editor: 'Chuyên gia Di sản Văn hóa & Ban Biên tập PHU THO AI TRAVEL',
    targetAudience: 'Người say mê văn hóa dân gian, nhiếp ảnh kiến trúc cổ, giáo viên và học sinh',
    difficultyLevel: 'Chuyên sâu',
    keyTakeaways: [
      'Hát Xoan Phú Thọ là loại hình dân ca nghi lễ gắn với tín ngưỡng thờ cúng Thành hoàng và Vua Hùng, được UNESCO vinh danh năm 2017.',
      'Làng cổ Hùng Lô sở hữu quần thể đình làng bằng gỗ lim hơn 300 năm tuổi với nghệ thuật chạm khắc tinh xảo bậc nhất miền Bắc.',
      'Quần thể Tây Thiên – Tam Đảo lưu giữ tín ngưỡng thờ Quốc Mẫu Lăng Thị Tiêu kết hợp cùng trung tâm thiền phái Trúc Lâm Yên Tử.',
      'Du lịch văn hóa cần sự tôn trọng không gian sống của cộng đồng địa phương và bảo tồn nguyên vẹn kiến trúc cổ.'
    ],
    tableOfContents: [
      { id: 'hat-xoan-cua-dinh', title: '1. Hát Xoan Phú Thọ — Khúc hát cửa đình ngàn năm' },
      { id: 'dinh-co-hung-lo', title: '2. Làng cổ & Đình Hùng Lô: Bảo tàng kiến trúc gỗ sống động' },
      { id: 'tay-thien-tam-dao', title: '3. Tây Thiên: Không gian giao thoa giữa Phật và Mẫu' },
      { id: 'phuong-phap-kham-pha', title: '4. Phương pháp xây dựng hành trình chuyên đề văn hóa' }
    ],
    sections: [
      {
        id: 'hat-xoan-cua-dinh',
        title: '1. Hát Xoan Phú Thọ — Khúc hát cửa đình ngàn năm',
        paragraphs: [
          'Hát Xoan (xưa gọi là hát Xuân) là di sản văn hóa phi vật thể độc nhất vô nhị của vùng đất Phú Thọ. Khác với hát quan họ Bắc Ninh giao duyên trên thuyền rồng, Hát Xoan là khúc hát cửa đình mang tính nghi lễ tâm linh trang trọng.',
          'Một canh Xoan trọn vẹn gồm ba chặng: Hát nghi lễ (chúc tụng thần linh), Hát quả cách (ngâm ngợi 14 quả cách răn dạy đạo lý làm người) và Hát hội (giao duyên mộc mạc, xin huê, bỏ bộ tưng bừng).',
          'Năm 2011, Hát Xoan từng bị UNESCO xếp vào danh sách Di sản cần bảo vệ khẩn cấp. Nhờ sự hồi sinh kỳ diệu từ các nghệ nhân bốn phường Xoan cổ (An Thái, Thét, Phù Đức, Kim Đới), đến năm 2017, UNESCO đã chính thức đưa Hát Xoan vào danh sách Di sản đại diện nhân loại.'
        ]
      },
      {
        id: 'dinh-co-hung-lo',
        title: '2. Làng cổ & Đình Hùng Lô: Bảo tàng kiến trúc gỗ sống động',
        paragraphs: [
          'Nằm cách trung tâm TP. Việt Trì khoảng 6 km ven bờ sông Lô, Đình cổ Hùng Lô niên đại hơn 300 năm (khởi dựng từ thời Hậu Lê) là viên ngọc quý của kiến trúc đình làng Bắc Bộ. Toàn bộ vì kèo, bẩy hiên, hoành phi câu đối đều được chạm bong, chạm lộng tinh vi hình tứ linh, hoa sen và cảnh sinh hoạt nông nghiệp.',
          'Đến Hùng Lô, du khách không chỉ được chiêm ngưỡng đình cổ mà còn được nghe các nghệ nhân trình diễn Hát Xoan ngay tại gian tiền tế, thăm các ngôi nhà cổ bằng gỗ lim trăm tuổi và trải nghiệm nghề làm mì gạo truyền thống.'
        ]
      },
      {
        id: 'tay-thien-tam-dao',
        title: '3. Tây Thiên: Không gian giao thoa giữa Phật và Mẫu',
        paragraphs: [
          'Tọa lạc trên sườn núi Thạch Bàn thuộc dãy Tam Đảo, Khu danh thắng Tây Thiên là một phần của Di tích Quốc gia đặc biệt. Điểm độc đáo của Tây Thiên là sự kết hợp nhuần nhuyễn giữa tín ngưỡng thờ Quốc Mẫu Lăng Thị Tiêu (Chính Vương phi của Hùng Chiêu Vương thứ 7) và trung tâm Phật giáo Trúc Lâm cổ kính với Đại Bảo tháp Mandala Kim Cương Thừa rực rỡ sắc màu.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Đăng ký trước với Ban quản lý Đình Hùng Lô để nghe biểu diễn Hát Xoan',
        why: 'Các nghệ nhân phường Xoan không biểu diễn liên tục mà chỉ tổ chức khi có đoàn đăng ký hoặc dịp lễ hội.',
        howToApply: 'Liên hệ qua UBND Xã Hùng Lô hoặc các công ty lữ hành trước chuyến đi ít nhất 2 ngày.'
      }
    ],
    preTripChecklist: [
      'Tìm hiểu sơ lược về 14 quả cách của Hát Xoan để cảm nhận sâu sắc hơn lời ca cổ.',
      'Chuẩn bị máy ảnh ống kính góc rộng nếu muốn chụp kiến trúc điêu khắc đình làng.',
      'Tôn trọng không gian thờ tự, không sờ tay vào các hiện vật gỗ cổ hàng trăm năm tuổi.'
    ],
    verifiedSources: [
      {
        name: 'Hồ sơ Khoa học Di sản Văn hóa Phi vật thể Hát Xoan Phú Thọ',
        publisher: 'Viện Văn hóa Nghệ thuật Quốc gia Việt Nam & Cục Di sản Văn hóa',
        accessDate: '2017/2026',
        verifiedNote: 'Văn kiện khoa học được UNESCO ghi nhận'
      }
    ],
    relatedDestinationIds: ['den-hung', 'tay-thien', 'tam-dao'],
    suggestedAiPrompt: 'Lập hành trình khám phá di sản văn hóa Phú Thọ 2 ngày: dâng hương Đền Hùng, xem hát Xoan Hùng Lô và chiêm bái Tây Thiên',
    relatedArticleIds: ['kham-pha-den-hung-tin-nguong-tho-cung', 'cam-nang-kham-pha-am-thuc-phu-tho']
  },

  // ==========================================
  // NHÓM D — ẨM THỰC VÀ DU LỊCH CỘNG ĐỒNG
  // ==========================================
  {
    id: 'cam-nang-kham-pha-am-thuc-phu-tho',
    slug: 'cam-nang-kham-pha-am-thuc-phu-tho-dac-san-va-cach-thuong-thuc',
    title: 'Cẩm Nang Khám Phá Ẩm Thực Phú Thọ: Tìm Hiểu Đặc Sản, Cách Thưởng Thức & Lưu Ý',
    subtitle: 'Hương vị Đất Tổ chắt lọc từ thổ nhưỡng: Thịt chua Thanh Sơn, canh rau sắn chua, cá lăng sông Đà và bưởi Đoan Hùng',
    excerpt: 'Khám phá thế giới ẩm thực độc đáo của vùng đất ngã ba sông: nguồn gốc xuất xứ, hương vị nguyên bản, cách lựa chọn đúng cơ sở uy tín và lưu ý an toàn thực phẩm.',
    category: 'local_cuisine',
    categoryLabel: 'Ẩm thực & Đặc sản',
    categoryBadgeColor: 'bg-rose-100 text-rose-950 border-rose-300',
    coverImage: '/images/den-hung/cover.jpg',
    readingTimeMinutes: 8,
    publishedDate: '15/02/2026',
    lastUpdated: '10/2026',
    editor: 'Ban Biên tập Ẩm thực Bản địa PHU THO AI TRAVEL',
    targetAudience: 'Người sành ăn, du khách tìm mua quà biếu và các gia đình du lịch',
    difficultyLevel: 'Dễ tiếp cận',
    keyTakeaways: [
      'Thịt chua Thanh Sơn: Đặc sản của đồng bào Mường làm từ thịt lợn lửng lên men bằng thính ngô rang thơm giòn, ăn kèm lá sung và đinh lăng.',
      'Canh rau sắn chua nấu cá suối / móng giò: Món ăn dân dã có vị chua thanh dịu khó quên, gắn liền với ký ức tuổi thơ người Đất Tổ.',
      'Cá lăng, cá ngạnh sông Đà / sông Lô: Thịt chắc ngọt, không xương dăm, chế biến nướng than hoa hoặc nấu lẩu măng chua.',
      'Bánh tai Phú Thọ & Mì gạo Hùng Lô: Thức quà sáng tinh túy từ gạo tẻ dẻo thơm của đồng bãi sông Hồng.'
    ],
    tableOfContents: [
      { id: 'tinh-hoa-am-thuc', title: '1. Tinh hoa ẩm thực cội nguồn Lang Liêu' },
      { id: 'mon-ngon-noi-tieng', title: '2. Bốn đặc sản nhất định phải thử' },
      { id: 'cach-chon-mua-qua', title: '3. Kinh nghiệm chọn mua quà đặc sản chuẩn OCOP' },
      { id: 'luu-y-an-toan-di-ung', title: '4. Lưu ý vệ sinh thực phẩm & Dị ứng' }
    ],
    sections: [
      {
        id: 'tinh-hoa-am-thuc',
        title: '1. Tinh hoa ẩm thực cội nguồn Lang Liêu',
        paragraphs: [
          'Ẩm thực Phú Thọ khởi nguồn từ truyền thuyết Lang Liêu sáng tạo ra Bánh Chưng – Bánh Giầy thời Vua Hùng dựng nước. Nền ẩm thực nơi đây không cầu kỳ hoa mỹ như ẩm thực cung đình Huế, cũng không quá đậm vị như ẩm thực miền Trung, mà mộc mạc, tôn vinh vị ngọt lành tự nhiên của sản vật nông nghiệp và sông ngòi bán sơn địa.'
        ]
      },
      {
        id: 'mon-ngon-noi-tieng',
        title: '2. Bốn đặc sản nhất định phải thử',
        bulletPoints: [
          {
            heading: 'Thịt chua Thanh Sơn',
            detail: 'Món ăn truyền thống của người Mường huyện Thanh Sơn. Thịt lợn tươi thái mỏng trộn cùng thính ngô rang vàng xay mịn, nén chặt trong ống bứa hoặc hộp nhựa có lá ổi lót đáy để lên men tự nhiên. Khi ăn cuộn tròn trong lá sung, lá ổi, chấm tương ớt cay nồng giòn sần sật.'
          },
          {
            heading: 'Canh rau sắn chua',
            detail: 'Những búp rau sắn non được vò kỹ, muối chua trong vại sành như dưa cải. Canh rau sắn nấu với cá suối hoặc móng giò lợn béo ngậy có mùi thơm nồng nàn đặc trưng và vị chua thanh độc nhất vô nhị.'
          },
          {
            heading: 'Cá lăng nướng sông Đà',
            detail: 'Thịt cá lăng vàng ươm, mềm ngọt ướp mẻ nghệ nướng trên vỉ than hoa đỏ rực, ăn kèm bánh tráng cuốn thì là, hành hoa và bún tươi.'
          },
          {
            heading: 'Bánh tai (Bánh Hòn) Phú Thọ',
            detail: 'Làm từ bột gạo tẻ dẻo, nhân thịt lợn băm nhỏ ướp hạt tiêu cay ấm, hấp chín bằng hơi nước. Bánh tai ăn nóng vào buổi sáng mùa đông là trải nghiệm ẩm thực ấm lòng.'
          }
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Kiểm tra tem OCOP và ngày đóng gói khi mua thịt chua',
        why: 'Thịt chua ngon nhất trong vòng 15-30 ngày kể từ ngày đóng gói khi bảo quản ngăn mát tủ lạnh.',
        howToApply: 'Quan sát tem truy xuất nguồn gốc trên nắp hộp và hỏi người bán ngày sản xuất mới nhất.'
      }
    ],
    preTripChecklist: [
      'Mang theo túi giữ nhiệt nhỏ nếu dự định mua cá tươi hoặc thịt chua mang về Hà Nội.',
      'Thông báo trước cho nhà hàng nếu đoàn có thành viên bị dị ứng cá sông hoặc măng chua.'
    ],
    verifiedSources: [
      {
        name: 'Chương trình Mỗi Xã Một Sản Phẩm (OCOP) Tỉnh Phú Thọ',
        publisher: 'Sở Nông nghiệp và Phát triển Nông thôn Phú Thọ',
        url: 'https://phutho.gov.vn',
        accessDate: '2026',
        verifiedNote: 'Danh mục sản phẩm nông nghiệp và đặc sản đạt chứng nhận OCOP 3 sao, 4 sao'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc'],
    suggestedAiPrompt: 'Gợi ý các quán ăn đặc sản cá sông và nhà hàng cơm quê ngon, giá niêm yết chuẩn tại TP. Việt Trì',
    relatedArticleIds: ['15-bi-kip-du-lich-phu-tho-tiet-kiem', 'du-lich-cong-dong-co-trach-nhiem']
  },

  {
    id: 'du-lich-cong-dong-co-trach-nhiem',
    slug: 'du-lich-cong-dong-co-trach-nhiem-trai-nghiem-va-dong-gop-kinh-te-ban-dia',
    title: 'Du Lịch Cộng Đồng Có Trách Nhiệm: Trải Nghiệm Bản Địa & Đóng Góp Sinh Kế',
    subtitle: 'Tôn trọng không gian sống của đồng bào Mường, Dao Tiền tại Xuân Sơn và Long Cốc: Nguyên tắc văn hóa, bảo vệ rừng và tiêu dùng bền vững',
    excerpt: 'Làm thế nào để chuyến đi của bạn mang lại niềm vui cho bản thân đồng thời trực tiếp hỗ trợ sinh kế cho các hộ gia đình dân tộc thiểu số mà không làm tổn hại đến bản sắc truyền thống.',
    category: 'green_sustainable',
    categoryLabel: 'Du lịch xanh & Cộng đồng',
    categoryBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    coverImage: '/images/long-coc/cover.jpg',
    readingTimeMinutes: 7,
    publishedDate: '20/02/2026',
    lastUpdated: '10/2026',
    editor: 'Chuyên gia Phát triển Bền vững & PHU THO AI TRAVEL',
    targetAudience: 'Du khách yêu thiên nhiên, các đoàn trường học, tổ chức dã ngoại sinh thái',
    difficultyLevel: 'Dễ tiếp cận',
    keyTakeaways: [
      'Ưu tiên lưu trú tại homestay nhà sàn do chính người Mường, người Dao làm chủ để dòng tiền trực tiếp hỗ trợ kinh tế bản làng.',
      'Tôn trọng phong tục tập quán: Xin phép trước khi chụp ảnh người già và trẻ em; không tự ý bước vào gian thờ riêng trên nhà sàn.',
      'Ủng hộ các sản phẩm thủ công thổ cẩm thêu tay và chè búp tím truyền thống có xuất xứ rõ ràng.',
      'Nguyên tắc "Không để lại gì ngoài những dấu chân, không lấy đi gì ngoài những bức ảnh đẹp".'
    ],
    tableOfContents: [
      { id: 'khai-niem-du-lich-trach-nhiem', title: '1. Thế nào là du lịch cộng đồng có trách nhiệm?' },
      { id: 'quy-tac-ung-xu-ban-lang', title: '2. Quy tắc ứng xử khi đến bản làng Mường, Dao' },
      { id: 'tieu-dung-xanh-dia-phuong', title: '3. Cách tiêu dùng thông minh hỗ trợ người dân' },
      { id: 'bao-ve-moi-truong-rung', title: '4. Cam kết bảo vệ cảnh quan & Giảm rác thải' }
    ],
    sections: [
      {
        id: 'khai-niem-du-lich-trach-nhiem',
        title: '1. Thế nào là du lịch cộng đồng có trách nhiệm?',
        paragraphs: [
          'Du lịch cộng đồng (Community-Based Tourism - CBT) tại các bản làng như Bản Dù, Bản Lấp (VQG Xuân Sơn) hay xóm Măng (Long Cốc) không đơn thuần là dịch vụ nghỉ dưỡng giá rẻ. Đó là cơ hội để du khách trải nghiệm nếp sống thuần hậu, hòa mình vào không gian nhà sàn truyền thống, thưởng thức những sản vật tự nhiên được nuôi trồng bền vững.',
          'Có trách nhiệm nghĩa là chúng ta nhận thức được rằng mỗi hành động của mình đều tác động đến môi trường tự nhiên và văn hóa nơi đây.'
        ]
      },
      {
        id: 'quy-tac-ung-xu-ban-lang',
        title: '2. Quy tắc ứng xử khi đến bản làng Mường, Dao',
        paragraphs: [
          'Khi ghé thăm nhà sàn của bà con đồng bào dân tộc thiểu số, hãy lưu ý một số phong tục:',
          '• Gian thờ tổ tiên trên nhà sàn là chốn linh thiêng nhất, du khách không nên tự ý bước vào hoặc chạm tay vào đồ thờ cúng.',
          '• Luôn mỉm cười và chào hỏi lịch sự; xin phép trước khi chụp ảnh chân dung cận cảnh của các bà, các mẹ đang ngồi dệt vải.',
          '• Không phát kẹo bánh bừa bãi cho trẻ em trong bản vì dễ hình thành thói quen vòi vĩnh và ảnh hưởng sức khỏe răng miệng của các em.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Đặt ăn tại homestay bằng các món nguyên liệu địa phương',
        why: 'Vừa được thưởng thức rau rừng, gà thả đồi tươi ngon nhất, vừa giúp gia đình chủ nhà có nguồn thu từ nông sản tự sản xuất.',
        howToApply: 'Báo trước với chủ homestay thực đơn trước khi đến ít nhất 3 tiếng.'
      }
    ],
    preTripChecklist: [
      'Mang theo túi vải hoặc túi tái sử dụng để đựng đồ khi mua sắm đặc sản.',
      'Chuẩn bị túi đựng rác cá nhân để mang rác thải nhựa về lại thùng rác trung tâm.',
      'Ăn mặc trang phục kín đáo khi đi dạo quanh các trục đường làng bản.'
    ],
    verifiedSources: [
      {
        name: 'Bộ Quy tắc Ứng xử Du lịch Văn minh',
        publisher: 'Cục Du lịch Quốc gia Việt Nam',
        accessDate: '2026',
        verifiedNote: 'Quy chuẩn ứng xử quốc gia về bảo tồn di sản và văn hóa bản địa'
      }
    ],
    relatedDestinationIds: ['doi-che-long-coc'],
    suggestedAiPrompt: 'Lập lịch trình 2 ngày 1 đêm trải nghiệm du lịch cộng đồng tại bản Mường Long Cốc và VQG Xuân Sơn',
    relatedArticleIds: ['cam-nang-kham-pha-am-thuc-phu-tho', 'du-lich-ben-vung-phu-tho']
  },

  // ==========================================
  // NHÓM E — LỊCH TRÌNH VÀ HƯỚNG DẪN THEO ĐỐI TƯỢNG
  // ==========================================
  {
    id: 'goi-y-hanh-trinh-1-ngay-va-2-ngay-1-dem',
    slug: 'goi-y-hanh-trinh-kham-pha-phu-tho-1-ngay-va-2-ngay-1-dem',
    title: 'Gợi Ý Hành Trình Khám Phá Phú Thọ Trong 1 Ngày & 2 Ngày 1 Đêm',
    subtitle: 'Các phương án lộ trình khả thi, kiểm chứng thực tế: Cội nguồn Đất Tổ, Nghỉ dưỡng khoáng nóng và Săn mây đồi chè',
    excerpt: 'Ba phương án lịch trình mẫu chi tiết đến từng khung giờ, cự ly di chuyển, điểm ăn uống và chi phí ước tính, giúp bạn dễ dàng áp dụng hoặc điều chỉnh bằng AI.',
    category: 'itineraries',
    categoryLabel: 'Lịch trình mẫu',
    categoryBadgeColor: 'bg-sky-100 text-sky-950 border-sky-300',
    coverImage: '/images/den-hung/cover.jpg',
    readingTimeMinutes: 9,
    publishedDate: '25/02/2026',
    lastUpdated: '10/2026',
    editor: 'Đội ngũ Thiết kế Tour PHU THO AI TRAVEL',
    targetAudience: 'Người tìm kiếm lịch trình có sẵn để áp dụng ngay',
    difficultyLevel: 'Dễ tiếp cận',
    keyTakeaways: [
      'Phương án 1 (1 Ngày): Hà Nội -> Đền Hùng -> Làng cổ Hùng Lô -> Thưởng thức Hát Xoan -> Hà Nội (Lịch trình văn hóa hoàn hảo).',
      'Phương án 2 (2 Ngày 1 Đêm Di sản & Nghỉ dưỡng): Đền Hùng -> Tây Thiên Tam Đảo -> Nghỉ đêm Tam Đảo hoặc Thanh Thủy (Thư giãn, phục hồi sức khỏe).',
      'Phương án 3 (2 Ngày 1 Đêm Sinh thái): Hà Nội -> Suối khoáng Thanh Thủy -> Homestay Đồi chè Long Cốc -> Đón bình minh mây ngàn -> Hà Nội.',
      'Tất cả phương án đều có thời gian đệm, không nhồi nhét điểm đến xa xôi.'
    ],
    tableOfContents: [
      { id: 'phuong-an-1-ngay', title: '1. Phương án A: 1 Ngày "Về miền Đất Tổ Hùng Vương"' },
      { id: 'phuong-an-2n1d-disan', title: '2. Phương án B: 2N1Đ "Di sản Cội nguồn & Non thiêng Tây Thiên"' },
      { id: 'phuong-an-2n1d-sinhthai', title: '3. Phương án C: 2N1Đ "Bình minh Đồi chè & Khoáng nóng Thanh Thủy"' },
      { id: 'cach-ca-nhan-hoa-ai', title: '4. Cách đưa lịch trình mẫu vào AI để tùy biến' }
    ],
    sections: [
      {
        id: 'phuong-an-1-ngay',
        title: '1. Phương án A: 1 Ngày "Về miền Đất Tổ Hùng Vương"',
        paragraphs: [
          'Dành cho du khách có quỹ thời gian hạn chế vào cuối tuần, tập trung trọn vẹn vào cội nguồn lịch sử dân tộc:'
        ],
        bulletPoints: [
          {
            heading: '07:00 – 08:15',
            detail: 'Khởi hành từ Hà Nội theo cao tốc CT05 (Nội Bài - Lào Cai), ra tại Nút giao IC7 đến thẳng cổng Khu di tích lịch sử Đền Hùng.'
          },
          {
            heading: '08:30 – 11:30',
            detail: 'Hành hương dâng hương qua Cổng chính, Đền Hạ, Chùa Thiên Quang, Đền Trung, Đền Thượng và Lăng Hùng Vương trên đỉnh núi Nghĩa Lĩnh. Chiêm bái Đền Giếng dưới chân núi.'
          },
          {
            heading: '11:45 – 13:30',
            detail: 'Ăn trưa tại nhà hàng đặc sản gần Đền Hùng: Thưởng thức cá sông Lô, gà đồi nướng lá chanh, cơm lam, thịt chua Thanh Sơn.'
          },
          {
            heading: '14:00 – 16:00',
            detail: 'Di chuyển 6 km về Làng cổ Hùng Lô. Thăm ngôi đình cổ 300 năm tuổi, nghe các nghệ nhân trình diễn Hát Xoan cửa đình và trải nghiệm làm mì gạo truyền thống.'
          },
          {
            heading: '16:30 – 17:45',
            detail: 'Lên xe trở về Hà Nội theo đường cao tốc, kết thúc một ngày ý nghĩa.'
          }
        ]
      },
      {
        id: 'phuong-an-2n1d-sinhthai',
        title: '3. Phương án C: 2N1Đ "Bình minh Đồi chè & Khoáng nóng Thanh Thủy"',
        paragraphs: [
          'Hành trình sinh thái kết hợp thư giãn chăm sóc sức khỏe rất được các gia đình trẻ và nhóm bạn yêu thích:'
        ],
        bulletPoints: [
          {
            heading: 'Ngày 1 (Thanh Thủy -> Long Cốc)',
            detail: 'Sáng xuất phát theo QL32 qua Sơn Tây đến Suối khoáng nóng Thanh Thủy. Tắm khoáng Onsen, ăn trưa cá sông Đà và dê núi. Chiều di chuyển 48 km lên Đồi chè Long Cốc. Nhận phòng homestay nhà sàn, ngắm hoàng hôn buông xuống các ốc đảo chè. Tối giao lưu ẩm thực người Mường.'
          },
          {
            heading: 'Ngày 2 (Săn mây Long Cốc -> Trở về)',
            detail: '5:30 sáng dậy đón bình minh và săn biển mây trên đỉnh đồi chè Đội 3 hoặc Đội 5. Thưởng thức tách trà ấm nóng. 9:00 mua đặc sản chè búp tím và thịt chua rồi thong thả trở về Hà Nội.'
          }
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Nhấn nút "Tạo lịch trình từ cẩm nang này"',
        why: 'Hệ thống AI Travel Planner của website sẽ tự động nạp các điểm dừng chân trong bài viết này vào biểu mẫu và tính toán thời gian chuẩn xác theo ngày bạn chọn.',
        howToApply: 'Bấm nút CTA ở cuối bài viết để mở ngay màn hình lập kế hoạch thông minh.'
      }
    ],
    preTripChecklist: [
      'Xác nhận số lượng người lớn và trẻ em để điều chỉnh loại phương tiện phù hợp.',
      'Gọi điện đặt bàn ăn trưa trước nếu đi đoàn đông trên 8 người.',
      'Chuẩn bị danh sách nhạc thư giãn trên xe ô tô cho chuyến đi dài.'
    ],
    verifiedSources: [
      {
        name: 'Dữ liệu Hành trình & Cự ly Thực địa Phú Thọ',
        publisher: 'Bộ dữ liệu Tri thức Geo-Routing PHU THO AI TRAVEL',
        accessDate: '10/2026',
        verifiedNote: 'Đã kiểm thử thời gian chạy thực tế theo các khung giờ khác nhau'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc', 'tay-thien', 'tam-dao', 'ho-dai-lai'],
    suggestedAiPrompt: 'Tạo lịch trình 2 ngày 1 đêm khám phá Đền Hùng và Tây Thiên Tam Đảo khởi hành từ sáng thứ 7',
    relatedArticleIds: ['cam-nang-du-lich-phu-tho-toan-dien', 'du-lich-phu-tho-cung-gia-dinh']
  },

  {
    id: 'du-lich-phu-tho-cung-gia-dinh',
    slug: 'du-lich-phu-tho-cung-gia-dinh-kinh-nghiem-cho-tre-nho-nguoi-cao-tuoi',
    title: 'Du Lịch Phú Thọ Cùng Gia Đình: Kinh Nghiệm Lựa Chọn Hoạt Động Cho Trẻ Nhỏ & Người Cao Tuổi',
    subtitle: 'Cân bằng nhu cầu đa thế hệ: Giải pháp di chuyển nhẹ nhàng, thực đơn dinh dưỡng và lưu ý an toàn sức khỏe',
    excerpt: 'Làm thế nào để ông bà được tĩnh tâm dâng hương, con trẻ được vận động khám phá thiên nhiên mà cha mẹ không bị quá tải stress? Bí quyết tổ chức tour gia đình hoàn hảo tại Phú Thọ.',
    category: 'family',
    categoryLabel: 'Du lịch gia đình',
    categoryBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    coverImage: '/images/dai-lai/cover.jpg',
    readingTimeMinutes: 8,
    publishedDate: '01/03/2026',
    lastUpdated: '10/2026',
    editor: 'Chuyên gia Tâm lý & Du lịch Gia đình PHU THO AI TRAVEL',
    targetAudience: 'Các gia đình 3 thế hệ (ông bà, cha mẹ, con nhỏ)',
    difficultyLevel: 'Cần chuẩn bị',
    keyTakeaways: [
      'Lựa chọn các điểm đến có xe điện hỗ trợ di chuyển (Đền Hùng, Tây Thiên) để giảm tải cho khớp gối của ông bà.',
      'Chọn các khu nghỉ dưỡng có không gian hồ nước và cây xanh (Hồ Đại Lải, Thanh Thủy) với đầy đủ tiện ích vui chơi an toàn cho trẻ em.',
      'Thời gian di chuyển trên xe giữa mỗi chặng không nên quá 60 phút để tránh say xe và mệt mỏi.',
      'Thực đơn bữa ăn cần có món mềm, thanh nhạt cho người già và các món giàu năng lượng cho trẻ nhỏ.'
    ],
    tableOfContents: [
      { id: 'tam-ly-da-the-he', title: '1. Thấu hiểu nhu cầu của từng thế hệ' },
      { id: 'tieu-chi-chon-diem-den', title: '2. Tiêu chí chọn điểm đến thân thiện với gia đình' },
      { id: 'giai-phap-di-chuyen', title: '3. Giải pháp di chuyển & Nghỉ chân thông minh' },
      { id: 'cham-soc-suc-khoe', title: '4. Y tế dự phòng & Xử lý thời tiết' }
    ],
    sections: [
      {
        id: 'tam-ly-da-the-he',
        title: '1. Thấu hiểu nhu cầu của từng thế hệ',
        paragraphs: [
          'Chuyến du lịch gia đình đa thế hệ thường dễ xảy ra xung đột nếu không dung hòa được mong muốn:',
          '• Người cao tuổi: Mong muốn sự trang nghiêm, hoài niệm, tìm về cội nguồn tâm linh, thích không gian tĩnh mịch và nhịp điệu thong thả.',
          '• Trẻ nhỏ: Thừa năng lượng, hiếu động, thích chạy nhảy, gần gũi với động vật và mặt nước, nhanh chán nếu phải nghe thuyết minh dài dòng.',
          '• Cha mẹ: Đóng vai trò cầu nối, mong muốn cả nhà gắn kết ấm cúng và an toàn tuyệt đối.'
        ]
      },
      {
        id: 'tieu-chi-chon-diem-den',
        title: '2. Tiêu chí chọn điểm đến thân thiện với gia đình',
        paragraphs: [
          'Tại Phú Thọ, những điểm đến sau đáp ứng tốt nhất tiêu chí gia đình:',
          '• Khu Di tích Đền Hùng: Hệ thống xe điện đưa đón từ bãi xe đến tận chân núi và khu đền Giếng, đền Lạc Long Quân; rừng cây cổ thụ râm mát.',
          '• Khu khoáng nóng Thanh Thủy: Hồ bơi khoáng ấm trong nhà an toàn cho trẻ em vùng vẫy, bồn ngâm thảo dược hỗ trợ xương khớp cho ông bà.',
          '• Hồ Đại Lải: Bãi cỏ rộng lớn ven hồ rất thích hợp dã ngoại picnic, cắm trại glamping và chèo thuyền đạp vịt nhẹ nhàng.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Sử dụng xe đẩy trẻ em loại gấp gọn nhẹ',
        why: 'Các lối đi quanh bảo tàng Hùng Vương, bờ hồ Đại Lải và sân đền đều lát đá phẳng, xe đẩy giúp bé ngủ trưa thoải mái khi cả nhà đang tham quan.',
        howToApply: 'Chuẩn bị xe đẩy du lịch gập 1 chạm để cất gọn vào cốp xe ô tô.'
      }
    ],
    preTripChecklist: [
      'Mang đủ bình sữa, tã lót và đồ ăn dặm quen thuộc cho bé.',
      'Kiểm tra thuốc điều trị mãn tính của ông bà (tiểu đường, huyết áp).',
      'Đem theo quạt cầm tay sạc pin cho những ngày nắng ấm.'
    ],
    verifiedSources: [
      {
        name: 'Cẩm nang Du lịch Gia đình & Sức khỏe Người cao tuổi',
        publisher: 'Hội đồng Y học Du lịch Quốc gia',
        accessDate: '2026',
        verifiedNote: 'Hướng dẫn an toàn sức khỏe lữ hành đa thế hệ'
      }
    ],
    relatedDestinationIds: ['den-hung', 'ho-dai-lai'],
    suggestedAiPrompt: 'Thiết kế hành trình nghỉ dưỡng Phú Thọ 2 ngày 1 đêm nhẹ nhàng cho gia đình có người cao tuổi 75 tuổi và 2 em bé',
    relatedArticleIds: ['checklist-hanh-ly-du-lich-phu-tho', 'cam-nang-du-lich-phu-tho-toan-dien']
  },

  // ==========================================
  // NHÓM F — DỰ ÁN VÀ ĐỔI MỚI DU LỊCH
  // ==========================================
  {
    id: 'du-lich-thong-minh-phu-tho-vai-tro-du-lieu-va-ai',
    slug: 'du-lich-thong-minh-phu-tho-vai-tro-du-lieu-so-va-tri-tue-nhan-tao',
    title: 'Du Lịch Thông Minh Phú Thọ: Vai Trò Của Dữ Liệu Số & Trí Tuệ Nhân Tạo',
    subtitle: 'Nghiên cứu ứng dụng công nghệ trong quản lý điểm đến, cá nhân hóa trải nghiệm và giải quyết bài toán thông tin ảo giác',
    excerpt: 'Bài viết học thuật và phân tích thực tiễn: Khái niệm Smart Tourism, tầm quan trọng của dữ liệu địa lý GIS đã kiểm chứng và cách AI thế hệ mới giải quyết vấn đề của du lịch truyền thống.',
    category: 'smart_tourism',
    categoryLabel: 'Du lịch thông minh & AI',
    categoryBadgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    coverImage: '/images/den-hung/bao_tang.jpg',
    readingTimeMinutes: 9,
    publishedDate: '05/03/2026',
    lastUpdated: '10/2026',
    editor: 'Nhóm Nghiên cứu KHKT PHU THO AI TRAVEL',
    targetAudience: 'Giám khảo KHKT, sinh viên công nghệ, chuyên gia du lịch và người quan tâm đổi mới sáng tạo',
    difficultyLevel: 'Chuyên sâu',
    keyTakeaways: [
      'Du lịch thông minh không chỉ là lập một website đẹp, mà là hệ sinh thái kết nối dữ liệu địa điểm, định tuyến GIS và phân tích nhu cầu du khách.',
      'Vấn đề lớn nhất của các mô hình AI ngôn ngữ lớn (LLM) hiện nay là "ảo giác" (hallucination) — tự bịa địa danh, giá vé và giờ mở cửa.',
      'Giải pháp cốt lõi của PHU THO AI TRAVEL: Ứng dụng kỹ thuật RAG (Retrieval-Augmented Generation) dựa trên cơ sở tri thức đã kiểm chứng thực địa.',
      'Bảo vệ dữ liệu cá nhân du khách và quyền riêng tư là nguyên tắc đạo đức công nghệ bắt buộc.'
    ],
    tableOfContents: [
      { id: 'khai-niem-smart-tourism', title: '1. Bản chất của Du lịch Thông minh (Smart Tourism)' },
      { id: 'thach-thuc-ai-ao-giac', title: '2. Thách thức "ảo giác" của trí tuệ nhân tạo' },
      { id: 'kien-truc-du-lieu-xac-thuc', title: '3. Kiến trúc dữ liệu địa lý xác thực tại Phú Thọ' },
      { id: 'dao-duc-bao-mat', title: '4. Đạo đức dữ liệu & Tương lai du lịch số' }
    ],
    sections: [
      {
        id: 'khai-niem-smart-tourism',
        title: '1. Bản chất của Du lịch Thông minh (Smart Tourism)',
        paragraphs: [
          'Theo Tổ chức Du lịch Thế giới (UNWTO), Du lịch thông minh là sự tích hợp sâu rộng của công nghệ thông tin và truyền thông (ICT) vào toàn bộ chuỗi giá trị du lịch, nhằm nâng cao trải nghiệm của du khách, tối ưu hóa công tác quản trị điểm đến và thúc đẩy phát triển bền vững.',
          'Tại một địa bàn giàu tiềm năng di sản như Phú Thọ, du lịch thông minh phải giải quyết được bài toán liên kết: giúp du khách không chỉ dừng chân ở Đền Hùng mà còn dễ dàng khám phá hệ sinh thái đồi chè Long Cốc, khoáng nóng Thanh Thủy và VQG Xuân Sơn thông qua công cụ điều hướng trực quan.'
        ]
      },
      {
        id: 'thach-thuc-ai-ao-giac',
        title: '2. Thách thức "ảo giác" của trí tuệ nhân tạo',
        paragraphs: [
          'Khi người dùng hỏi các chatbot phổ thông trên thị trường về lịch trình Phú Thọ, mô hình AI thường có xu hướng "bịa đặt" thuyết phục các khách sạn không tồn tại, trích dẫn giá vé sai lệch hàng chục lần hoặc ghép những địa điểm cách nhau 150 km vào cùng một buổi chiều.',
          'Điều này gây nguy cơ nghiêm trọng cho du khách thực tế. Do đó, hệ thống PHU THO AI TRAVEL áp dụng nguyên tắc kiểm soát chặt chẽ: AI chỉ được phép lập kế hoạch dựa trên tập dữ liệu địa điểm, giá vé và ma trận cự ly đã được Ban Biên tập xác thực và cập nhật định kỳ.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Cách phân biệt thông tin chính thức và gợi ý từ AI',
        why: 'Mọi thông tin về giá vé, giờ mở cửa trên website đều có nhãn xác minh nguồn gốc rõ ràng, trong khi lộ trình di chuyển là thuật toán gợi ý tối ưu.',
        howToApply: 'Du khách luôn kiểm tra biểu tượng xác minh tích xanh trên từng thẻ địa điểm trước khi đặt cọc dịch vụ.'
      }
    ],
    preTripChecklist: [
      'Cập nhật ứng dụng web lên phiên bản mới nhất.',
      'Cho phép chia sẻ vị trí trình duyệt để bản đồ hiển thị hướng dẫn đường đi chính xác từ điểm xuất phát của bạn.'
    ],
    verifiedSources: [
      {
        name: 'Khung Kiến trúc Du lịch Thông minh Quốc gia',
        publisher: 'Bộ Thông tin & Truyền thông phối hợp Bộ Văn hóa, Thể thao và Du lịch',
        accessDate: '2025/2026',
        verifiedNote: 'Tiêu chuẩn quốc gia về số hóa du lịch và bảo mật dữ liệu người dùng'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc', 'tay-thien'],
    suggestedAiPrompt: 'Lập lịch trình thông minh tối ưu thời gian di chuyển giữa các điểm đến tại Phú Thọ',
    relatedArticleIds: ['dinh-huong-xay-dung-tro-ly-hanh-trinh-phu-tho-ai-travel', 'du-lich-ben-vung-phu-tho']
  },

  {
    id: 'dinh-huong-xay-dung-tro-ly-hanh-trinh-phu-tho-ai-travel',
    slug: 'phu-tho-ai-travel-dinh-huong-xay-dung-tro-ly-hanh-trinh-thich-ung',
    title: 'PHU THO AI TRAVEL: Định Hướng Xây Dựng Trợ Lý Hành Trình Có Khả Năng Thích Ứng',
    subtitle: 'Hồ sơ nghiên cứu khoa học kỹ thuật: Từ bài toán thực tiễn của du khách Đất Tổ đến giải pháp phần mềm thông minh',
    excerpt: 'Báo cáo chi tiết về phương pháp luận, kiến trúc hệ thống, quy trình kiểm thử thực tế và lộ trình phát triển của sản phẩm công nghệ du lịch do nhóm học sinh Phú Thọ sáng tạo.',
    category: 'smart_tourism',
    categoryLabel: 'Dự án KHKT',
    categoryBadgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    coverImage: '/images/den-hung/toan_canh.jpg',
    readingTimeMinutes: 10,
    publishedDate: '10/03/2026',
    lastUpdated: '10/2026',
    editor: 'Nhóm Tác giả Dự án KHKT PHU THO AI TRAVEL',
    targetAudience: 'Hội đồng Giám khảo Cuộc thi KHKT, các thầy cô hướng dẫn và cộng đồng công nghệ',
    difficultyLevel: 'Chuyên sâu',
    keyTakeaways: [
      'Tính cấp thiết: Giải quyết bài toán thông tin du lịch Đất Tổ bị phân tán và hiện tượng quá tải cục bộ tại Đền Hùng.',
      'Tính mới: Kết hợp giữa bản đồ số Leaflet mở, mô hình Gemini AI thế hệ mới và cơ sở dữ liệu kiểm chứng không phụ thuộc API trả phí đắt đỏ.',
      'Tính khả thi: Nền tảng web hiện đại chạy mượt mà trên cả máy tính và điện thoại thông minh với chi phí vận hành tinh gọn.',
      'Phân định minh bạch giữa tính năng đã hoàn thiện (MVP), tính năng đang thử nghiệm và định hướng mở rộng tương lai.'
    ],
    tableOfContents: [
      { id: 'ly-do-chon-de-tai', title: '1. Tính cấp thiết & Mục tiêu nghiên cứu đề tài' },
      { id: 'phuong-phap-nghien-cuu', title: '2. Phương pháp nghiên cứu & Thu thập dữ liệu thực địa' },
      { id: 'kien-truc-he-thong', title: '3. Kiến trúc phần mềm & Công nghệ ứng dụng' },
      { id: 'ket-qua-kiem-thu', title: '4. Kết quả kiểm thử thực tế & Khảo sát người dùng' },
      { id: 'han-che-va-huong-phat-trien', title: '5. Các giới hạn hiện tại & Hướng phát triển tiếp theo' }
    ],
    sections: [
      {
        id: 'ly-do-chon-de-tai',
        title: '1. Tính cấp thiết & Mục tiêu nghiên cứu đề tài',
        paragraphs: [
          'Sinh ra và lớn lên trên quê hương Đất Tổ, nhóm tác giả luôn trăn trở trước thực tế: Mỗi năm có hàng triệu đồng bào hành hương về Đền Hùng vào tháng 3 âm lịch, nhưng chỉ có một tỷ lệ rất nhỏ du khách tiếp tục hành trình khám phá vẻ đẹp đồi chè Long Cốc, rừng nguyên sinh Xuân Sơn hay tắm khoáng nóng Thanh Thủy.',
          'Nguyên nhân cốt lõi không phải vì Phú Thọ thiếu danh lam thắng cảnh, mà vì thiếu một công cụ số tập trung, thông minh và đáng tin cậy giúp du khách hình dung và kết nối các điểm đến.',
          'Đề tài nghiên cứu hướng đến việc phát triển một trợ lý du lịch số cá nhân hóa, có khả năng lắng nghe nhu cầu tự nhiên của du khách để kiến tạo một hành trình du lịch tối ưu, thực tế và minh bạch.'
        ]
      },
      {
        id: 'kien-truc-he-thong',
        title: '3. Kiến trúc phần mềm & Công nghệ ứng dụng',
        paragraphs: [
          'Hệ thống được thiết kế theo kiến trúc Micro-Frontend hiện đại với 4 phân hệ chính:',
          '1. Phân hệ Bản đồ Tương tác Đa lớp: Xây dựng trên nền tảng Leaflet Engine, hỗ trợ chuyển đổi linh hoạt giữa bản đồ đường phố OpenStreetMap, ảnh vệ tinh Esri World Imagery và bản đồ địa hình OpenTopoMap, hiển thị trạm dừng và đường vẽ lộ trình polyline thông minh.',
          '2. Phân hệ Lập Kế hoạch AI: Ứng dụng @google/genai SDK kết hợp kỹ thuật prompt engineering với ràng buộc dữ liệu nghiêm ngặt để triệt tiêu hiện tượng ảo giác thông tin.',
          '3. Phân hệ Đồng bộ Đám mây: Lưu trữ an toàn ghi chú, danh sách yêu thích và kế hoạch chuyến đi của người dùng qua tài khoản Google.',
          '4. Phân hệ Cẩm nang & Tri thức Di sản: Tạp chí du lịch số chuẩn SEO, cung cấp nội dung có kiểm chứng khoa học.'
        ]
      },
      {
        id: 'han-che-va-huong-phat-trien',
        title: '5. Các giới hạn hiện tại & Hướng phát triển tiếp theo',
        paragraphs: [
          'Để đảm bảo tính trung thực khoa học, nhóm tác giả thẳng thắn chỉ ra các giới hạn hiện tại của sản phẩm:',
          '• Hệ thống chưa kết nối dữ liệu tình trạng giao thông thời gian thực (như Google Traffic API do chính sách chi phí), mà dựa trên cự ly chuẩn và vận tốc trung bình thực nghiệm trên từng loại đường.',
          '• Số lượng địa điểm hiện tại tập trung vào 6 trọng điểm du lịch tiêu biểu nhất của tỉnh, chưa bao quát toàn bộ hàng trăm di tích cấp huyện xã.',
          '• Hướng phát triển tiếp theo: Phát triển ứng dụng ngoại tuyến PWA để du khách sử dụng tốt ngay cả khi mất sóng trên đỉnh núi cao, và bổ sung giao diện đa ngôn ngữ phục vụ khách quốc tế.'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Khám phá mã nguồn mở và đóng góp phản hồi cho dự án',
        why: 'Sản phẩm không ngừng hoàn thiện nhờ các ý kiến đóng góp từ du khách thực tế và các thầy cô trong hội đồng khoa học.',
        howToApply: 'Sử dụng nút Đóng góp ý kiến hoặc liên hệ qua biểu mẫu Hợp tác trên website.'
      }
    ],
    preTripChecklist: [
      'Trải nghiệm tính năng AI Travel Planner trên cả máy tính và điện thoại.',
      'Thử nghiệm xuất bản kế hoạch chuyến đi ra file hoặc in ấn cầm tay.'
    ],
    verifiedSources: [
      {
        name: 'Hồ sơ Thuyết minh Đề tài Nghiên cứu KHKT Cấp Tỉnh',
        publisher: 'Nhóm Nghiên cứu PHU THO AI TRAVEL',
        accessDate: '2026',
        verifiedNote: 'Bản quyền báo cáo kỹ thuật và mô hình thử nghiệm MVP'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc', 'tay-thien', 'tam-dao', 'ho-dai-lai'],
    suggestedAiPrompt: 'Lập lịch trình mẫu thử nghiệm tính năng AI Travel Planner cho đoàn 10 người tham quan toàn diện Phú Thọ',
    relatedArticleIds: ['du-lich-thong-minh-phu-tho-vai-tro-du-lieu-va-ai', 'du-lich-ben-vung-phu-tho']
  },

  {
    id: 'du-lich-ben-vung-phu-tho',
    slug: 'du-lich-ben-vung-tai-phu-tho-giai-phap-hai-hoa-trai-nghiem-va-bao-ton',
    title: 'Du Lịch Bền Vững Tại Phú Thọ: Giải Pháp Hài Hòa Giữa Trải Nghiệm & Bảo Tồn',
    subtitle: 'Bảo vệ giá trị di sản Đất Tổ trước sức ép quá tải: Giảm thiểu rác thải nhựa, tôn trọng hệ sinh thái và tiêu dùng có đạo đức',
    excerpt: 'Làm thế nào để phát triển du lịch trở thành động lực bảo tồn di sản thay vì làm mai một tài nguyên thiên nhiên? Những hành động thiết thực dành cho du khách và cộng đồng.',
    category: 'green_sustainable',
    categoryLabel: 'Du lịch bền vững',
    categoryBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    coverImage: '/images/long-coc/cover.jpg',
    readingTimeMinutes: 7,
    publishedDate: '15/03/2026',
    lastUpdated: '10/2026',
    editor: 'Chuyên gia Môi trường & PHU THO AI TRAVEL',
    targetAudience: 'Du khách có ý thức sinh thái, các tổ chức giáo dục, câu lạc bộ thanh niên',
    difficultyLevel: 'Dễ tiếp cận',
    keyTakeaways: [
      'Phú Thọ sở hữu hệ sinh thái rừng nhiệt đới trên núi đá vôi Xuân Sơn và rừng cổ thụ Nghĩa Lĩnh vô cùng nhạy cảm.',
      'Sức ép rác thải nhựa sau mỗi mùa lễ hội là thách thức lớn đối với môi trường cảnh quan di tích.',
      'Giải pháp "Du lịch không rác thải nhựa" (Zero-plastic travel): Nói không với túi nilon và đồ nhựa dùng 1 lần.',
      'Mỗi hành động nhỏ của du khách hôm nay sẽ gìn giữ non sông tươi đẹp cho con cháu mai sau.'
    ],
    tableOfContents: [
      { id: 'thach-thuc-moi-truong', title: '1. Thách thức môi trường du lịch Phú Thọ' },
      { id: 'nguyen-tac-xanh', title: '2. Ba nguyên tắc xanh cho du khách có trách nhiệm' },
      { id: 'bao-ton-rung-nguyen-sinh', title: '3. Bảo tồn rừng nguyên sinh Xuân Sơn & Rừng Đền Hùng' },
      { id: 'hanh-dong-thiet-thuc', title: '4. Những hành động thiết thực bạn có thể làm ngay' }
    ],
    sections: [
      {
        id: 'thach-thuc-moi-truong',
        title: '1. Thách thức môi trường du lịch Phú Thọ',
        paragraphs: [
          'Sự gia tăng nhanh chóng của lượng khách du lịch trong các năm gần đây đặt ra bài toán hóc búa về năng lực chịu tải của các khu di tích và thắng cảnh thiên nhiên. Tại Đền Hùng vào ngày 10/3 âm lịch, khối lượng rác thải sinh hoạt phát sinh trong một ngày có thể lên tới hàng chục tấn.',
          'Tại các đồi chè Long Cốc, tình trạng du khách giẫm đạp lên búp chè non để chụp ảnh sống ảo gây thiệt hại trực tiếp cho năng suất mùa vụ của bà con nông dân.'
        ]
      },
      {
        id: 'nguyen-tac-xanh',
        title: '2. Ba nguyên tắc xanh cho du khách có trách nhiệm',
        paragraphs: [
          'Để trở thành một du khách văn minh và có trách nhiệm, hãy ghi nhớ 3 nguyên tắc cốt lõi:',
          '1. Tôn trọng thiên nhiên: Đi theo các đường mòn đã có sẵn, không bẻ cành búp chè, không hái phong lan rừng và không làm tổn hại thảm thực vật.',
          '2. Quản lý rác thải cá nhân: Mang rác của mình về thùng rác công cộng, chủ động nhặt rác nếu thấy trên đường trekking.',
          '3. Tiêu dùng có trách nhiệm: Ủng hộ các cơ sở sử dụng vật liệu thân thiện môi trường (ống hút cỏ bàng, lá chuối bọc thực phẩm).'
        ]
      }
    ],
    practicalAdvice: [
      {
        tip: 'Tham gia phong trào "Hành hương xanh - Nhớ ơn Quốc Tổ"',
        why: 'Hành động nhỏ gom rác tại chân núi Nghĩa Lĩnh lan tỏa thông điệp văn minh mạnh mẽ đến hàng ngàn du khách xung quanh.',
        howToApply: 'Bỏ rác đúng nơi quy định và khuyến khích bạn bè cùng thực hiện.'
      }
    ],
    preTripChecklist: [
      'Mang theo túi vải và bình nước tái sử dụng.',
      'Không mang theo loa kéo công suất lớn gây ô nhiễm tiếng ồn tại khu di tích tâm linh và rừng sinh thái.'
    ],
    verifiedSources: [
      {
        name: 'Đề tài Nghiên cứu Sức tải Môi trường Du lịch Vùng Di sản Phú Thọ',
        publisher: 'Sở Tài nguyên & Môi trường tỉnh Phú Thọ',
        accessDate: '2026',
        verifiedNote: 'Báo cáo khoa học về giải pháp bảo tồn hệ sinh thái du lịch'
      }
    ],
    relatedDestinationIds: ['den-hung', 'doi-che-long-coc'],
    suggestedAiPrompt: 'Lập lịch trình du lịch xanh khám phá Phú Thọ không phát thải rác nhựa dùng 1 lần',
    relatedArticleIds: ['du-lich-cong-dong-co-trach-nhiem', 'du-lich-thong-minh-phu-tho-vai-tro-du-lieu-va-ai']
  }
];

export const ARTICLE_CATEGORIES_CONFIG = [
  { id: 'all', label: 'Tất cả bài viết', icon: 'BookOpen' },
  { id: 'general_guide', label: 'Cẩm nang du lịch', icon: 'Compass' },
  { id: 'tips_hacks', label: 'Kinh nghiệm & Bí kíp', icon: 'Lightbulb' },
  { id: 'culture_heritage', label: 'Văn hóa & Di sản', icon: 'Award' },
  { id: 'local_cuisine', label: 'Ẩm thực địa phương', icon: 'Utensils' },
  { id: 'itineraries', label: 'Lịch trình tham khảo', icon: 'Calendar' },
  { id: 'family', label: 'Du lịch gia đình', icon: 'Users' },
  { id: 'green_sustainable', label: 'Du lịch xanh & Bản địa', icon: 'Leaf' },
  { id: 'smart_tourism', label: 'Dự án & Du lịch số', icon: 'Sparkles' }
];
