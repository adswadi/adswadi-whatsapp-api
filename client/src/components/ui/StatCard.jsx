import { cn, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorVariants = {
  purple: 'stat-card-purple',
  blue: 'stat-card-blue',
  pink: 'stat-card-pink',
  green: 'stat-card-green',
}

const iconBg = {
  purple: 'bg-brand-purple/10 text-brand-purple',
  blue: 'bg-brand-blue/10 text-brand-blue',
  pink: 'bg-brand-pink/10 text-brand-pink',
  green: 'bg-whatsapp/10 text-whatsapp',
}

const StatCard = ({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  color = 'purple',
  suffix = '',
  prefix = '',
  className,
}) => {
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div className={cn('rounded-2xl p-5 bg-white border border-gray-100 shadow-sm', colorVariants[color], className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {Icon && (
          <div className={cn('p-2 rounded-xl', iconBg[color])}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 font-jakarta">
            {prefix}{typeof value === 'number' ? formatNumber(value) : value}{suffix}
          </p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', {
              'text-green-600': isPositive,
              'text-red-500': isNegative,
              'text-gray-500': !isPositive && !isNegative,
            })}>
              {isPositive && <TrendingUp size={12} />}
              {isNegative && <TrendingDown size={12} />}
              <span>{isPositive ? '+' : ''}{change}%</span>
              <span className="text-gray-400 font-normal">{changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatCard
