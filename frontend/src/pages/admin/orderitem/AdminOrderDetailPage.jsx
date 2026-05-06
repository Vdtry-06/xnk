import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/Layout";
import { Badge, Spinner, fmt, ConfirmModal } from "../../../components/ui";
import { salesOrderApi, paymentApi } from "../../../api";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";

const METHOD_LABELS = {
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  CASH_ON_DELIVERY: "Thanh toán khi nhận hàng",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: order,
    loading,
    refetch,
  } = useApi(() => salesOrderApi.getById(id), [id]);

  const [payment, setPayment] = useState(null);
  const [loadingPay, setLoadingPay] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchPayment = () => {
    setLoadingPay(true);
    paymentApi
      .getBySalesOrder(id)
      .then((r) => setPayment(r.data?.data ?? null))
      .catch(() => setPayment(null))
      .finally(() => setLoadingPay(false));
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const approve = async () => {
    const managerId = user?.userId;
    if (!managerId) {
      toast.error("Không tìm thấy managerId. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      await salesOrderApi.approve(id, managerId);
      toast.success("Đã duyệt");
      navigate("/admin/orders");
      // refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || "Lỗi");
    }
  };

  const handlePaymentAction = async () => {
    if (!confirmModal) return;
    const managerId = user?.userId;
    if (!managerId) {
      toast.error("Không tìm thấy managerId. Vui lòng đăng nhập lại.");
      return;
    }
    setProcessing(true);
    try {
      await paymentApi.confirmPaid(payment.id, managerId);
      toast.success("Đã xác nhận thanh toán!");
      fetchPayment();
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || "Lỗi xử lý");
    } finally {
      setProcessing(false);
      setConfirmModal(null);
    }
  };

  if (loading)
    return (
      <Layout title="Chi tiết đơn hàng">
        <Spinner />
      </Layout>
    );
  if (!order)
    return (
      <Layout title="Chi tiết đơn hàng">
        <p>Không tìm thấy đơn hàng</p>
      </Layout>
    );

  return (
    <Layout title={`Đơn hàng #${order.id}`}>
      <div style={{ maxWidth: 800 }}>
        {/* Thông tin đơn hàng */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <span style={{ color: "#64748b" }}>Đại lý: </span>
              <strong>
                {order.agentCode} — {order.agentName}
              </strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Trạng thái: </span>
              <Badge status={order.status} />
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Tổng dự kiến: </span>
              <strong>{fmt.currency(order.totalEstimatedPrice)}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Ngày tạo: </span>
              {fmt.date(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="card" style={{ marginBottom: 16 }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>SL</th>
                <th>Đơn giá DK</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((it, i) => (
                <tr key={it.id}>
                  <td>{i + 1}</td>
                  <td>
                    {it.productName}
                    {it.productLink && (
                      <>
                        <br />
                        <a
                          href={it.productLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12 }}
                        >
                          Link
                        </a>
                      </>
                    )}
                  </td>
                  <td>{it.quantity}</td>
                  <td>{fmt.currency(it.estimatedUnitPrice)}</td>
                  <td>
                    {it.estimatedUnitPrice
                      ? fmt.currency(it.estimatedUnitPrice * it.quantity)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel thanh toán */}
        {!loadingPay && payment && (
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 15,
                color: "var(--gray-700)",
              }}
            >
              Thông tin thanh toán
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <span style={{ color: "#64748b" }}>Phương thức: </span>
                <strong>
                  {METHOD_LABELS[payment.method] || payment.method}
                </strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Trạng thái: </span>
                <Badge status={payment.status} />
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Số tiền: </span>
                <strong style={{ color: "var(--primary)", fontSize: 16 }}>
                  {fmt.currency(payment.amount)}
                </strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Ngày tạo YC: </span>
                {fmt.date(payment.createdAt)}
              </div>
              {payment.paidAt && (
                <div>
                  <span style={{ color: "#64748b" }}>Đã TT lúc: </span>
                  {fmt.date(payment.paidAt)}
                </div>
              )}
              {payment.note && (
                <div style={{ gridColumn: "1/-1" }}>
                  <span style={{ color: "#64748b" }}>Ghi chú: </span>
                  {payment.note}
                </div>
              )}
            </div>

            {payment.status === "PENDING" && (
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  className="btn btn-success"
                  onClick={() => setConfirmModal({ type: "paid" })}
                >
                  Xác nhận đã nhận tiền
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          {order.status === "PENDING" && (
            <button className="btn btn-success" onClick={approve}>
              Duyệt đơn
            </button>
          )}
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/orders")}
          >
            Quay lại
          </button>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          title="Xác nhận đã nhận tiền"
          message={`Xác nhận đã nhận ${fmt.currency(payment?.amount)} từ đại lý ${order.agentName}?`}
          onConfirm={handlePaymentAction}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </Layout>
  );
}
