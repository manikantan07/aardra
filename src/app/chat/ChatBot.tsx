'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// ─── Types ───────────────────────────────────────────────────
type MsgType = 'text' | 'chart' | 'list' | 'stats';
type ChartKind = 'bar' | 'line' | 'pie' | 'doughnut';

interface ChartPayload {
  kind: ChartKind;
  title: string;
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string; fill?: boolean }[];
}

interface ListPayload {
  title: string;
  columns: string[];
  rows: Record<string, string | number>[];
}

interface StatsPayload {
  items: { label: string; value: string }[];
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  type: MsgType;
  text: string;
  chart?: ChartPayload;
  list?: ListPayload;
  stats?: StatsPayload;
  time: string;
}

// ─── Datasets ────────────────────────────────────────────────
const DATASETS = [
  { id: 'sales',      icon: '💰', label: 'Sales',      sub: 'Revenue & Orders',   file: '/data/sales-data.json' },
  { id: 'users',      icon: '👥', label: 'Users',       sub: 'Growth & Retention', file: '/data/user-growth.json' },
  { id: 'comparison', icon: '📊', label: 'Comparison',  sub: 'YoY & Categories',   file: '/data/comparison.json' },
  { id: 'list',       icon: '📋', label: 'Top Lists',   sub: 'Products & Orders',  file: '/data/list-data.json' },
];

const SUGGESTED = [
  'Show me revenue chart',
  'Compare this year vs last year',
  'Top 5 products list',
  'How many users this month?',
  'Sales by category pie chart',
  'Recent orders',
];

const QUICK_ACTIONS = [
  { label: '💰 Sales Overview',      prompt: 'Give me a sales overview with charts' },
  { label: '📈 Revenue Trend',        prompt: 'Show monthly revenue trend as line chart' },
  { label: '🏆 Top Products',         prompt: 'Show top products list' },
  { label: '👥 User Growth',          prompt: 'Show user growth chart' },
  { label: '🆚 Compare Categories',   prompt: 'Compare sales across categories' },
  { label: '📋 Recent Orders',        prompt: 'Show recent orders table' },
];

const ACCENT = '#e94560';
const PALETTE = [ACCENT, '#0f3460', '#533483', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'];

// ─── Intent Detection ────────────────────────────────────────
function detectDataset(q: string): string {
  const l = q.toLowerCase();
  if (/sales|revenue|order|earning|payment|transaction/.test(l)) return 'sales';
  if (/user|customer|growth|churn|signup|register|acquisition|retention|demographic/.test(l)) return 'users';
  if (/compare|vs|versus|year.over.year|yoy|quarter|q[1-4]|category comparison/.test(l)) return 'comparison';
  if (/top|list|rank|best|popular|recent|table/.test(l)) return 'list';
  return 'sales';
}

function detectChartType(q: string): ChartKind {
  const l = q.toLowerCase();
  if (/pie|donut|doughnut|breakdown|portion|share/.test(l)) return 'pie';
  if (/line|trend|over time|timeline|month|growth/.test(l)) return 'line';
  if (/bar|column|compare|comparison|versus|vs/.test(l)) return 'bar';
  return 'bar';
}

function detectIntent(q: string): 'chart' | 'list' | 'stats' | 'text' {
  const l = q.toLowerCase();
  if (/chart|graph|visual|plot|bar|line|pie|trend|show me/.test(l)) return 'chart';
  if (/list|table|top|rank|recent|order|show (all|me the)/.test(l)) return 'list';
  if (/how many|total|sum|count|average|avg|overview|summary|stat/.test(l)) return 'stats';
  return 'text';
}

// ─── Response Generator ──────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateResponse(query: string, allData: Record<string, any>): Promise<Omit<Message, 'id' | 'time' | 'role'>> {
  const ds = detectDataset(query);
  const intent = detectIntent(query);
  const chartType = detectChartType(query);
  const data = allData[ds];
  if (!data) return { type: 'text', text: "I couldn't load the dataset. Please try again." };

  const q = query.toLowerCase();

  // ── STATS ──
  if (intent === 'stats') {
    const s = data.summary ?? {};
    const items = Object.entries(s).map(([k, v]) => ({
      label: k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      value: String(v),
    }));
    const descriptions: Record<string, string> = {
      sales: `Here's a quick summary of the sales data:\n\n`,
      users: `Here's your user metrics at a glance:\n\n`,
      comparison: `Here's the comparison overview:\n\n`,
      list: `Here's the data summary:\n\n`,
    };
    return { type: 'stats', text: descriptions[ds] || 'Here is the summary:', stats: { items } };
  }

  // ── LIST ──
  if (intent === 'list') {
    if (/order/.test(q) && data.recent_orders) {
      return {
        type: 'list', text: 'Here are the most recent orders:',
        list: {
          title: 'Recent Orders',
          columns: ['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'],
          rows: data.recent_orders.map((o: Record<string, string | number>) => ({
            'Order ID': o.id, Customer: o.customer, Product: o.product,
            Amount: `$${o.amount}`, Status: o.status, Date: o.date,
          })),
        },
      };
    }
    if (/customer/.test(q) && data.top_customers) {
      return {
        type: 'list', text: 'Here are the top customers by spend:',
        list: {
          title: 'Top Customers',
          columns: ['Rank', 'Name', 'Orders', 'Total Spent', 'Location'],
          rows: data.top_customers.map((c: Record<string, string | number>) => ({
            Rank: `#${c.rank}`, Name: c.name, Orders: c.orders,
            'Total Spent': `$${c.spent}`, Location: c.location,
          })),
        },
      };
    }
    const products = data.top_products ?? data.monthly;
    if (products) {
      const isProduct = !!data.top_products;
      return {
        type: 'list', text: isProduct ? 'Here are the top performing products:' : 'Here is the monthly breakdown:',
        list: {
          title: isProduct ? 'Top Products' : 'Monthly Data',
          columns: isProduct
            ? ['Rank', 'Product', 'Category', 'Revenue', 'Units', 'Rating', 'Trend']
            : ['Month', 'New Users', 'Active Users', 'Churned'],
          rows: isProduct
            ? products.map((p: Record<string, string | number>) => ({
                Rank: `#${p.rank}`, Product: p.name, Category: p.category,
                Revenue: `$${p.revenue.toLocaleString()}`, Units: p.units,
                Rating: `⭐ ${p.rating}`, Trend: p.trend,
              }))
            : products.map((m: Record<string, string | number>) => ({
                Month: m.month, 'New Users': m.new_users, 'Active Users': m.active_users, Churned: m.churned,
              })),
        },
      };
    }
  }

  // ── CHART ──
  if (intent === 'chart' || intent === 'text') {
    // Pie: category/channel breakdown
    if (/pie|category|channel|demographic|portion/.test(q)) {
      if (ds === 'sales' && data.categories) {
        return {
          type: 'chart', text: 'Here is the revenue breakdown by category:',
          chart: {
            kind: 'pie', title: 'Revenue by Category',
            labels: data.categories.map((c: { name: string }) => c.name),
            datasets: [{
              label: 'Revenue %',
              data: data.categories.map((c: { percentage: number }) => c.percentage),
              backgroundColor: PALETTE.slice(0, data.categories.length),
            }],
          },
        };
      }
      if (ds === 'users' && data.acquisition_channels) {
        return {
          type: 'chart', text: 'Here is the user acquisition breakdown by channel:',
          chart: {
            kind: 'doughnut', title: 'Acquisition Channels',
            labels: data.acquisition_channels.map((c: { channel: string }) => c.channel),
            datasets: [{
              label: 'Users',
              data: data.acquisition_channels.map((c: { users: number }) => c.users),
              backgroundColor: PALETTE.slice(0, 5),
            }],
          },
        };
      }
    }

    // YoY comparison line chart
    if (/year|yoy|last year|2023/.test(q) && ds === 'comparison' && data.yoy_comparison) {
      const yoy = data.yoy_comparison;
      return {
        type: 'chart', text: 'Here is the year-over-year revenue comparison:',
        chart: {
          kind: 'line', title: 'Revenue: 2023 vs 2024',
          labels: yoy.labels,
          datasets: yoy.datasets.map((d: { label: string; data: number[]; color: string }) => ({
            label: d.label, data: d.data, borderColor: d.color,
            backgroundColor: d.color + '20', fill: true,
          })),
        },
      };
    }

    // Category comparison bar
    if (/compare|categor|quarter|q[1-4]/.test(q) && ds === 'comparison' && data.category_comparison) {
      const cc = data.category_comparison;
      return {
        type: 'chart', text: 'Here is the quarterly revenue comparison by category:',
        chart: {
          kind: 'bar', title: 'Quarterly Revenue by Category',
          labels: cc.labels,
          datasets: cc.datasets.map((d: { label: string; data: number[]; color: string }) => ({
            label: d.label, data: d.data, backgroundColor: d.color,
          })),
        },
      };
    }

    // Monthly sales / users
    if (data.monthly) {
      const isUsers = ds === 'users';
      const labels = data.monthly.map((m: { month: string }) => m.month);
      if (chartType === 'line') {
        return {
          type: 'chart', text: isUsers ? 'Here is the monthly active users trend:' : 'Here is the monthly revenue trend:',
          chart: {
            kind: 'line', title: isUsers ? 'Monthly Active Users' : 'Monthly Revenue ($)',
            labels,
            datasets: [{
              label: isUsers ? 'Active Users' : 'Revenue ($)',
              data: data.monthly.map((m: { active_users?: number; revenue?: number }) => isUsers ? m.active_users : m.revenue),
              borderColor: ACCENT, backgroundColor: ACCENT + '25', fill: true,
            }],
          },
        };
      }
      return {
        type: 'chart', text: isUsers ? 'Here is the monthly user acquisition:' : 'Here is the monthly revenue breakdown:',
        chart: {
          kind: 'bar', title: isUsers ? 'Monthly New Users' : 'Monthly Revenue ($)',
          labels,
          datasets: [{
            label: isUsers ? 'New Users' : 'Revenue ($)',
            data: data.monthly.map((m: { new_users?: number; revenue?: number }) => isUsers ? m.new_users : m.revenue),
            backgroundColor: PALETTE,
          }],
        },
      };
    }
  }

  // Fallback text
  const fallbacks: Record<string, string> = {
    sales: `Based on the sales data, total revenue for 2024 was **$284,500** across **3,420 orders**. The best performing month was **November** with $42,100 in revenue. Electronics is the top category at 50% of revenue. Ask me to show charts or lists for more detail!`,
    users: `User metrics show **28,450 total users** with **18,920 active** this month. Organic search is the top acquisition channel (35%). The 25-34 age group is the largest demographic. Ask for charts or growth trends!`,
    comparison: `The comparison data shows strong YoY growth — 2024 outperformed 2023 in all months. Q4 was the strongest quarter, with Electronics leading all categories. Want a specific chart comparison?`,
    list: `The top product is **Wireless Headphones Pro** with $34,800 in revenue. Recent orders show strong delivery performance. Ask for specific lists like "top products", "recent orders", or "top customers"!`,
  };
  return { type: 'text', text: fallbacks[ds] ?? 'Ask me about sales, users, comparisons, or lists!' };
}

// ─── Chart Component ─────────────────────────────────────────
function ChartBlock({ payload, onClick }: { payload: ChartPayload; onClick: () => void }) {
  const opts = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom' as const }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: payload.kind === 'pie' || payload.kind === 'doughnut' ? {} : {
      x: { grid: { color: 'rgba(128,128,128,0.1)' } },
      y: { grid: { color: 'rgba(128,128,128,0.1)' } },
    },
  };
  const ChartComponent = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut }[payload.kind];
  return (
    <div className="chart-card" onClick={onClick}>
      <div className="chart-card__title">
        <span>{payload.title}</span>
        <span className="chart-card__hint">Click to expand ↗</span>
      </div>
      <ChartComponent data={{ labels: payload.labels, datasets: payload.datasets }} options={opts} />
    </div>
  );
}

// ─── List Component ──────────────────────────────────────────
function ListBlock({ payload }: { payload: ListPayload }) {
  const [search, setSearch] = useState('');
  const filtered = payload.rows.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );
  const trendIcon = (v: string | number) => {
    if (v === 'up') return <span className="trend-up">▲</span>;
    if (v === 'down') return <span className="trend-down">▼</span>;
    if (v === 'stable') return <span className="trend-stable">●</span>;
    return null;
  };
  const statusBadge = (v: string) => {
    const cls = v.toLowerCase();
    return <span className={`badge-status ${cls}`}>{v}</span>;
  };

  return (
    <div className="list-result">
      <div className="list-result__header">
        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{payload.title}</span>
        <input className="list-search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="list-table">
          <thead>
            <tr>{payload.columns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                {payload.columns.map((col) => {
                  const val = row[col];
                  if (col === 'Trend') return <td key={col}>{trendIcon(val)}</td>;
                  if (col === 'Status') return <td key={col}>{statusBadge(String(val))}</td>;
                  return <td key={col}>{val}</td>;
                })}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={payload.columns.length} style={{ textAlign: 'center', color: '#888', padding: '1rem' }}>No results found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Stats Component ─────────────────────────────────────────
function StatsBlock({ payload }: { payload: StatsPayload }) {
  return (
    <div className="stats-grid">
      {payload.items.map((item) => (
        <div key={item.label} className="stat-card">
          <div className="stat-label">{item.label}</div>
          <div className="stat-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [activeDs, setActiveDs] = useState('sales');
  const [modalChart, setModalChart] = useState<ChartPayload | null>(null);
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [loadedData, setLoadedData] = useState<Record<string, any>>({});
  const [listFilter, setListFilter] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all datasets upfront
  useEffect(() => {
    Promise.all(
      DATASETS.map(async (ds) => {
        const res = await fetch(ds.file);
        const json = await res.json();
        return [ds.id, json];
      })
    ).then((entries) => setLoadedData(Object.fromEntries(entries)));
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Web Speech API init
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onresult = (e: { results: { transcript: string }[][] }) => {
        const transcript = e.results[0][0].transcript;
        setInput((prev) => prev + transcript);
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', text: text.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = await generateResponse(text, loadedData);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', time: now(), ...response };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  }, [isTyping, loadedData]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const downloadChart = (title: string) => {
    const canvas = document.querySelector('.modal-content-chat canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      if (ext === 'json') {
        try {
          const json = JSON.parse(raw);
          setLoadedData((prev) => ({ ...prev, uploaded: json }));
          const userMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', text: `Uploaded: ${file.name}`, time: now() };
          setMessages((prev) => [...prev, userMsg]);
          setIsTyping(true);
          await new Promise((r) => setTimeout(r, 600));
          const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', type: 'text', text: `✅ I've loaded **${file.name}** successfully! It has ${Array.isArray(json) ? json.length + ' records.' : Object.keys(json).length + ' top-level keys.'} You can now ask me questions about this data!`, time: now() };
          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
        } catch {
          alert('Invalid JSON file.');
        }
      } else if (ext === 'csv') {
        const lines = raw.trim().split('\n');
        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const vals = line.split(',');
          return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim() ?? '']));
        });
        setLoadedData((prev) => ({ ...prev, uploaded: { title: file.name, rows } }));
        const userMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', text: `Uploaded CSV: ${file.name}`, time: now() };
        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, 600));
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', type: 'list', text: `✅ Loaded **${file.name}** with ${rows.length} rows!`,
          list: { title: file.name, columns: headers, rows: rows.slice(0, 10) }, time: now() };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const modalOpts = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom' as const }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: modalChart && (modalChart.kind === 'pie' || modalChart.kind === 'doughnut') ? {} : {
      x: { grid: { color: 'rgba(128,128,128,0.1)' } },
      y: { grid: { color: 'rgba(128,128,128,0.1)' } },
    },
  };

  return (
    <div className={`chat-page ${isDark ? 'dark' : 'light'}`}>
      <div className="chat-layout">
        {/* ── Sidebar ── */}
        <aside className="chat-sidebar">
          <div>
            <h6>Datasets</h6>
            {DATASETS.map((ds) => (
              <button
                key={ds.id}
                className={`dataset-btn ${activeDs === ds.id ? 'active' : ''}`}
                onClick={() => setActiveDs(ds.id)}
              >
                <span className="dataset-icon">{ds.icon}</span>
                <span><span className="dataset-label">{ds.label}</span><span className="dataset-sub">{ds.sub}</span></span>
              </button>
            ))}
          </div>

          <div>
            <h6>Upload Data</h6>
            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
              📂 Drop CSV / JSON here<br /><small>or click to browse</small>
              <input ref={fileInputRef} type="file" accept=".json,.csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>
          </div>

          <div>
            <h6>Filter Lists</h6>
            <input
              className="list-search w-100"
              placeholder="Filter list results…"
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value)}
              style={{ width: '100%', padding: '0.4rem 0.65rem', borderRadius: 8, fontSize: '0.78rem' }}
            />
          </div>

          <div style={{ marginTop: 'auto', fontSize: '0.72rem', color: '#666', lineHeight: 1.5 }}>
            💡 Tip: Ask about sales, users, comparisons, or top products. Use voice input or upload your own data!
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="chat-main">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header__title">
              <div className="status-dot" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Aardra AI Assistant</div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>Powered by local intelligence</div>
              </div>
            </div>
            <div className="chat-header__actions">
              <button className="action-pill" onClick={() => setMessages([])}>🗑 Clear</button>
              <button className="action-pill" onClick={() => setIsDark((d) => !d)}>{isDark ? '☀️' : '🌙'}</button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-icon">🤖</div>
                <h3>Hi! I&apos;m Aardra AI</h3>
                <p>Ask me anything about sales, users, comparisons, or product performance. I can show charts, tables, and stats!</p>
                <div className="quick-actions">
                  {QUICK_ACTIONS.map((qa) => (
                    <button key={qa.label} className="quick-action-btn" onClick={() => sendMessage(qa.prompt)}>{qa.label}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`msg-row msg-row--${msg.role}`}
                >
                  <div className={`msg-avatar msg-avatar--${msg.role}`}>
                    {msg.role === 'ai' ? '🤖' : '👤'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className={`msg-bubble msg-${msg.role}`}>
                      <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                      {msg.type === 'stats' && msg.stats && <StatsBlock payload={msg.stats} />}
                      {msg.type === 'chart' && msg.chart && (
                        <ChartBlock payload={msg.chart} onClick={() => setModalChart(msg.chart!)} />
                      )}
                      {msg.type === 'list' && msg.list && <ListBlock payload={msg.list} />}
                    </div>
                    <div className="msg-time d-flex align-items-center gap-2">
                      <span>{msg.time}</span>
                      {msg.role === 'ai' && (
                        <>
                          <button className="action-pill" onClick={() => copyText(msg.text)}>📋 Copy</button>
                          {msg.type === 'chart' && <button className="action-pill" onClick={() => setModalChart(msg.chart!)}>🔍 Expand</button>}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="msg-row msg-row--ai">
                <div className="msg-avatar">🤖</div>
                <div className="msg-bubble msg-ai">
                  <div className="typing-indicator"><span /><span /><span /></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            {messages.length === 0 && (
              <div className="suggested-prompts">
                {SUGGESTED.map((s) => (
                  <button key={s} className="suggested-chip" onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            )}
            <div className="chat-input-row">
              <button
                className={`chat-icon-btn ${isListening ? 'active' : ''}`}
                onClick={toggleVoice}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? '⏹' : '🎤'}
              </button>
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder={isListening ? 'Listening…' : 'Ask about sales, users, charts, or comparisons…'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ minHeight: 42, maxHeight: 120 }}
              />
              <button
                className="chat-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                title="Send message"
              >
                ➤
              </button>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '0.4rem', textAlign: 'center' }}>
              Press <kbd style={{ padding: '1px 5px', borderRadius: 4, border: '1px solid currentColor', fontSize: '0.65rem' }}>Enter</kbd> to send &nbsp;·&nbsp; <kbd style={{ padding: '1px 5px', borderRadius: 4, border: '1px solid currentColor', fontSize: '0.65rem' }}>Shift+Enter</kbd> for new line
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart Modal ── */}
      <AnimatePresence>
        {modalChart && (
          <motion.div
            className="chat-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalChart(null)}
          >
            <motion.div
              className="modal-content-chat"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setModalChart(null)}>✕</button>
              <h5 style={{ fontWeight: 700, marginBottom: '1rem', paddingRight: '2rem' }}>{modalChart.title}</h5>
              {(() => {
                const MC = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut }[modalChart.kind];
                return <MC data={{ labels: modalChart.labels, datasets: modalChart.datasets }} options={modalOpts} />;
              })()}
              <div className="d-flex gap-2 mt-3 flex-wrap">
                <button className="action-pill" onClick={() => downloadChart(modalChart.title)}>⬇ Download PNG</button>
                <button className="action-pill" onClick={() => setModalChart(null)}>✕ Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
