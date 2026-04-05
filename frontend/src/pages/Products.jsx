import { useEffect, useState } from 'react'
import { api } from '../api'
import { PlusCircle, Trash2, ArrowDownCircle, ArrowUpCircle, Search } from 'lucide-react'

const cls = "bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Tools', 'Office', 'Other']

export default function Products() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [txModal, setTxModal] = useState(null) // { product, type }
  const [form, setForm] = useState({ name: '', sku: '', category: 'Electronics', price: '', stock: '', lowStockAt: '10', supplier: '', description: '' })
  const [txForm, setTxForm] = useState({ quantity: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.getProducts().then(setProducts)

  useEffect(() => { load(); api.getSuppliers().then(setSuppliers) }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await api.createProduct({ ...form, price: Number(form.price), stock: Number(form.stock), lowStockAt: Number(form.lowStockAt) })
      setForm({ name: '', sku: '', category: 'Electronics', price: '', stock: '', lowStockAt: '10', supplier: '', description: '' })
      setShowForm(false); load()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.deleteProduct(id); load()
  }

  const handleTx = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await api.addTransaction({ productId: txModal.product._id, type: txModal.type, quantity: Number(txForm.quantity), note: txForm.note })
      setTxModal(null); setTxForm({ quantity: '', note: '' }); load()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 text-sm">{products.length} items in inventory</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <PlusCircle size={16} /> Add Product
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} required />
          <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={cls} required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={cls}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className={cls} required>
            <option value="">Select Supplier</option>
            {suppliers.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
          </select>
          <input type="number" placeholder="Price ($)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={cls} required min="0" step="0.01" />
          <input type="number" placeholder="Initial Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={cls} required min="0" />
          <input type="number" placeholder="Low Stock Alert At" value={form.lowStockAt} onChange={(e) => setForm({ ...form, lowStockAt: e.target.value })} className={cls} min="0" />
          <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cls} />
          {error && <p className="text-red-400 text-xs sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
        <input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left border-b border-gray-800 bg-gray-900/80">
              {['Name', 'SKU', 'Category', 'Supplier', 'Price', 'Stock', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((p) => (
              <tr key={p._id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 text-gray-400">{p.category}</td>
                <td className="px-4 py-3 text-gray-400">{p.supplier}</td>
                <td className="px-4 py-3 text-gray-300">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${p.stock <= p.lowStockAt ? 'text-amber-400' : 'text-green-400'}`}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setTxModal({ product: p, type: 'in' }); setError('') }} title="Stock In" className="text-green-400 hover:text-green-300 transition-colors"><ArrowDownCircle size={16} /></button>
                    <button onClick={() => { setTxModal({ product: p, type: 'out' }); setError('') }} title="Stock Out" className="text-red-400 hover:text-red-300 transition-colors"><ArrowUpCircle size={16} /></button>
                    <button onClick={() => handleDelete(p._id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction modal */}
      {txModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-1">
              {txModal.type === 'in' ? '📦 Stock In' : '📤 Stock Out'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{txModal.product.name} — current stock: <span className="text-white">{txModal.product.stock}</span></p>
            <form onSubmit={handleTx} className="space-y-3">
              <input type="number" placeholder="Quantity" value={txForm.quantity} onChange={(e) => setTxForm({ ...txForm, quantity: e.target.value })} className={`w-full ${cls}`} required min="1" />
              <input placeholder="Note (optional)" value={txForm.note} onChange={(e) => setTxForm({ ...txForm, note: e.target.value })} className={`w-full ${cls}`} />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  {loading ? 'Saving...' : 'Confirm'}
                </button>
                <button type="button" onClick={() => setTxModal(null)} className="text-gray-400 hover:text-white text-sm transition-colors px-4">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
