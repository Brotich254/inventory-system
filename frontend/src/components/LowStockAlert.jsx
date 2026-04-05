import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LowStockAlert({ products }) {
  const low = products.filter((p) => p.stock <= p.lowStockAt)
  if (low.length === 0) return null

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-amber-400" />
        <span className="text-amber-400 font-semibold text-sm">{low.length} item{low.length > 1 ? 's' : ''} low on stock</span>
      </div>
      <div className="space-y-1">
        {low.map((p) => (
          <div key={p._id} className="flex items-center justify-between text-sm">
            <span className="text-gray-300">{p.name} <span className="text-gray-500">({p.sku})</span></span>
            <span className="text-amber-400 font-medium">{p.stock} left</span>
          </div>
        ))}
      </div>
    </div>
  )
}
