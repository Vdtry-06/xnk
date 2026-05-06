import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/Layout";
import { Spinner, Empty } from "../../../components/ui";
import { agentApi } from "../../../api";
import { useApi } from "../../../hooks/useApi";

export default function AdminAgentsPage() {
  const navigate = useNavigate();

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
    </Layout>
  );
}
