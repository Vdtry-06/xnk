import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Field } from '../../components/ui'
import { salesOrderApi } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const EMPTY_ITEM = { productName:'', productLink:'', quantity:1, estimatedUnitPrice:'' }

export default function CreateOrderPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [items, setItems]   = useState([{...EMPTY_ITEM}])
  const [saving, setSaving] = useState(false)

  const addItem    = () => setItems(p => [...p, {...EMPTY_ITEM}])
  const removeItem = i  => setItems(p => p.filter((_,idx) => idx !== i))
  const setField   = (i, k, v) => setItems(p => p.map((it,idx) => idx===i ? {...it,[k]:v} : it))

  const submit = async () => {
    if (items.some(it => !it.productName || it.quantity < 1)) {
      toast.error('Điền đủ tên sản phẩm và số lượng'); return
    }
    setSaving(true)
    try {
      await salesOrderApi.create({
        agentId: user.userId,
        items: items.map(it => ({
          productName:        it.productName,
          productLink:        it.productLink || null,
          quantity:           Number(it.quantity),
          estimatedUnitPrice: it.estimatedUnitPrice ? Number(it.estimatedUnitPrice) : null,
        }))
      })
      toast.success('Đặt hàng thành công!')
      navigate('/orders')
    } catch(e) { toast.error(e.response?.data?.message || 'Lỗi') }
    finally { setSaving(false) }
  }

  return (
    <Layout title="Tạo đơn hàng mới">
      <div style={{ maxWidth:720 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <strong>Danh sách sản phẩm</strong>
          <button className="btn btn-outline btn-sm" onClick={addItem}>+ Thêm sản phẩm</button>
        </div>

        {items.map((it, i) => (
          <div key={i} className="card" style={{ marginBottom:12, padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <strong style={{ fontSize:13 }}>Sản phẩm #{i+1}</strong>
              {items.length > 1 && (
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>Xóa</button>
              )}
            </div>
            <div className="form-row">
              <Field label="Tên sản phẩm" required style={{ margin:0 }}>
                <input className="form-control" value={it.productName}
                  onChange={e => setField(i,'productName',e.target.value)} placeholder="BMW X5 2024"/>
              </Field>
              <Field label="Link tham khảo" style={{ margin:0 }}>
                <input className="form-control" value={it.productLink}
                  onChange={e => setField(i,'productLink',e.target.value)} placeholder="https://..."/>
              </Field>
            </div>
            <div className="form-row" style={{ marginTop:10 }}>
              <Field label="Số lượng" required style={{ margin:0 }}>
                <input type="number" className="form-control" min={1} value={it.quantity}
                  onChange={e => setField(i,'quantity',e.target.value)}/>
              </Field>
              <Field label="Đơn giá dự kiến (VND)" style={{ margin:0 }}>
                <input type="number" className="form-control" min={0} value={it.estimatedUnitPrice}
                  onChange={e => setField(i,'estimatedUnitPrice',e.target.value)} placeholder="0"/>
              </Field>
            </div>
          </div>
        ))}

        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Đang gửi...' : 'Gửi đơn hàng'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/orders')}>Hủy</button>
        </div>
      </div>
    </Layout>
  )
}
