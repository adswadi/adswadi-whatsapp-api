import { cn } from '@/lib/utils'

export const Table = ({ children, className }) => (
  <div className={cn('w-full overflow-x-auto', className)}>
    <table className="w-full text-sm text-left">
      {children}
    </table>
  </div>
)

export const TableHead = ({ children, className }) => (
  <thead className={cn('bg-gray-50 border-b border-gray-100', className)}>
    {children}
  </thead>
)

export const TableBody = ({ children, className }) => (
  <tbody className={cn('divide-y divide-gray-50', className)}>
    {children}
  </tbody>
)

export const TableRow = ({ children, className, onClick }) => (
  <tr
    className={cn(
      'hover:bg-gray-50/50 transition-colors',
      onClick && 'cursor-pointer',
      className
    )}
    onClick={onClick}
  >
    {children}
  </tr>
)

export const TableHeader = ({ children, className }) => (
  <th className={cn('px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider', className)}>
    {children}
  </th>
)

export const TableCell = ({ children, className }) => (
  <td className={cn('px-4 py-3 text-gray-700', className)}>
    {children}
  </td>
)
