'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, Trash2, X, Maximize2, Minimize2,
  BarChart2, ZoomIn, ChevronRight, Bot, Sparkles,
  ShieldCheck, MessageSquare, TrendingUp,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// ─── Types ────────────────────────────────────────────────────
type MsgType = 'text' | 'chart' | 'list' | 'stats';
type ChartKind = 'bar' | 'line' | 'pie' | 'doughnut';
type Stage = 'closed' | 'landing' | 'terms' | 'chat';

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
  linkCol?: string;  // which column should be a link
  links?: string[];  // href per row (parallel to rows)
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

const ACCENT = '#e94560';
const DARK_BG   = '#0d0d1a';
const DARK_CARD = '#12122a';
const DARK_INPUT = '#1a1a35';
const DARK_BORDER = '#1e1e3a';
const PALETTE = [ACCENT, '#0f3460', '#533483', '#22c55e', '#f59e0b', '#3b82f6'];

const QUICK_ACTIONS = [
  { label: 'Sales overview',       prompt: 'Give me a sales overview with charts' },
  { label: 'Revenue trend',        prompt: 'Show monthly revenue trend as line chart' },
  { label: 'Top products',         prompt: 'Show top products list' },
  { label: 'User growth',          prompt: 'Show user growth chart' },
  { label: 'Compare categories',   prompt: 'Compare sales across categories' },
  { label: 'Recent orders',        prompt: 'Show recent orders table' },
];

// ─── AI Avatar SVG ────────────────────────────────────────────
function AIAvatar({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="url(#avatarGrad)" />
      <defs>
        <radialGradient id="avatarGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e94560" />
          <stop offset="100%" stopColor="#0f3460" />
        </radialGradient>
      </defs>
      {/* Face */}
      <ellipse cx="20" cy="19" rx="9" ry="9.5" fill="rgba(255,255,255,0.12)" />
      {/* Eyes */}
      <circle cx="16.5" cy="17.5" r="1.6" fill="#fff" />
      <circle cx="23.5" cy="17.5" r="1.6" fill="#fff" />
      <circle cx="17" cy="18" r="0.7" fill="#0f3460" />
      <circle cx="24" cy="18" r="0.7" fill="#0f3460" />
      {/* Smile */}
      <path d="M16 22 Q20 25.5 24 22" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Antenna */}
      <line x1="20" y1="9.5" x2="20" y2="6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="5" r="1.5" fill={ACCENT} />
      {/* Circuit dots */}
      <circle cx="9" cy="20" r="1.2" fill="rgba(255,255,255,0.35)" />
      <circle cx="31" cy="20" r="1.2" fill="rgba(255,255,255,0.35)" />
      <line x1="11" y1="20" x2="14" y2="20" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <line x1="26" y1="20" x2="29" y2="20" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    </svg>
  );
}

// ─── Intent detection ─────────────────────────────────────────
function detectDataset(q: string) {
  const l = q.toLowerCase();
  if (/sales|revenue|order|earn|payment|transaction/.test(l)) return 'sales';
  if (/user|customer|growth|churn|signup|register|acquisition|retention|demographic/.test(l)) return 'users';
  if (/compare|vs|versus|yoy|year.over.year|quarter|q[1-4]|categor/.test(l)) return 'comparison';
  if (/top|list|rank|best|popular|recent|table/.test(l)) return 'list';
  return 'sales';
}
function detectChartType(q: string): ChartKind {
  const l = q.toLowerCase();
  if (/pie|donut|doughnut|breakdown|portion|share/.test(l)) return 'pie';
  if (/line|trend|over time|timeline|month|growth/.test(l)) return 'line';
  return 'bar';
}
function detectIntent(q: string): 'chart' | 'list' | 'stats' | 'text' {
  const l = q.toLowerCase();
  if (/chart|graph|visual|plot|bar|line|pie|trend|show/.test(l)) return 'chart';
  if (/list|table|top|rank|recent|all/.test(l)) return 'list';
  if (/how many|total|sum|count|average|avg|overview|summary|stat/.test(l)) return 'stats';
  return 'text';
}

// ─── Response generator ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateResponse(query: string, allData: Record<string, any>): Promise<Omit<Message, 'id' | 'time' | 'role'>> {
  const q = query.toLowerCase();
  const realProducts: Record<string, unknown>[] = allData['realProducts'] ?? [];

  // ── Real product queries ──────────────────────────────────────
  if (realProducts.length > 0 && /product|item|shop|buy|stock|available|what.*sell|show.*product|list.*product|all product|our product|featured/.test(q)) {
    const searchTerm = q.replace(/show|list|all|our|featured|products?|items?|available|what|you|sell|do|have|are|there|any/g, '').trim();
    const filtered = searchTerm.length > 2
      ? realProducts.filter((p) => String(p['name']).toLowerCase().includes(searchTerm) || String(p['category']).toLowerCase().includes(searchTerm))
      : realProducts;
    const display = filtered.slice(0, 8);

    if (/chart|graph|bar|pie|visual/.test(q) && display.length > 0) {
      return {
        type: 'chart', text: `Here are our products visualised by price${searchTerm ? ` (filtered: "${searchTerm}")` : ''}:`,
        chart: {
          kind: 'bar', title: 'Products by Price (₹)',
          labels: display.map((p) => String(p['name']).split(' ').slice(0, 3).join(' ')),
          datasets: [{ label: 'Price (₹)', data: display.map((p) => Number(p['price'])), backgroundColor: PALETTE }],
        },
      };
    }

    return {
      type: 'list',
      text: filtered.length === 0
        ? `No products found matching "${searchTerm}". Try a different keyword!`
        : `Found **${filtered.length}** product${filtered.length !== 1 ? 's' : ''}${searchTerm ? ` matching "${searchTerm}"` : ' in our store'}:`,
      list: {
        title: searchTerm ? `Results for "${searchTerm}"` : 'Our Products',
        columns: ['Product', 'Category', 'Price', 'Stock'],
        linkCol: 'Product',
        links: display.map((p) => `/products/${p['id']}`),
        rows: display.map((p) => ({
          Product: String(p['name']),
          Category: String(p['category']),
          Price: `₹${Number(p['price']).toLocaleString('en-IN')}`,
          Stock: Number(p['stock']) > 0 ? `${p['stock']} left` : 'Out of stock',
        })),
      },
    };
  }

  // ── Category breakdown from real products ─────────────────────
  if (realProducts.length > 0 && /categor/.test(q) && /chart|pie|breakdown/.test(q)) {
    const catMap: Record<string, number> = {};
    realProducts.forEach((p) => { const cat = String(p['category']); catMap[cat] = (catMap[cat] ?? 0) + 1; });
    return {
      type: 'chart', text: 'Products by category (live from store):',
      chart: {
        kind: 'pie', title: 'Products by Category',
        labels: Object.keys(catMap),
        datasets: [{ label: 'Count', data: Object.values(catMap), backgroundColor: PALETTE }],
      },
    };
  }

  const ds = detectDataset(query);
  const intent = detectIntent(query);
  const chartType = detectChartType(query);
  const data = allData[ds];
  if (!data) return { type: 'text', text: 'Dataset not loaded yet, please try again in a moment.' };

  if (intent === 'stats') {
    const s = data.summary ?? {};
    const items = Object.entries(s).map(([k, v]) => ({
      label: k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      value: String(v),
    }));
    return { type: 'stats', text: "Here's the summary:", stats: { items } };
  }

  if (intent === 'list') {
    if (/order/.test(q) && data.recent_orders) {
      return {
        type: 'list', text: 'Most recent orders:',
        list: {
          title: 'Recent Orders',
          columns: ['Order ID', 'Customer', 'Amount', 'Status'],
          rows: data.recent_orders.map((o: Record<string, unknown>) => ({
            'Order ID': String(o['id']),
            Customer: String(o['customer']),
            Amount: `$${o['amount']}`,
            Status: String(o['status']),
          })),
        },
      };
    }
    const products = data.top_products ?? data.monthly;
    if (products) {
      const isProduct = !!data.top_products;
      return {
        type: 'list', text: isProduct ? 'Top performing products:' : 'Monthly breakdown:',
        list: {
          title: isProduct ? 'Top Products' : 'Monthly Data',
          columns: isProduct ? ['#', 'Product', 'Revenue', 'Units'] : ['Month', 'Revenue', 'Orders'],
          linkCol: isProduct ? 'Product' : undefined,
          links: isProduct
            ? products.map((p: Record<string, unknown>) => `/products?search=${encodeURIComponent(String(p['name']))}`)
            : undefined,
          rows: isProduct
            ? products.map((p: Record<string, unknown>) => ({
                '#': `#${p['rank']}`,
                Product: String(p['name']),
                Revenue: `$${Number(p['revenue']).toLocaleString()}`,
                Units: String(p['units']),
              }))
            : products.map((m: Record<string, unknown>) => ({
                Month: String(m['month']),
                Revenue: `$${Number(m['revenue']).toLocaleString()}`,
                Orders: String(m['orders']),
              })),
        },
      };
    }
  }

  if (intent === 'chart' || intent === 'text') {
    if (/pie|category|channel|portion/.test(q)) {
      if (ds === 'sales' && data.categories) {
        return {
          type: 'chart', text: 'Revenue breakdown by category:',
          chart: { kind: 'pie', title: 'Revenue by Category', labels: data.categories.map((c: { name: string }) => c.name), datasets: [{ label: '%', data: data.categories.map((c: { percentage: number }) => c.percentage), backgroundColor: PALETTE }] },
        };
      }
      if (ds === 'users' && data.acquisition_channels) {
        return {
          type: 'chart', text: 'User acquisition by channel:',
          chart: { kind: 'doughnut', title: 'Acquisition Channels', labels: data.acquisition_channels.map((c: { channel: string }) => c.channel), datasets: [{ label: 'Users', data: data.acquisition_channels.map((c: { users: number }) => c.users), backgroundColor: PALETTE }] },
        };
      }
    }
    if (/year|yoy|last year|2023/.test(q) && ds === 'comparison' && data.yoy_comparison) {
      const yoy = data.yoy_comparison;
      return {
        type: 'chart', text: 'Year-over-year revenue comparison:',
        chart: { kind: 'line', title: '2023 vs 2024 Revenue', labels: yoy.labels, datasets: yoy.datasets.map((d: { label: string; data: number[]; color: string }) => ({ label: d.label, data: d.data, borderColor: d.color, backgroundColor: d.color + '20', fill: true })) },
      };
    }
    if (/compare|categor|quarter/.test(q) && ds === 'comparison' && data.category_comparison) {
      const cc = data.category_comparison;
      return {
        type: 'chart', text: 'Quarterly revenue by category:',
        chart: { kind: 'bar', title: 'Category Comparison by Quarter', labels: cc.labels, datasets: cc.datasets.map((d: { label: string; data: number[]; color: string }) => ({ label: d.label, data: d.data, backgroundColor: d.color })) },
      };
    }
    if (data.monthly) {
      const isUsers = ds === 'users';
      const labels = data.monthly.map((m: { month: string }) => m.month);
      if (chartType === 'line') {
        return {
          type: 'chart', text: isUsers ? 'Monthly active users trend:' : 'Monthly revenue trend:',
          chart: { kind: 'line', title: isUsers ? 'Active Users / Month' : 'Revenue / Month', labels, datasets: [{ label: isUsers ? 'Active Users' : 'Revenue ($)', data: data.monthly.map((m: { active_users?: number; revenue?: number }) => isUsers ? m.active_users : m.revenue), borderColor: ACCENT, backgroundColor: ACCENT + '25', fill: true }] },
        };
      }
      return {
        type: 'chart', text: isUsers ? 'Monthly user acquisition:' : 'Monthly revenue:',
        chart: { kind: 'bar', title: isUsers ? 'New Users / Month' : 'Revenue / Month ($)', labels, datasets: [{ label: isUsers ? 'New Users' : 'Revenue ($)', data: data.monthly.map((m: { new_users?: number; revenue?: number }) => isUsers ? m.new_users : m.revenue), backgroundColor: PALETTE }] },
      };
    }
  }

  const fallbacks: Record<string, string> = {
    sales: `**Sales 2024 Snapshot**\n\nTotal Revenue: **$284,500** · Orders: **3,420** · Growth: **18.5%** · Best month: **November** ($42,100)\n\nTry asking me to show a chart, list, or category breakdown!`,
    users: `**User Metrics**\n\nTotal Users: **28,450** · Active: **18,920** · Top channel: **Organic Search (35%)**\n\nAsk for charts or growth trends!`,
    comparison: `**Comparison Overview**\n\n2024 outperformed 2023 in all months. Q4 was the strongest quarter. Ask for a specific comparison chart!`,
    list: `**Available Lists**\n\n• Top products by revenue\n• Top customers by spend\n• Recent orders\n\nJust ask for any of these!`,
  };
  return { type: 'text', text: fallbacks[ds] ?? 'Ask me about sales, users, comparisons, or product lists!' };
}

// ─── Mini chart ────────────────────────────────────────────────
function MiniChart({ payload, onExpand }: { payload: ChartPayload; onExpand: () => void }) {
  const opts = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: payload.kind === 'pie' || payload.kind === 'doughnut', position: 'bottom' as const, labels: { color: '#aaa', font: { size: 9 }, boxWidth: 10 } }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: payload.kind === 'pie' || payload.kind === 'doughnut' ? {} : {
      x: { grid: { display: false }, ticks: { color: '#666', font: { size: 9 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 9 } } },
    },
  };
  const C = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut }[payload.kind];
  return (
    <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 10px 6px', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#ccc', display: 'flex', alignItems: 'center', gap: 4 }}>
          <BarChart2 size={11} color={ACCENT} /> {payload.title}
        </span>
        <button onClick={onExpand} style={{ background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 6, color: ACCENT, cursor: 'pointer', padding: '2px 7px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
          <ZoomIn size={10} /> Expand
        </button>
      </div>
      <C data={{ labels: payload.labels, datasets: payload.datasets }} options={opts} />
    </div>
  );
}

// ─── Mini list ─────────────────────────────────────────────────
function MiniList({ payload }: { payload: ListPayload }) {
  return (
    <div style={{ marginTop: 10, overflowX: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc', padding: '8px 10px 4px' }}>{payload.title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>{payload.columns.map((c) => <th key={c} style={{ textAlign: 'left', padding: '4px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#666', fontWeight: 600 }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {payload.rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < payload.rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              {payload.columns.map((col) => {
                const val = row[col];
                const isLink = payload.linkCol === col && payload.links?.[i];
                return (
                  <td key={col} style={{ padding: '5px 10px', fontSize: 11 }}>
                    {isLink ? (
                      <a
                        href={payload.links![i]}
                        style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {val}
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H4M10 2V8" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </a>
                    ) : (
                      <span style={{ color: col === '#' ? '#666' : '#ddd' }}>{val}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mini stats ────────────────────────────────────────────────
function MiniStats({ payload }: { payload: StatsPayload }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
      {payload.items.map((item) => (
        <div key={item.label} style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 8, padding: '6px 8px' }}>
          <div style={{ fontSize: 9, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginTop: 2 }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Chart Expand Modal ───────────────────────────────────────
function ChartModal({ payload, onClose }: { payload: ChartPayload; onClose: () => void }) {
  const C = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut }[payload.kind];
  const opts = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom' as const, labels: { color: '#ccc', font: { size: 11 }, boxWidth: 12 } }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: payload.kind === 'pie' || payload.kind === 'doughnut' ? {} : {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
    },
  };
  const download = () => {
    const canvas = document.querySelector('.chart-modal-canvas canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${payload.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{ background: DARK_CARD, borderRadius: 20, padding: 24, width: '100%', maxWidth: 640, border: `1px solid ${DARK_BORDER}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={16} color={ACCENT} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{payload.title}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={download} style={{ background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 8, color: ACCENT, cursor: 'pointer', padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>⬇ PNG</button>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
          </div>
        </div>
        <div className="chart-modal-canvas"><C data={{ labels: payload.labels, datasets: payload.datasets }} options={opts} /></div>
      </motion.div>
    </motion.div>
  );
}

// ─── localStorage helpers ─────────────────────────────────────
const LS_KEY = 'aardra_chat_v1';

function loadPersistedState() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null'); } catch { return null; }
}

function savePersistedState(data: object) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* quota full */ }
}

// ─── Main widget ───────────────────────────────────────────────
export default function ChatWidget() {
  // Initialise from localStorage on first render (client-only)
  const persisted = useRef(loadPersistedState());

  const [stage, setStageRaw]        = useState<Stage>('closed');
  const [messages, setMessagesRaw]  = useState<Message[]>([]);
  const [expanded, setExpanded]     = useState<boolean>(persisted.current?.expanded ?? false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(persisted.current?.termsAccepted ?? false);
  const [termsChecked, setTermsChecked]   = useState(false);
  const [unread, setUnread]         = useState<number>(persisted.current?.unread ?? 0);

  const [input, setInput]           = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [expandedChart, setExpandedChart] = useState<ChartPayload | null>(null);
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [loadedData, setLoadedData] = useState<Record<string, any>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Restore messages from localStorage after first mount
  useEffect(() => {
    const saved = persisted.current;
    if (saved?.messages?.length) setMessagesRaw(saved.messages);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever key state changes
  useEffect(() => {
    savePersistedState({ messages, expanded, termsAccepted, unread });
  }, [messages, expanded, termsAccepted, unread]);

  // Wrapped setters that also persist
  const setStage = (s: Stage) => setStageRaw(s);
  const setMessages = (fn: Message[] | ((prev: Message[]) => Message[])) => {
    setMessagesRaw((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      return next;
    });
  };

  // Load datasets + real products from DB
  useEffect(() => {
    const files = [['sales','/data/sales-data.json'],['users','/data/user-growth.json'],['comparison','/data/comparison.json'],['list','/data/list-data.json']];
    Promise.all([
      ...files.map(async ([id, path]) => [id, await (await fetch(path)).json()]),
      fetch('/api/chat/products').then((r) => r.json()).then((json) => ['realProducts', json.products ?? []]),
    ]).then((entries) => setLoadedData(Object.fromEntries(entries)));
  }, []);

  // Speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US';
    rec.onresult = (e: { results: { transcript: string }[][] }) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend   = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  useEffect(() => {
    if (stage === 'chat') {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [stage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Open: skip landing+terms if already accepted; go straight to chat
  const handleOpen = () => {
    if (termsAccepted && messages.length > 0) {
      setStage('chat');
    } else if (termsAccepted) {
      setStage('chat');
      triggerGreeting();
    } else {
      setStage('landing');
    }
  };
  const handleClose = () => { setStage('closed'); setExpanded(false); };

  const triggerGreeting = async () => {
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1000));
    const greeting: Message = {
      id: 'greeting', role: 'ai', type: 'text', time: now(),
      text: `Hello! 👋 I'm **Aardra AI Assistant** — your intelligent data companion.\n\nI can help you explore:\n• 💰 Sales & revenue analytics\n• 👥 User growth & demographics\n• 📊 Product performance comparisons\n• 📋 Order lists & rankings\n\nJust ask me anything — I'll show charts, tables, and insights in seconds! What would you like to explore?`,
    };
    setMessages([greeting]);
    setIsTyping(false);
  };

  const startChat = async () => {
    setTermsAccepted(true);
    setStage('chat');
    if (messages.length === 0) await triggerGreeting();
  };

  const clearChat = () => {
    setMessagesRaw([]);
    savePersistedState({ messages: [], expanded, termsAccepted, unread: 0 });
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', text: text.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
    const response = await generateResponse(text, loadedData);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', time: now(), ...response };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    if (stage !== 'chat') setUnread((n) => n + 1);
  }, [isTyping, loadedData, stage]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };



  // Panel dimensions
  const panelW = expanded ? 560 : 360;
  const panelH = expanded ? 680 : 540;

  const isOpen = stage !== 'closed';

  return (
    <>
      {/* ── Expanded chart modal ── */}
      <AnimatePresence>
        {expandedChart && <ChartModal payload={expandedChart} onClose={() => setExpandedChart(null)} />}
      </AnimatePresence>

      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>

        {/* ── Chat panel ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.94 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                position: 'absolute', bottom: 72, right: 0,
                width: panelW, maxWidth: 'calc(100vw - 32px)',
                height: panelH,
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                display: 'flex', flexDirection: 'column',
                background: DARK_BG,
                border: `1px solid ${DARK_BORDER}`,
                transition: 'width 0.25s ease, height 0.25s ease',
              }}
            >
              {/* ── Header ── */}
              <div style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #0f3460 100%)`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <AIAvatar size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-0.01em' }}>Aardra AI Assistant</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 2px rgba(34,197,94,0.3)' }} />
                    Online · Data Intelligence
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {stage === 'chat' && (
                    <button onClick={clearChat} title="Clear chat" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
                      <Trash2 size={13} />
                    </button>
                  )}
                  <button onClick={() => setExpanded((e) => !e)} title={expanded ? 'Compact view' : 'Expanded view'} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
                    {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>
                  <button onClick={handleClose} title="Close" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* ── Landing screen ── */}
              {stage === 'landing' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 0, overflowY: 'auto' }}>
                  <div style={{ marginBottom: 14 }}><AIAvatar size={72} /></div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 6, textAlign: 'center' }}>Meet Aardra AI Assistant</h3>
                  <p style={{ color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 1.6, maxWidth: 280, marginBottom: 20 }}>
                    Your intelligent analytics companion — explore sales data, user growth, product performance, and more through natural conversation.
                  </p>

                  {/* Feature pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280, marginBottom: 20 }}>
                    {[
                      { icon: <BarChart2 size={14} color={ACCENT} />, label: 'Interactive charts & visualizations' },
                      { icon: <TrendingUp size={14} color="#22c55e" />,  label: 'Real-time data insights' },
                      { icon: <MessageSquare size={14} color="#3b82f6" />, label: 'Natural language queries' },
                      { icon: <Sparkles size={14} color="#f59e0b" />,   label: 'Smart intent detection' },
                    ].map((f) => (
                      <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {f.icon}
                        <span style={{ fontSize: 12, color: '#ccc' }}>{f.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Get started button */}
                  <button onClick={() => setStage('terms')} style={{ background: `linear-gradient(135deg, ${ACCENT}, #c73652)`, border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', padding: '11px 28px', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 6px 20px rgba(233,69,96,0.35)`, width: '100%', maxWidth: 280, justifyContent: 'center', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(233,69,96,0.45)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(233,69,96,0.35)'; }}>
                    Get Started <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* ── Terms screen ── */}
              {stage === 'terms' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 18px', overflowY: 'auto', gap: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <ShieldCheck size={18} color={ACCENT} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Terms & Privacy</span>
                  </div>

                  <div style={{ background: DARK_CARD, borderRadius: 12, padding: 14, border: `1px solid ${DARK_BORDER}`, fontSize: 12, color: '#aaa', lineHeight: 1.7, flex: 1, overflowY: 'auto', marginBottom: 14 }}>
                    <p style={{ color: '#ddd', fontWeight: 600, marginBottom: 8 }}>Before you start, please read and accept our terms:</p>
                    <p><strong style={{ color: '#fff' }}>1. Data Usage</strong><br />This assistant uses anonymised business data stored locally. No personal information is collected or transmitted to third parties.</p>
                    <p><strong style={{ color: '#fff' }}>2. AI Responses</strong><br />Responses are generated by Aardra AI using pre-loaded datasets. The information is for analytical purposes only and may not reflect real-time data.</p>
                    <p><strong style={{ color: '#fff' }}>3. Conversations</strong><br />Chat sessions are stored temporarily in your browser session only. No conversation history is saved on our servers.</p>
                    <p><strong style={{ color: '#fff' }}>4. Accuracy</strong><br />While we strive for accuracy, AI responses should not be used as the sole basis for business decisions. Always verify with authoritative data sources.</p>
                    <p><strong style={{ color: '#fff' }}>5. Acceptable Use</strong><br />Please use this assistant responsibly. Do not submit sensitive personal information or attempt to misuse the system.</p>
                    <p style={{ marginBottom: 0 }}>By continuing, you agree to Aardra&apos;s <span style={{ color: ACCENT }}>Privacy Policy</span> and <span style={{ color: ACCENT }}>Terms of Service</span>.</p>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                    <div onClick={() => setTermsChecked((c) => !c)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${termsChecked ? ACCENT : '#444'}`, background: termsChecked ? ACCENT : 'transparent', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'pointer' }}>
                      {termsChecked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12, color: '#bbb', lineHeight: 1.5 }}>I have read and agree to the Terms of Service and Privacy Policy</span>
                  </label>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setStage('landing')} style={{ flex: 1, border: `1px solid ${DARK_BORDER}`, borderRadius: 10, background: 'transparent', color: '#888', cursor: 'pointer', padding: '10px', fontSize: 13, fontWeight: 600 }}>Back</button>
                    <button onClick={startChat} disabled={!termsChecked} style={{ flex: 2, border: 'none', borderRadius: 10, background: termsChecked ? ACCENT : '#333', color: termsChecked ? '#fff' : '#666', cursor: termsChecked ? 'pointer' : 'not-allowed', padding: '10px', fontSize: 13, fontWeight: 700, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Bot size={14} /> Start Chatting
                    </button>
                  </div>
                </div>
              )}

              {/* ── Chat screen ── */}
              {stage === 'chat' && (
                <>
                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }} className="cw-messages">

                    {messages.length === 0 && !isTyping && (
                      <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                        <AIAvatar size={48} />
                        <div style={{ fontSize: 13, color: '#888', marginTop: 10 }}>Loading greeting…</div>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.role === 'ai' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <AIAvatar size={20} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#888' }}>Aardra AI</span>
                          </div>
                        )}
                        <div style={{
                          maxWidth: '90%',
                          borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                          padding: '9px 12px',
                          background: msg.role === 'user' ? ACCENT : DARK_INPUT,
                          color: '#fff', fontSize: 13, lineHeight: 1.55,
                          border: msg.role === 'ai' ? `1px solid ${DARK_BORDER}` : 'none',
                        }}>
                          <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                          {msg.type === 'stats' && msg.stats && <MiniStats payload={msg.stats} />}
                          {msg.type === 'chart' && msg.chart && <MiniChart payload={msg.chart} onExpand={() => setExpandedChart(msg.chart!)} />}
                          {msg.type === 'list'  && msg.list  && <MiniList  payload={msg.list}  />}
                        </div>
                        <div style={{ fontSize: 10, color: '#444', marginTop: 3, paddingInline: 4 }}>{msg.time}</div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AIAvatar size={20} />
                        <div style={{ display: 'flex', gap: 4, background: DARK_INPUT, border: `1px solid ${DARK_BORDER}`, borderRadius: '4px 14px 14px 14px', padding: '10px 14px' }}>
                          {[0, 1, 2].map((i) => (
                            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#666', display: 'block', animation: `cwDot 1.2s ${i * 0.2}s infinite ease-in-out` }} />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Quick actions after greeting */}
                    {messages.length === 1 && !isTyping && (
                      <div style={{ paddingLeft: 26 }}>
                        <div style={{ fontSize: 10, color: '#555', marginBottom: 6, fontWeight: 600 }}>Quick actions:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {QUICK_ACTIONS.map((qa) => (
                            <button key={qa.label} onClick={() => sendMessage(qa.prompt)} style={{ border: `1px solid rgba(233,69,96,0.3)`, borderRadius: 999, padding: '4px 10px', fontSize: 11, cursor: 'pointer', background: 'rgba(233,69,96,0.08)', color: ACCENT, fontWeight: 500, transition: 'background 0.15s', whiteSpace: 'nowrap' }}>
                              {qa.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div style={{ padding: '10px 12px', borderTop: `1px solid ${DARK_BORDER}`, background: DARK_CARD, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={toggleVoice} title={isListening ? 'Stop listening' : 'Voice input'}
                        style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${isListening ? ACCENT : DARK_BORDER}`, background: isListening ? ACCENT : 'transparent', color: isListening ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                        {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                      </button>
                      <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(input); } }}
                        placeholder={isListening ? 'Listening…' : 'Ask me anything…'}
                        style={{ flex: 1, background: DARK_INPUT, border: `1.5px solid ${DARK_BORDER}`, borderRadius: 20, padding: '8px 14px', fontSize: 13, color: '#e8e8f0', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                        onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                        onBlur={(e) => (e.target.style.borderColor = DARK_BORDER)}
                      />
                      <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
                        style={{ width: 34, height: 34, borderRadius: '50%', background: input.trim() && !isTyping ? ACCENT : '#222', border: 'none', color: '#fff', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: input.trim() && !isTyping ? 1 : 0.35, transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { if (input.trim()) e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                        <Send size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: 10, color: '#333', marginTop: 6, textAlign: 'center' }}>
                      Powered by Aardra Intelligence
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bubble button ── */}
        <motion.button
          onClick={() => stage === 'closed' ? handleOpen() : handleClose()}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          style={{ width: 58, height: 58, borderRadius: '50%', background: stage !== 'closed' ? '#1a1a2e' : ACCENT, border: `2px solid ${stage !== 'closed' ? DARK_BORDER : 'transparent'}`, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(233,69,96,0.4)', position: 'relative', transition: 'background 0.2s, border-color 0.2s' }}
          aria-label={stage !== 'closed' ? 'Close AI chat' : 'Open AI chat'}
        >
          <AnimatePresence mode="wait">
            {stage !== 'closed' ? (
              <motion.span key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={22} />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                <AIAvatar size={38} />
              </motion.span>
            )}
          </AnimatePresence>
          {stage === 'closed' && unread > 0 && (
            <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#22c55e', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unread}</span>
          )}
        </motion.button>
      </div>

      <style>{`
        @keyframes cwDot { 0%,80%,100% { transform:scale(0.5); opacity:0.3; } 40% { transform:scale(1); opacity:1; } }
        .cw-messages { scroll-behavior: smooth; }
        .cw-messages::-webkit-scrollbar { width: 3px; }
        .cw-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>
    </>
  );
}
