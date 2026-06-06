import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  purple: 'bg-brand-purple/10 text-brand-purple',
  blue: 'bg-brand-blue/10 text-brand-blue',
  pink: 'bg-brand-pink/10 text-brand-pink',
  green: 'bg-whatsapp/10 text-whatsapp',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  orange: 'bg-orange-100 text-orange-700',
}

const Badge = ({ children, className, variant = 'default', dot = false, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full',
      variants[variant],
      className
    )}
    {...props}
  >
    {dot && (
      <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-gray-500': variant === 'default',
        'bg-brand-purple': variant === 'purple',
        'bg-brand-blue': variant === 'blue',
        'bg-brand-pink': variant === 'pink',
        'bg-whatsapp': variant === 'green',
        'bg-red-500': variant === 'red',
        'bg-yellow-500': variant === 'yellow',
      })} />
    )}
    {children}
  </span>
)

export default Badge
