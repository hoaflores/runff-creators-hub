import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { listRunffLeads, type LeadRow } from "@/lib/runff-leads.functions";

const LIME = "#CCFC57";
const LINE = "#242424";

export const Route = createFileRoute("/leads-runff-creators")({
  head: () => ({
    meta: [
      { title: "Cadastros | Runff Creators" },
      { name: "description", content: "Painel interno de cadastros do programa Runff Creators." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Cadastros | Runff Creators" },
      { property: "og:description", content: "Painel interno de cadastros do programa Runff Creators." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/leads-runff-creators" }],
  }),
  component: LeadsPage,
});

const COLUMNS: [keyof LeadRow, string][] = [
  ["created_at", "Data"],
  ["name", "Nome"],
  ["whatsapp", "WhatsApp"],
  ["city", "Cidade"],
  ["state", "UF"],
  ["social_profile", "Perfil"],
  ["follower_range", "Seguidores"],
  ["running_connection", "Conexão"],
  ["event_interest", "Interesse"],
  ["motivation", "Motivação"],
  ["utm_source", "UTM source"],
  ["utm_campaign", "UTM campaign"],
  ["landing_variant", "Variante"],
];

function LeadsPage() {
  const fetchLeads = useServerFn(listRunffLeads);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLeads({ data: { username, password } });
      if (!res.ok) {
        setError(res.error ?? "Erro ao entrar.");
        return;
      }
      setLeads(res.leads);
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!leads) return;
    const header = COLUMNS.map(([, label]) => label).join(";");
    const rows = leads.map((lead) =>
      COLUMNS.map(([key]) => `"${String(lead[key] ?? "").replace(/"/g, '""')}"`).join(";"),
    );
    const blob = new Blob([`\uFEFF${[header, ...rows].join("\n")}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `runff-creators-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputClass =
    "min-h-[48px] w-full border bg-transparent px-4 text-[15px] text-white outline-none focus:border-[#CCFC57]";

  if (!leads) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-5 text-white">
        <form onSubmit={login} className="w-full max-w-sm border p-8" style={{ borderColor: LINE }}>
          <h1 className="text-2xl font-bold uppercase">Runff Creators</h1>
          <p className="mt-1 text-[13px] text-white/50">Painel de cadastros</p>
          <div className="mt-6 space-y-3">
            <input
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              style={{ borderColor: LINE }}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              style={{ borderColor: LINE }}
            />
          </div>
          {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 min-h-[48px] w-full text-[12px] font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
            style={{ background: LIME, color: "#0B0B0B" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold uppercase">Cadastros Runff Creators</h1>
            <p className="mt-1 text-[13px] text-white/50">{leads.length} registros</p>
          </div>
          <button
            onClick={exportCsv}
            className="min-h-[46px] px-6 text-[12px] font-semibold uppercase tracking-[0.18em]"
            style={{ background: LIME, color: "#0B0B0B" }}
          >
            Exportar CSV
          </button>
        </div>

        <div className="mt-8 overflow-x-auto border" style={{ borderColor: LINE }}>
          <table className="w-full min-w-[1200px] text-left text-[13px]">
            <thead>
              <tr style={{ background: "#141414" }}>
                {COLUMNS.map(([key, label]) => (
                  <th key={key} className="whitespace-nowrap px-4 py-3 font-semibold text-white/60">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t align-top" style={{ borderColor: LINE }}>
                  {COLUMNS.map(([key]) => (
                    <td key={key} className="px-4 py-3 text-white/75">
                      {key === "created_at"
                        ? new Date(lead.created_at).toLocaleString("pt-BR")
                        : (lead[key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
