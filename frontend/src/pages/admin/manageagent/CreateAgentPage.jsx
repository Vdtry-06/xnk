import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/Layout";
import { agentApi } from "../../../api";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  username: "",
  password: "",
  code: "",
  name: "",
  phone: "",
  address: "",
};

export default function CreateAgentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.code || !form.name || !form.phone || !form.address) {
      toast.error("Điền đầy đủ các trường bắt buộc");
      return;
    }
    const managerId = user?.userId;
    if (!managerId) {
      toast.error("Không tìm thấy managerId. Vui lòng đăng nhập lại.");
      return;
    }
    setSaving(true);
    try {
      await agentApi.create({ ...form, managerId });
      toast.success("Tạo đại lý thành công!");
      navigate("/admin/agents");
    } catch (e) {
      toast.error(e.response?.data?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Tạo đại lý mới">
      <div
        className="card"
        style={{ padding: 20, marginBottom: 20, maxWidth: 640 }}
      >
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tên đăng nhập *</label>
              <input
                className="form-control"
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                placeholder="agent3"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mật khẩu *</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="••••••"
              />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mã đại lý *</label>
              <input
                className="form-control"
                value={form.code}
                onChange={(e) => setField("code", e.target.value)}
                placeholder="AG003"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tên đại lý *</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Đại lý Đà Nẵng"
              />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Điện thoại *</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="0900000000"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Địa chỉ *</label>
              <input
                className="form-control"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="123 Đường ABC"
              />
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Đang tạo..." : "Tạo đại lý"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/admin/agents")}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
