import React, { useState } from 'react';
import {
  Rocket,
  Target,
  Sparkles,
  TrendingUp,
  Layers,
  HeartHandshake,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { STARTUP_PROJECT_DATA } from '../data/startupInfo';
import { PartnerProposal } from '../types';

interface StartupModelSectionProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const StartupModelSection: React.FC<StartupModelSectionProps> = ({ onShowToast }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    serviceType: 'homestay',
    district: 'Huyện Tân Sơn',
    description: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProposals, setSubmittedProposals] = useState<PartnerProposal[]>(() => {
    try {
      const saved = localStorage.getItem('phutho_travel_proposals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.businessName.trim()) {
      errors.businessName = 'Vui lòng nhập tên cơ sở hoặc doanh nghiệp.';
    }
    if (!formData.contactPerson.trim()) {
      errors.contactPerson = 'Vui lòng nhập họ tên người đại diện.';
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      errors.phone = 'Vui lòng nhập số điện thoại liên hệ hợp lệ.';
    }
    if (!formData.description.trim() || formData.description.length < 15) {
      errors.description = 'Vui lòng mô tả ít nhất 15 ký tự về dịch vụ của bạn.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      onShowToast('Vui lòng kiểm tra lại thông tin biểu mẫu', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newProposal: PartnerProposal = {
        ...formData,
        serviceType: formData.serviceType as any,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };

      const updated = [newProposal, ...submittedProposals];
      setSubmittedProposals(updated);
      try {
        localStorage.setItem('phutho_travel_proposals', JSON.stringify(updated));
      } catch {
        // Storage fail fallback
      }

      setIsSubmitting(false);
      setFormData({
        businessName: '',
        contactPerson: '',
        phone: '',
        email: '',
        serviceType: 'homestay',
        district: 'Huyện Tân Sơn',
        description: '',
      });
      onShowToast(
        'Đã ghi nhận bản đề xuất thử nghiệm vào bộ nhớ thiết bị thành công!',
        'success'
      );
    }, 600);
  };

  return (
    <section id="startup" className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
            <span>Khởi nghiệp đổi mới sáng tạo</span>
            <span aria-hidden="true">·</span>
            <span>Hồ sơ dự án học sinh</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            VỀ DỰ ÁN “PHÚ THỌ TRAVEL”
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            Dự án được xây dựng từ ý tưởng của học sinh nhằm số hóa thông tin du lịch Đất Tổ, giải quyết bài toán thông tin phân tán và hỗ trợ các cơ sở bản địa tiếp cận du khách với chi phí tinh gọn.
          </p>
        </div>

        {/* 2 Columns: Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Problem */}
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>{STARTUP_PROJECT_DATA.problemStatement.title}</span>
            </div>
            <div className="space-y-3">
              {STARTUP_PROJECT_DATA.problemStatement.points.map((p, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200/80">
                  <h4 className="text-xs font-bold text-stone-900">{p.title}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{STARTUP_PROJECT_DATA.solutionStatement.title}</span>
            </div>
            <div className="space-y-3">
              {STARTUP_PROJECT_DATA.solutionStatement.points.map((p, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-200/60">
                  <h4 className="text-xs font-bold text-stone-900">{p.title}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monetization Strategy for Judges */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-stone-900 text-stone-100">
          <div className="max-w-2xl mb-6">
            <span className="text-xs uppercase font-semibold text-amber-400 tracking-wider">
              Kế hoạch tài chính khả thi
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1">
              {STARTUP_PROJECT_DATA.monetizationPlan.title}
            </h3>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              {STARTUP_PROJECT_DATA.monetizationPlan.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STARTUP_PROJECT_DATA.monetizationPlan.revenueStreams.map((stream, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {stream.tag}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2 mb-2 leading-snug">
                    {stream.channel}
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">{stream.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Roadmap */}
          <div className="mt-8 pt-6 border-t border-stone-800">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
              Lộ trình triển khai thực tế (Roadmap)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STARTUP_PROJECT_DATA.developmentPhases.map((dev, i) => (
                <div key={i} className="text-xs space-y-1">
                  <div className="font-bold text-emerald-400">{dev.phase}</div>
                  <div className="text-stone-300 leading-relaxed">{dev.goal}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partner Proposal Section & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-emerald-700" />
              <span>Dành cho đối tác địa phương</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              ĐỒNG HÀNH & KẾT NỐI QUẢNG BÁ
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Bạn là chủ homestay, nhà hàng cá sông, cơ sở sản xuất thịt chua Thanh Sơn, miến dong Hùng Lô hay hợp tác xã chè Long Cốc? Hãy gửi đề xuất để cùng xuất hiện trên bản đồ số du lịch Đất Tổ.
            </p>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="font-semibold text-stone-900">Quyền lợi của đối tác tham gia:</div>
              <ul className="space-y-1.5 text-stone-600">
                <li>• Được xác minh vị trí và ghim trên bản đồ số Phú Thọ.</li>
                <li>• Có liên kết trực tiếp tới số điện thoại và Google Maps của cơ sở.</li>
                <li>• Được đưa vào các gợi ý lịch trình tour phù hợp với du khách.</li>
              </ul>
            </div>

            {/* Transparency Note */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{STARTUP_PROJECT_DATA.transparencyNotice}</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-stone-50 p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
            <h4 className="text-base font-bold text-stone-900 mb-1">
              Biểu mẫu Đề xuất Hợp tác Thử nghiệm (Demo)
            </h4>
            <p className="text-xs text-stone-500 mb-6">
              Biểu mẫu hoạt động thực tế trên trình duyệt; thông tin sẽ được lưu trữ an toàn trong bộ nhớ thiết bị để ban giám khảo đánh giá quy trình.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tên cơ sở / Hộ kinh doanh *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="VD: Homestay Bản Dù Xuân Sơn"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                  />
                  {formErrors.businessName && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{formErrors.businessName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Người đại diện liên hệ *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                  />
                  {formErrors.contactPerson && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{formErrors.contactPerson}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912 345 678"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                  />
                  {formErrors.phone && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{formErrors.phone}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email liên hệ (nếu có)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doitac@gmail.com"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Lĩnh vực dịch vụ
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                  >
                    <option value="homestay">Homestay / Nghỉ dưỡng</option>
                    <option value="restaurant">Nhà hàng / Ẩm thực cá sông</option>
                    <option value="specialty">Đặc sản OCOP (Thịt chua, Chè, Bưởi, Miến)</option>
                    <option value="tour">Dịch vụ dẫn tour bản địa</option>
                    <option value="other">Dịch vụ khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Địa bàn huyện / thành phố
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                  >
                    <option value="Huyện Tân Sơn">Huyện Tân Sơn</option>
                    <option value="Huyện Thanh Thủy">Huyện Thanh Thủy</option>
                    <option value="TP. Việt Trì">TP. Việt Trì</option>
                    <option value="Huyện Hạ Hòa">Huyện Hạ Hòa</option>
                    <option value="Huyện Lâm Thao">Huyện Lâm Thao</option>
                    <option value="Huyện Cẩm Khê">Huyện Cẩm Khê</option>
                    <option value="Huyện Thanh Sơn">Huyện Thanh Sơn</option>
                    <option value="Huyện Thanh Ba">Huyện Thanh Ba</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mô tả dịch vụ & Mong muốn hợp tác *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Giới thiệu sơ lược về dịch vụ, số lượng phòng hoặc đặc sản của cơ sở..."
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                />
                {formErrors.description && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">{formErrors.description}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang ghi nhận...' : 'Gửi đề xuất hợp tác (Demo)'}</span>
              </button>
            </form>

            {/* Display submitted test proposals list */}
            {submittedProposals.length > 0 && (
              <div className="mt-6 pt-5 border-t border-stone-200">
                <h5 className="text-xs font-bold text-stone-700 mb-2">
                  Các đề xuất đã gửi thử nghiệm trên thiết bị này ({submittedProposals.length}):
                </h5>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {submittedProposals.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-stone-200 text-xs">
                      <div className="font-semibold text-stone-900">{item.businessName}</div>
                      <div className="text-[11px] text-stone-500">
                        {item.contactPerson} · {item.phone} · {item.district} ({item.createdAt})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
