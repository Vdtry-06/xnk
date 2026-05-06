import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/Layout";
import { agentApi } from "../../../api";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";

const EMPTY_FORM = { username: "", password: "", code: "", name: "", phone: "", address: "" };
const ERR = { color: "#ef4444", fontSize: 12, marginTop: 3 };

export default function CreateAgentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const e = { ...p }; delete e[k]; return e });
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Tên đăng nhập không được để trống";
    if (!form.password.trim()) e.password = "Mật khẩu không được để trống";
    if (!form.code.trim())     e.code     = "Mã đại lý không được để trống";
    if (!form.name.trim())     e.name     = "Tên đại lý không được để trống";
    if (!form.phone.trim())    e.phone    = "Số điện thoại không được để trống";
    if (!form.address.trim())  e.address  = "Địa chỉ không được để trống";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (!user?.userId) { toast.error("Không tìm thấy managerId. Vui lòng đăng nhập lại."); return; }

    setSaving(true);
    try {
      await agentApi.create({ ...form, managerId: user.userId });
      toast.success("Tạo đại lý thành công!");
      navigate("/admin/agents");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Tạo đại lý mới">
      <div className="card" style={{ padding: 20, marginBottom: 20, maxWidth: 640 }}>
        <form onSubmit={submit}>

          <div className="form-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tên đăng nhập <span style={{ color: "#ef4444" }}>*</span></label>
              <input className="form-control" value={form.username} placeholder="agent3"
                onChange={e => setField("username", e.target.value)} />
              {errors.username && <p style={ERR}>{errors.username}</p>}
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mật khẩu <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="password" className="form-control" value={form.password} placeholder="••••••"
                onChange={e => setField("password", e.target.value)} />
              {errors.password && <p style={ERR}>{errors.password}</p>}
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mã đại lý <span style={{ color: "#ef4444" }}>*</span></label>
              <input className="form-control" value={form.code} placeholder="AG003"
                onChange={e => setField("code", e.target.value)} />
              {errors.code && <p style={ERR}>{errors.code}</p>}
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tên đại lý <span style={{ color: "#ef4444" }}>*</span></label>
              <input className="form-control" value={form.name} placeholder="Đại lý Đà Nẵng"
                onChange={e => setField("name", e.target.value)} />
              {errors.name && <p style={ERR}>{errors.name}</p>}
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Điện thoại <span style={{ color: "#ef4444" }}>*</span></label>
              <input className="form-control" value={form.phone} placeholder="0900000000"
                onChange={e => setField("phone", e.target.value)} />
              {errors.phone && <p style={ERR}>{errors.phone}</p>}
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Địa chỉ <span style={{ color: "#ef4444" }}>*</span></label>
              <input className="form-control" value={form.address} placeholder="123 Đường ABC"
                onChange={e => setField("address", e.target.value)} />
              {errors.address && <p style={ERR}>{errors.address}</p>}
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang tạo..." : "Tạo đại lý"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/admin/agents")}>
              Hủy
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}