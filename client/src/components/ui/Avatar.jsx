import { cn, getInitials } from '@/lib/utils'

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
}

const Avatar = ({ src, name, size = 'md', className, status }) => {
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizeMap[size])}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-bold font-jakarta text-white',
            sizeMap[size]
          )}
          style={{ background: 'linear-gradient(135deg, #7B2FBE, #4A6CF7)' }}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
            status === 'online' ? 'bg-whatsapp' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  )
}

export default Avatar
