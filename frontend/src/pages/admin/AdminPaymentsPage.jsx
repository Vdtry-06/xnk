import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Badge, Spinner, fmt, Empty, ConfirmModal } from '../../components/ui'
import { paymentApi } from '../../api'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const METHOD_LABELS = {
  BANK_TRANSFER: 'Chuyển khoản',
  CASH_ON_DELIVERY: 'Nhận hàng',
}

export default function AdminPaymentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: payments, loading, refetch } = useApi(() => paymentApi.getAll(), [])
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'paid'|'cancel', id }
  const [processing, setProcessing] = useState(false)

  const handleConfirm = async () => {
    if (!confirmModal) return
    const managerId = user?.userId
    if (!managerId) {
      toast.error('Không tìm thấy managerId. Vui lòng đăng nhập lại.')
      return
    }
    setProcessing(true)
    try {
      if (confirmModal.type === 'paid') {
        await paymentApi.confirmPaid(confirmModal.id, managerId)
        toast.success('Đã xác nhận thanh toán!')
      } else {
        await paymentApi.cancel(confirmModal.id)
        toast.success('Đã hủy thanh toán.')
      }
      refetch()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi xử lý')
    } finally {
      setProcessing(false)
      setConfirmModal(null)
    }
  }

  if (loading) return <Layout title="Quản lý thanh toán"><Spinner/></Layout>

  const pending  = (payments || []).filter(p => p.status === 'PENDING')
  const others   = (payments || []).filter(p => p.status !== 'PENDING')

  return (
    <Layout title="Quản lý thanh toán">
      {/* Pending */}
      <h3 style={{ fontSize: 15, marginBottom: 12, color: 'var(--gray-700)' }}>
        Chờ xác nhận ({pending.length})
      </h3>
      <div className="card" style={{ marginBottom: 24 }}>
        {pending.length === 0
          ? <Empty msg="Không có thanh toán nào đang chờ"/>
          : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Đơn hàng</th>
                  <th>Phương thức</th>
                  <th>Số tiền</th>
                  <th>Ghi chú</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '2px 10px', fontSize: 13 }}
                        onClick={() => navigate(`/admin/orders/${p.salesOrderId}`)}
                      >
                        #{p.salesOrderId}
                      </button>
                    </td>
                    <td>{METHOD_LABELS[p.method] || p.method}</td>
                    <td><strong style={{ color: 'var(--primary)' }}>{fmt.currency(p.amount)}</strong></td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>{p.note || '—'}</td>
                    <td style={{ fontSize: 13 }}>{fmt.date(p.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-success"
                          style={{ padding: '4px 12px', fontSize: 13 }}
                          onClick={() => setConfirmModal({ type: 'paid', id: p.id })}
                        >
                          Xác nhận
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 12px', fontSize: 13 }}
                          onClick={() => setConfirmModal({ type: 'cancel', id: p.id })}
                        >
                          Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {/* Lịch sử */}
      <h3 style={{ fontSize: 15, marginBottom: 12, color: 'var(--gray-700)' }}>
        📋 Lịch sử thanh toán ({others.length})
      </h3>
      <div className="card">
        {others.length === 0
          ? <Empty msg="Chưa có lịch sử"/>
          : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Đơn hàng</th>
                  <th>Phương thức</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày TT</th>
                </tr>
              </thead>
              <tbody>
                {others.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '2px 10px', fontSize: 13 }}
                        onClick={() => navigate(`/admin/orders/${p.salesOrderId}`)}
                      >
                        #{p.salesOrderId}
                      </button>
                    </td>
                    <td>{METHOD_LABELS[p.method] || p.method}</td>
                    <td>{fmt.currency(p.amount)}</td>
                    <td><Badge status={p.status}/></td>
                    <td style={{ fontSize: 13 }}>{fmt.date(p.paidAt) || fmt.date(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.type === 'paid' ? 'Xác nhận đã thanh toán' : 'Hủy thanh toán'}
          message={
            confirmModal.type === 'paid'
              ? 'Xác nhận rằng bạn đã nhận được tiền thanh toán từ đại lý?'
              : 'Bạn có chắc muốn hủy yêu cầu thanh toán này?'
          }
          danger={confirmModal.type === 'cancel'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </Layout>
  )
}
