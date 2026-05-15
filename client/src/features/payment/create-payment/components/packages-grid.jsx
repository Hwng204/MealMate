import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import { MEMBERSHIP_LEVEL } from '~/constants/membership-level';
import { ROLE } from '~/constants/role';

import { useCreatePayment } from '../api/create-payment';
import PackageCard from './package-card';

const plans = [
  {
    name: 'Cơ bản',
    category: 'B2C',
    price: '0đ',
    desc: 'Bắt đầu hành trình sống khỏe',
    features: [
      'AI gợi ý bữa ăn theo từng ngày',
      'Theo dõi lịch trình ăn uống',
      'Tính toán Calories & Dinh dưỡng',
      'Lưu món ăn yêu thích'
    ],
    highlight: false,
    amount: 0,
    targetMembership: MEMBERSHIP_LEVEL.NORMAL
  },
  {
    name: 'Premium',
    category: 'B2C',
    price: '89k',
    period: '/ tháng',
    desc: 'Tối ưu hóa sức khỏe toàn diện',
    features: [
      'AI gợi ý bữa ăn & tập luyện theo tuần',
      'Tự động tạo danh sách mua sắm',
      'Nhận tư vấn từ chuyên gia',
      'Chuyên gia lên lịch trình riêng'
    ],
    highlight: true,
    amount: 89000,
    targetMembership: MEMBERSHIP_LEVEL.VIP
  },
  {
    name: 'Basic',
    category: 'B2B',
    price: '375k',
    period: '/ tháng',
    desc: 'Quản lý tối đa 5 học viên',
    features: [
      'Cấp tài khoản Premium cho 5 học viên',
      'Theo dõi lịch trình ăn uống & tập luyện',
      'Điều chỉnh chế độ ăn & bài tập học viên',
      'Chat trực tiếp hỗ trợ học viên'
    ],
    highlight: false,
    amount: 375000,
    targetMembership: MEMBERSHIP_LEVEL.EXPERT_BASIC
  },
  {
    name: 'Standard',
    category: 'B2B',
    price: '630k',
    period: '/ tháng',
    desc: 'Quản lý tối đa 10 học viên',
    features: [
      'Cấp tài khoản Premium cho 10 học viên',
      'Theo dõi lịch trình ăn uống & tập luyện',
      'Điều chỉnh chế độ ăn & bài tập học viên',
      'Chat trực tiếp hỗ trợ học viên'
    ],
    highlight: true,
    amount: 630000,
    targetMembership: MEMBERSHIP_LEVEL.EXPERT_STANDARD
  },
  {
    name: 'Premium',
    category: 'B2B',
    price: '1.190k',
    period: '/ tháng',
    desc: 'Quản lý tối đa 20 học viên',
    features: [
      'Cấp tài khoản Premium cho 20 học viên',
      'Theo dõi lịch trình ăn uống & tập luyện',
      'Điều chỉnh chế độ ăn & bài tập học viên',
      'Chat trực tiếp hỗ trợ học viên'
    ],
    highlight: false,
    amount: 1190000,
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
    <div className='mx-auto max-w-7xl space-y-16 px-4 py-8'>
      {showB2C && (
        <section>
          <h2 className='mb-8 text-center text-3xl font-bold text-neutral-900'>
            Dành cho Cá nhân
          </h2>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-3xl'>
            {plans
              .filter(p => p.category === 'B2C')
              .map(plan => (
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
          <h2 className='mb-8 text-center text-3xl font-bold text-neutral-900'>
            Dành cho Chuyên gia
          </h2>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {plans
              .filter(p => p.category === 'B2B')
              .map(plan => (
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
