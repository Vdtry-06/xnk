import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../components/Layout'
import { Badge, Spinner, Empty, fmt } from '../../../components/ui'
import { salesOrderApi } from '../../../api'
import { useApi } from '../../../hooks/useApi'

const FILTERS = ['ALL','PENDING','APPROVED','PROCESSING','COMPLETED']

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('ALL')

  const { data: orders, loading } = useApi(
    () => salesOrderApi.getAll(filter === 'ALL' ? null : filter), [filter])

  return (
    <Layout title="Quản lý đơn hàng">
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-outline'}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card">
        {loading ? <Spinner/> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>ID</th><th>Đại lý</th><th>Sản phẩm</th><th>Tổng dự kiến</th><th>Trạng thái</th><th>Ngày tạo</th><th></th>
              </tr></thead>
              <tbody>
                {!orders?.length
                  ? <tr><td colSpan={7}><Empty msg="Chưa có đơn hàng nào"/></td></tr>
                  : orders.map(o => (
                    <tr key={o.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/admin/orders/${o.id}`)}>
                      <td>#{o.id}</td>
                      <td><strong>{o.agentCode}</strong><div style={{ fontSize:12, color:'#64748b' }}>{o.agentName}</div></td>
                      <td>{o.items?.length ?? 0} sản phẩm</td>
                      <td>{fmt.currency(o.totalEstimatedPrice)}</td>
                      <td><Badge status={o.status}/></td>
                      <td>{fmt.date(o.createdAt)}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); navigate(`/admin/orders/${o.id}`) }}>Chi tiết</button>
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
