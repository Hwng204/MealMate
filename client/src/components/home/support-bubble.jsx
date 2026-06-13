import { Facebook, Headset, MessageCircle } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';

const SupportBubble = () => {
  return (
    <div className='fixed bottom-6 left-6 z-50'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size='icon'
            className='size-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground'
          >
            <Headset className='size-7' />
            <span className='sr-only'>Hỗ trợ khách hàng</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-64 p-2' align='start' sideOffset={10}>
          <div className='flex flex-col gap-2'>
            <div className='px-2 py-1.5 pb-3 border-b'>
              <p className='font-semibold text-sm'>Liên hệ tư vấn</p>
              <p className='text-xs text-muted-foreground'>
                Chúng tôi luôn sẵn sàng hỗ trợ bạn
              </p>
            </div>

            <a
              href='https://m.me/mealmatemanagement'
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent transition-colors'
            >
              <div className='flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                <Facebook className='size-5' />
              </div>
              Facebook Messenger
            </a>

            <a
              href='https://zalo.me/your-zalo-id'
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent transition-colors'
            >
              <div className='flex size-9 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'>
                <MessageCircle className='size-5' />
              </div>
              Zalo
            </a>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SupportBubble;
