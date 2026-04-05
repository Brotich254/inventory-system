import { useEffect, useState } from 'react'
import { api } from '../api'
import StatCard from '../components/StatCard'
import LowStockAlert from '../components/LowStockAlert'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Package, Truck, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    api.getProducts().then(setProducts)
    api.getSuppliers().then(setSuppliers)
    api.getTransactions().then(setTransactions)
  }, [])

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0)
  const stockIn  = transactions.filter((t) => t.type === 'in').reduce((s, t) => s + t.quantity, 0)
  const stockOut = transactions.filter((t) => t.type === 'out').reduce((s, t) => s + t.quantity, 0)

  // Category breakdown for chart
  const byCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.stock
    return acc
  }, {})
  const chartData = Object.entries(byCategory).map(([name, stock]) => ({ name, stock }))

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-6">Inventory overview</p>

      <LowStockAlert products={products} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Products"  value={products.length}         icon={Package}         color="text-indigo-400" />
        <StatCard label="Total Suppliers" value={suppliers.length}        icon={Truck}           color="text-blue-400" />
        <StatCard label="Stock In"        value={stockIn}                 icon={ArrowDownCircle} color="text-green-400" sub="all time" />
        <StatCard label="Stock Out"       value={stockOut}                icon={ArrowUpCircle}   color="text-red-400"   sub="all time" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory value */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-1">Total Inventory Value</h2>
          <p className="text-4xl font-bold text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Stock by category */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">Stock by Category</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-10">No data yet</p>
          )}
        </div>

        {/* Recent transactions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-800">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Stock After</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {transactions.slice(0, 8).map((t) => (
                  <tr key={t._id}>
                    <td className="py-2.5 text-white">{t.productName}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'in' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {t.type === 'in' ? 'Stock In' : 'Stock Out'}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-300">{t.quantity}</td>
                    <td className="py-2.5 text-gray-300">{t.stockAfter}</td>
                    <td className="py-2.5 text-gray-500">{t.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
