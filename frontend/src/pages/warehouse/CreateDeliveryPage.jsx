import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Field, Spinner } from '../../components/ui'
import { salesOrderApi, deliveryNoteApi, paymentApi } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function CreateDeliveryPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [eligibleOrders, setEligibleOrders] = useState([])
  const [selectedOrder,  setSelectedOrder]  = useState(null)
  const [loadingOrders,  setLoadingOrders]  = useState(true)

  // delivery note form
  const [form, setForm] = useState({
    orderItemId: '', deliveredQuantity: 1,
    trackingCode: '', carrierName: '', shippingFee: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load APPROVED + PROCESSING orders, rồi lọc theo điều kiện thanh toán
    Promise.all([
      salesOrderApi.getAll('APPROVED'),
      salesOrderApi.getAll('PROCESSING'),
    ]).then(async ([a, b]) => {
      const all = [...(a.data?.data || []), ...(b.data?.data || [])]
      const unique = all.filter((o,i,arr) => arr.findIndex(x => x.id===o.id) === i)

      // Với mỗi đơn, kiểm tra payment để chỉ hiển thị đơn đủ điều kiện xuất
      const checks = await Promise.all(unique.map(async (o) => {
        try {
          const res = await paymentApi.getBySalesOrder(o.id)
          const payment = res.data?.data
          if (!payment) return null
          // COD: luôn được xuất; BANK_TRANSFER: phải PAID
          const ok = payment.method === 'CASH_ON_DELIVERY' || payment.status === 'PAID'
          return ok ? o : null
        } catch {
          return null
        }
      }))

      setEligibleOrders(checks.filter(Boolean))
      setLoadingOrders(false)
    })
  }, [])

  // When order selected, get full detail with items
  const selectOrder = async (orderId) => {
    if (!orderId) { setSelectedOrder(null); return }
    try {
      const res = await salesOrderApi.getById(orderId)
      setSelectedOrder(res.data.data)
      setForm(p => ({...p, orderItemId: '', deliveredQuantity: 1}))
    } catch { toast.error('Không tải được đơn hàng') }
  }

  const selectedItem = selectedOrder?.items?.find(it => String(it.id) === String(form.orderItemId))
  const availableItems = selectedOrder?.items?.filter(it => (it.remainingQuantity ?? it.quantity) > 0) ?? []

  const submit = async () => {
    if (!selectedOrder || !form.orderItemId || form.deliveredQuantity < 1) {
      toast.error('Chọn đơn hàng, sản phẩm và số lượng'); return
    }
    setSaving(true)
    try {
      await deliveryNoteApi.create({
        salesOrderId:      selectedOrder.id,
        warehouseStaffId:  user.userId,
        deliveryNoteItems: [
          {
            orderItemId: Number(form.orderItemId),
            deliveredQuantity: Number(form.deliveredQuantity),
          },
        ],
        trackingCode:      form.trackingCode  || null,
        carrierName:       form.carrierName   || null,
        shippingFee:       form.shippingFee   ? Number(form.shippingFee) : null,
      })
      toast.success('Tạo phiếu xuất thành công!')
      navigate('/delivery')
    } catch(e) { toast.error(e.response?.data?.message || 'Lỗi') }
    finally { setSaving(false) }
  }

  return (
    <Layout title="Tạo phiếu xuất hàng">
      <div style={{ maxWidth:640 }}>
        {loadingOrders ? <Spinner/> : (
          <>
            <div className="card" style={{ padding:20, marginBottom:16 }}>
              <Field label="Chọn đơn hàng (đủ điều kiện xuất hàng)" required>
                <select className="form-control"
                  onChange={e => selectOrder(e.target.value)}
                  disabled={!eligibleOrders.length}>
                  <option value="">-- Chọn đơn hàng --</option>
                  {eligibleOrders.map(o => (
                    <option key={o.id} value={o.id}>
                      SO #{o.id} — {o.agentCode} {o.agentName} ({o.items?.length ?? 0} SP)
                    </option>
                  ))}
                </select>
                {!eligibleOrders.length && (
                  <p style={{ fontSize:12, color:'#f59e0b', marginTop:4 }}>
                    Không có đơn hàng nào đủ điều kiện xuất hàng.<br/>
                    Điều kiện: đơn đã duyệt + (thanh toán khi nhận hàng HOẶC đã xác nhận chuyển khoản).
                  </p>
                )}
              </Field>

              {selectedOrder && (
                <Field label="Chọn sản phẩm xuất" required>
                  <select className="form-control" value={form.orderItemId}
                    onChange={e => setForm(p => ({...p, orderItemId: e.target.value, deliveredQuantity: 1}))}>
                    <option value="">-- Chọn sản phẩm --</option>
                    {availableItems.map(it => (
                      <option key={it.id} value={it.id}>
                        {it.productName} (Còn lại: {it.remainingQuantity ?? it.quantity})
                      </option>
                    ))}
                  </select>
                  {availableItems.length === 0 && (
                    <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>Tất cả sản phẩm đã được xuất đủ số lượng</p>
                  )}
                </Field>
              )}

              {selectedItem && (
                <Field label={`Số lượng xuất (còn lại: ${selectedItem.remainingQuantity ?? selectedItem.quantity})`} required>
                  <input type="number" className="form-control" min={1} max={selectedItem.remainingQuantity ?? selectedItem.quantity}
                    value={form.deliveredQuantity}
                    onChange={e => setForm(p => ({...p, deliveredQuantity: e.target.value}))}/>
                </Field>
              )}
            </div>

            {selectedOrder && (
              <div className="card" style={{ padding:20, marginBottom:16 }}>
                <h4 style={{ marginBottom:14, fontSize:14 }}>Thông tin vận chuyển</h4>
                <Field label="Nhân viên kho">
                  <input className="form-control" value={user?.name || user?.username || ''} disabled
                    style={{ background:'#f8fafc', color:'#94a3b8' }}/>
                </Field>
                <div className="form-row">
                  <Field label="Mã vận đơn" style={{ margin:0 }}>
                    <input className="form-control" value={form.trackingCode}
                      onChange={e => setForm(p => ({...p, trackingCode: e.target.value}))} placeholder="VNPOST123456"/>
                  </Field>
                  <Field label="Hãng vận chuyển" style={{ margin:0 }}>
                    <input className="form-control" value={form.carrierName}
                      onChange={e => setForm(p => ({...p, carrierName: e.target.value}))} placeholder="GHTK, Viettel Post..."/>
                  </Field>
                </div>
                <Field label="Phí giao hàng (VND)" style={{ marginTop:10 }}>
                  <input type="number" className="form-control" min={0} value={form.shippingFee}
                    onChange={e => setForm(p => ({...p, shippingFee: e.target.value}))} placeholder="0"/>
                </Field>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" onClick={submit}
                disabled={saving || !selectedOrder || !form.orderItemId}>
                {saving ? 'Đang tạo...' : 'Tạo phiếu xuất'}
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/delivery')}>Hủy</button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
