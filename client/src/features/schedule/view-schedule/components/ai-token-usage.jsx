export default function AITokenUsage({ remainingTokens, dailyTokenLimit, showWorkoutCost = false }) {
  if (typeof remainingTokens !== 'number') return null;

  return (
    <div className='mt-1.5 space-y-0.5'>
      <p className='mt-1 text-[11px] font-semibold text-primary/80'>
        AI tokens còn lại: {remainingTokens.toLocaleString('vi-VN')}
        {typeof dailyTokenLimit === 'number'
          ? ` / ${dailyTokenLimit.toLocaleString('vi-VN')}`
          : ''}
      </p>
      <p className='text-[10px] font-medium text-muted-foreground/70'>
        Gợi ý thực đơn ngày: <span className='font-bold text-primary/60'>10.000 tokens / lần</span>
        {showWorkoutCost && (
          <> · Gợi ý bài tập: <span className='font-bold text-purple-600/70'>5.000 tokens / lần</span></>
        )}
      </p>
    </div>
  );
}
