// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ELTASOLAR KOMPLET PLATFORM v2.0
// Alle moduler: Kalkulation, Tilbud, Chat, Filer, Akkord, AI-tekst, PDF
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  companyName: 'Elta Solar',
  tagline: 'Fra sol til stikkontakt – nemt og sikkert',
  vatRate: 25,
  akkordMinuteRate: 5.33, // kr pr. akkordminut
};

const COLORS = {
  primary: '#2E7D32', primaryDark: '#1B5E20', primaryLight: '#4CAF50',
  accent: '#F5A623', accentDark: '#E09000',
  bg: '#F8FAFC', card: '#FFFFFF', text: '#1E293B', textLight: '#64748B', border: '#E2E8F0',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
};

const STYLES = {
  label: { display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: COLORS.text },
  input: { width: '100%', padding: '12px 16px', border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 15, boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 16px', border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 15, boxSizing: 'border-box', background: 'white' },
  primaryBtn: { background: COLORS.primary, color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  secondaryBtn: { background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  card: { background: 'white', borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: COLORS.textLight, textTransform: 'uppercase' },
  td: { padding: '16px', fontSize: 14 },
};

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSection('dashboard');
  };

  const hasPermission = (perm) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    return profile.permissions?.includes(perm);
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, hasPermission }}>
      <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Inter', -apple-system, sans-serif" }}>
        {!user ? <LoginPage /> : (
          <>
            <Navigation section={section} setSection={setSection} />
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
              {section === 'dashboard' && <Dashboard setSection={setSection} />}
              {section === 'projekter' && <ProjektSystem />}
              {section === 'kunder' && <KunderSystem />}
              {section === 'tilbud' && <TilbudSystem />}
              {section === 'normtider' && <NormtiderSystem />}
              {section === 'indstillinger' && profile?.role === 'admin' && <IndstillingerSystem />}
            </main>
          </>
        )}
      </div>
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING & LOGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.bg }}>
      <div style={{ textAlign: 'center' }}>
        <SolarLogo size={60} />
        <p style={{ marginTop: 16, color: COLORS.textLight }}>Indlæser Elta Solar...</p>
      </div>
    </div>
  );
}

function SolarLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <g fill={COLORS.accent}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect key={i} x="47" y="5" width="6" height="15" rx="3" transform={`rotate(${angle} 50 50)`} />
        ))}
      </g>
      <rect x="30" y="35" width="40" height="30" rx="4" fill={COLORS.primary} />
      <line x1="30" y1="45" x2="70" y2="45" stroke="white" strokeWidth="2" />
      <line x1="30" y1="55" x2="70" y2="55" stroke="white" strokeWidth="2" />
      <line x1="40" y1="35" x2="40" y2="65" stroke="white" strokeWidth="2" />
      <line x1="50" y1="35" x2="50" y2="65" stroke="white" strokeWidth="2" />
      <line x1="60" y1="35" x2="60" y2="65" stroke="white" strokeWidth="2" />
      <rect x="45" y="65" width="10" height="12" rx="2" fill={COLORS.primary} />
      <path d="M 35 85 Q 50 70 65 85" stroke={COLORS.primary} strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 48, width: '100%', maxWidth: 420, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <SolarLogo size={48} />
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              <span style={{ color: COLORS.primary }}>Elta</span>
              <span style={{ color: COLORS.accent }}>Solar</span>
            </div>
          </div>
          <p style={{ color: COLORS.textLight, fontSize: 14 }}>{CONFIG.tagline}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="din@email.dk" />
          <FormField label="Adgangskode" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error && <Alert type="error">{error}</Alert>}
          <button type="submit" disabled={loading} style={{ ...STYLES.primaryBtn, width: '100%', padding: 16, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logger ind...' : 'Log ind'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: COLORS.textLight }}>Kontakt administrator for at få adgang</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Navigation({ section, setSection }) {
  const { profile, logout } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const menuItems = [
    { id: 'dashboard', label: 'Overblik', icon: '📊' },
    { id: 'projekter', label: 'Projekter', icon: '🔧' },
    { id: 'kunder', label: 'Kunder', icon: '👥' },
    { id: 'tilbud', label: 'Tilbud', icon: '📄' },
    { id: 'normtider', label: 'Normtider', icon: '⏱️' },
    { id: 'indstillinger', label: 'Indstillinger', icon: '⚙️', adminOnly: true },
  ];

  return (
    <nav style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}`, padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SolarLogo size={32} />
          <span style={{ fontWeight: 700, fontSize: 18 }}><span style={{ color: COLORS.primary }}>Elta</span><span style={{ color: COLORS.accent }}>Solar</span></span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {menuItems.map(item => (
            (!item.adminOnly || isAdmin) && (
              <button key={item.id} onClick={() => setSection(item.id)} style={{
                background: section === item.id ? COLORS.primary : 'transparent',
                color: section === item.id ? 'white' : COLORS.text,
                border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 500, cursor: 'pointer', fontSize: 13
              }}>
                {item.icon} {item.label}
              </button>
            )
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: COLORS.textLight }}>
            {profile?.name || profile?.email}
            {isAdmin && <span style={{ marginLeft: 8, padding: '2px 8px', background: COLORS.primary, color: 'white', borderRadius: 4, fontSize: 10 }}>ADMIN</span>}
          </span>
          <button onClick={logout} style={{ ...STYLES.secondaryBtn, padding: '8px 16px' }}>Log ud</button>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Dashboard({ setSection }) {
  const [stats, setStats] = useState({ projects: 0, customers: 0, quotes: 0, pendingQuotes: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const { profile } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [projects, customers, quotes, recent] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact' }),
      supabase.from('customers').select('id', { count: 'exact' }),
      supabase.from('quotes').select('id, status', { count: 'exact' }),
      supabase.from('projects').select('*, customers(name, company)').order('created_at', { ascending: false }).limit(5)
    ]);
    
    const pendingCount = quotes.data?.filter(q => q.status === 'sent').length || 0;
    
    setStats({
      projects: projects.count || 0,
      customers: customers.count || 0,
      quotes: quotes.count || 0,
      pendingQuotes: pendingCount
    });
    setRecentProjects(recent.data || []);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Velkommen, {profile?.name || 'Bruger'}</h1>
        <p style={{ color: COLORS.textLight, marginTop: 4 }}>Her er dit overblik</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Projekter" value={stats.projects} icon="📁" color={COLORS.primary} onClick={() => setSection('projekter')} />
        <StatCard label="Kunder" value={stats.customers} icon="👥" color={COLORS.info} onClick={() => setSection('kunder')} />
        <StatCard label="Tilbud sendt" value={stats.quotes} icon="📄" color={COLORS.accent} onClick={() => setSection('tilbud')} />
        <StatCard label="Afventer svar" value={stats.pendingQuotes} icon="⏳" color={COLORS.warning} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={STYLES.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Seneste projekter</h3>
          {recentProjects.length === 0 ? (
            <p style={{ color: COLORS.textLight }}>Ingen projekter endnu</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {recentProjects.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textLight }}>{p.customers?.company || p.customers?.name}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}><StatusBadge status={p.status} /></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(p.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={STYLES.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Hurtige handlinger</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => setSection('projekter')} style={{ ...STYLES.primaryBtn }}>➕ Nyt projekt</button>
            <button onClick={() => setSection('kunder')} style={{ ...STYLES.secondaryBtn }}>👤 Ny kunde</button>
            <button onClick={() => setSection('tilbud')} style={{ ...STYLES.secondaryBtn }}>📄 Nyt tilbud</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, onClick }) {
  return (
    <div onClick={onClick} style={{ ...STYLES.card, cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: 16 }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'translateY(0)')}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 14, color: COLORS.textLight }}>{label}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROJEKT SYSTEM MED KALKULATION OG AKKORD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ProjektSystem() {
  const [projekter, setProjekter] = useState([]);
  const [selectedProjekt, setSelectedProjekt] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProjekter(); }, []);

  const loadProjekter = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*, customers(name, company)').order('created_at', { ascending: false });
    setProjekter(data || []);
    setLoading(false);
  };

  const createProjekt = async (form) => {
    // Convert empty strings to null for UUID fields
    const cleanForm = {
      ...form,
      customer_id: form.customer_id || null
    };
    const { data, error } = await supabase.from('projects').insert([cleanForm]).select().single();
    if (error) { alert('Fejl: ' + error.message); return; }
    setShowCreate(false);
    setSelectedProjekt(data);
    loadProjekter();
  };

  if (selectedProjekt) {
    return <ProjektDetalje projekt={selectedProjekt} onBack={() => { setSelectedProjekt(null); loadProjekter(); }} />;
  }

  return (
    <div>
      <PageHeader title="Projekter & Kalkulation" subtitle="Opret projekter, kalkuler og generer tilbud" action={{ label: '+ Nyt projekt', onClick: () => setShowCreate(true) }} />

      {loading ? <LoadingIndicator /> : projekter.length === 0 ? (
        <EmptyState icon="📁" title="Ingen projekter endnu" subtitle="Opret dit første projekt for at komme i gang" action={{ label: '+ Opret projekt', onClick: () => setShowCreate(true) }} />
      ) : (
        <div style={{ ...STYLES.card, overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Projekt</th>
                <th style={STYLES.th}>Kunde</th>
                <th style={STYLES.th}>Status</th>
                <th style={STYLES.th}>Timer</th>
                <th style={STYLES.th}>Pris</th>
                <th style={STYLES.th}>DB%</th>
                <th style={STYLES.th}>Akkord</th>
                <th style={STYLES.th}></th>
              </tr>
            </thead>
            <tbody>
              {projekter.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => setSelectedProjekt(p)}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textLight }}>{p.address}</div>
                  </td>
                  <td style={STYLES.td}>{p.customers?.company || p.customers?.name || '-'}</td>
                  <td style={STYLES.td}><StatusBadge status={p.status} /></td>
                  <td style={STYLES.td}>{(p.total_labor_hours || 0).toFixed(1)}</td>
                  <td style={STYLES.td}><strong>{formatMoney(p.total_price)}</strong></td>
                  <td style={STYLES.td}><span style={{ color: (p.contribution_margin_percent || 0) >= 20 ? COLORS.success : COLORS.warning }}>{(p.contribution_margin_percent || 0).toFixed(1)}%</span></td>
                  <td style={STYLES.td}>{formatMoney(p.akkord_total_amount)}</td>
                  <td style={STYLES.td}><button style={STYLES.secondaryBtn}>Åbn →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Opret nyt projekt" onClose={() => setShowCreate(false)}>
          <ProjektForm onSave={createProjekt} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
    </div>
  );
}

function ProjektForm({ onSave, onCancel, initial = {} }) {
  const [kunder, setKunder] = useState([]);
  const [form, setForm] = useState({ name: '', customer_id: '', address: '', city: '', zip: '', project_type: 'standard', description: '', ...initial });

  useEffect(() => {
    supabase.from('customers').select('id, name, company').then(({ data }) => setKunder(data || []));
  }, []);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FormField label="Projektnavn *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="F.eks. Solcelleanlæg Villa Hansen" />
      <div>
        <label style={STYLES.label}>Kunde</label>
        <select style={STYLES.select} value={form.customer_id || ''} onChange={e => setForm({ ...form, customer_id: e.target.value || null })}>
          <option value="">Vælg kunde (valgfri)</option>
          {kunder.map(k => <option key={k.id} value={k.id}>{k.company || k.name}</option>)}
        </select>
      </div>
      <FormField label="Adresse" value={form.address} onChange={v => setForm({ ...form, address: v })} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <FormField label="Postnr" value={form.zip} onChange={v => setForm({ ...form, zip: v })} />
        <FormField label="By" value={form.city} onChange={v => setForm({ ...form, city: v })} />
      </div>
      <div>
        <label style={STYLES.label}>Projekttype</label>
        <select style={STYLES.select} value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })}>
          <option value="standard">Standard</option>
          <option value="renovation">Renovering (+30% tid)</option>
          <option value="new_build">Nybyg</option>
        </select>
      </div>
      <FormField label="Beskrivelse" value={form.description} onChange={v => setForm({ ...form, description: v })} multiline />
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={() => form.name && onSave(form)} style={STYLES.primaryBtn}>Opret projekt</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROJEKT DETALJE MED KALKULATION OG AKKORD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ProjektDetalje({ projekt, onBack }) {
  const [items, setItems] = useState([]);
  const [normtider, setNormtider] = useState([]);
  const [categories, setCategories] = useState([]);
  const [laborRates, setLaborRates] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [activeTab, setActiveTab] = useState('kalkulation');
  const [totals, setTotals] = useState({ materials: 0, labor: 0, hours: 0, cost: 0, price: 0, db: 0, dbPercent: 0, akkordMinutes: 0, akkordAmount: 0 });
  const [markup, setMarkup] = useState(projekt.markup_percent || 25);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { calculateTotals(); }, [items, markup]);

  const loadData = async () => {
    const [itemsRes, normRes, catRes, laborRes] = await Promise.all([
      supabase.from('project_items').select('*').eq('project_id', projekt.id).order('sort_order'),
      supabase.from('norm_times').select('*, work_categories(name)').eq('active', true),
      supabase.from('work_categories').select('*').eq('active', true).order('sort_order'),
      supabase.from('labor_rates').select('*').eq('active', true)
    ]);
    setItems(itemsRes.data || []);
    setNormtider(normRes.data || []);
    setCategories(catRes.data || []);
    setLaborRates(laborRes.data || []);
  };

  const calculateTotals = () => {
    let materials = 0, laborCost = 0, hours = 0, akkordMin = 0;
    items.forEach(item => {
      materials += item.material_cost_total || 0;
      laborCost += item.labor_cost_total || 0;
      hours += (item.total_minutes || 0) / 60;
      akkordMin += item.akkord_minutes_total || 0;
    });
    const cost = materials + laborCost;
    const price = cost * (1 + markup / 100);
    const db = price - cost;
    const dbPercent = price > 0 ? (db / price) * 100 : 0;
    const akkordAmount = akkordMin * CONFIG.akkordMinuteRate;
    setTotals({ materials, labor: laborCost, hours, cost, price, db, dbPercent, akkordMinutes: akkordMin, akkordAmount });
  };

  const addItem = async (normtid, quantity) => {
    const defaultLaborRate = laborRates.find(r => r.name === 'Montør') || laborRates[0];
    const isRenovation = projekt.project_type === 'renovation';
    const difficultyFactor = isRenovation ? (normtid.renovation_factor || 1.3) : (normtid.difficulty_factor || 1);
    
    const totalMinutes = normtid.norm_minutes * quantity * difficultyFactor;
    const materialCostTotal = (normtid.material_cost || 0) * quantity;
    const laborCostTotal = defaultLaborRate ? (totalMinutes / 60) * defaultLaborRate.hourly_rate : 0;
    const akkordMinutesTotal = (normtid.akkord_minutes || normtid.norm_minutes * 0.75) * quantity;
    
    const newItem = {
      project_id: projekt.id,
      norm_time_id: normtid.id,
      name: normtid.name,
      description: normtid.description,
      unit: normtid.unit,
      quantity,
      norm_minutes: normtid.norm_minutes,
      total_minutes: totalMinutes,
      difficulty_factor: difficultyFactor,
      material_cost_unit: normtid.material_cost || 0,
      material_cost_total: materialCostTotal,
      labor_rate_id: defaultLaborRate?.id,
      labor_cost_total: laborCostTotal,
      akkord_minutes_unit: normtid.akkord_minutes || normtid.norm_minutes * 0.75,
      akkord_minutes_total: akkordMinutesTotal,
      akkord_amount: akkordMinutesTotal * CONFIG.akkordMinuteRate,
      cost_total: materialCostTotal + laborCostTotal,
      sort_order: items.length
    };

    const { data, error } = await supabase.from('project_items').insert([newItem]).select().single();
    if (error) { alert('Fejl: ' + error.message); return; }
    setItems([...items, data]);
    setShowAddItem(false);
  };

  const updateItemQuantity = async (id, qty) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const totalMin = item.norm_minutes * qty * (item.difficulty_factor || 1);
    const matCost = (item.material_cost_unit || 0) * qty;
    const labCost = (totalMin / 60) * (laborRates.find(r => r.id === item.labor_rate_id)?.hourly_rate || 285);
    const akkordMin = (item.akkord_minutes_unit || item.norm_minutes * 0.75) * qty;
    
    const updates = {
      quantity: qty,
      total_minutes: totalMin,
      material_cost_total: matCost,
      labor_cost_total: labCost,
      akkord_minutes_total: akkordMin,
      akkord_amount: akkordMin * CONFIG.akkordMinuteRate,
      cost_total: matCost + labCost
    };
    
    await supabase.from('project_items').update(updates).eq('id', id);
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteItem = async (id) => {
    await supabase.from('project_items').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  const saveProject = async () => {
    await supabase.from('projects').update({
      total_materials: totals.materials,
      total_labor_hours: totals.hours,
      total_labor_cost: totals.labor,
      total_cost: totals.cost,
      markup_percent: markup,
      total_price: totals.price,
      contribution_margin: totals.db,
      contribution_margin_percent: totals.dbPercent,
      akkord_total_minutes: totals.akkordMinutes,
      akkord_total_amount: totals.akkordAmount,
      status: 'calculated'
    }).eq('id', projekt.id);
    alert('Projekt gemt!');
  };

  const generatePDF = () => {
    // Create printable content
    const printContent = `
      <html>
      <head>
        <title>Kalkulation - ${projekt.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #2E7D32; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #2E7D32; color: white; }
          .totals { margin-top: 20px; text-align: right; }
          .total-line { font-size: 18px; font-weight: bold; color: #2E7D32; }
        </style>
      </head>
      <body>
        <h1>Elta Solar - Kalkulation</h1>
        <p><strong>Projekt:</strong> ${projekt.name}</p>
        <p><strong>Adresse:</strong> ${projekt.address || ''} ${projekt.zip || ''} ${projekt.city || ''}</p>
        <p><strong>Dato:</strong> ${new Date().toLocaleDateString('da-DK')}</p>
        
        <table>
          <thead>
            <tr>
              <th>Beskrivelse</th>
              <th>Antal</th>
              <th>Enhed</th>
              <th>Timer</th>
              <th>Materialer</th>
              <th>Løn</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${(item.total_minutes / 60).toFixed(1)}</td>
                <td>${formatMoney(item.material_cost_total)}</td>
                <td>${formatMoney(item.labor_cost_total)}</td>
                <td>${formatMoney(item.cost_total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Materialer: ${formatMoney(totals.materials)}</p>
          <p>Løn: ${formatMoney(totals.labor)}</p>
          <p>Avance (${markup}%): ${formatMoney(totals.db)}</p>
          <p class="total-line">Total: ${formatMoney(totals.price)}</p>
          <p>Akkord: ${(totals.akkordMinutes / 60).toFixed(1)} timer = ${formatMoney(totals.akkordAmount)}</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <button onClick={onBack} style={{ ...STYLES.secondaryBtn, marginBottom: 12 }}>← Tilbage</button>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{projekt.name}</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{projekt.address} {projekt.zip} {projekt.city}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={saveProject} style={STYLES.primaryBtn}>💾 Gem</button>
          <button onClick={generatePDF} style={{ ...STYLES.secondaryBtn }}>📄 PDF</button>
          <button style={{ ...STYLES.primaryBtn, background: COLORS.accent }}>📨 Send tilbud</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
        <SummaryCard label="Timer" value={totals.hours.toFixed(1)} color={COLORS.info} />
        <SummaryCard label="Materialer" value={formatMoney(totals.materials)} color={COLORS.textLight} />
        <SummaryCard label="Løn" value={formatMoney(totals.labor)} color={COLORS.textLight} />
        <SummaryCard label="Salgspris" value={formatMoney(totals.price)} color={COLORS.primary} large />
        <SummaryCard label="DB" value={`${totals.dbPercent.toFixed(1)}%`} subvalue={formatMoney(totals.db)} color={totals.dbPercent >= 20 ? COLORS.success : COLORS.warning} />
        <SummaryCard label="Akkord" value={formatMoney(totals.akkordAmount)} subvalue={`${(totals.akkordMinutes/60).toFixed(1)} t`} color={COLORS.accent} />
      </div>

      {/* Markup Slider */}
      <div style={{ ...STYLES.card, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontWeight: 600 }}>Avance:</span>
          <input type="range" min="0" max="50" value={markup} onChange={e => setMarkup(Number(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontWeight: 700, fontSize: 18, minWidth: 60 }}>{markup}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[{ id: 'kalkulation', label: 'Kalkulation' }, { id: 'akkord', label: 'Akkordark' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: activeTab === tab.id ? COLORS.primary : 'white',
            color: activeTab === tab.id ? 'white' : COLORS.text,
            border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 20px', fontWeight: 500, cursor: 'pointer'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'kalkulation' && (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Kalkulationsposter ({items.length})</h3>
            <button onClick={() => setShowAddItem(true)} style={STYLES.primaryBtn}>+ Tilføj post</button>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: COLORS.textLight }}>Ingen poster. Klik "Tilføj post" for at begynde.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  <th style={STYLES.th}>Beskrivelse</th>
                  <th style={{ ...STYLES.th, width: 70 }}>Antal</th>
                  <th style={{ ...STYLES.th, width: 50 }}>Enhed</th>
                  <th style={{ ...STYLES.th, width: 70 }}>Timer</th>
                  <th style={{ ...STYLES.th, width: 90 }}>Materialer</th>
                  <th style={{ ...STYLES.th, width: 90 }}>Løn</th>
                  <th style={{ ...STYLES.th, width: 90 }}>Total</th>
                  <th style={{ ...STYLES.th, width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={STYLES.td}>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textLight }}>{item.description}</div>
                    </td>
                    <td style={STYLES.td}>
                      <input type="number" value={item.quantity} min="0.1" step="0.1" style={{ ...STYLES.input, width: 60, padding: 8, textAlign: 'center' }}
                        onChange={e => updateItemQuantity(item.id, Number(e.target.value) || 1)} />
                    </td>
                    <td style={STYLES.td}>{item.unit}</td>
                    <td style={STYLES.td}>{(item.total_minutes / 60).toFixed(1)}</td>
                    <td style={STYLES.td}>{formatMoney(item.material_cost_total)}</td>
                    <td style={STYLES.td}>{formatMoney(item.labor_cost_total)}</td>
                    <td style={{ ...STYLES.td, fontWeight: 600 }}>{formatMoney(item.cost_total)}</td>
                    <td style={STYLES.td}>
                      <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', color: COLORS.error, cursor: 'pointer', fontSize: 18 }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'akkord' && (
        <AkkordArk items={items} totals={totals} projekt={projekt} />
      )}

      {showAddItem && (
        <Modal title="Tilføj kalkulationspost" onClose={() => setShowAddItem(false)} wide>
          <NormtidSelector normtider={normtider} categories={categories} onSelect={addItem} />
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({ label, value, subvalue, color, large }) {
  return (
    <div style={{ ...STYLES.card, textAlign: 'center', padding: 16 }}>
      <div style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: large ? 24 : 18, fontWeight: 700, color }}>{value}</div>
      {subvalue && <div style={{ fontSize: 11, color: COLORS.textLight }}>{subvalue}</div>}
    </div>
  );
}

function AkkordArk({ items, totals, projekt }) {
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'Generelt';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const avgHourlyRate = totals.akkordMinutes > 0 ? (totals.akkordAmount / (totals.akkordMinutes / 60)) : 0;

  return (
    <div style={STYLES.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0 }}>Akkordark</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 12px', background: COLORS.bg, borderRadius: 8, fontSize: 13 }}>
            Akkordsats: {CONFIG.akkordMinuteRate.toFixed(2)} kr/min
          </span>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: COLORS.bg }}>
            <th style={STYLES.th}>Arbejde</th>
            <th style={{ ...STYLES.th, textAlign: 'center' }}>Antal</th>
            <th style={{ ...STYLES.th, textAlign: 'center' }}>Enhed</th>
            <th style={{ ...STYLES.th, textAlign: 'center' }}>Min/enhed</th>
            <th style={{ ...STYLES.th, textAlign: 'center' }}>Total min</th>
            <th style={{ ...STYLES.th, textAlign: 'right' }}>Akkordbeløb</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <td style={STYLES.td}>{item.name}</td>
              <td style={{ ...STYLES.td, textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ ...STYLES.td, textAlign: 'center' }}>{item.unit}</td>
              <td style={{ ...STYLES.td, textAlign: 'center' }}>{(item.akkord_minutes_unit || 0).toFixed(1)}</td>
              <td style={{ ...STYLES.td, textAlign: 'center' }}>{(item.akkord_minutes_total || 0).toFixed(0)}</td>
              <td style={{ ...STYLES.td, textAlign: 'right', fontWeight: 600 }}>{formatMoney(item.akkord_amount || 0)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: COLORS.bg, fontWeight: 700 }}>
            <td colSpan={4} style={STYLES.td}>TOTAL</td>
            <td style={{ ...STYLES.td, textAlign: 'center' }}>{totals.akkordMinutes.toFixed(0)} min</td>
            <td style={{ ...STYLES.td, textAlign: 'right', color: COLORS.primary }}>{formatMoney(totals.akkordAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, background: COLORS.bg, padding: 20, borderRadius: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textLight }}>Total akkordtimer</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{(totals.akkordMinutes / 60).toFixed(1)} timer</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textLight }}>Total akkordbeløb</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{formatMoney(totals.akkordAmount)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textLight }}>Gns. timeløn (akkord)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.success }}>{formatMoney(avgHourlyRate)}/time</div>
        </div>
      </div>
    </div>
  );
}

function NormtidSelector({ normtider, categories, onSelect }) {
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState(1);

  const filtered = normtider.filter(n => {
    if (selectedCat && n.category_id !== selectedCat) return false;
    if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input placeholder="Søg normtid..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...STYLES.input, flex: 1 }} />
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ ...STYLES.select, width: 200 }}>
          <option value="">Alle kategorier</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ maxHeight: 400, overflow: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: COLORS.textLight }}>Ingen normtider fundet</div>
        ) : filtered.map(n => (
          <div key={n.id} style={{ padding: 16, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{n.name}</div>
              <div style={{ fontSize: 12, color: COLORS.textLight }}>{n.description}</div>
              <div style={{ fontSize: 12, color: COLORS.info, marginTop: 4 }}>
                {n.norm_minutes} min | {n.unit} | Mat: {formatMoney(n.material_cost || 0)} | Akkord: {n.akkord_minutes || Math.round(n.norm_minutes * 0.75)} min
              </div>
            </div>
            <input type="number" min="0.1" step="0.1" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} style={{ ...STYLES.input, width: 70, padding: 8, textAlign: 'center' }} />
            <button onClick={() => { onSelect(n, quantity); setQuantity(1); }} style={STYLES.primaryBtn}>Tilføj</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KUNDER SYSTEM MED CHAT OG FILER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function KunderSystem() {
  const [kunder, setKunder] = useState([]);
  const [selectedKunde, setSelectedKunde] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadKunder(); }, []);
  const loadKunder = async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    setKunder(data || []);
  };

  const createKunde = async (form) => {
    const { data, error } = await supabase.from('customers').insert([form]).select().single();
    if (error) { alert('Fejl: ' + error.message); return; }
    setShowCreate(false);
    setSelectedKunde(data);
    loadKunder();
  };

  if (selectedKunde) {
    return <KundeDetalje kunde={selectedKunde} onBack={() => { setSelectedKunde(null); loadKunder(); }} />;
  }

  return (
    <div>
      <PageHeader title="Kunder" subtitle="Administrer kunder, chat og dokumenter" action={{ label: '+ Ny kunde', onClick: () => setShowCreate(true) }} />

      {kunder.length === 0 ? (
        <EmptyState icon="👥" title="Ingen kunder endnu" subtitle="Opret din første kunde" action={{ label: '+ Opret kunde', onClick: () => setShowCreate(true) }} />
      ) : (
        <div style={{ ...STYLES.card, overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Kunde</th>
                <th style={STYLES.th}>Kontakt</th>
                <th style={STYLES.th}>Adresse</th>
                <th style={STYLES.th}></th>
              </tr>
            </thead>
            <tbody>
              {kunder.map(k => (
                <tr key={k.id} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => setSelectedKunde(k)}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600 }}>{k.company || k.name}</div>
                    {k.company && <div style={{ fontSize: 12, color: COLORS.textLight }}>{k.name}</div>}
                  </td>
                  <td style={STYLES.td}>
                    <div>{k.email}</div>
                    <div style={{ fontSize: 12, color: COLORS.textLight }}>{k.phone}</div>
                  </td>
                  <td style={STYLES.td}>{k.address}, {k.zip} {k.city}</td>
                  <td style={STYLES.td}><button style={STYLES.secondaryBtn}>Åbn →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Opret kunde" onClose={() => setShowCreate(false)}>
          <KundeForm onSave={createKunde} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
    </div>
  );
}

function KundeForm({ onSave, onCancel, initial = {} }) {
  const [kundeType, setKundeType] = useState(initial.customer_type || 'erhverv');
  const [sameAddress, setSameAddress] = useState(true);
  const [form, setForm] = useState({ 
    customer_type: 'erhverv',
    name: '', 
    company: '', 
    cvr: '',
    email: '', 
    phone: '', 
    address: '', 
    city: '', 
    zip: '',
    delivery_address: '',
    delivery_city: '',
    delivery_zip: '',
    ...initial 
  });

  const handleTypeChange = (type) => {
    setKundeType(type);
    setForm({ ...form, customer_type: type });
  };

  const handleSave = () => {
    if (kundeType === 'privat' && !form.name) return alert('Navn er påkrævet');
    if (kundeType === 'erhverv' && (!form.name || !form.company)) return alert('Firma og kontaktperson er påkrævet');
    
    const saveData = {
      ...form,
      delivery_address: sameAddress ? form.address : form.delivery_address,
      delivery_city: sameAddress ? form.city : form.delivery_city,
      delivery_zip: sameAddress ? form.zip : form.delivery_zip,
    };
    onSave(saveData);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Kundetype valg */}
      <div>
        <label style={STYLES.label}>Kundetype *</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            type="button"
            onClick={() => handleTypeChange('privat')} 
            style={{ 
              ...STYLES.secondaryBtn, 
              flex: 1,
              background: kundeType === 'privat' ? COLORS.primary : 'white',
              color: kundeType === 'privat' ? 'white' : COLORS.text
            }}
          >
            🏠 Privat
          </button>
          <button 
            type="button"
            onClick={() => handleTypeChange('erhverv')} 
            style={{ 
              ...STYLES.secondaryBtn, 
              flex: 1,
              background: kundeType === 'erhverv' ? COLORS.primary : 'white',
              color: kundeType === 'erhverv' ? 'white' : COLORS.text
            }}
          >
            🏢 Erhverv
          </button>
        </div>
      </div>

      {/* Erhverv felter */}
      {kundeType === 'erhverv' && (
        <>
          <FormField label="Firmanavn *" value={form.company} onChange={v => setForm({ ...form, company: v })} placeholder="Firma ApS" />
          <FormField label="CVR" value={form.cvr} onChange={v => setForm({ ...form, cvr: v })} placeholder="12345678" />
          <FormField label="Kontaktperson *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Jens Jensen" />
        </>
      )}

      {/* Privat felter */}
      {kundeType === 'privat' && (
        <FormField label="Fulde navn *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Jens Jensen" />
      )}

      {/* Fælles kontaktinfo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField label="Email *" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="email@eksempel.dk" />
        <FormField label="Telefon *" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="12345678" />
      </div>

      {/* Adresse */}
      <div style={{ background: COLORS.bg, padding: 16, borderRadius: 12 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
          {kundeType === 'erhverv' ? '📍 Firmaadresse' : '📍 Adresse'}
        </h4>
        <FormField label="Adresse" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="Vejnavn 123" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
          <FormField label="Postnr" value={form.zip} onChange={v => setForm({ ...form, zip: v })} placeholder="1234" />
          <FormField label="By" value={form.city} onChange={v => setForm({ ...form, city: v })} placeholder="København" />
        </div>
      </div>

      {/* Leveringsadresse */}
      <div style={{ background: COLORS.bg, padding: 16, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>🚚 Leveringsadresse</h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input 
              type="checkbox" 
              checked={sameAddress} 
              onChange={e => setSameAddress(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            Samme som {kundeType === 'erhverv' ? 'firmaadresse' : 'adresse'}
          </label>
        </div>
        
        {!sameAddress && (
          <>
            <FormField label="Leveringsadresse" value={form.delivery_address} onChange={v => setForm({ ...form, delivery_address: v })} placeholder="Vejnavn 123" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
              <FormField label="Postnr" value={form.delivery_zip} onChange={v => setForm({ ...form, delivery_zip: v })} placeholder="1234" />
              <FormField label="By" value={form.delivery_city} onChange={v => setForm({ ...form, delivery_city: v })} placeholder="København" />
            </div>
          </>
        )}
        
        {sameAddress && (
          <p style={{ margin: 0, color: COLORS.textLight, fontSize: 13 }}>
            ✓ Leveringsadresse er samme som {kundeType === 'erhverv' ? 'firmaadresse' : 'adresse'}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSave} style={STYLES.primaryBtn}>Gem kunde</button>
      </div>
    </div>
  );
}

function KundeDetalje({ kunde, onBack }) {
  const [activeTab, setActiveTab] = useState('info');
  const [projekter, setProjekter] = useState([]);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { profile } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => { loadData(); }, [kunde.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadData = async () => {
    const [projRes, msgRes, fileRes] = await Promise.all([
      supabase.from('projects').select('*').eq('customer_id', kunde.id).order('created_at', { ascending: false }),
      supabase.from('chat_messages').select('*, profiles(name)').eq('customer_id', kunde.id).order('created_at', { ascending: true }),
      supabase.from('files').select('*').eq('customer_id', kunde.id).order('created_at', { ascending: false })
    ]);
    setProjekter(projRes.data || []);
    setMessages(msgRes.data || []);
    setFiles(fileRes.data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { error } = await supabase.from('chat_messages').insert([{
      customer_id: kunde.id,
      sender_id: profile.id,
      sender_type: 'staff',
      message: newMessage
    }]);
    if (error) { alert('Fejl: ' + error.message); return; }
    setNewMessage('');
    loadData();
    // TODO: Send email notification to customer
  };

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${kunde.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
    if (uploadError) { alert('Fejl ved upload: ' + uploadError.message); return; }
    
    await supabase.from('files').insert([{
      customer_id: kunde.id,
      uploaded_by: profile.id,
      filename: fileName,
      original_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: fileName
    }]);
    
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <button onClick={onBack} style={{ ...STYLES.secondaryBtn, marginBottom: 12 }}>← Tilbage</button>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{kunde.company || kunde.name}</h1>
          {kunde.company && <p style={{ color: COLORS.textLight, marginTop: 4 }}>{kunde.name}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[{ id: 'info', label: '📋 Info' }, { id: 'chat', label: '💬 Chat' }, { id: 'filer', label: '📁 Filer' }, { id: 'projekter', label: '🔧 Projekter' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: activeTab === tab.id ? COLORS.primary : 'white',
            color: activeTab === tab.id ? 'white' : COLORS.text,
            border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 20px', fontWeight: 500, cursor: 'pointer'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div style={STYLES.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Kontaktoplysninger</h3>
              <InfoRow label="Email" value={kunde.email} />
              <InfoRow label="Telefon" value={kunde.phone} />
              <InfoRow label="CVR" value={kunde.cvr} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Adresse</h3>
              <InfoRow label="Adresse" value={kunde.address} />
              <InfoRow label="Postnr/By" value={`${kunde.zip} ${kunde.city}`} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div style={{ ...STYLES.card, display: 'flex', flexDirection: 'column', height: 500 }}>
          <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: COLORS.textLight, padding: 40 }}>Ingen beskeder endnu</div>
            ) : messages.map(msg => (
              <div key={msg.id} style={{
                marginBottom: 12,
                display: 'flex',
                justifyContent: msg.sender_type === 'staff' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: 12,
                  borderRadius: 12,
                  background: msg.sender_type === 'staff' ? COLORS.primary : COLORS.bg,
                  color: msg.sender_type === 'staff' ? 'white' : COLORS.text
                }}>
                  <div style={{ fontSize: 11, marginBottom: 4, opacity: 0.7 }}>
                    {msg.profiles?.name || 'Kunde'} • {new Date(msg.created_at).toLocaleString('da-DK')}
                  </div>
                  <div>{msg.message}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Skriv besked..."
              style={{ ...STYLES.input, flex: 1 }}
            />
            <AITextButton text={newMessage} onResult={setNewMessage} />
            <button onClick={sendMessage} style={STYLES.primaryBtn}>Send</button>
          </div>
        </div>
      )}

      {activeTab === 'filer' && (
        <div style={STYLES.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Dokumenter</h3>
            <label style={{ ...STYLES.primaryBtn, cursor: 'pointer' }}>
              📎 Upload fil
              <input type="file" style={{ display: 'none' }} onChange={uploadFile} />
            </label>
          </div>
          {files.length === 0 ? (
            <div style={{ textAlign: 'center', color: COLORS.textLight, padding: 40 }}>Ingen filer endnu</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  <th style={STYLES.th}>Filnavn</th>
                  <th style={STYLES.th}>Type</th>
                  <th style={STYLES.th}>Størrelse</th>
                  <th style={STYLES.th}>Dato</th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={STYLES.td}>{f.original_name}</td>
                    <td style={STYLES.td}>{f.file_type}</td>
                    <td style={STYLES.td}>{Math.round((f.file_size || 0) / 1024)} KB</td>
                    <td style={STYLES.td}>{new Date(f.created_at).toLocaleDateString('da-DK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'projekter' && (
        <div style={STYLES.card}>
          <h3 style={{ margin: '0 0 16px' }}>Projekter for denne kunde</h3>
          {projekter.length === 0 ? (
            <div style={{ textAlign: 'center', color: COLORS.textLight, padding: 40 }}>Ingen projekter endnu</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  <th style={STYLES.th}>Projekt</th>
                  <th style={STYLES.th}>Status</th>
                  <th style={STYLES.th}>Pris</th>
                </tr>
              </thead>
              <tbody>
                {projekter.map(p => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={STYLES.td}><strong>{p.name}</strong></td>
                    <td style={STYLES.td}><StatusBadge status={p.status} /></td>
                    <td style={STYLES.td}>{formatMoney(p.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: COLORS.textLight }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value || '-'}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TILBUD SYSTEM MED PDF
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function TilbudSystem() {
  const [tilbud, setTilbud] = useState([]);
  const [selectedTilbud, setSelectedTilbud] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadTilbud(); }, []);
  const loadTilbud = async () => {
    const { data } = await supabase.from('quotes').select('*, customers(name, company), projects(name)').order('created_at', { ascending: false });
    setTilbud(data || []);
  };

  if (selectedTilbud) {
    return <TilbudDetalje tilbud={selectedTilbud} onBack={() => { setSelectedTilbud(null); loadTilbud(); }} />;
  }

  return (
    <div>
      <PageHeader title="Tilbud" subtitle="Opret og send professionelle tilbud" action={{ label: '+ Nyt tilbud', onClick: () => setShowCreate(true) }} />

      {tilbud.length === 0 ? (
        <EmptyState icon="📄" title="Ingen tilbud endnu" subtitle="Opret dit første tilbud" action={{ label: '+ Opret tilbud', onClick: () => setShowCreate(true) }} />
      ) : (
        <div style={{ ...STYLES.card, overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Tilbudsnr</th>
                <th style={STYLES.th}>Kunde</th>
                <th style={STYLES.th}>Projekt</th>
                <th style={STYLES.th}>Beløb</th>
                <th style={STYLES.th}>Status</th>
                <th style={STYLES.th}>Dato</th>
                <th style={STYLES.th}></th>
              </tr>
            </thead>
            <tbody>
              {tilbud.map(t => (
                <tr key={t.id} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => setSelectedTilbud(t)}>
                  <td style={STYLES.td}><strong>{t.quote_number}</strong></td>
                  <td style={STYLES.td}>{t.customers?.company || t.customers?.name}</td>
                  <td style={STYLES.td}>{t.projects?.name || t.title}</td>
                  <td style={STYLES.td}>{formatMoney(t.total_incl_vat)}</td>
                  <td style={STYLES.td}><QuoteStatusBadge status={t.status} /></td>
                  <td style={STYLES.td}>{new Date(t.created_at).toLocaleDateString('da-DK')}</td>
                  <td style={STYLES.td}><button style={STYLES.secondaryBtn}>Åbn →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Opret tilbud" onClose={() => setShowCreate(false)} wide>
          <TilbudForm onSave={() => { setShowCreate(false); loadTilbud(); }} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
    </div>
  );
}

function QuoteStatusBadge({ status }) {
  const colors = {
    draft: { bg: '#F3F4F6', color: '#6B7280' },
    sent: { bg: '#FEF3C7', color: '#D97706' },
    viewed: { bg: '#DBEAFE', color: '#1D4ED8' },
    accepted: { bg: '#D1FAE5', color: '#059669' },
    rejected: { bg: '#FEE2E2', color: '#DC2626' },
  };
  const labels = { draft: 'Kladde', sent: 'Sendt', viewed: 'Set', accepted: 'Accepteret', rejected: 'Afvist' };
  const c = colors[status] || colors.draft;
  return <span style={{ padding: '4px 12px', background: c.bg, color: c.color, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{labels[status] || status}</span>;
}

function TilbudForm({ onSave, onCancel }) {
  const [kunder, setKunder] = useState([]);
  const [projekter, setProjekter] = useState([]);
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    customer_id: '',
    project_id: '',
    title: '',
    introduction_text: 'Tak for jeres henvendelse. Vi har hermed fornøjelsen at fremsende tilbud på nedenstående arbejde.',
    terms_text: 'Tilbuddet er ekskl. moms. Betaling netto 8 dage. Arbejdet udføres iht. gældende standarder.',
    show_unit_prices: false,
    show_line_totals: false,
    validity_days: 30
  });
  const [lines, setLines] = useState([]);
  const { profile } = useAuth();

  useEffect(() => {
    Promise.all([
      supabase.from('customers').select('id, name, company'),
      supabase.from('projects').select('id, name, customer_id, total_price'),
      supabase.from('quote_packages').select('*').eq('active', true)
    ]).then(([c, p, pkg]) => {
      setKunder(c.data || []);
      setProjekter(p.data || []);
      setPackages(pkg.data || []);
    });
  }, []);

  const addLine = () => {
    setLines([...lines, { id: Date.now(), description: '', quantity: 1, unit: 'stk', unit_price: 0 }]);
  };

  const updateLine = (id, updates) => {
    setLines(lines.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLine = (id) => {
    setLines(lines.filter(l => l.id !== id));
  };

  const addPackage = (pkg) => {
    const items = JSON.parse(pkg.items || '[]');
    const newLines = items.map((item, i) => ({
      id: Date.now() + i,
      description: item.name,
      quantity: item.quantity || 1,
      unit: 'stk',
      unit_price: item.unit_price || 0
    }));
    setLines([...lines, ...newLines]);
  };

  const subtotal = lines.reduce((sum, l) => sum + (l.quantity * l.unit_price), 0);
  const vatAmount = subtotal * 0.25;
  const total = subtotal + vatAmount;

  const handleSave = async () => {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + form.validity_days);

    const { data, error } = await supabase.from('quotes').insert([{
      ...form,
      customer_id: form.customer_id || null,
      project_id: form.project_id || null,
      created_by: profile.id,
      subtotal,
      vat_amount: vatAmount,
      total_excl_vat: subtotal,
      total_incl_vat: total,
      valid_until: validUntil.toISOString()
    }]).select().single();

    if (error) { alert('Fejl: ' + error.message); return; }

    // Insert lines
    if (lines.length > 0) {
      await supabase.from('quote_lines').insert(lines.map((l, i) => ({
        quote_id: data.id,
        description: l.description,
        quantity: l.quantity,
        unit: l.unit,
        unit_price: l.unit_price,
        total_price: l.quantity * l.unit_price,
        sort_order: i
      })));
    }

    onSave();
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={STYLES.label}>Kunde</label>
          <select style={STYLES.select} value={form.customer_id || ''} onChange={e => setForm({ ...form, customer_id: e.target.value || null })}>
            <option value="">Vælg kunde</option>
            {kunder.map(k => <option key={k.id} value={k.id}>{k.company || k.name}</option>)}
          </select>
        </div>
        <div>
          <label style={STYLES.label}>Projekt (valgfri)</label>
          <select style={STYLES.select} value={form.project_id || ''} onChange={e => setForm({ ...form, project_id: e.target.value || null })}>
            <option value="">Vælg projekt</option>
            {projekter.filter(p => !form.customer_id || p.customer_id === form.customer_id).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <FormField label="Titel *" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="F.eks. Solcelleanlæg 6kW" />

      <div>
        <label style={STYLES.label}>Indledning</label>
        <textarea value={form.introduction_text} onChange={e => setForm({ ...form, introduction_text: e.target.value })} style={{ ...STYLES.input, minHeight: 80 }} />
        <AITextButton text={form.introduction_text} onResult={v => setForm({ ...form, introduction_text: v })} label="Forbedre tekst" />
      </div>

      {packages.length > 0 && (
        <div>
          <label style={STYLES.label}>Tilføj pakke</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {packages.map(pkg => (
              <button key={pkg.id} onClick={() => addPackage(pkg)} style={{ ...STYLES.secondaryBtn, padding: '8px 12px', fontSize: 13 }}>
                {pkg.name} ({formatMoney(pkg.total_price)})
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={STYLES.label}>Tilbudslinjer</label>
          <button onClick={addLine} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', fontSize: 13 }}>+ Tilføj linje</button>
        </div>
        {lines.map((line, i) => (
          <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 80px 100px 40px', gap: 8, marginBottom: 8 }}>
            <input value={line.description} onChange={e => updateLine(line.id, { description: e.target.value })} placeholder="Beskrivelse" style={STYLES.input} />
            <input type="number" value={line.quantity} onChange={e => updateLine(line.id, { quantity: Number(e.target.value) })} style={{ ...STYLES.input, textAlign: 'center' }} />
            <input value={line.unit} onChange={e => updateLine(line.id, { unit: e.target.value })} style={STYLES.input} />
            <input type="number" value={line.unit_price} onChange={e => updateLine(line.id, { unit_price: Number(e.target.value) })} style={{ ...STYLES.input, textAlign: 'right' }} />
            <button onClick={() => removeLine(line.id)} style={{ background: 'none', border: 'none', color: COLORS.error, cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.show_unit_prices} onChange={e => setForm({ ...form, show_unit_prices: e.target.checked })} />
          Vis enhedspriser
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.show_line_totals} onChange={e => setForm({ ...form, show_line_totals: e.target.checked })} />
          Vis linjetotaler
        </label>
      </div>

      <div style={{ background: COLORS.bg, padding: 16, borderRadius: 12, textAlign: 'right' }}>
        <div style={{ marginBottom: 8 }}>Subtotal: {formatMoney(subtotal)}</div>
        <div style={{ marginBottom: 8 }}>Moms (25%): {formatMoney(vatAmount)}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>Total: {formatMoney(total)}</div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSave} style={STYLES.primaryBtn}>Gem tilbud</button>
      </div>
    </div>
  );
}

function TilbudDetalje({ tilbud, onBack }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    supabase.from('quote_lines').select('*').eq('quote_id', tilbud.id).order('sort_order').then(({ data }) => setLines(data || []));
  }, [tilbud.id]);

  const generatePDF = () => {
    const printContent = `
      <html>
      <head>
        <title>Tilbud - ${tilbud.quote_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2E7D32; margin-bottom: 5px; }
          .tagline { color: #666; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #2E7D32; color: white; }
          .totals { margin-top: 20px; text-align: right; }
          .total-line { font-size: 20px; font-weight: bold; color: #2E7D32; }
          .terms { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Elta Solar</h1>
        <p class="tagline">Fra sol til stikkontakt – nemt og sikkert</p>
        
        <h2>TILBUD</h2>
        <div class="info">
          <p><strong>Tilbudsnr:</strong> ${tilbud.quote_number}</p>
          <p><strong>Dato:</strong> ${new Date(tilbud.created_at).toLocaleDateString('da-DK')}</p>
          <p><strong>Gyldig til:</strong> ${tilbud.valid_until ? new Date(tilbud.valid_until).toLocaleDateString('da-DK') : '-'}</p>
          <p><strong>Kunde:</strong> ${tilbud.customers?.company || tilbud.customers?.name || '-'}</p>
        </div>
        
        <h3>${tilbud.title || ''}</h3>
        ${tilbud.introduction_text ? `<p>${tilbud.introduction_text}</p>` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Beskrivelse</th>
              ${tilbud.show_unit_prices ? '<th>Antal</th><th>Enhed</th><th>Enhedspris</th>' : ''}
              <th>Pris</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map(line => `
              <tr>
                <td>${line.description}</td>
                ${tilbud.show_unit_prices ? `<td>${line.quantity}</td><td>${line.unit}</td><td>${formatMoney(line.unit_price)}</td>` : ''}
                <td>${formatMoney(line.total_price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal ekskl. moms: ${formatMoney(tilbud.total_excl_vat)}</p>
          <p>Moms (25%): ${formatMoney(tilbud.vat_amount)}</p>
          <p class="total-line">Total inkl. moms: ${formatMoney(tilbud.total_incl_vat)}</p>
        </div>
        
        ${tilbud.terms_text ? `<div class="terms"><p>${tilbud.terms_text}</p></div>` : ''}
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const sendQuote = async () => {
    // Mark as sent
    await supabase.from('quotes').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', tilbud.id);
    alert('Tilbud markeret som sendt! (Email-integration kræver opsætning)');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <button onClick={onBack} style={{ ...STYLES.secondaryBtn, marginBottom: 12 }}>← Tilbage</button>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{tilbud.quote_number}</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{tilbud.title}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={generatePDF} style={STYLES.secondaryBtn}>📄 Download PDF</button>
          <button onClick={sendQuote} style={STYLES.primaryBtn}>📨 Send til kunde</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={STYLES.card}>
          <h3 style={{ margin: '0 0 16px' }}>Tilbudslinjer</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Beskrivelse</th>
                <th style={STYLES.th}>Antal</th>
                <th style={STYLES.th}>Pris</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={STYLES.td}>{l.description}</td>
                  <td style={STYLES.td}>{l.quantity} {l.unit}</td>
                  <td style={STYLES.td}>{formatMoney(l.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={STYLES.card}>
          <h3 style={{ margin: '0 0 16px' }}>Oversigt</h3>
          <InfoRow label="Kunde" value={tilbud.customers?.company || tilbud.customers?.name} />
          <InfoRow label="Status" value={<QuoteStatusBadge status={tilbud.status} />} />
          <InfoRow label="Gyldig til" value={tilbud.valid_until ? new Date(tilbud.valid_until).toLocaleDateString('da-DK') : '-'} />
          <hr style={{ margin: '16px 0', border: 'none', borderTop: `1px solid ${COLORS.border}` }} />
          <InfoRow label="Subtotal" value={formatMoney(tilbud.total_excl_vat)} />
          <InfoRow label="Moms" value={formatMoney(tilbud.vat_amount)} />
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary, marginTop: 16 }}>
            Total: {formatMoney(tilbud.total_incl_vat)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NORMTIDER SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function NormtiderSystem() {
  const [normtider, setNormtider] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [normRes, catRes] = await Promise.all([
      supabase.from('norm_times').select('*, work_categories(name)').order('name'),
      supabase.from('work_categories').select('*').order('sort_order')
    ]);
    setNormtider(normRes.data || []);
    setCategories(catRes.data || []);
  };

  const filtered = selectedCat ? normtider.filter(n => n.category_id === selectedCat) : normtider;

  return (
    <div>
      <PageHeader title="Normtider" subtitle={`${normtider.length} standardtider for el-arbejde`} action={{ label: '+ Tilføj normtid', onClick: () => setShowCreate(true) }} />

      {normtider.length === 0 ? (
        <EmptyState icon="⏱️" title="Ingen normtider" subtitle="Kør SQL-scriptet i Supabase for at tilføje normtider" />
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ ...STYLES.select, width: 300 }}>
              <option value="">Alle kategorier ({normtider.length})</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ ...STYLES.card, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  <th style={STYLES.th}>Kategori</th>
                  <th style={STYLES.th}>Navn</th>
                  <th style={STYLES.th}>Enhed</th>
                  <th style={STYLES.th}>Normtid</th>
                  <th style={STYLES.th}>Akkord</th>
                  <th style={STYLES.th}>Materialer</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(n => (
                  <tr key={n.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={STYLES.td}><span style={{ padding: '4px 8px', background: COLORS.bg, borderRadius: 6, fontSize: 12 }}>{n.work_categories?.name}</span></td>
                    <td style={STYLES.td}>
                      <div style={{ fontWeight: 500 }}>{n.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textLight }}>{n.description}</div>
                    </td>
                    <td style={STYLES.td}>{n.unit}</td>
                    <td style={STYLES.td}><strong>{n.norm_minutes} min</strong></td>
                    <td style={STYLES.td}>{n.akkord_minutes || '-'} min</td>
                    <td style={STYLES.td}>{formatMoney(n.material_cost || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BRUGER SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INDSTILLINGER (KUN ADMIN) - KOMPLET ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function IndstillingerSystem() {
  const [activeTab, setActiveTab] = useState('brugere');
  const [brugere, setBrugere] = useState([]);
  const [laborRates, setLaborRates] = useState([]);
  const [normtider, setNormtider] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({ name: 'Elta Solar', cvr: '', address: '', zip: '', city: '', phone: '', email: '' });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  const [editingNorm, setEditingNorm] = useState(null);
  const [showCreateNorm, setShowCreateNorm] = useState(false);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    const [usersRes, laborRes, normRes, catRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      supabase.from('labor_rates').select('*').order('name'),
      supabase.from('norm_times').select('*, work_categories(name)').order('name'),
      supabase.from('work_categories').select('*').order('sort_order'),
      supabase.from('system_settings').select('*')
    ]);
    setBrugere(usersRes.data || []);
    setLaborRates(laborRes.data || []);
    setNormtider(normRes.data || []);
    setCategories(catRes.data || []);
    
    const company = settingsRes.data?.find(s => s.key === 'company');
    if (company?.value) setCompanyInfo(company.value);
  };

  const tabs = [
    { id: 'brugere', label: '👥 Brugere', icon: '👥' },
    { id: 'firma', label: '🏢 Firma', icon: '🏢' },
    { id: 'lonsatser', label: '💰 Lønsatser', icon: '💰' },
    { id: 'kategorier', label: '📁 Kategorier', icon: '📁' },
    { id: 'normtider', label: '⏱️ Normtider & Priser', icon: '⏱️' },
    { id: 'tilbud', label: '📄 Tilbud', icon: '📄' },
  ];

  // === BRUGER FUNKTIONER ===
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array(12).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const createBruger = async (form) => {
    const password = form.password || generatePassword();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: password,
      options: { data: { name: form.name, role: form.role } }
    });
    if (error) { alert('Fejl: ' + error.message); return; }
    
    // Update profile with permissions
    setTimeout(async () => {
      await supabase.from('profiles').update({ 
        permissions: form.permissions,
        phone: form.phone,
        title: form.title
      }).eq('email', form.email);
      loadAllData();
    }, 1000);
    
    setShowCreateUser(false);
    setShowSuccess({ ...form, password: password });
  };

  const updateBruger = async (form) => {
    const { error } = await supabase.from('profiles').update({
      name: form.name,
      role: form.role,
      permissions: form.permissions,
      phone: form.phone,
      title: form.title,
      active: form.active
    }).eq('id', form.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    setShowEditUser(null);
    loadAllData();
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) { 
      alert('Fejl: ' + error.message); 
      return false;
    }
    alert('Nulstillingslink sendt til ' + email);
    return true;
  };

  // === LØNSATS FUNKTIONER ===
  const updateLaborRate = async (id, updates) => {
    await supabase.from('labor_rates').update(updates).eq('id', id);
    setEditingRate(null);
    loadAllData();
  };

  // === NORMTID FUNKTIONER ===
  const updateNormtid = async (id, updates) => {
    await supabase.from('norm_times').update(updates).eq('id', id);
    setEditingNorm(null);
    loadAllData();
  };

  const createNormtid = async (data) => {
    const { error } = await supabase.from('norm_times').insert([data]);
    if (error) { alert('Fejl: ' + error.message); return; }
    setShowCreateNorm(false);
    loadAllData();
  };

  const deleteNormtid = async (id, name) => {
    if (!confirm(`Er du sikker på at du vil slette "${name}"?`)) return;
    const { error } = await supabase.from('norm_times').delete().eq('id', id);
    if (error) { alert('Fejl: ' + error.message); return; }
    loadAllData();
  };

  // === FIRMA FUNKTIONER ===
  const saveCompanyInfo = async () => {
    await supabase.from('system_settings').upsert({ 
      key: 'company', 
      value: companyInfo, 
      updated_at: new Date().toISOString() 
    });
    alert('Firmainformation gemt!');
  };

  const rolleColors = { admin: '#DBEAFE', saelger: '#D1FAE5', montoer: '#FEF3C7', elev: '#F3E8FF' };
  const rolleLabels = { admin: 'Administrator', saelger: 'Sælger', montoer: 'Montør', elev: 'Elev' };

  return (
    <div>
      <PageHeader title="Indstillinger" subtitle="Kun administratorer har adgang til denne sektion" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: activeTab === tab.id ? COLORS.primary : 'white',
            color: activeTab === tab.id ? 'white' : COLORS.text,
            border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 20px', fontWeight: 500, cursor: 'pointer'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* === BRUGERE TAB === */}
      {activeTab === 'brugere' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Brugerstyring</h3>
            <button onClick={() => setShowCreateUser(true)} style={STYLES.primaryBtn}>+ Opret bruger</button>
          </div>
          
          <div style={{ ...STYLES.card, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  <th style={STYLES.th}>Bruger</th>
                  <th style={STYLES.th}>Rolle</th>
                  <th style={STYLES.th}>Rettigheder</th>
                  <th style={STYLES.th}>Status</th>
                  <th style={STYLES.th}></th>
                </tr>
              </thead>
              <tbody>
                {brugere.map(b => (
                  <tr key={b.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={STYLES.td}>
                      <div style={{ fontWeight: 600 }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textLight }}>{b.email}</div>
                      {b.title && <div style={{ fontSize: 11, color: COLORS.info }}>{b.title}</div>}
                    </td>
                    <td style={STYLES.td}>
                      <span style={{ padding: '4px 12px', background: rolleColors[b.role] || COLORS.bg, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {rolleLabels[b.role] || b.role}
                      </span>
                    </td>
                    <td style={STYLES.td}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(b.permissions || []).map(p => (
                          <span key={p} style={{ padding: '2px 6px', background: COLORS.bg, borderRadius: 4, fontSize: 10 }}>{p}</span>
                        ))}
                        {(!b.permissions || b.permissions.length === 0) && b.role !== 'admin' && (
                          <span style={{ fontSize: 12, color: COLORS.textLight }}>Ingen specielle</span>
                        )}
                        {b.role === 'admin' && (
                          <span style={{ fontSize: 12, color: COLORS.success }}>Fuld adgang</span>
                        )}
                      </div>
                    </td>
                    <td style={STYLES.td}>
                      <span style={{ color: b.active !== false ? COLORS.success : COLORS.error }}>
                        {b.active !== false ? '● Aktiv' : '○ Inaktiv'}
                      </span>
                    </td>
                    <td style={STYLES.td}>
                      <button onClick={() => setShowEditUser(b)} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', fontSize: 12 }}>Rediger</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === FIRMA TAB === */}
      {activeTab === 'firma' && (
        <div style={STYLES.card}>
          <h3 style={{ margin: '0 0 20px' }}>Firmainformation</h3>
          <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
            <FormField label="Firmanavn" value={companyInfo.name} onChange={v => setCompanyInfo({ ...companyInfo, name: v })} />
            <FormField label="CVR" value={companyInfo.cvr} onChange={v => setCompanyInfo({ ...companyInfo, cvr: v })} />
            <FormField label="Adresse" value={companyInfo.address} onChange={v => setCompanyInfo({ ...companyInfo, address: v })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <FormField label="Postnr" value={companyInfo.zip} onChange={v => setCompanyInfo({ ...companyInfo, zip: v })} />
              <FormField label="By" value={companyInfo.city} onChange={v => setCompanyInfo({ ...companyInfo, city: v })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Telefon" value={companyInfo.phone} onChange={v => setCompanyInfo({ ...companyInfo, phone: v })} />
              <FormField label="Email" value={companyInfo.email} onChange={v => setCompanyInfo({ ...companyInfo, email: v })} />
            </div>
            <button onClick={saveCompanyInfo} style={STYLES.primaryBtn}>Gem firmainformation</button>
          </div>
        </div>
      )}

      {/* === LØNSATSER TAB === */}
      {activeTab === 'lonsatser' && (
        <div style={STYLES.card}>
          <h3 style={{ margin: '0 0 20px' }}>Lønsatser</h3>
          <p style={{ color: COLORS.textLight, marginBottom: 16 }}>Klik på en række for at redigere</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Type</th>
                <th style={STYLES.th}>Kostpris/time</th>
                <th style={STYLES.th}>Salgspris/time</th>
                <th style={STYLES.th}>Akkordsats/time</th>
                <th style={STYLES.th}></th>
              </tr>
            </thead>
            <tbody>
              {laborRates.map(r => (
                <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  {editingRate === r.id ? (
                    <>
                      <td style={STYLES.td}><strong>{r.name}</strong></td>
                      <td style={STYLES.td}>
                        <input type="number" defaultValue={r.hourly_rate} id={`rate-cost-${r.id}`} style={{ ...STYLES.input, width: 100, padding: 8 }} />
                      </td>
                      <td style={STYLES.td}>
                        <input type="number" defaultValue={r.hourly_rate_sale} id={`rate-sale-${r.id}`} style={{ ...STYLES.input, width: 100, padding: 8 }} />
                      </td>
                      <td style={STYLES.td}>
                        <input type="number" defaultValue={r.akkord_rate} id={`rate-akkord-${r.id}`} style={{ ...STYLES.input, width: 100, padding: 8 }} />
                      </td>
                      <td style={STYLES.td}>
                        <button onClick={() => updateLaborRate(r.id, {
                          hourly_rate: Number(document.getElementById(`rate-cost-${r.id}`).value),
                          hourly_rate_sale: Number(document.getElementById(`rate-sale-${r.id}`).value),
                          akkord_rate: Number(document.getElementById(`rate-akkord-${r.id}`).value)
                        })} style={{ ...STYLES.primaryBtn, padding: '6px 12px', fontSize: 12 }}>Gem</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={STYLES.td}><strong>{r.name}</strong></td>
                      <td style={STYLES.td}>{formatMoney(r.hourly_rate)}</td>
                      <td style={STYLES.td}>{formatMoney(r.hourly_rate_sale)}</td>
                      <td style={STYLES.td}>{formatMoney(r.akkord_rate)}</td>
                      <td style={STYLES.td}>
                        <button onClick={() => setEditingRate(r.id)} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', fontSize: 12 }}>Rediger</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === KATEGORIER TAB === */}
      {activeTab === 'kategorier' && (
        <div style={STYLES.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0 }}>Arbejdskategorier</h3>
              <p style={{ color: COLORS.textLight, marginTop: 4, marginBottom: 0 }}>Kategorier til normtider og kalkulationsposter</p>
            </div>
            <button onClick={() => {
              const name = prompt('Navn på ny kategori:');
              if (!name) return;
              supabase.from('work_categories').insert([{ name, sort_order: categories.length }]).then(() => loadAllData());
            }} style={STYLES.primaryBtn}>+ Tilføj kategori</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Kategori</th>
                <th style={STYLES.th}>Antal poster</th>
                <th style={{ ...STYLES.th, width: 150 }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={STYLES.td}><strong>{c.name}</strong></td>
                  <td style={STYLES.td}>{normtider.filter(n => n.category_id === c.id).length} poster</td>
                  <td style={STYLES.td}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => {
                        const name = prompt('Nyt navn:', c.name);
                        if (!name || name === c.name) return;
                        supabase.from('work_categories').update({ name }).eq('id', c.id).then(() => loadAllData());
                      }} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', fontSize: 12 }}>Omdøb</button>
                      <button onClick={async () => {
                        const count = normtider.filter(n => n.category_id === c.id).length;
                        if (count > 0) { alert(`Kan ikke slette - kategorien har ${count} poster`); return; }
                        if (!confirm(`Slet kategorien "${c.name}"?`)) return;
                        await supabase.from('work_categories').delete().eq('id', c.id);
                        loadAllData();
                      }} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', fontSize: 12, color: COLORS.error }}>Slet</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === NORMTIDER TAB === */}
      {activeTab === 'normtider' && (
        <div style={STYLES.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0 }}>Normtider & Kalkulationsposter</h3>
              <p style={{ color: COLORS.textLight, marginTop: 4, marginBottom: 0 }}>Opret, rediger og slet kalkulationsposter</p>
            </div>
            <button onClick={() => setEditingNorm('new')} style={STYLES.primaryBtn}>+ Tilføj post</button>
          </div>

          {editingNorm === 'new' && (
            <div style={{ background: COLORS.bg, padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 16px' }}>Ny kalkulationspost</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={STYLES.label}>Kategori *</label>
                  <select id="new-norm-cat" style={STYLES.select}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={STYLES.label}>Navn *</label>
                  <input id="new-norm-name" style={STYLES.input} placeholder="F.eks. Stikkontakt enkelt" />
                </div>
                <div>
                  <label style={STYLES.label}>Enhed</label>
                  <input id="new-norm-unit" style={STYLES.input} placeholder="stk" defaultValue="stk" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label style={STYLES.label}>Normminutter *</label>
                  <input id="new-norm-min" type="number" style={STYLES.input} placeholder="45" />
                </div>
                <div>
                  <label style={STYLES.label}>Akkordminutter</label>
                  <input id="new-norm-akk" type="number" style={STYLES.input} placeholder="34" />
                </div>
                <div>
                  <label style={STYLES.label}>Materialepris (kr)</label>
                  <input id="new-norm-mat" type="number" style={STYLES.input} placeholder="150" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button onClick={() => setEditingNorm(null)} style={STYLES.secondaryBtn}>Annuller</button>
                <button onClick={async () => {
                  const name = document.getElementById('new-norm-name').value;
                  const catId = document.getElementById('new-norm-cat').value;
                  const normMin = document.getElementById('new-norm-min').value;
                  if (!name || !catId || !normMin) { alert('Udfyld navn, kategori og normminutter'); return; }
                  const { error } = await supabase.from('norm_times').insert([{
                    name,
                    category_id: catId,
                    unit: document.getElementById('new-norm-unit').value || 'stk',
                    norm_minutes: Number(normMin),
                    akkord_minutes: Number(document.getElementById('new-norm-akk').value) || null,
                    material_cost: Number(document.getElementById('new-norm-mat').value) || 0
                  }]);
                  if (error) { alert('Fejl: ' + error.message); return; }
                  setEditingNorm(null);
                  loadAllData();
                }} style={STYLES.primaryBtn}>Gem ny post</button>
              </div>
            </div>
          )}

          <div style={{ maxHeight: 500, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                <tr style={{ background: COLORS.bg }}>
                  <th style={STYLES.th}>Kategori</th>
                  <th style={STYLES.th}>Navn</th>
                  <th style={STYLES.th}>Enhed</th>
                  <th style={{ ...STYLES.th, width: 80 }}>Norm</th>
                  <th style={{ ...STYLES.th, width: 80 }}>Akkord</th>
                  <th style={{ ...STYLES.th, width: 100 }}>Materialer</th>
                  <th style={{ ...STYLES.th, width: 120 }}></th>
                </tr>
              </thead>
              <tbody>
                {normtider.map(n => (
                  <tr key={n.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    {editingNorm === n.id ? (
                      <>
                        <td style={STYLES.td}>
                          <select defaultValue={n.category_id} id={`norm-cat-${n.id}`} style={{ ...STYLES.select, padding: 6, fontSize: 12 }}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </td>
                        <td style={STYLES.td}>
                          <input type="text" defaultValue={n.name} id={`norm-name-${n.id}`} style={{ ...STYLES.input, padding: 6, fontSize: 12 }} />
                        </td>
                        <td style={STYLES.td}>
                          <input type="text" defaultValue={n.unit} id={`norm-unit-${n.id}`} style={{ ...STYLES.input, width: 50, padding: 6, fontSize: 12 }} />
                        </td>
                        <td style={STYLES.td}>
                          <input type="number" defaultValue={n.norm_minutes} id={`norm-min-${n.id}`} style={{ ...STYLES.input, width: 60, padding: 6, fontSize: 12 }} />
                        </td>
                        <td style={STYLES.td}>
                          <input type="number" defaultValue={n.akkord_minutes} id={`norm-akk-${n.id}`} style={{ ...STYLES.input, width: 60, padding: 6, fontSize: 12 }} />
                        </td>
                        <td style={STYLES.td}>
                          <input type="number" defaultValue={n.material_cost} id={`norm-mat-${n.id}`} style={{ ...STYLES.input, width: 70, padding: 6, fontSize: 12 }} />
                        </td>
                        <td style={STYLES.td}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => updateNormtid(n.id, {
                              category_id: document.getElementById(`norm-cat-${n.id}`).value,
                              name: document.getElementById(`norm-name-${n.id}`).value,
                              unit: document.getElementById(`norm-unit-${n.id}`).value,
                              norm_minutes: Number(document.getElementById(`norm-min-${n.id}`).value),
                              akkord_minutes: Number(document.getElementById(`norm-akk-${n.id}`).value) || null,
                              material_cost: Number(document.getElementById(`norm-mat-${n.id}`).value) || 0
                            })} style={{ ...STYLES.primaryBtn, padding: '4px 8px', fontSize: 11 }}>Gem</button>
                            <button onClick={() => setEditingNorm(null)} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 11 }}>×</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={STYLES.td}><span style={{ fontSize: 11, color: COLORS.textLight }}>{n.work_categories?.name}</span></td>
                        <td style={STYLES.td}><strong>{n.name}</strong></td>
                        <td style={STYLES.td}>{n.unit}</td>
                        <td style={STYLES.td}>{n.norm_minutes} min</td>
                        <td style={STYLES.td}>{n.akkord_minutes || '-'} min</td>
                        <td style={STYLES.td}>{formatMoney(n.material_cost || 0)}</td>
                        <td style={STYLES.td}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => setEditingNorm(n.id)} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 11 }}>Ret</button>
                            <button onClick={async () => {
                              if (!confirm(`Slet "${n.name}"?`)) return;
                              await supabase.from('norm_times').delete().eq('id', n.id);
                              loadAllData();
                            }} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 11, color: COLORS.error }}>Slet</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === TILBUD TAB === */}
      {activeTab === 'tilbud' && (
        <div style={STYLES.card}>
          <h3 style={{ margin: '0 0 20px' }}>Tilbudsindstillinger</h3>
          <p style={{ color: COLORS.textLight }}>Standard tilbudsvilkår, skabeloner og gyldighed kommer her.</p>
        </div>
      )}

      {/* === MODALS === */}
      {showCreateUser && (
        <Modal title="Opret ny bruger" onClose={() => setShowCreateUser(false)} wide>
          <BrugerFormFull onSave={createBruger} onCancel={() => setShowCreateUser(false)} />
        </Modal>
      )}

      {showEditUser && (
        <Modal title="Rediger bruger" onClose={() => setShowEditUser(null)} wide>
          <BrugerFormFull initial={showEditUser} onSave={updateBruger} onCancel={() => setShowEditUser(null)} onResetPassword={resetPassword} isEdit />
        </Modal>
      )}

      {showSuccess && (
        <Modal title="✅ Bruger oprettet" onClose={() => setShowSuccess(null)}>
          <Alert type="success">Brugeren er oprettet!</Alert>
          <div style={{ background: COLORS.bg, borderRadius: 12, padding: 20, marginTop: 16 }}>
            <InfoRow label="Navn" value={showSuccess.name} />
            <InfoRow label="Email" value={showSuccess.email} />
            <InfoRow label="Rolle" value={showSuccess.role} />
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.textLight }}>Midlertidig adgangskode</div>
              <code style={{ display: 'block', background: 'white', padding: 12, borderRadius: 8, fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {showSuccess.password}
              </code>
            </div>
          </div>
          <Alert type="warning" style={{ marginTop: 16 }}>Send disse oplysninger til brugeren. Adgangskoden vises kun denne ene gang.</Alert>
          <button onClick={() => setShowSuccess(null)} style={{ ...STYLES.primaryBtn, marginTop: 16 }}>Luk</button>
        </Modal>
      )}
    </div>
  );
}

// Bruger form med rettigheder
function BrugerFormFull({ onSave, onCancel, initial = {}, isEdit = false, onResetPassword }) {
  const [form, setForm] = useState({
    id: initial.id || null,
    name: initial.name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    title: initial.title || '',
    role: initial.role || 'saelger',
    permissions: initial.permissions || [],
    active: initial.active !== false,
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const pwd = Array(12).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    setForm({ ...form, password: pwd, confirmPassword: pwd });
  };

  const allPermissions = [
    { id: 'projekter_se', label: 'Se projekter', group: 'Projekter' },
    { id: 'projekter_opret', label: 'Oprette projekter', group: 'Projekter' },
    { id: 'projekter_rediger', label: 'Redigere projekter', group: 'Projekter' },
    { id: 'projekter_slet', label: 'Slette projekter', group: 'Projekter' },
    { id: 'kunder_se', label: 'Se kunder', group: 'Kunder' },
    { id: 'kunder_opret', label: 'Oprette kunder', group: 'Kunder' },
    { id: 'kunder_rediger', label: 'Redigere kunder', group: 'Kunder' },
    { id: 'tilbud_se', label: 'Se tilbud', group: 'Tilbud' },
    { id: 'tilbud_opret', label: 'Oprette tilbud', group: 'Tilbud' },
    { id: 'tilbud_send', label: 'Sende tilbud', group: 'Tilbud' },
    { id: 'priser_se', label: 'Se priser og DB', group: 'Økonomi' },
    { id: 'akkord_se', label: 'Se akkord', group: 'Økonomi' },
  ];

  const togglePermission = (permId) => {
    if (form.permissions.includes(permId)) {
      setForm({ ...form, permissions: form.permissions.filter(p => p !== permId) });
    } else {
      setForm({ ...form, permissions: [...form.permissions, permId] });
    }
  };

  const permissionGroups = [...new Set(allPermissions.map(p => p.group))];

  const handleSave = () => {
    if (!form.name || !form.email) {
      alert('Navn og email er påkrævet');
      return;
    }
    if (!isEdit && form.password && form.password !== form.confirmPassword) {
      alert('Adgangskoderne matcher ikke');
      return;
    }
    if (!isEdit && form.password && form.password.length < 6) {
      alert('Adgangskoden skal være mindst 6 tegn');
      return;
    }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField label="Fulde navn *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
        <FormField label="Titel" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="F.eks. Salgschef" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField label="Email *" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} disabled={isEdit} />
        <FormField label="Telefon" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
      </div>

      {/* Password sektion */}
      {!isEdit ? (
        <div style={{ background: COLORS.bg, padding: 20, borderRadius: 12 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>🔑 Adgangskode</h4>
          <p style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 12 }}>
            Vælg selv en adgangskode eller lad feltet være tomt for automatisk generering
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={STYLES.label}>Adgangskode</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 tegn"
                  style={{ ...STYLES.input, flex: 1 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ ...STYLES.secondaryBtn, padding: '8px 12px' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label style={STYLES.label}>Bekræft adgangskode</label>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Gentag adgangskode"
                style={STYLES.input}
              />
            </div>
          </div>
          <button type="button" onClick={generateRandomPassword} style={{ ...STYLES.secondaryBtn, marginTop: 12, fontSize: 13 }}>
            🎲 Generer tilfældig adgangskode
          </button>
          {!form.password && (
            <p style={{ fontSize: 12, color: COLORS.info, marginTop: 8 }}>
              💡 Hvis du ikke angiver en adgangskode, genereres en automatisk
            </p>
          )}
        </div>
      ) : (
        <div style={{ background: COLORS.bg, padding: 20, borderRadius: 12 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>🔑 Adgangskode</h4>
          <p style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 12 }}>
            Send et link til brugeren så de kan nulstille deres adgangskode
          </p>
          <button type="button" onClick={() => onResetPassword && onResetPassword(form.email)} style={{ ...STYLES.secondaryBtn }}>
            📧 Send nulstillingslink til {form.email}
          </button>
        </div>
      )}
      
      <div>
        <label style={STYLES.label}>Rolle</label>
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={STYLES.select}>
          <option value="saelger">Sælger</option>
          <option value="montoer">Montør</option>
          <option value="elev">Elev</option>
          <option value="admin">Administrator (Fuld adgang)</option>
        </select>
      </div>

      {form.role !== 'admin' && (
        <div style={{ background: COLORS.bg, padding: 20, borderRadius: 12 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 14 }}>🔐 Rettigheder</h4>
          <p style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 16 }}>Vælg hvad denne bruger må se og gøre i systemet</p>
          
          {permissionGroups.map(group => (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: COLORS.text }}>{group}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {allPermissions.filter(p => p.group === group).map(perm => (
                  <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      style={{ width: 16, height: 16 }}
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {form.role === 'admin' && (
        <Alert type="info">Administratorer har automatisk fuld adgang til alle funktioner.</Alert>
      )}

      {isEdit && (
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 500 }}>Bruger er aktiv</span>
          </label>
          <p style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>Inaktive brugere kan ikke logge ind</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSave} style={STYLES.primaryBtn}>
          {isEdit ? 'Gem ændringer' : 'Opret bruger'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AI TEKST FUNKTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function AITextButton({ text, onResult, label = '✨ AI' }) {
  const [loading, setLoading] = useState(false);

  const improveText = async () => {
    if (!text?.trim()) return;
    setLoading(true);
    
    // Simuleret AI-forbedring (i produktion: kald til Anthropic/OpenAI API)
    const improved = await simulateAIImprovement(text);
    onResult(improved);
    setLoading(false);
  };

  return (
    <button onClick={improveText} disabled={loading || !text?.trim()} style={{ ...STYLES.secondaryBtn, padding: '8px 12px', fontSize: 12, opacity: loading ? 0.7 : 1 }}>
      {loading ? '...' : label}
    </button>
  );
}

async function simulateAIImprovement(text) {
  // Simuleret forsinkelse
  await new Promise(r => setTimeout(r, 500));
  
  // Simpel tekst-forbedring (i produktion erstattes med rigtig AI)
  let improved = text.trim();
  
  // Capitalize first letter
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  
  // Add period if missing
  if (!/[.!?]$/.test(improved)) improved += '.';
  
  // Expand short text
  if (improved.length < 50) {
    improved = `${improved} Vi udfører arbejdet professionelt og i henhold til gældende standarder. Kontakt os gerne for yderligere information.`;
  }
  
  return improved;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HJÆLPE-KOMPONENTER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: COLORS.textLight, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <button onClick={action.onClick} style={STYLES.primaryBtn}>{action.label}</button>}
    </div>
  );
}

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ ...STYLES.card, textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
      <p style={{ color: COLORS.textLight, marginBottom: 24 }}>{subtitle}</p>
      {action && <button onClick={action.onClick} style={STYLES.primaryBtn}>{action.label}</button>}
    </div>
  );
}

function LoadingIndicator() {
  return <div style={{ textAlign: 'center', padding: 40, color: COLORS.textLight }}>Indlæser...</div>;
}

function FormField({ label, value, onChange, type = 'text', placeholder, multiline, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={STYLES.label}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={{ ...STYLES.input, minHeight: 80, resize: 'vertical', opacity: disabled ? 0.6 : 1 }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={{ ...STYLES.input, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text' }} />
      )}
    </div>
  );
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: wide ? 900 : 500, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: COLORS.textLight }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Alert({ type, children, style }) {
  const colors = {
    error: { bg: '#FEE2E2', color: '#DC2626' },
    success: { bg: '#D1FAE5', color: '#059669' },
    warning: { bg: '#FEF3C7', color: '#92400E' },
    info: { bg: '#DBEAFE', color: '#1D4ED8' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ padding: '12px 16px', background: c.bg, borderRadius: 12, color: c.color, fontSize: 14, ...style }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    draft: { bg: '#F3F4F6', color: '#6B7280' },
    calculated: { bg: '#DBEAFE', color: '#1D4ED8' },
    quoted: { bg: '#FEF3C7', color: '#D97706' },
    accepted: { bg: '#D1FAE5', color: '#059669' },
    completed: { bg: '#E0E7FF', color: '#4338CA' },
  };
  const labels = { draft: 'Kladde', calculated: 'Kalkuleret', quoted: 'Tilbud', accepted: 'Accepteret', completed: 'Afsluttet' };
  const c = colors[status] || colors.draft;
  return <span style={{ padding: '4px 12px', background: c.bg, color: c.color, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{labels[status] || status}</span>;
}

function formatMoney(amount) {
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
}
