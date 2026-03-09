"use client";

import { useState, useEffect, useCallback } from "react";

const CATEGORIES = {
  all: { label: "Tümü", color: "#94a3b8" },
  ai: { label: "AI & Araçlar", color: "#f59e0b" },
  branding: { label: "Marka & Strateji", color: "#8b5cf6" },
  turkiye: { label: "TR Girişimcilik", color: "#ef4444" },
  abd: { label: "ABD İş Kurma", color: "#3b82f6" },
};

const STATUS_CONFIG = {
  draft: { label: "Taslak", bg: "rgba(148,163,184,0.15)", color: "#94a3b8" },
  approved: { label: "Onaylı", bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  scheduled: {
    label: "Zamanlanmış",
    bg: "rgba(59,130,246,0.15)",
    color: "#3b82f6",
  },
  published: {
    label: "Yayında",
    bg: "rgba(168,85,247,0.15)",
    color: "#a855f7",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = [
    "Oca", "Şub", "Mar", "Nis", "May", "Haz",
    "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}

function CategoryTag({ category }) {
  const cat = CATEGORIES[category];
  if (!cat) return null;
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{ background: `${cat.color}22`, color: cat.color }}
    >
      {cat.label}
    </span>
  );
}

function TweetCard({ tweet, onApprove, onSchedule, onDelete, onEdit, onPublish }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.content);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [publishing, setPublishing] = useState(false);
  const chars = tweet.content.length;

  const handlePublish = async () => {
    setPublishing(true);
    await onPublish(tweet.id);
    setPublishing(false);
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 transition-all hover:border-[#3a3a44]">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 items-center">
          <CategoryTag category={tweet.category} />
          <StatusBadge status={tweet.status} />
        </div>
        <span className="text-[11px] text-gray-600">
          {formatDate(tweet.created_at)}
        </span>
      </div>

      {editing ? (
        <div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full min-h-[120px] bg-brand-dark border border-brand-border rounded-lg text-gray-200 p-3 text-[13px] leading-relaxed resize-y font-mono outline-none focus:border-brand-amber transition-colors"
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="px-3.5 py-1.5 bg-transparent border border-brand-border rounded-md text-gray-500 text-xs cursor-pointer hover:border-gray-500 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={() => {
                onEdit(tweet.id, editText);
                setEditing(false);
              }}
              className="px-3.5 py-1.5 bg-brand-amber border-none rounded-md text-black text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Kaydet
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 text-[13.5px] leading-[1.7] whitespace-pre-wrap mb-3.5">
          {tweet.content}
        </p>
      )}

      {!editing && (
        <div className="flex justify-between items-center mb-3.5">
          <span
            className={`text-[11px] ${chars > 280 ? "text-red-500" : "text-gray-600"}`}
          >
            {chars}/280{" "}
            {chars > 280 && (
              <span className="text-brand-amber ml-1.5">Thread önerisi</span>
            )}
          </span>
          {tweet.scheduled_at && (
            <span className="text-[11px] text-blue-500">
              ⏰ {formatDate(tweet.scheduled_at)}
            </span>
          )}
        </div>
      )}

      {showSchedule && (
        <div className="bg-brand-dark border border-brand-border rounded-lg p-3 mb-3 flex gap-2 items-center flex-wrap">
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="bg-brand-muted border border-brand-border rounded-md text-gray-200 px-2.5 py-1.5 text-xs outline-none"
          />
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="bg-brand-muted border border-brand-border rounded-md text-gray-200 px-2.5 py-1.5 text-xs outline-none"
          />
          <button
            onClick={() => {
              onSchedule(tweet.id, `${scheduleDate}T${scheduleTime}:00Z`);
              setShowSchedule(false);
            }}
            className="px-3.5 py-1.5 bg-blue-500 border-none rounded-md text-white text-xs font-semibold cursor-pointer"
          >
            Zamanla
          </button>
          <button
            onClick={() => setShowSchedule(false)}
            className="px-3.5 py-1.5 bg-transparent border border-brand-border rounded-md text-gray-500 text-xs cursor-pointer"
          >
            İptal
          </button>
        </div>
      )}

      {!editing && (
        <div className="flex gap-1.5 flex-wrap">
          {tweet.status === "draft" && (
            <button
              onClick={() => onApprove(tweet.id)}
              className="px-3.5 py-[7px] bg-green-500/10 border border-green-500/25 rounded-md text-green-500 text-xs font-medium cursor-pointer hover:bg-green-500/20 transition-colors"
            >
              ✓ Onayla
            </button>
          )}
          {(tweet.status === "draft" || tweet.status === "approved") && (
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="px-3.5 py-[7px] bg-blue-500/10 border border-blue-500/25 rounded-md text-blue-500 text-xs font-medium cursor-pointer hover:bg-blue-500/20 transition-colors"
            >
              ⏰ Zamanla
            </button>
          )}
          {(tweet.status === "approved" || tweet.status === "scheduled") && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-3.5 py-[7px] bg-purple-500/10 border border-purple-500/25 rounded-md text-purple-500 text-xs font-medium cursor-pointer hover:bg-purple-500/20 transition-colors disabled:opacity-50"
            >
              {publishing ? "Paylaşılıyor..." : "▶ Paylaş"}
            </button>
          )}
          {tweet.status !== "published" && (
            <button
              onClick={() => {
                setEditText(tweet.content);
                setEditing(true);
              }}
              className="px-3.5 py-[7px] bg-gray-500/10 border border-gray-500/20 rounded-md text-gray-400 text-xs font-medium cursor-pointer hover:bg-gray-500/20 transition-colors"
            >
              ✎ Düzenle
            </button>
          )}
          {tweet.status === "published" && tweet.twitter_id && (
            <a
              href={`https://x.com/afurkanbudakcom/status/${tweet.twitter_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-[7px] bg-brand-amber/10 border border-brand-amber/25 rounded-md text-brand-amber text-xs font-medium cursor-pointer hover:bg-brand-amber/20 transition-colors no-underline"
            >
              ↗ X'te Gör
            </a>
          )}
          <button
            onClick={() => onDelete(tweet.id)}
            className="px-3.5 py-[7px] bg-red-500/5 border border-red-500/20 rounded-md text-red-500 text-xs font-medium cursor-pointer hover:bg-red-500/15 transition-colors ml-auto"
          >
            ✕ Sil
          </button>
        </div>
      )}
    </div>
  );
}

function StatsCard({ label, value, accent }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-[10px] px-5 py-4 flex-1 min-w-[120px]">
      <div className="text-[11px] text-gray-600 uppercase tracking-widest font-semibold mb-1.5">
        {label}
      </div>
      <div
        className="text-[28px] font-bold font-mono"
        style={{ color: accent || "#e0e0e0" }}
      >
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tweets, setTweets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeCategory, setComposeCategory] = useState("ai");
  const [genTopic, setGenTopic] = useState("");
  const [genCategory, setGenCategory] = useState("ai");
  const [genCount, setGenCount] = useState(5);
  const [error, setError] = useState(null);
  const [autoGenerating, setAutoGenerating] = useState(false);

  const fetchTweets = useCallback(async (retries = 2) => {
    try {
      const res = await fetch("/api/tweets", { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch hatası");
      const data = await res.json();
      setTweets(data);
      setError(null);
    } catch (err) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 1000));
        return fetchTweets(retries - 1);
      }
      setError("Bağlantı hatası. Sayfayı yenileyin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  const filteredTweets = tweets.filter((t) => {
    if (filter !== "all" && t.category !== filter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: tweets.length,
    drafts: tweets.filter((t) => t.status === "draft").length,
    scheduled: tweets.filter(
      (t) => t.status === "approved" || t.status === "scheduled"
    ).length,
    published: tweets.filter((t) => t.status === "published").length,
  };

  const handleApprove = async (id) => {
    await fetch("/api/tweets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved" }),
    });
    fetchTweets();
  };

  const handleSchedule = async (id, dateStr) => {
    await fetch("/api/tweets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: "scheduled",
        scheduled_at: dateStr,
      }),
    });
    fetchTweets();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/tweets?id=${id}`, { method: "DELETE" });
    fetchTweets();
  };

  const handleEdit = async (id, newContent) => {
    await fetch("/api/tweets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content: newContent }),
    });
    fetchTweets();
  };

  const handlePublish = async (id) => {
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Hata: ${data.error}`);
        return;
      }
      fetchTweets();
    } catch (err) {
      alert(`Paylaşım hatası: ${err.message}`);
    }
  };

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: genTopic,
          category: genCategory,
          count: genCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setGenTopic("");
      fetchTweets();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleAutoGenerate = async () => {
    setAutoGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      fetchTweets();
    } catch (err) {
      setError(err.message);
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleCompose = async () => {
    if (!composeText.trim()) return;
    await fetch("/api/tweets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: composeText,
        category: composeCategory,
      }),
    });
    setComposeText("");
    setShowCompose(false);
    fetchTweets();
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="border-b border-brand-muted px-8 py-4 flex justify-between items-center sticky top-0 bg-brand-dark/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-amber to-amber-600 flex items-center justify-center text-sm font-extrabold text-black">
            AF
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-gray-100">
              AFBrandworks
            </h1>
            <span className="text-[10px] text-gray-600 tracking-[1.5px] uppercase font-semibold">
              Tweet Manager
            </span>
          </div>
        </div>
        <div className="flex gap-2.5 items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-[11px] text-gray-600">@afurkanbudakcom</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[220px] border-r border-brand-muted p-6 min-h-[calc(100vh-60px)] sticky top-[60px] self-start">
          <div className="mb-7">
            <div className="text-[10px] text-gray-700 uppercase tracking-[1.5px] font-bold mb-2.5 px-2">
              Kategori
            </div>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-md border-none text-xs cursor-pointer text-left transition-all ${
                  filter === key
                    ? "bg-brand-muted font-semibold"
                    : "bg-transparent font-normal"
                }`}
                style={{ color: filter === key ? cat.color : "#666" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: cat.color,
                    opacity: filter === key ? 1 : 0.4,
                  }}
                />
                {cat.label}
                <span className="ml-auto text-[10px] text-gray-700">
                  {key === "all"
                    ? tweets.length
                    : tweets.filter((t) => t.category === key).length}
                </span>
              </button>
            ))}
          </div>

          <div className="mb-7">
            <div className="text-[10px] text-gray-700 uppercase tracking-[1.5px] font-bold mb-2.5 px-2">
              Durum
            </div>
            <button
              onClick={() => setStatusFilter("all")}
              className={`block w-full px-2.5 py-2 rounded-md border-none text-xs cursor-pointer text-left transition-all ${
                statusFilter === "all"
                  ? "bg-brand-muted text-gray-200 font-semibold"
                  : "bg-transparent text-gray-600"
              }`}
            >
              Tümü
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-md border-none text-xs cursor-pointer text-left transition-all ${
                  statusFilter === key
                    ? "bg-brand-muted font-semibold"
                    : "bg-transparent font-normal"
                }`}
                style={{ color: statusFilter === key ? cfg.color : "#666" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: cfg.color,
                    opacity: statusFilter === key ? 1 : 0.4,
                  }}
                />
                {cfg.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCompose(true)}
            className="w-full py-2.5 bg-gradient-to-br from-brand-amber to-amber-600 border-none rounded-lg text-black text-xs font-bold cursor-pointer tracking-wide hover:opacity-90 transition-opacity"
          >
            + Yeni Tweet
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 max-w-[760px]">
          {/* Stats */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <StatsCard label="Toplam" value={stats.total} />
            <StatsCard label="Taslak" value={stats.drafts} accent="#94a3b8" />
            <StatsCard
              label="Kuyrukta"
              value={stats.scheduled}
              accent="#3b82f6"
            />
            <StatsCard
              label="Yayında"
              value={stats.published}
              accent="#a855f7"
            />
          </div>

          {/* AI Generator */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 mb-6">
            <h3 className="mb-4 text-brand-amber text-sm font-bold tracking-wide uppercase">
              ⚡ AI Tweet Üretici
            </h3>
            <button
              onClick={handleAutoGenerate}
              disabled={autoGenerating}
              className="w-full mb-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 border-none rounded-lg text-white text-sm font-bold cursor-pointer tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {autoGenerating
                ? "⏳ Gündem taranıyor, tweet'ler üretiliyor..."
                : "🚀 Günlük Tweet'leri Otomatik Üret (8 tweet, 4 kategori)"}
            </button>
            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 mb-4 text-red-400 text-xs">
                {error}
              </div>
            )}
            <div className="flex gap-2.5 flex-wrap items-end">
              <div className="flex-[2] min-w-[200px]">
                <label className="text-[11px] text-gray-600 block mb-1 font-semibold">
                  Konu / Gündem
                </label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="ör: Apple Siri AI güncellemesi, MCP protokolü..."
                  className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-lg text-gray-200 text-[13px] outline-none focus:border-brand-amber transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
              </div>
              <div className="min-w-[140px]">
                <label className="text-[11px] text-gray-600 block mb-1 font-semibold">
                  Kategori
                </label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-lg text-gray-200 text-[13px] outline-none cursor-pointer"
                >
                  <option value="ai">AI & Araçlar</option>
                  <option value="branding">Marka & Strateji</option>
                  <option value="turkiye">TR Girişimcilik</option>
                  <option value="abd">ABD İş Kurma</option>
                </select>
              </div>
              <div className="min-w-[80px]">
                <label className="text-[11px] text-gray-600 block mb-1 font-semibold">
                  Adet
                </label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-lg text-gray-200 text-[13px] outline-none cursor-pointer"
                >
                  {[3, 5, 7, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !genTopic.trim()}
                className="px-6 py-2.5 bg-gradient-to-br from-brand-amber to-amber-600 border-none rounded-lg text-black text-[13px] font-bold cursor-pointer tracking-wide whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {generating ? "Üretiliyor..." : "Üret →"}
              </button>
            </div>
          </div>

          {/* Compose */}
          {showCompose && (
            <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-200">
                  Yeni Tweet Yaz
                </h3>
                <select
                  value={composeCategory}
                  onChange={(e) => setComposeCategory(e.target.value)}
                  className="bg-brand-dark border border-brand-border rounded-md text-gray-200 px-2.5 py-1.5 text-[11px] outline-none"
                >
                  <option value="ai">AI & Araçlar</option>
                  <option value="branding">Marka & Strateji</option>
                  <option value="turkiye">TR Girişimcilik</option>
                  <option value="abd">ABD İş Kurma</option>
                </select>
              </div>
              <textarea
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                placeholder="Tweet'ini yaz..."
                className="w-full min-h-[100px] bg-brand-dark border border-brand-border rounded-lg text-gray-200 p-3 text-[13px] leading-relaxed resize-y outline-none focus:border-brand-amber transition-colors"
              />
              <div className="flex justify-between items-center mt-2.5">
                <span
                  className={`text-[11px] ${composeText.length > 280 ? "text-red-500" : "text-gray-600"}`}
                >
                  {composeText.length}/280
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCompose(false);
                      setComposeText("");
                    }}
                    className="px-4 py-2 bg-transparent border border-brand-border rounded-md text-gray-500 text-xs cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCompose}
                    className="px-4 py-2 bg-brand-amber border-none rounded-md text-black text-xs font-semibold cursor-pointer"
                  >
                    Taslağa Ekle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tweet List */}
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-2xl mb-3 animate-spin">⏳</div>
                <p className="text-sm">Yükleniyor...</p>
              </div>
            ) : filteredTweets.length === 0 ? (
              <div className="text-center py-16 text-gray-700">
                <div className="text-3xl mb-3">📭</div>
                <p className="text-sm">Bu filtrede tweet yok.</p>
              </div>
            ) : (
              filteredTweets.map((tweet) => (
                <TweetCard
                  key={tweet.id}
                  tweet={tweet}
                  onApprove={handleApprove}
                  onSchedule={handleSchedule}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onPublish={handlePublish}
                />
              ))
            )}
          </div>
        </main>

        {/* Right Panel */}
        <aside className="w-[260px] border-l border-brand-muted p-6 min-h-[calc(100vh-60px)] sticky top-[60px] self-start">
          <div className="text-[10px] text-gray-700 uppercase tracking-[1.5px] font-bold mb-4">
            Yayın Kuyruğu
          </div>
          {tweets.filter(
            (t) => t.status === "scheduled" || t.status === "approved"
          ).length === 0 ? (
            <p className="text-xs text-gray-700 leading-relaxed">
              Kuyrukta tweet yok. Taslakları onaylayıp zamanlayarak kuyruğa
              ekle.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {tweets
                .filter(
                  (t) => t.status === "scheduled" || t.status === "approved"
                )
                .map((t) => (
                  <div
                    key={t.id}
                    className="bg-brand-card border border-[#1e1e24] rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <CategoryTag category={t.category} />
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                      {t.content}
                    </p>
                    {t.scheduled_at && (
                      <span className="text-[10px] text-blue-500 mt-1.5 block">
                        ⏰ {formatDate(t.scheduled_at)}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}

          <div className="mt-7 p-4 bg-brand-card rounded-[10px] border border-[#1e1e24]">
            <div className="text-[10px] text-gray-700 uppercase tracking-[1.5px] font-bold mb-2.5">
              Bağlantı Durumu
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] text-gray-500">X API</span>
              <span className="text-[10px] text-green-500 ml-auto">Bağlı</span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-amber" />
              <span className="text-[11px] text-gray-500">Claude AI</span>
              <span className="text-[10px] text-brand-amber ml-auto">
                Aktif
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] text-gray-500">Supabase</span>
              <span className="text-[10px] text-green-500 ml-auto">Bağlı</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
