import { cn } from '@/lib/utils'

export const Card = ({ children, className, hover = false, ...props }) => (
  <div
    className={cn(
      'bg-white rounded-2xl border border-gray-100 shadow-sm',
      hover && 'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('font-bold text-gray-900 font-jakarta text-lg', className)} {...props}>
    {children}
  </h3>
)

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-t border-gray-100', className)} {...props}>
    {children}
  </div>
)

export default Card
