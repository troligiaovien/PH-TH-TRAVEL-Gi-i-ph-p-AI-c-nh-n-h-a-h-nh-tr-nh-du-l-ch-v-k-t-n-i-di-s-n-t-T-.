import { TourismProjectProfile } from '../types/magazine';

export const TOURISM_PROJECTS_DATA: TourismProjectProfile[] = [
  {
    id: 'phutho-ai-travel',
    title: 'PHU THO AI TRAVEL — Hệ Thống Trợ Lý Du Lịch Số & Kiến Tạo Lịch Trình Thông Minh',
    tagline: 'Chuyển đổi số du lịch vùng Đất Tổ: Kết nối di sản, tối ưu lộ trình và hỗ trợ du khách theo thời gian thực',
    category: 'digital_transformation',
    categoryLabel: 'Chuyển đổi số & Trí tuệ nhân tạo',
    leadOrganization: 'Nhóm Nghiên cứu KHKT Học sinh Phú Thọ & Đội ngũ Phát triển Công nghệ Giáo dục',
    status: 'mvp',
    statusLabel: 'Giai đoạn Thử nghiệm Thực tế (MVP v2.4)',
    statusBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    targetBeneficiaries: [
      'Du khách trong và ngoài nước đến Phú Thọ tìm kiếm thông tin xác thực, tránh bị lạc hoặc quá tải',
      'Cộng đồng địa phương và các cơ sở lưu trú homestay, nhà hàng bản địa tiếp cận du khách với chi phí 0 đồng',
      'Ngành du lịch tỉnh Phú Thọ trong việc quảng bá hình ảnh di sản văn hóa phi vật thể UNESCO'
    ],
    problemAddressed:
      'Thông tin du lịch Phú Thọ trên không gian mạng hiện còn phân tán; phần lớn du khách chỉ về Đền Hùng vào dịp chính hội tháng 3 rồi vội vã rời đi vì thiếu thông tin định tuyến đến các danh thắng khác (Long Cốc, Xuân Sơn, Thanh Thủy, Hùng Lô). Đồng thời, các công cụ chatbot thông thường thường "ảo giác" bịa đặt giá cả và lộ trình thiếu khả thi.',
    objectives: [
      'Xây dựng nền tảng bản đồ số chuyên sâu tích hợp dữ liệu GPS chuẩn xác và kiểm chứng thực địa 100%.',
      'Ứng dụng AI tổng hợp và phân tích ràng buộc (thời gian, đối tượng, thể lực, ngân sách) để kiến tạo lịch trình cá nhân hóa thực tế.',
      'Bảo tồn và lan tỏa giá trị hai Di sản Văn hóa Phi vật thể đại diện của nhân loại được UNESCO ghi danh (Tín ngưỡng thờ cúng Hùng Vương và Hát Xoan Phú Thọ).',
      'Đề cao trách nhiệm du lịch xanh, hỗ trợ sinh kế bản địa của đồng bào Mường, Dao và làng nghề truyền thống.'
    ],
    solutionOverview:
      'Hệ sinh thái kết hợp ba lớp giải pháp: (1) Cơ sở tri thức địa lý du lịch xác minh với ma trận thời gian di chuyển thực tế; (2) Bộ máy AI Travel Planner cá nhân hóa không sinh dữ liệu giả; (3) Tạp chí cẩm nang du lịch số và bản đồ tương tác đa lớp không phụ thuộc vào các dịch vụ tính phí đắt đỏ.',
    keyComponents: [
      {
        title: 'Bộ máy Lập Lịch trình AI Thông minh (AI Itinerary Engine)',
        description: 'Tự động tính toán lộ trình theo cung đường thực tế (CT05, QL32, ĐT315, ĐT317), kiểm soát thời gian mở cửa, dự toán chi phí vé và gợi ý điểm dừng chân phù hợp từng nhóm tuổi.'
      },
      {
        title: 'Bản đồ số Tương tác Đa lớp (Digital GIS Hub)',
        description: 'Tích hợp lớp bản đồ đường phố, vệ tinh và địa hình trực quan, vẽ đường polyline lộ trình từng ngày và hỗ trợ định vị một chạm.'
      },
      {
        title: 'Kho Cẩm nang & Tri thức Di sản Đất Tổ (Travel Knowledge Base)',
        description: 'Hệ thống bài viết chuyên sâu có dẫn chứng nguồn gốc, số liệu minh bạch và liên kết trực tiếp sang công cụ lên kế hoạch chuyến đi.'
      }
    ],
    technicalStack: [
      'Frontend: React 19 + TypeScript + Tailwind CSS hiện đại',
      'Bản đồ số: Leaflet Engine + OpenStreetMap + Esri World Imagery (không lệ thuộc billing ngoại tệ)',
      'Hạ tầng dữ liệu: Google Cloud Firestore đồng bộ thời gian thực + Firebase Authentication',
      'Trí tuệ nhân tạo: @google/genai TypeScript SDK với cơ chế RAG (Retrieval-Augmented Generation) dựa trên tri thức thực địa'
    ],
    verifiedOutcomes: [
      'Đã số hóa thành công 6 trọng điểm danh thắng tiêu biểu với đầy đủ tọa độ GPS chuẩn xác và hàng chục điểm dừng chân lân cận.',
      'Bộ dữ liệu lộ trình thực tế đã kiểm thử thành công các cung đường từ Hà Nội, Việt Trì đến Tân Sơn, Tam Đảo và Thanh Thủy.',
      'Thời gian phản hồi tạo kế hoạch du lịch hoàn chỉnh trung bình chỉ 3-5 giây với độ chính xác cao về chi phí niêm yết.'
    ],
    developmentRoadmap: [
      {
        phase: 'Giai đoạn 1',
        timeline: 'Quý 4/2025 - Quý 1/2026',
        goal: 'Khảo sát thực địa, số hóa dữ liệu di tích Đền Hùng, Long Cốc, Tây Thiên; xây dựng kiến trúc nền tảng và bản đồ số.',
        isCurrent: false
      },
      {
        phase: 'Giai đoạn 2 (Hiện tại)',
        timeline: 'Quý 2/2026 - Quý 3/2026',
        goal: 'Tích hợp AI Travel Planner, hoàn thiện tạp chí Cẩm nang & Dự án số, thử nghiệm thực tế với nhóm học sinh và du khách.',
        isCurrent: true
      },
      {
        phase: 'Giai đoạn 3',
        timeline: 'Quý 4/2026 - Năm 2027',
        goal: 'Kết nối mạng lưới hợp tác xã homestay bản địa, hỗ trợ đa ngôn ngữ (Anh - Việt), phát hành ứng dụng PWA hỗ trợ ngoại tuyến không cần mạng 4G trên núi cao.',
        isCurrent: false
      }
    ],
    officialSources: [
      {
        title: 'Cổng thông tin Điện tử Sở Văn hóa, Thể thao và Du lịch tỉnh Phú Thọ',
        url: 'https://svhttdl.phutho.gov.vn',
        note: 'Dữ liệu danh mục di tích và quy hoạch du lịch tỉnh'
      },
      {
        title: 'Đề án Phát triển Du lịch Phú Thọ giai đoạn 2021 - 2025, định hướng đến năm 2030',
        url: 'https://phutho.gov.vn',
        note: 'Định hướng chuyển đổi số và phát triển du lịch thông minh'
      }
    ],
    lastUpdated: '10/2026'
  },
  {
    id: 'so-hoa-den-hung-3d',
    title: 'Chương Trình Số Hóa Di Tích Quốc Gia Đặc Biệt Đền Hùng',
    tagline: 'Ứng dụng công nghệ quét 3D Laser và không gian thực tế ảo phục vụ du khách hành hương cội nguồn',
    category: 'heritage_preservation',
    categoryLabel: 'Bảo tồn Di sản Văn hóa',
    leadOrganization: 'Khu Di tích Lịch sử Đền Hùng phối hợp các đối tác công nghệ quốc gia',
    status: 'pilot_testing',
    statusLabel: 'Đang triển khai từng phần',
    statusBadgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
    targetBeneficiaries: [
      'Đồng bào cả nước và kiều bào ở nước ngoài muốn chiêm bái non thiêng Nghĩa Lĩnh từ xa',
      'Học sinh, sinh viên nghiên cứu lịch sử thời đại Hùng Vương và văn hóa Đông Sơn'
    ],
    problemAddressed:
      'Vào dịp chính hội 10/3 âm lịch, mật độ du khách tập trung quá lớn dẫn đến khó khăn trong việc tiếp cận các thông tin thuyết minh lịch sử chi tiết tại các đền Hạ, Trung, Thượng và Bảo tàng Hùng Vương.',
    objectives: [
      'Số hóa tư liệu hiện vật bảo vật quốc gia (trống đồng, vũ khí đồng, đồ gốm tiền sử).',
      'Cung cấp mã QR tra cứu thuyết minh tự động bằng âm thanh đa ngữ tại từng điểm di tích.',
      'Bảo tồn tư liệu số lâu dài phục vụ công tác trùng tu kiến trúc gỗ cổ truyền.'
    ],
    solutionOverview:
      'Triển khai các điểm quét mã thông tin tại chân núi Nghĩa Lĩnh, cổng chính, đền Giếng và Bảo tàng Hùng Vương; xây dựng mô hình sa bàn số 3D toàn cảnh khu di tích 845 ha.',
    keyComponents: [
      {
        title: 'Hệ thống Thuyết minh Âm thanh Tự động (Audio Guide)',
        description: 'Du khách quét mã QR để nghe thuyết minh về lịch sử từng ngôi đền bằng tiếng Việt và tiếng Anh.'
      },
      {
        title: 'Số hóa 3D Cổ vật Thời đại Hùng Vương',
        description: 'Tái hiện không gian ảo các bảo vật trống đồng Đông Sơn cho phép xoay 360 độ và xem cận cảnh hoa văn.'
      }
    ],
    technicalStack: ['Công nghệ quét 3D Photogrammetry', 'Nền tảng WebGL/Three.js', 'Hệ thống mã QR định danh'],
    verifiedOutcomes: [
      'Đã hoàn thành lắp đặt biển bảng thông tin mã QR tra cứu tại trục chính hành hương Đền Hùng.',
      'Hàng chục ngàn lượt khách đã trải nghiệm thuyết minh tự động trong các dịp lễ hội vừa qua.'
    ],
    developmentRoadmap: [
      {
        phase: 'Bước 1',
        timeline: '2023 - 2024',
        goal: 'Lắp đặt hệ thống thuyết minh QR tại các đền chính.',
        isCurrent: false
      },
      {
        phase: 'Bước 2',
        timeline: '2025 - 2026',
        goal: 'Hoàn thiện sa bàn số 3D và kết nối dữ liệu số với cổng du lịch tỉnh.',
        isCurrent: true
      }
    ],
    officialSources: [
      {
        title: 'Ban Quản lý Khu Di tích Lịch sử Đền Hùng',
        note: 'Thông tin công bố tại hội nghị xúc tiến chuyển đổi số du lịch Đất Tổ'
      }
    ],
    lastUpdated: '10/2026'
  },
  {
    id: 'du-lich-sinh-thai-xuan-son',
    title: 'Mô Hình Du Lịch Sinh Thái Cộng Đồng Gắn Với Bảo Tồn Rừng VQG Xuân Sơn',
    tagline: 'Phát triển sinh kế bền vững cho đồng bào Mường, Dao Tiền dựa trên nguyên tắc bảo vệ nghiêm ngặt hệ sinh thái',
    category: 'community_empowerment',
    categoryLabel: 'Du lịch Cộng đồng & Sinh kế',
    leadOrganization: 'Ban Quản lý Vườn Quốc gia Xuân Sơn & Hợp tác xã Du lịch Cộng đồng Bản Dù',
    status: 'implemented',
    statusLabel: 'Đang vận hành hiệu quả',
    statusBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    targetBeneficiaries: [
      'Các hộ gia đình đồng bào dân tộc Mường và Dao Tiền tại Bản Dù, Bản Lấp, Bản Cỏi',
      'Du khách yêu thiên nhiên, trekking khám phá hang động và văn hóa bản địa'
    ],
    problemAddressed:
      'Trước đây, đời sống bà con vùng đệm VQG Xuân Sơn phụ thuộc vào khai thác lâm sản phụ. Cần một mô hình kinh tế xanh giúp đồng bào có thu nhập ổn định mà không xâm hại đến rừng nguyên sinh.',
    objectives: [
      'Đào tạo kỹ năng làm du lịch homestay, vệ sinh an toàn thực phẩm và đón tiếp du khách.',
      'Bảo tồn nếp nhà sàn truyền thống, nghề dệt thổ cẩm thêu tay và tri thức thuốc nam.',
      'Thiết lập quy chế bảo vệ môi trường, nghiêm cấm xả rác và săn bắt động vật hoang dã.'
    ],
    solutionOverview:
      'Hỗ trợ các gia đình cải tạo nhà sàn đạt tiêu chuẩn đón khách, xây dựng các tour trekking có người bản địa dẫn đường, gắn trải nghiệm ẩm thực (rau dớn, gà nhiều cựa, xôi ngũ sắc) với hoạt động giao lưu văn nghệ dân tộc.',
    keyComponents: [
      {
        title: 'Mạng lưới Homestay Bản Dù & Bản Lấp',
        description: 'Hơn 15 cơ sở nhà sàn đạt chuẩn đón khách lưu trú với không gian văn hóa nguyên bản.'
      },
      {
        title: 'Tổ Hướng dẫn viên Bản địa Trekking Hang Động',
        description: 'Thanh niên địa phương được đào tạo sơ cấp cứu, kỹ năng dẫn đường tham quan Hang Lạng, Thác Chín Tầng an toàn.'
      }
    ],
    technicalStack: ['Quy chuẩn Du lịch Cộng đồng ASEAN', 'Hệ thống năng lượng mặt trời mini tại các điểm xa'],
    verifiedOutcomes: [
      'Tạo việc làm và thu nhập trực tiếp cho hàng trăm lao động địa phương.',
      'Tỷ lệ vi phạm bảo vệ rừng tại khu vực vùng đệm giảm rõ rệt nhờ cộng đồng trực tiếp hưởng lợi từ du lịch sinh thái.'
    ],
    developmentRoadmap: [
      {
        phase: 'Giai đoạn 1',
        timeline: '2020 - 2023',
        goal: 'Hình thành cụm homestay thí điểm tại Bản Dù.',
        isCurrent: false
      },
      {
        phase: 'Giai đoạn 2',
        timeline: '2024 - 2026',
        goal: 'Nâng cao chất lượng dịch vụ, xử lý rác thải sinh hoạt và phát triển sản phẩm OCOP bản địa.',
        isCurrent: true
      }
    ],
    officialSources: [
      {
        title: 'Ban Quản lý Vườn Quốc gia Xuân Sơn & UBND Huyện Tân Sơn',
        note: 'Báo cáo tổng kết công tác quản trị du lịch sinh thái cộng đồng'
      }
    ],
    lastUpdated: '10/2026'
  },
  {
    id: 'khong-gian-van-hoa-hat-xoan',
    title: 'Sáng Kiến Bảo Tồn & Lan Tỏa Di Sản Hát Xoan Phú Thọ Gắn Với Điểm Đến Làng Cổ Hùng Lô',
    tagline: 'Đưa di sản văn hóa phi vật thể nhân loại trở thành sản phẩm du lịch trải nghiệm đặc sắc',
    category: 'heritage_preservation',
    categoryLabel: 'Bảo tồn & Lan tỏa Di sản',
    leadOrganization: 'Sở Văn hóa Thể thao và Du lịch Phú Thọ & Các Phường Xoan Gốc',
    status: 'implemented',
    statusLabel: 'Đang triển khai thường xuyên',
    statusBadgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    targetBeneficiaries: [
      'Nghệ nhân, Đào, Kép thuộc 4 phường Xoan cổ (An Thái, Thét, Phù Đức, Kim Đới)',
      'Du khách trong nước và quốc tế trải nghiệm nghệ thuật diễn xướng cửa đình'
    ],
    problemAddressed:
      'Hát Xoan từng đứng trước nguy cơ mai một nghiêm trọng vào năm 2011 do thiếu thế hệ kế cận và ít không gian trình diễn ngoài dịp lễ hội đầu xuân.',
    objectives: [
      'Mở rộng không gian trình diễn Hát Xoan tại Đình cổ Hùng Lô và Miếu Lãi Lèn phục vụ khách du lịch quanh năm.',
      'Truyền dạy bài bản cho thế hệ trẻ học sinh và đào tạo các nghệ nhân kế cận.',
      'Kết hợp xem Hát Xoan với trải nghiệm làng nghề làm mì gạo, bánh chưng truyền thống.'
    ],
    solutionOverview:
      'Tổ chức các tour du lịch "Hát Xoan làng cổ" định kỳ vào cuối tuần; hỗ trợ các nghệ nhân cao tuổi phục dựng đầy đủ 14 quả cách và các làn điệu hát hội đối đáp.',
    keyComponents: [
      {
        title: 'Điểm trình diễn Hát Xoan tại Đình Cổ Hùng Lô',
        description: 'Không gian ngôi đình 300 năm tuổi với kiến trúc chạm khắc tinh xảo trở thành thánh đường biểu diễn mộc mạc.'
      },
      {
        title: 'Chương trình Trải nghiệm Tương tác cùng Nghệ nhân',
        description: 'Du khách được nghệ nhân hướng dẫn gõ trống con, múa bỏ bộ và hát đối đáp trực tiếp.'
      }
    ],
    technicalStack: ['Bảo tồn sống (Living Heritage Framework)', 'Tư liệu hóa băng hình và âm thanh độ nét cao'],
    verifiedOutcomes: [
      'UNESCO chính thức chuyển Hát Xoan từ danh sách Cần bảo vệ khẩn cấp sang danh sách Di sản Văn hóa Phi vật thể đại diện của nhân loại vào năm 2017.',
      'Hàng trăm đoàn khách du lịch lữ hành đã tham gia chương trình Hát Xoan làng cổ hàng năm.'
    ],
    developmentRoadmap: [
      {
        phase: 'Cột mốc 2017',
        timeline: 'Năm 2017',
        goal: 'UNESCO công nhận Di sản đại diện nhân loại.',
        isCurrent: false
      },
      {
        phase: 'Cột mốc 2024 - 2026',
        timeline: 'Hiện nay',
        goal: 'Chuẩn hóa chương trình biểu diễn đón khách du lịch quốc tế và học sinh trải nghiệm ngoại khóa.',
        isCurrent: true
      }
    ],
    officialSources: [
      {
        title: 'Hồ sơ đệ trình UNESCO & Cục Di sản Văn hóa',
        note: 'Văn bản báo cáo tình trạng bảo tồn di sản Hát Xoan Phú Thọ'
      }
    ],
    lastUpdated: '10/2026'
  }
];
