import React, { useState } from 'react';
import { Compass, MapPin, Mail, Phone, ExternalLink, ShieldCheck, Award } from 'lucide-react';
import { AppUISettings } from '../types';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  uiSettings?: AppUISettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection, uiSettings }) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const brandTitle = uiSettings?.logoText || 'PHÚ THỌ TRAVEL';
  const logoUrl = uiSettings?.logoUrl?.trim();

  const logoHeight = uiSettings?.logoHeight ?? 44;
  const logoScale = (uiSettings?.logoScale ?? 100) / 100;
  const logoScaleX = (uiSettings?.logoScaleX ?? 100) / 100;
  const logoScaleY = (uiSettings?.logoScaleY ?? 100) / 100;

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Col 1: Brand & Slogan (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center overflow-visible py-1">
              {logoUrl && !logoFailed ? (
                <img
                  src={logoUrl}
                  alt={brandTitle}
                  loading="lazy"
                  decoding="async"
                  style={{
                    height: `${Math.round(logoHeight * logoScale * logoScaleY)}px`,
                    transform: logoScaleX !== 1 ? `scaleX(${logoScaleX})` : undefined,
                    transformOrigin: 'left center',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  className="w-auto max-w-[320px] sm:max-w-[460px] object-contain"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center font-serif text-lg font-bold">
                    PT
                  </div>
                  <span className="font-serif text-lg font-bold text-white tracking-tight">
                    {brandTitle}
                  </span>
                </div>
              )}
            </div>

            <p className="text-amber-400/90 font-serif italic text-sm">
              “Chạm vào cội nguồn – Khám phá vẻ đẹp Đất Tổ”
            </p>

            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Nền tảng du lịch số do nhóm học sinh phát triển, cung cấp bản đồ số tương tác, liên kết định vị chuẩn xác, thông tin di sản văn hóa và cẩm nang hành trình cho du khách muôn phương.
            </p>

            <div className="pt-2 flex items-center gap-2 text-stone-400">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Tỉnh Phú Thọ, Việt Nam</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (Col 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-bold text-white tracking-wider">
              Khám phá nhanh
            </h4>
            <ul className="space-y-2">
              {[
                { id: 'destinations', label: '5 Điểm đến tiêu biểu' },
                { id: 'map', label: 'Bản đồ du lịch số' },
                { id: 'itineraries', label: 'Lịch trình gợi ý' },
                { id: 'guide', label: 'Cẩm nang & Dự án học sinh' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigateSection(link.id)}
                    className="text-stone-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="https://dulichphutho.com.vn/vi/explore360"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>NGẮM PHÚ THỌ QUA 360°</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Research Project & Authors (Col 4) */}
          <div className="lg:col-span-4 space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>PHÚ THỌ TRAVEL</span>
            </h4>
            <p className="text-stone-200 font-semibold text-xs leading-snug">
              Nền tảng du lịch thông minh ứng dụng trí tuệ nhân tạo
            </p>
            <div className="text-stone-300 text-xs leading-relaxed space-y-1">
              <div className="text-stone-300">
                Sản phẩm nghiên cứu khoa học kỹ thuật của nhóm học sinh:
              </div>
              <ul className="text-stone-200 font-medium pl-2 space-y-0.5">
                <li>• Trần Mạnh Phong</li>
                <li>• Nguyễn Hải Đăng</li>
              </ul>
              <div className="text-emerald-400 font-medium pt-0.5">
                Trường: THCS Đội Cấn
              </div>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed pt-1.5 border-t border-stone-800">
              © 2026 PHÚ THỌ TRAVEL. Bản quyền đối với các nội dung và thành phần do nhóm tự phát triển được bảo lưu và bảo mật.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} PHÚ THỌ TRAVEL. Bản quyền dự án học sinh trường THCS Đội Cấn.
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>
    </footer>
  );
};
