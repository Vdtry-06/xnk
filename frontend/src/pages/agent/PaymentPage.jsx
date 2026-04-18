import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Badge, Spinner, fmt, Modal, Field } from "../../components/ui";
import { salesOrderApi, paymentApi } from "../../api";
import { useApi } from "../../hooks/useApi";
import toast from "react-hot-toast";

const METHOD_LABELS = {
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  CASH_ON_DELIVERY: "Thanh toán khi nhận hàng",
};

const STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
};

export default function AgentPaymentPage() {
  const { id } = useParams(); // salesOrderId
  const navigate = useNavigate();

  const { data: order, loading: loadingOrder } = useApi(
    () => salesOrderApi.getById(id),
    [id],
  );
  const [payment, setPayment] = useState(null);
  const [loadingPay, setLoadingPay] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    paymentApi
      .getBySalesOrder(id)
      .then((r) => setPayment(r.data?.data ?? null))
      .catch(() => setPayment(null))
      .finally(() => setLoadingPay(false));
  }, [id]);

  useEffect(() => {
    if (order) setAmount(order.totalEstimatedPrice ?? "");
  }, [order]);

  const handleCreate = async () => {
    if (!method) return toast.error("Vui lòng chọn phương thức thanh toán");
    setSubmitting(true);
    try {
      const res = await paymentApi.create({
        salesOrderId: Number(id),
        method,
        amount: amount ? Number(amount) : null,
        note: note || null,
      });
      setPayment(res.data.data);
      setShowModal(false);
      toast.success("Đã tạo yêu cầu thanh toán!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Lỗi tạo thanh toán");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOrder || loadingPay)
    return (
      <Layout title="Thanh toán đơn hàng">
        <Spinner />
      </Layout>
    );
  if (!order)
    return (
      <Layout title="Thanh toán đơn hàng">
        <p>Không tìm thấy đơn hàng</p>
      </Layout>
    );

  const canPay = order.status === "APPROVED" && !payment;

  return (
    <Layout title={`Thanh toán — Đơn #${order.id}`}>
      <div style={{ maxWidth: 760 }}>
        {/* Thông tin đơn hàng */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3
            style={{
              margin: "0 0 14px",
              fontSize: 16,
              color: "var(--gray-700)",
            }}
          >
            Thông tin đơn hàng
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <span style={{ color: "#64748b" }}>Đơn hàng: </span>
              <strong>#{order.id}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Trạng thái: </span>
              <Badge status={order.status} />
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Tổng dự kiến: </span>
              <strong style={{ color: "var(--primary)", fontSize: 17 }}>
                {fmt.currency(order.totalEstimatedPrice)}
              </strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Ngày tạo: </span>
              {fmt.date(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Trạng thái thanh toán */}
        {payment ? (
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 16,
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
                <Badge status={payment.status} />{" "}
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  ({STATUS_LABELS[payment.status]})
                </span>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Số tiền: </span>
                <strong style={{ color: "var(--primary)" }}>
                  {fmt.currency(payment.amount)}
                </strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Ngày tạo: </span>
                {fmt.date(payment.createdAt)}
              </div>
              {payment.paidAt && (
                <div>
                  <span style={{ color: "#64748b" }}>Đã thanh toán lúc: </span>
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

            {/* Hướng dẫn nếu là chuyển khoản và còn chờ */}
            {payment.method === "BANK_TRANSFER" &&
              payment.status === "PENDING" && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 16px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  <strong style={{ color: "#1d4ed8" }}>
                    Hướng dẫn chuyển khoản
                  </strong>
                  <div
                    style={{ marginTop: 8, lineHeight: 1.7, color: "#1e40af" }}
                  >
                    <div>
                      Ngân hàng: <strong>Vietcombank</strong>
                    </div>
                    <div>
                      STK: <strong>1234567890</strong>
                    </div>
                    <div>
                      Tên TK: <strong>CONG TY TNHH XNK</strong>
                    </div>
                    <div>
                      Số tiền: <strong>{fmt.currency(payment.amount)}</strong>
                    </div>
                    <div>
                      Nội dung:{" "}
                      <strong>
                        TT {order.id} {order.agentCode}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

            {payment.method === "CASH_ON_DELIVERY" &&
              payment.status === "PENDING" && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 16px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    fontSize: 14,
                    color: "#166534",
                  }}
                >
                  <strong>Thanh toán khi nhận hàng</strong>
                  <div style={{ marginTop: 6, lineHeight: 1.7 }}>
                    Vui lòng chuẩn bị{" "}
                    <strong>{fmt.currency(payment.amount)}</strong> để thanh
                    toán khi nhân viên giao hàng đến.
                  </div>
                </div>
              )}
          </div>
        ) : order.status === "APPROVED" ? (
          <div
            className="card"
            style={{
              padding: 28,
              marginBottom: 16,
              textAlign: "center",
              border: "2px dashed var(--primary)",
              background: "#f8faff",
            }}
          >
            <p
              style={{
                margin: "0 0 16px",
                color: "var(--gray-600)",
                fontSize: 15,
              }}
            >
              Đơn hàng đã được duyệt. Vui lòng chọn phương thức thanh toán để
              tiếp tục.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Tạo thanh toán
            </button>
          </div>
        ) : (
          <div
            className="card"
            style={{ padding: 20, marginBottom: 16, background: "#fafafa" }}
          >
            <p
              style={{
                margin: 0,
                color: "var(--gray-500)",
                textAlign: "center",
              }}
            >
              {order.status === "PENDING"
                ? "Đơn hàng đang chờ admin duyệt. Bạn có thể thanh toán sau khi đơn được duyệt."
                : "Đơn hàng đã hoàn tất."}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/orders")}
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Modal tạo thanh toán */}
      {showModal && (
        <Modal
          title="Chọn phương thức thanh toán"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </>
          }
        >
          <Field label="Phương thức thanh toán" required>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 4,
              }}
            >
              {Object.entries(METHOD_LABELS).map(([val, label]) => (
                <label
                  key={val}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    border: `2px solid ${method === val ? "var(--primary)" : "#e2e8f0"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    background: method === val ? "#f0f7ff" : "#fff",
                    fontSize: 15,
                    transition: "all .15s",
                  }}
                >
                  <input
                    type="radio"
                    name="method"
                    value={val}
                    checked={method === val}
                    onChange={() => setMethod(val)}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Số tiền thanh toán" style={{ marginTop: 16 }}>
            <input
              className="form-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Để trống = dùng tổng dự kiến"
              style={{
                width: "100%",
                marginTop: 4,
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 15,
                outline: "none",
              }}
            />
          </Field>

          <Field label="Ghi chú / Nội dung CK" style={{ marginTop: 12 }}>
            <textarea
              className="form-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: TT đơn hàng #12..."
              rows={3}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 15,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </Field>
        </Modal>
      )}
    </Layout>
  );
}
