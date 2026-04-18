import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/Layout";
import { Spinner, Empty } from "../../../components/ui";
import { agentApi } from "../../../api";
import { useApi } from "../../../hooks/useApi";

export default function AdminAgentsPage() {
  const navigate = useNavigate();
  // const { data: agents, loading } = useApi(() => agentApi.getAll(), []);

  return (
    <Layout title="Quản lý đại lý">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/agents/create")}
        >
          + Tạo đại lý mới
        </button>
      </div>

      {/* <div className="card">
        {loading ? (
          <Spinner />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã đại lý</th>
                  <th>Tên đại lý</th>
                  <th>Tên đăng nhập</th>
                  <th>Điện thoại</th>
                  <th>Địa chỉ</th>
                </tr>
              </thead>
              <tbody>
                {!agents?.length ? (
                  <tr>
                    <td colSpan={5}>
                      <Empty msg="Chưa có đại lý nào" />
                    </td>
                  </tr>
                ) : (
                  agents.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.code}</strong></td>
                      <td>{a.name}</td>
                      <td>{a.username}</td>
                      <td>{a.phone || "—"}</td>
                      <td>{a.address || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div> */}
    </Layout>
  );
}
