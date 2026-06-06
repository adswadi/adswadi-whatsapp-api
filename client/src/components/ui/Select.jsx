import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({ className, label, error, options = [], placeholder, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple',
          'transition-all duration-200',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))

Select.displayName = 'Select'
export default Select
