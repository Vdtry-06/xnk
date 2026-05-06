import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Field } from '../../components/ui'
import { salesOrderApi } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const EMPTY_ITEM = { productName: '', productLink: '', quantity: 1, estimatedUnitPrice: '' }
const ERR = { color: '#ef4444', fontSize: 12, marginTop: 3 }

export default function CreateOrderPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [items,  setItems]  = useState([{ ...EMPTY_ITEM }])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const addItem    = () => setItems(p => [...p, { ...EMPTY_ITEM }])
  const removeItem = (i) => {
    setItems(p => p.filter((_, idx) => idx !== i))
    setErrors(prev => {
      const e = { ...prev }
      delete e[`${i}_productName`]; delete e[`${i}_productLink`]
      delete e[`${i}_quantity`];    delete e[`${i}_estimatedUnitPrice`]
      return e
    })
  }

  const setField = (i, k, v) => {
    setItems(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it))
    setErrors(prev => { const e = { ...prev }; delete e[`${i}_${k}`]; return e })
  }

  const validate = () => {
    const e = {}
    items.forEach((it, i) => {
      if (!it.productName.trim())                       e[`${i}_productName`]         = 'Tên sản phẩm không được để trống'
      if (!it.productLink.trim())                       e[`${i}_productLink`]         = 'Link tham khảo không được để trống'
      if (!it.quantity || Number(it.quantity) < 1)      e[`${i}_quantity`]            = 'Số lượng tối thiểu là 1'
      if (it.estimatedUnitPrice && Number(it.estimatedUnitPrice) < 0)
                                                        e[`${i}_estimatedUnitPrice`]  = 'Đơn giá không được âm'
    })
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      await salesOrderApi.create({
        agentId: user.userId,
        items: items.map(it => ({
          productName:        it.productName,
          productLink:        it.productLink,
          quantity:           Number(it.quantity),
          estimatedUnitPrice: it.estimatedUnitPrice ? Number(it.estimatedUnitPrice) : null,
        }))
      })
      toast.success('Đặt hàng thành công!')
      navigate('/orders')
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi') }
    finally { setSaving(false) }
  }

  return (
    <Layout title="Tạo đơn hàng mới">
      <div style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <strong>Danh sách sản phẩm</strong>
          <button className="btn btn-outline btn-sm" onClick={addItem}>+ Thêm sản phẩm</button>
        </div>

        {items.map((it, i) => (
          <div key={i} className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong style={{ fontSize: 13 }}>Sản phẩm #{i + 1}</strong>
              {items.length > 1 && (
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>Xóa</button>
              )}
            </div>

            <div className="form-row">
              <Field label="Tên sản phẩm" required style={{ margin: 0 }}>
                <input className="form-control" value={it.productName} placeholder="BMW X5 2024"
                  onChange={e => setField(i, 'productName', e.target.value)} />
                {errors[`${i}_productName`] && <p style={ERR}>{errors[`${i}_productName`]}</p>}
              </Field>
              <Field label="Link tham khảo" required style={{ margin: 0 }}>
                <input className="form-control" value={it.productLink} placeholder="https://..."
                  onChange={e => setField(i, 'productLink', e.target.value)} />
                {errors[`${i}_productLink`] && <p style={ERR}>{errors[`${i}_productLink`]}</p>}
              </Field>
            </div>

            <div className="form-row" style={{ marginTop: 10 }}>
              <Field label="Số lượng" required style={{ margin: 0 }}>
                <input type="number" className="form-control" min={1} value={it.quantity}
                  onChange={e => setField(i, 'quantity', e.target.value)} />
                {errors[`${i}_quantity`] && <p style={ERR}>{errors[`${i}_quantity`]}</p>}
              </Field>
              <Field label="Đơn giá dự kiến (VND)" style={{ margin: 0 }}>
                <input type="number" className="form-control" min={0} value={it.estimatedUnitPrice} placeholder="0"
                  onChange={e => setField(i, 'estimatedUnitPrice', e.target.value)} />
                {errors[`${i}_estimatedUnitPrice`] && <p style={ERR}>{errors[`${i}_estimatedUnitPrice`]}</p>}
              </Field>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Đang gửi...' : 'Gửi đơn hàng'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/orders')}>Hủy</button>
        </div>
      </div>
    </Layout>
  )
}