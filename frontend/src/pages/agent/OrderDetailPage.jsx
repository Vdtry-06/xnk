import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Badge, Spinner, fmt } from '../../components/ui'
import { salesOrderApi } from '../../api'
import { useApi } from '../../hooks/useApi'

export default function AgentOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, loading } = useApi(() => salesOrderApi.getById(id), [id])

  if (loading) return <Layout title="Chi tiết đơn hàng"><Spinner/></Layout>
  if (!order)  return <Layout title="Chi tiết đơn hàng"><p>Không tìm thấy đơn hàng</p></Layout>

  return (
    <Layout title={`Đơn hàng #${order.id}`}>
      <div style={{ maxWidth: 720 }}>
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><span style={{ color:'#64748b' }}>Trạng thái: </span><Badge status={order.status}/></div>
            <div><span style={{ color:'#64748b' }}>Ngày tạo: </span>{fmt.date(order.createdAt)}</div>
            <div><span style={{ color:'#64748b' }}>Tổng dự kiến: </span><strong>{fmt.currency(order.totalEstimatedPrice)}</strong></div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <table>
            <thead><tr>
              <th>#</th><th>Sản phẩm</th><th>SL</th><th>Đơn giá DK</th><th>Thành tiền</th>
            </tr></thead>
            <tbody>
              {order.items?.map((it, i) => (
                <tr key={it.id}>
                  <td>{i+1}</td>
                  <td>
                    {it.productName}
                    {it.productLink && <><br/><a href={it.productLink} target="_blank" rel="noreferrer" style={{ fontSize:12 }}>Link</a></>}
                  </td>
                  <td>{it.quantity}</td>
                  <td>{fmt.currency(it.estimatedUnitPrice)}</td>
                  <td>{it.estimatedUnitPrice ? fmt.currency(it.estimatedUnitPrice * it.quantity) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          {(order.status === 'APPROVED' || order.status === 'PROCESSING') && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/orders/${id}/payment`)}
            >
              Thanh toán
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navigate('/orders')}>Quay lại</button>
        </div>
      </div>
    </Layout>
  )
}
