import { ArrowRight, Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useNutritionists } from '~/features/users/view-nutritionist/api/view-nutritionist';

const NutritionistCard = ({ nutritionist }) => {
  if (!nutritionist) {
    return null;
  }

  const profile = nutritionist.nutritionistProfile;

  return (
    <Card className='group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-background/90 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]'>
      <div className='absolute inset-x-0 top-0 h-28 bg-linear-to-br from-primary/12 via-primary/6 to-transparent' />

      <div className='relative px-6 pt-8'>
        <Avatar className='mx-auto mb-4 h-28 w-28 ring-4 ring-background shadow-[0_10px_30px_rgba(15,23,42,0.12)]'>
          <AvatarImage src={nutritionist.avatar} alt={nutritionist.name} />
          <AvatarFallback className='bg-primary/10 text-3xl font-bold text-primary'>
            {nutritionist.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className='space-y-1 text-center'>
          <h3 className='line-clamp-2 text-lg font-black tracking-tight text-foreground'>
            {nutritionist.name}
          </h3>
          <div className='mx-auto h-1 w-12 rounded-full bg-primary/20' />
        </div>
      </div>

      <CardContent className='relative flex flex-1 flex-col justify-between px-6 pb-6 pt-5'>
        <div className='space-y-4'>
          {(profile?.workplace || profile?.graduatedUniversity) && (
            <div className='space-y-3'>
              {profile?.workplace && (
                <div className='flex items-start gap-3 rounded-2xl bg-muted/50 px-3 py-3'>
                  <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm'>
                    <Building2 className='h-4 w-4' />
                  </div>
                  <span className='line-clamp-2 text-sm leading-6 text-muted-foreground'>
                    {profile.workplace}
                  </span>
                </div>
              )}

              {profile?.graduatedUniversity && (
                <div className='flex items-start gap-3 rounded-2xl bg-muted/50 px-3 py-3'>
                  <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm'>
                    <GraduationCap className='h-4 w-4' />
                  </div>
                  <span className='line-clamp-2 text-sm leading-6 text-muted-foreground'>
                    {profile.graduatedUniversity}
                  </span>
                </div>
              )}
            </div>
          )}

          {profile?.professionalBio && (
            <div className='rounded-2xl border border-border/70 bg-background px-4 py-4 text-left'>
              <p className='line-clamp-4 text-sm leading-7 text-muted-foreground'>
                {profile.professionalBio}
              </p>
            </div>
          )}
        </div>

        <Button
          asChild
          variant='ghost'
          size='sm'
          className='mt-5 h-11 w-full rounded-2xl border border-primary/15 bg-primary/5 font-bold text-primary transition-colors duration-200 hover:bg-primary/10 hover:text-primary'
        >
          <Link to={`/nutritionists/${nutritionist._id}`}>
            <span>Xem hồ sơ</span>
            <ArrowRight className='ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5' />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const NutritionistList = () => {
  const { data } = useNutritionists({ page: 1, limit: 4 });
  const docs = data?.docs || [];

  if (docs.length === 0) {
    return null;
  }

  return (
    <section className='mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8'>
      {/* Centering Header Content */}
      <div className='mb-12 flex flex-col items-center text-center'>
        <div className='space-y-3 flex flex-col items-center'>
          <span className='inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary w-fit'>
            Chuyên gia
          </span>
          <h2 className='text-3xl font-black tracking-tight text-foreground sm:text-4xl'>
            Đội ngũ chuyên gia của chúng tôi
          </h2>
          <p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
            Kết nối với đội ngũ chuyên gia giàu kinh nghiệm để nhận tư vấn dinh
            dưỡng phù hợp với mục tiêu sức khỏe của bạn.
          </p>
        </div>
      </div>

      {/* Grid Centering: justify-center helps if there are fewer than 4 items */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center'>
        {docs.map(nutritionist => (
          <NutritionistCard
            key={nutritionist._id ?? nutritionist.name}
            nutritionist={nutritionist}
          />
        ))}
      </div>
    </section>
  );
};

export default NutritionistList;