import { useEffect, useState } from 'react'
import { api } from '../api'
import { PlusCircle, Trash2 } from 'lucide-react'

const cls = "bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.getSuppliers().then(setSuppliers)
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await api.createSupplier(form)
      setForm({ name: '', email: '', phone: '', address: '' })
      setShowForm(false); load()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return
    await api.deleteSupplier(id); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="text-gray-400 text-sm">{suppliers.length} suppliers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <PlusCircle size={16} /> Add Supplier
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={cls} required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={cls} />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={cls} />
          {error && <p className="text-red-400 text-xs sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              {loading ? 'Saving...' : 'Save Supplier'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-lg">
                {s.name[0].toUpperCase()}
              </div>
              <button onClick={() => handleDelete(s._id)} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={15} />
              </button>
            </div>
            <h3 className="font-semibold text-white">{s.name}</h3>
            <p className="text-gray-400 text-sm mt-1">{s.email}</p>
            {s.phone && <p className="text-gray-500 text-xs mt-1">{s.phone}</p>}
            {s.address && <p className="text-gray-500 text-xs mt-0.5">{s.address}</p>}
          </div>
        ))}
        {suppliers.length === 0 && (
          <p className="text-gray-500 text-sm col-span-3 py-10 text-center">No suppliers yet.</p>
        )}
      </div>
    </div>
  )
}
