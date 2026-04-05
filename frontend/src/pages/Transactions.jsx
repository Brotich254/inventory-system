import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTransactions().then(setTransactions).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Transactions</h1>
      <p className="text-gray-400 text-sm mb-6">Full stock movement history</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left border-b border-gray-800">
              {['Product', 'Type', 'Quantity', 'Stock After', 'Note', 'Date'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No transactions yet.</td></tr>
            ) : transactions.map((t) => (
              <tr key={t._id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{t.productName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'in' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {t.type === 'in' ? '↓ Stock In' : '↑ Stock Out'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{t.quantity}</td>
                <td className="px-4 py-3 text-gray-300">{t.stockAfter}</td>
                <td className="px-4 py-3 text-gray-500">{t.note || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{t.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
