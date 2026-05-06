import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Field, Spinner } from '../../components/ui'
import { salesOrderApi, deliveryNoteApi, paymentApi } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const ERR = { color: '#ef4444', fontSize: 12, marginTop: 3 }

export default function CreateDeliveryPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [eligibleOrders, setEligibleOrders] = useState([])
  const [selectedOrder,  setSelectedOrder]  = useState(null)
  const [loadingOrders,  setLoadingOrders]  = useState(true)

  // 1 phiếu xuất có thể có nhiều sản phẩm
  const [items, setItems] = useState([{ orderItemId: '', deliveredQuantity: 1 }])

  const [trackingCode, setTrackingCode] = useState('')
  const [carrierName,  setCarrierName]  = useState('')
  const [shippingFee,  setShippingFee]  = useState('')

  // Lỗi validation hiển thị inline
  const [errors, setErrors] = useState({})

  const [saving, setSaving] = useState(false)

  // Load đơn hàng đủ điều kiện xuất
  useEffect(() => {
    Promise.all([
      salesOrderApi.getAll('APPROVED'),
      salesOrderApi.getAll('PROCESSING'),
    ]).then(async ([a, b]) => {
      const all    = [...(a.data?.data || []), ...(b.data?.data || [])]
      const unique = all.filter((o, i, arr) => arr.findIndex(x => x.id === o.id) === i)
      const checks = await Promise.all(unique.map(async (o) => {
        try {
          const res = await paymentApi.getBySalesOrder(o.id)
          const pay = res.data?.data
          if (!pay) return null
          const ok = pay.method === 'CASH_ON_DELIVERY' || pay.status === 'PAID'
          return ok ? o : null
        } catch { return null }
      }))
      setEligibleOrders(checks.filter(Boolean))
      setLoadingOrders(false)
    })
  }, [])

  const selectOrder = async (orderId) => {
    setErrors({})
    if (!orderId) { setSelectedOrder(null); setItems([{ orderItemId: '', deliveredQuantity: 1 }]); return }
    try {
      const res = await salesOrderApi.getById(orderId)
      setSelectedOrder(res.data.data)
      setItems([{ orderItemId: '', deliveredQuantity: 1 }])
    } catch { toast.error('Không tải được đơn hàng') }
  }

  // Sản phẩm còn hàng chưa xuất đủ
  const availableItems = selectedOrder?.items?.filter(it => (it.remainingQuantity ?? it.quantity) > 0) ?? []

  // IDs đã được chọn (để không cho chọn trùng)
  const usedIds = items.map(it => String(it.orderItemId)).filter(Boolean)

  const changeItem = (index, field, value) => {
    setErrors(prev => { const e = {...prev}; delete e[`item_${index}_${field}`]; return e })
    setItems(prev => prev.map((row, i) => {
      if (i !== index) return row
      return { ...row, [field]: value, ...(field === 'orderItemId' ? { deliveredQuantity: 1 } : {}) }
    }))
  }

  const addItem = () => setItems(prev => [...prev, { orderItemId: '', deliveredQuantity: 1 }])
  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index))
    setErrors(prev => { const e = {...prev}; delete e[`item_${index}_orderItemId`]; delete e[`item_${index}_deliveredQuantity`]; return e })
  }

  const validate = () => {
    const e = {}
    if (!selectedOrder) { e.salesOrder = 'Vui lòng chọn đơn hàng' }
    if (!trackingCode.trim()) { e.trackingCode = 'Mã vận đơn không được để trống' }
    if (!carrierName.trim())  { e.carrierName  = 'Hãng vận chuyển không được để trống' }

    const filledItems = items.filter(it => it.orderItemId)
    if (!filledItems.length) { e.items = 'Vui lòng chọn ít nhất 1 sản phẩm' }

    items.forEach((it, i) => {
      if (!it.orderItemId) { e[`item_${i}_orderItemId`] = 'Chưa chọn sản phẩm'; return }
      const oi  = availableItems.find(a => String(a.id) === String(it.orderItemId))
      const max = oi ? (oi.remainingQuantity ?? oi.quantity) : 0
      const qty = Number(it.deliveredQuantity)
      if (!qty || qty < 1)    { e[`item_${i}_deliveredQuantity`] = 'Số lượng tối thiểu là 1' }
      else if (qty > max)     { e[`item_${i}_deliveredQuantity`] = `Vượt quá số lượng còn lại (${max})` }
    })
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      await deliveryNoteApi.create({
        salesOrderId:      selectedOrder.id,
        warehouseStaffId:  user.userId,
        deliveryNoteItems: items.filter(it => it.orderItemId).map(it => ({
          orderItemId:       Number(it.orderItemId),
          deliveredQuantity: Number(it.deliveredQuantity),
        })),
        trackingCode,
        carrierName,
        shippingFee: shippingFee ? Number(shippingFee) : null,
      })
      toast.success('Tạo phiếu xuất thành công!')
      navigate('/delivery')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo phiếu xuất')
    } finally { setSaving(false) }
  }

  const canAddMore = selectedOrder && items.length < availableItems.length && items.every(it => it.orderItemId)

  return (
    <Layout title="Tạo phiếu xuất hàng">
      <div style={{ maxWidth: 680 }}>
        {loadingOrders ? <Spinner /> : (<>

          {/* ── Chọn đơn hàng ── */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <Field label="Chọn đơn hàng (đủ điều kiện xuất hàng)" required>
              <select className="form-control" onChange={e => selectOrder(e.target.value)} disabled={!eligibleOrders.length}>
                <option value="">-- Chọn đơn hàng --</option>
                {eligibleOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    SO #{o.id} — {o.agentCode} {o.agentName} ({o.items?.length ?? 0} SP)
                  </option>
                ))}
              </select>
              {errors.salesOrder && <p style={ERR}>{errors.salesOrder}</p>}
              {!eligibleOrders.length && (
                <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>
                  Không có đơn hàng nào đủ điều kiện xuất hàng.<br />
                  Điều kiện: đơn đã duyệt + (COD hoặc đã xác nhận chuyển khoản).
                </p>
              )}
            </Field>
          </div>

          {/* ── Sản phẩm xuất ── */}
          {selectedOrder && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Sản phẩm xuất hàng</h4>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {items.filter(it => it.orderItemId).length} / {availableItems.length} sản phẩm
                </span>
              </div>

              {errors.items && <p style={ERR}>{errors.items}</p>}

              {availableItems.length === 0
                ? <p style={{ fontSize: 12, color: '#f59e0b' }}>Tất cả sản phẩm đã xuất đủ số lượng.</p>
                : (<>
                  {/* Header cột */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 36px', gap: 10, marginBottom: 4 }}>
                    <label className="form-label" style={{ margin: 0 }}>Sản phẩm <span style={{ color: '#ef4444' }}>*</span></label>
                    <label className="form-label" style={{ margin: 0 }}>Số lượng xuất <span style={{ color: '#ef4444' }}>*</span></label>
                    <div />
                  </div>

                  {items.map((item, i) => {
                    const oi  = availableItems.find(a => String(a.id) === String(item.orderItemId))
                    const max = oi ? (oi.remainingQuantity ?? oi.quantity) : 1
                    return (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 36px', gap: 10, alignItems: 'start' }}>
                          {/* Dropdown sản phẩm */}
                          <div>
                            <select className="form-control" value={item.orderItemId}
                              onChange={e => changeItem(i, 'orderItemId', e.target.value)}>
                              <option value="">-- Chọn sản phẩm --</option>
                              {availableItems
                                .filter(a => !usedIds.includes(String(a.id)) || String(a.id) === String(item.orderItemId))
                                .map(a => (
                                  <option key={a.id} value={a.id}>
                                    {a.productName} (Còn lại: {a.remainingQuantity ?? a.quantity})
                                  </option>
                                ))}
                            </select>
                            {errors[`item_${i}_orderItemId`] && <p style={ERR}>{errors[`item_${i}_orderItemId`]}</p>}
                          </div>

                          {/* Số lượng */}
                          <div>
                            <input type="number" className="form-control" min={1} max={max}
                              value={item.deliveredQuantity} disabled={!item.orderItemId}
                              onChange={e => changeItem(i, 'deliveredQuantity', e.target.value)} />
                            {oi && <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'block' }}>Tối đa: {max}</span>}
                            {errors[`item_${i}_deliveredQuantity`] && <p style={ERR}>{errors[`item_${i}_deliveredQuantity`]}</p>}
                          </div>

                          {/* Nút xoá */}
                          <div>
                            {items.length > 1 && (
                              <button type="button" onClick={() => removeItem(i)}
                                style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, width: 36, height: 36, cursor: 'pointer', fontSize: 20 }}>
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {canAddMore && (
                    <button type="button" onClick={addItem}
                      style={{ marginTop: 4, background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 13, width: '100%' }}>
                      + Thêm sản phẩm
                    </button>
                  )}
                </>)
              }
            </div>
          )}

          {/* ── Thông tin vận chuyển ── */}
          {selectedOrder && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>Thông tin vận chuyển</h4>

              <Field label="Nhân viên kho">
                <input className="form-control" value={user?.name || user?.username || ''} disabled
                  style={{ background: '#f8fafc', color: '#94a3b8' }} />
              </Field>

              <div className="form-row">
                <Field label="Mã vận đơn" required style={{ margin: 0 }}>
                  <input className="form-control" value={trackingCode} placeholder="VNPOST123456"
                    onChange={e => { setTrackingCode(e.target.value); setErrors(p => ({...p, trackingCode: ''})) }} />
                  {errors.trackingCode && <p style={ERR}>{errors.trackingCode}</p>}
                </Field>
                <Field label="Hãng vận chuyển" required style={{ margin: 0 }}>
                  <input className="form-control" value={carrierName} placeholder="GHTK, Viettel Post..."
                    onChange={e => { setCarrierName(e.target.value); setErrors(p => ({...p, carrierName: ''})) }} />
                  {errors.carrierName && <p style={ERR}>{errors.carrierName}</p>}
                </Field>
              </div>

              <Field label="Phí giao hàng (VND)" style={{ marginTop: 10 }}>
                <input type="number" className="form-control" min={0} value={shippingFee} placeholder="0"
                  onChange={e => setShippingFee(e.target.value)} />
              </Field>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={submit}
              disabled={saving || !selectedOrder}>
              {saving ? 'Đang tạo...' : 'Tạo phiếu xuất'}
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/delivery')}>Hủy</button>
          </div>

        </>)}
      </div>
    </Layout>
  )
}