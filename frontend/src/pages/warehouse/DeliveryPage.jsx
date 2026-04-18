import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Spinner, Empty, fmt } from '../../components/ui'
import { deliveryNoteApi } from '../../api'
import { useApi } from '../../hooks/useApi'

export default function DeliveryPage() {
  const navigate = useNavigate()
  const { data: notes, loading } = useApi(() => deliveryNoteApi.getAll())

  return (
    <Layout title="Phiếu xuất hàng">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn btn-primary" onClick={() => navigate('/delivery/create')}>+ Tạo phiếu xuất</button>
      </div>

      <div className="card">
        {loading ? <Spinner/> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>ID</th><th>Đơn hàng</th><th>Sản phẩm</th><th>Tổng SL xuất</th><th>Đại lý nhận</th><th>Mã vận đơn</th><th>Hãng VC</th><th>Phí ship</th><th>Ngày xuất</th><th>NV kho</th>
              </tr></thead>
              <tbody>
                {!notes?.length
                  ? <tr><td colSpan={10}><Empty msg="Chưa có phiếu xuất nào"/></td></tr>
                  : notes.map(n => {
                      const items = n.deliveryNoteItems || []
                      const productSummary = items.map(i => `${i.productName} (${i.deliveredQuantity})`).join(', ')
                      const totalQty = items.reduce((sum, i) => sum + (i.deliveredQuantity || 0), 0)
                      return (
                        <tr key={n.id}>
                      <td>#{n.id}</td>
                      <td>SO #{n.salesOrderId}</td>
                      <td>{productSummary || '—'}</td>
                      <td>{totalQty}</td>
                      <td><strong>{n.agentCode}</strong><div style={{ fontSize:12, color:'#64748b' }}>{n.agentName}</div></td>
                      <td style={{ fontFamily:'monospace', fontSize:12 }}>{n.trackingCode || '—'}</td>
                      <td>{n.carrierName || '—'}</td>
                      <td>{fmt.currency(n.shippingFee)}</td>
                      <td>{fmt.date(n.createdAt)}</td>
                      <td style={{ fontSize:12, color:'#64748b' }}>{n.warehouseStaffName}</td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
