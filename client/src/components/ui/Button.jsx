import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  default: 'bg-brand-purple text-white hover:bg-brand-purple/90',
  gradient: 'bg-gradient-brand text-white hover:opacity-90',
  outline: 'border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  success: 'bg-whatsapp text-white hover:bg-whatsapp/90',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-xl',
}

const Button = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

export default Button
