export const Badge = ({ status }) => {
  const map = {
    PENDING:'amber', APPROVED:'blue', PROCESSING:'purple', COMPLETED:'green',
    SENT:'amber', PARTIAL_RECEIVED:'blue', FULLY_RECEIVED:'green',
    DRAFT:'gray', CONFIRMED:'green', GOOD:'green', DAMAGED:'red',
    PAID:'green', CANCELLED:'gray',
    BANK_TRANSFER:'blue', CASH_ON_DELIVERY:'purple',
  }
  return <span className={`badge badge-${map[status]||'gray'}`}>{status}</span>
}

export const Spinner = () => (
  <div style={{display:'flex',justifyContent:'center',padding:48}}>
    <div className="spinner"/>
  </div>
)

export const Empty = ({ msg = 'Không có dữ liệu' }) => (
  <div style={{textAlign:'center',padding:48,color:'var(--gray-400)'}}>{msg}</div>
)

export const Modal = ({ title, onClose, children, footer, large }) => (
  <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
    <div className={`modal${large?' modal-lg':''}`}>
      <div className="modal-header">
        <span>{title}</span>
        <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,lineHeight:1,cursor:'pointer',color:'var(--gray-400)'}}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
)

export const Field = ({ label, required, children, style }) => (
  <div className="form-group" style={style}>
    <label className="form-label">
      {label}{required && <span style={{color:'var(--danger)',marginLeft:2}}>*</span>}
    </label>
    {children}
  </div>
)

export const fmt = {
  currency: v => v == null ? '—' : new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(v),
  date: v => v ? new Date(v).toLocaleString('vi-VN') : '—',
}

export const EmptyState = ({ msg = 'Không có dữ liệu' }) => (
  <div style={{textAlign:'center',padding:48,color:'var(--gray-400)'}}>{msg}</div>
)

export const FormField = ({ label, required, children, style }) => (
  <div className="form-group" style={style}>
    <label className="form-label">
      {label}{required && <span style={{color:'var(--danger)',marginLeft:2}}>*</span>}
    </label>
    {children}
  </div>
)

export const ConfirmModal = ({ title = 'Xác nhận', message = 'Bạn có chắc không?', onConfirm, onCancel, danger = true }) => (
  <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onCancel()}>
    <div className="modal" style={{maxWidth:400}}>
      <div className="modal-header"><span>{title}</span></div>
      <div className="modal-body"><p style={{color:'var(--gray-700)'}}>{message}</p></div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onCancel}>Hủy</button>
        <button className={`btn ${danger?'btn-danger':'btn-primary'}`} onClick={onConfirm}>Xác nhận</button>
      </div>
    </div>
  </div>
)

export const fmtDate = v => v ? new Date(v).toLocaleString('vi-VN') : '—'
