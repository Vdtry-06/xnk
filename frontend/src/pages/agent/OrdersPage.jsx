import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Badge, Spinner, Empty, fmt } from '../../components/ui'
import { salesOrderApi } from '../../api'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'

const FILTERS = ['ALL','PENDING','APPROVED','PROCESSING','COMPLETED']

export default function AgentOrdersPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [filter, setFilter] = useState('ALL')

  const { data: allOrders, loading, refetch } = useApi(
    () => salesOrderApi.getAll(filter === 'ALL' ? null : filter), [filter])

  const orders = allOrders?.filter(o => o.agentId === user.userId || o.agentId === user.id)

  return (
    <Layout title="Đơn hàng của tôi">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-outline'}`} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/orders/create')}>+ Đặt hàng mới</button>
      </div>

      <div className="card">
        {loading ? <Spinner/> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>ID</th><th>Sản phẩm</th><th>Tổng dự kiến</th><th>Trạng thái</th><th>Ngày tạo</th><th></th>
              </tr></thead>
              <tbody>
                {!orders?.length
                  ? <tr><td colSpan={6}><Empty msg="Chưa có đơn hàng nào"/></td></tr>
                  : orders.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.items?.length ?? 0} sản phẩm</td>
                      <td>{fmt.currency(o.totalEstimatedPrice)}</td>
                      <td><Badge status={o.status}/></td>
                      <td>{fmt.date(o.createdAt)}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/orders/${o.id}`)}>Chi tiết</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
