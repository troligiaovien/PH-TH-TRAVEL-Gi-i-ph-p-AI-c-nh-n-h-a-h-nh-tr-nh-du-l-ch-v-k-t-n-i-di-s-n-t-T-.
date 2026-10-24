import React from 'react';
import { Globe, ExternalLink, Mountain, Eye, Compass, ShieldCheck } from 'lucide-react';

export const GoogleEarthExperience: React.FC = () => {
  const earthHotspots = [
    {
      title: 'Đền Hùng',
      district: 'TP. Việt Trì, Phú Thọ',
      terrainNote: 'Thế đất núi Nghĩa Lĩnh cao 175m nhìn ra ba dải sông hợp lưu, bao bọc bởi đồi núi trập trùng linh thiêng.',
      googleEarthUrl: 'https://earth.google.com/web/search/Den+Hung+Hy+Cuong+Viet+Tri+Phu+Tho+Vietnam',
      icon: '⛩️',
      visualGradient: 'from-amber-950 to-stone-900',
    },
    {
      title: 'Khu danh thắng Tây Thiên',
      district: 'Huyện Tam Đảo, Vĩnh Phúc',
      terrainNote: 'Thung lũng lòng chảo nguyên sinh và đỉnh núi Thạch Bàn mây ngàn bao phủ nơi Quốc Mẫu ngự trị.',
      googleEarthUrl: 'https://earth.google.com/web/search/Tay+Thien+Tam+Dao+Vinh+Phuc',
      icon: '🪷',
      visualGradient: 'from-amber-900 to-emerald-950',
    },
    {
      title: 'Tam Đảo',
      district: 'Thị trấn Tam Đảo, Vĩnh Phúc',
      terrainNote: 'Ba đỉnh núi Thiên Thị, Thạch Bàn và Phù Nghĩa cao trên 1.300m nhô lên giữa biển sương mù bồng bềnh.',
      googleEarthUrl: 'https://earth.google.com/web/search/Tam+Dao+Vinh+Phuc',
      icon: '🏰',
      visualGradient: 'from-sky-950 to-slate-900',
    },
    {
      title: 'Đồi chè Long Cốc',
      district: 'Huyện Tân Sơn, Phú Thọ',
      terrainNote: 'Hàng trăm ngọn đồi chè hình bát úp uốn lượn nhấp nhô như những ốc đảo bồng bềnh giữa biển mây trung du.',
      googleEarthUrl: 'https://earth.google.com/web/search/Long+Coc+Tan+Son+Phu+Tho',
      icon: '🍃',
      visualGradient: 'from-emerald-900 to-teal-950',
    },
    {
      title: 'Hồ Đại Lải',
      district: 'TP. Phúc Yên, Vĩnh Phúc',
      terrainNote: 'Mặt nước hồ trong xanh rộng hơn 525 ha nằm tựa lưng vào dãy Tam Đảo với Đảo Ngọc rợp bóng cây.',
      googleEarthUrl: 'https://earth.google.com/web/search/Ho+Dai+Lai+Phuc+Yen',
      icon: '⛵',
      visualGradient: 'from-blue-950 to-slate-900',
    },
  ];

  return (
    <section id="google-earth-3d" className="py-16 bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <span>Trải nghiệm địa hình số</span>
            <span aria-hidden="true">·</span>
            <span>Google Earth Web</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            NHÌN NGẮM ĐIỂM ĐẾN TỪ GÓC NHÌN KHÁC
          </h2>
          <p className="mt-3 text-base text-stone-300 leading-relaxed">
            Khám phá địa hình, cảnh quan và góc nhìn vệ tinh 3D của 5 danh thắng tiêu biểu: Đền Hùng, Tây Thiên, Tam Đảo, Đồi chè Long Cốc và Hồ Đại Lải.
          </p>
        </div>

        {/* 5 Featured Hotspots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
          {earthHotspots.map((spot) => (
            <div
              key={spot.title}
              className={`p-4 rounded-2xl bg-gradient-to-br ${spot.visualGradient} border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-all`}
            >
              <div>
                <div className="text-2xl mb-2.5">{spot.icon}</div>
                <div className="text-[11px] text-stone-400 font-medium">{spot.district}</div>
                <h3 className="text-base font-bold text-white mt-0.5">{spot.title}</h3>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  {spot.terrainNote}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-stone-800/80">
                <a
                  href={spot.googleEarthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-2.5 text-xs font-semibold text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mở 3D Google Earth</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Explanatory Card */}
        <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-400 space-y-2">
          <div className="flex items-center gap-2 text-stone-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Minh bạch về công nghệ & góc nhìn địa hình:</span>
          </div>
          <p className="leading-relaxed">
            • Nền tảng phân biệt rõ ràng: <strong>Ảnh vệ tinh & mô hình địa hình (Elevation Terrain)</strong> được Google Earth Web cung cấp trực tuyến, cho phép bạn xoay nghiêng góc nhìn 3D để quan sát các dải đồi bát úp hay dãy núi Tam Đảo hùng vĩ.
          </p>
          <p className="leading-relaxed">
            • Khi bấm mở, trình duyệt sẽ mở Google Earth Web tương ứng để bạn tự do phóng to, thu nhỏ và khám phá toàn cảnh khu vực địa hình thực tế.
          </p>
        </div>
      </div>
    </section>
  );
};
