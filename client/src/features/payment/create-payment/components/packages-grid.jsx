import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import { MEMBERSHIP_LEVEL } from '~/constants/membership-level';
import { ROLE } from '~/constants/role';

import { useCreatePayment } from '../api/create-payment';
import PackageCard from './package-card';

const b2cPlans = [
  {
    name: 'Miễn phí',
    price: '0đ',
    desc: 'Khám phá MealMate hoàn toàn miễn phí',
    features: [
      'Theo dõi lịch trình ăn uống',
      'Tính toán Calories & Dinh dưỡng',
      'Lưu món ăn yêu thích',
      'Tra cứu kho dữ liệu món ăn'
    ],
    tokenInfo: '25.000 tokens / ngày',
    amount: 0,
    isFree: true,
    targetMembership: null
  },
  {
    name: 'Premium Cá Nhân',
    price: '89.000đ',
    originalPrice: '119.000đ',
    period: '/ 1 tháng',
    desc: 'Tối ưu hóa sức khỏe toàn diện',
    badge: 'Phổ biến',
    colorTheme: 'orange',
    features: [
      'AI gợi ý bữa ăn và tập luyện theo tuần',
      'Tự động tạo danh sách mua sắm',
      'Thêm token tạo lịch trình ăn uống'
    ],
    tokenInfo: '120.000 tokens / ngày',
    amount: 89000,
    targetMembership: MEMBERSHIP_LEVEL.VIP
  }
];

const b2bPlans = [
  {
    name: 'BASIC',
    price: '349.000đ',
    originalPrice: '449.000đ',
    period: '/ 1 tháng',
    desc: 'Khởi đầu đơn giản – Hiệu quả',
    badge: 'Tiết kiệm 22% (so với gói tháng)',
    colorTheme: 'emerald',
    features: [
      'Quản lý học viên không giới hạn',
      'Tạo và theo dõi lịch tập',
      'Lên kế hoạch dinh dưỡng cơ bản',
      'Theo dõi tiến độ (cân nặng, số đo, hình ảnh)',
      'Thư viện bài tập & thực đơn mẫu',
      'Nhắc lịch tập & ăn uống cho học viên',
      'Hỗ trợ qua email'
    ],
    tokenInfo: '500.000 tokens / ngày',
    amount: 349000,
    targetMembership: MEMBERSHIP_LEVEL.EXPERT_BASIC
  },
  {
    name: 'STANDARD',
    price: '990.000đ',
    originalPrice: '1.190.000đ',
    period: '/ 3 tháng',
    desc: 'Tối ưu công việc – Nâng cao hiệu suất',
    badge: 'Tiết kiệm 16% (so với gói tháng)',
    colorTheme: 'blue',
    features: [
      'Phân tích chỉ số chuyên sâu',
      'Cá nhân hóa kế hoạch dinh dưỡng & tập luyện',
      'Báo cáo tiến độ chi tiết',
      'Ghi chú & đánh giá học viên',
      'Chat AI hỗ trợ tư vấn dinh dưỡng & tập luyện',
      'Tạo trang giới thiệu PT cá nhân',
      'Quản lý gói dịch vụ & thanh toán cho học viên',
      'Ưu tiên hỗ trợ 1-1',
      'Cập nhật tính năng mới sớm nhất'
    ],
    tokenInfo: '1.000.000 tokens / ngày',
    amount: 990000,
    targetMembership: MEMBERSHIP_LEVEL.EXPERT_STANDARD
  },
  {
    name: 'PREMIUM',
    price: '2.100.000đ',
    originalPrice: '2.699.000đ',
    period: '/ 6 tháng',
    desc: 'Toàn diện – Chuyên nghiệp – Dẫn đầu',
    badge: 'Tiết kiệm 22% (so với gói tháng)',
    colorTheme: 'orange',
    features: [
      'AI gợi ý thực đơn & bài tập thông minh',
      'Xây dựng thương hiệu cá nhân trên MealMate',
      'Dedicated Support (hỗ trợ riêng)',
      'Logo đối tác nổi bật trên website',
      'Banner quảng bá trên trang chủ MealMate',
      'Đồng hành trong các chiến dịch Marketing',
      'Ưu tiên giới thiệu khách hàng tiềm năng',
      'Workshop & sự kiện cộng đồng đồng tổ chức',
      'Ưu tiên trải nghiệm các tính năng mới'
    ],
    tokenInfo: '2.000.000 tokens / ngày',
    amount: 2100000,
    targetMembership: MEMBERSHIP_LEVEL.EXPERT_PREMIUM
  }
];

const PackagesGrid = () => {
  const { user } = useSelector(state => state.auth);
  const { mutateAsync, isPending } = useCreatePayment();
  const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || window.location.origin;

  const role = user?.role;
  const showB2C = !role || role === ROLE.USER;
  const showB2B = !role || role === ROLE.NUTRITIONIST;

  const handleSelectPlan = async plan => {
    if (!plan.amount || plan.amount <= 0) return;

    if (!user) {
      toast.error('Vui lòng đăng nhập để mua gói');
      return;
    }

    try {
      const result = await mutateAsync({
        amount: plan.amount,
        description: `Thanh toán gói ${plan.name}`,
        returnUrl: `${CLIENT_URL}/payment/success`,
        cancelUrl: `${CLIENT_URL}/payment/cancel`,
        targetMembership: plan.targetMembership
      });

      const checkoutUrl =
        typeof result === 'string' ? result : result?.checkoutUrl;

      if (!checkoutUrl) {
        toast.error('Không lấy được liên kết thanh toán');
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        'Tạo thanh toán thất bại, vui lòng thử lại'
      );
    }
  };

  return (
    <div className='mx-auto max-w-7xl space-y-16 px-4'>
      {showB2C && (
        <section>
          <div className='text-center max-w-4xl mx-auto mb-8 md:mb-12'>
            <h2 className='text-2xl sm:text-3xl md:text-5xl font-black text-neutral-900 tracking-tight'>
              BẢNG GIÁ DÀNH CHO <span className='text-orange-600'>CÁ NHÂN</span>
            </h2>
            <p className='text-sm sm:text-base md:text-lg text-neutral-600 mt-3 md:mt-4'>
              Trải nghiệm các tính năng AI để nâng cao sức khoẻ của bạn mỗi ngày.
            </p>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {b2cPlans.map(plan => (
              <PackageCard
                key={`b2c-${plan.name}`}
                plan={plan}
                onSelect={handleSelectPlan}
                isLoading={isPending}
              />
            ))}
          </div>
        </section>
      )}

      {showB2B && (
        <section className={showB2C ? 'border-t border-neutral-200 pt-16' : ''}>
          <div className='text-center max-w-4xl mx-auto mb-8 md:mb-12'>
            <h2 className='text-2xl sm:text-3xl md:text-5xl font-black text-neutral-900 tracking-tight'>
              BẢNG GIÁ DÀNH CHO <span className='text-emerald-700'>PT</span>
            </h2>
            <p className='text-sm sm:text-base md:text-lg text-neutral-600 mt-3 md:mt-4'>
              Ưu đãi đặc biệt dành cho phòng Gym! Hãy liên hệ MealMate để được tư vấn gói dịch vụ và nhận mức <span className='text-emerald-700 font-bold'>giá tốt nhất</span> dành cho đối tác
            </p>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {b2bPlans.map(plan => (
              <PackageCard
                key={`b2b-${plan.name}`}
                plan={plan}
                onSelect={handleSelectPlan}
                isLoading={isPending}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PackagesGrid;