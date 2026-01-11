// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ELTA SOLAR PLATFORM - Med Supabase Database
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KONFIGURATION & FARVER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  companyName: 'Elta Solar',
  tagline: 'Fra sol til stikkontakt – nemt og sikkert',
};

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  accent: '#F5A623',
  accentDark: '#E09000',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
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
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
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
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signUp = async (email, password, name, role = 'saelger') => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Tjek din email for bekræftelse!' };
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
    <AuthContext.Provider value={{ user, profile, login, signUp, logout, hasPermission }}>
      <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Inter', -apple-system, sans-serif" }}>
        {!user ? (
          <LoginPage />
        ) : (
          <>
            <Navigation section={section} setSection={setSection} />
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
              {section === 'dashboard' && <Dashboard setSection={setSection} />}
              {section === 'tilbud' && hasPermission('tilbud') && <TilbudSystem />}
              {section === 'kunder' && hasPermission('kunder') && <KunderSystem />}
              {section === 'produkter' && hasPermission('tilbud') && <ProdukterSystem />}
              {section === 'uddannelse' && hasPermission('uddannelse') && <UddannelseSystem />}
              {section === 'brugere' && hasPermission('brugere') && <BrugerSystem />}
              {section === 'indstillinger' && hasPermission('indstillinger') && <Indstillinger />}
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
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoginPage() {
  const { login, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'login') {
      const result = await login(email, password);
      if (!result.success) setError(result.error);
    } else {
      const result = await signUp(email, password, name);
      if (!result.success) setError(result.error);
      else setMessage(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
      padding: 20
    }}>
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

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 10,
              background: mode === m ? COLORS.primary : COLORS.bg,
              color: mode === m ? 'white' : COLORS.text,
              fontWeight: 600, cursor: 'pointer'
            }}>
              {m === 'login' ? 'Log ind' : 'Opret konto'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Navn</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dit navn" required style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="din@email.dk" required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Adgangskode</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={inputStyle} />
          </div>

          {error && <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 12, color: COLORS.error, fontSize: 14, marginBottom: 16 }}>{error}</div>}
          {message && <div style={{ padding: '12px 16px', background: '#D1FAE5', borderRadius: 12, color: COLORS.success, fontSize: 14, marginBottom: 16 }}>{message}</div>}

          <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, width: '100%', padding: '16px', fontSize: 16, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Vent...' : (mode === 'login' ? 'Log ind' : 'Opret konto')}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Navigation({ section, setSection }) {
  const { profile, logout, hasPermission } = useAuth();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', perm: null },
    { id: 'tilbud', label: 'Tilbud', icon: '📄', perm: 'tilbud' },
    { id: 'kunder', label: 'Kunder', icon: '👥', perm: 'kunder' },
    { id: 'produkter', label: 'Produkter', icon: '📦', perm: 'tilbud' },
    { id: 'uddannelse', label: 'Uddannelse', icon: '🎓', perm: 'uddannelse' },
    { id: 'brugere', label: 'Brugere', icon: '👤', perm: 'brugere' },
    { id: 'indstillinger', label: 'Indstillinger', icon: '⚙️', perm: 'indstillinger' },
  ];

  return (
    <nav style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 40 }}>
          <SolarLogo size={36} />
          <div style={{ fontWeight: 700, fontSize: 20 }}>
            <span style={{ color: COLORS.primary }}>Elta</span>
            <span style={{ color: COLORS.accent }}>Solar</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navItems.filter(i => !i.perm || hasPermission(i.perm)).map(item => (
            <button key={item.id} onClick={() => setSection(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
              border: 'none', borderRadius: 10,
              background: section === item.id ? `${COLORS.primary}15` : 'transparent',
              color: section === item.id ? COLORS.primary : COLORS.textLight,
              fontWeight: section === item.id ? 600 : 500, fontSize: 14, cursor: 'pointer'
            }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.name || 'Bruger'}</div>
            <div style={{ fontSize: 12, color: COLORS.textLight, textTransform: 'capitalize' }}>{profile?.role}</div>
          </div>
          <button onClick={logout} style={{ padding: '8px 16px', border: `1px solid ${COLORS.border}`, borderRadius: 8, background: 'white', cursor: 'pointer' }}>Log ud</button>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Dashboard({ setSection }) {
  const { profile, hasPermission } = useAuth();
  const [stats, setStats] = useState({ quotes: 0, customers: 0, products: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from('quotes').select('id', { count: 'exact' }),
      supabase.from('customers').select('id', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact' })
    ]).then(([q, c, p]) => setStats({ quotes: q.count || 0, customers: c.count || 0, products: p.count || 0 }));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Velkommen, {profile?.name?.split(' ')[0]}! ☀️</h1>
        <p style={{ color: COLORS.textLight, marginTop: 4 }}>Her er dit overblik</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard icon="📄" label="Tilbud" value={stats.quotes} color={COLORS.info} />
        <StatCard icon="👥" label="Kunder" value={stats.customers} color={COLORS.success} />
        <StatCard icon="📦" label="Produkter" value={stats.products} color={COLORS.accent} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {hasPermission('tilbud') && <ActionCard icon="📄" title="Opret tilbud" desc="Start et nyt tilbud" color={COLORS.primary} onClick={() => setSection('tilbud')} />}
        {hasPermission('kunder') && <ActionCard icon="👥" title="Se kunder" desc="Administrer kunder" color={COLORS.accent} onClick={() => setSection('kunder')} />}
        {hasPermission('uddannelse') && <ActionCard icon="🎓" title="Uddannelse" desc="AI-hjælpelærer" color={COLORS.info} onClick={() => setSection('uddannelse')} />}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
      <div><div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div><div style={{ fontSize: 13, color: COLORS.textLight }}>{label}</div></div>
    </div>
  );
}

function ActionCard({ icon, title, desc, color, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}`, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: '8px 0 0', fontSize: 14, color: COLORS.textLight }}>{desc}</p>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KUNDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function KunderSystem() {
  const [kunder, setKunder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadKunder(); }, []);

  const loadKunder = async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    setKunder(data || []);
    setLoading(false);
  };

  if (selected) return <KundeDetalje kunde={selected} onBack={() => { setSelected(null); loadKunder(); }} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Kunder</h1><p style={{ color: COLORS.textLight, margin: '4px 0 0' }}>{kunder.length} kunder</p></div>
        <button onClick={() => setShowCreate(true)} style={primaryButtonStyle}>+ Tilføj kunde</button>
      </div>
      {loading ? <p>Indlæser...</p> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {kunder.map(k => (
            <div key={k.id} onClick={() => setSelected(k)} style={{ background: 'white', borderRadius: 16, padding: 20, border: `1px solid ${COLORS.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 20 }}>
                {k.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 16 }}>{k.name}</div><div style={{ color: COLORS.textLight, fontSize: 14 }}>{k.email} {k.phone && `· ${k.phone}`}</div></div>
              <div style={{ fontSize: 12, color: COLORS.textLight }}>{k.city}</div>
            </div>
          ))}
        </div>
      )}
      {showCreate && <Modal title="Tilføj kunde" onClose={() => setShowCreate(false)}>
        <KundeForm onSave={async (form) => { await supabase.from('customers').insert([form]); setShowCreate(false); loadKunder(); }} onCancel={() => setShowCreate(false)} />
      </Modal>}
    </div>
  );
}

function KundeForm({ onSave, onCancel, initial = {} }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', zip: '', ...initial });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FormField label="Navn *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
        <FormField label="Telefon" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
      </div>
      <FormField label="Adresse" value={form.address} onChange={v => setForm({ ...form, address: v })} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <FormField label="By" value={form.city} onChange={v => setForm({ ...form, city: v })} />
        <FormField label="Postnr" value={form.zip} onChange={v => setForm({ ...form, zip: v })} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={secondaryButtonStyle}>Annuller</button>
        <button onClick={() => onSave(form)} style={primaryButtonStyle}>Gem</button>
      </div>
    </div>
  );
}

function KundeDetalje({ kunde, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => { loadMessages(); }, []);
  const loadMessages = async () => { const { data } = await supabase.from('messages').select('*').eq('customer_id', kunde.id).order('created_at'); setMessages(data || []); };
  const sendMessage = async () => { if (!newMsg.trim()) return; await supabase.from('messages').insert([{ customer_id: kunde.id, sender_type: 'staff', content: newMsg }]); setNewMsg(''); loadMessages(); };

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: COLORS.textLight, cursor: 'pointer', marginBottom: 20 }}>← Tilbage</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>{kunde.name}</h1>
          <p style={{ color: COLORS.textLight }}>{kunde.email} · {kunde.phone}</p>
          <p style={{ marginTop: 16 }}>{kunde.address}, {kunde.zip} {kunde.city}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', height: 500 }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${COLORS.border}`, fontWeight: 600 }}>💬 Chat</div>
          <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
            {messages.map(m => (
              <div key={m.id} style={{ marginBottom: 12, textAlign: m.sender_type === 'staff' ? 'right' : 'left' }}>
                <div style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 12, background: m.sender_type === 'staff' ? COLORS.primary : COLORS.bg, color: m.sender_type === 'staff' ? 'white' : COLORS.text, maxWidth: '80%' }}>{m.content}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 12 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Skriv besked..." style={{ flex: 1, padding: 12, border: `1px solid ${COLORS.border}`, borderRadius: 10 }} />
            <button onClick={sendMessage} style={primaryButtonStyle}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRODUKTER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ProdukterSystem() {
  const [produkter, setProdukter] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadProdukter(); }, []);
  const loadProdukter = async () => { const { data } = await supabase.from('products').select('*').order('name'); setProdukter(data || []); };
  const deleteProdukt = async (id) => { if (confirm('Slet produkt?')) { await supabase.from('products').delete().eq('id', id); loadProdukter(); } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Produkter & Pakker</h1>
        <button onClick={() => setShowCreate(true)} style={primaryButtonStyle}>+ Tilføj produkt</button>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: COLORS.bg }}><th style={thStyle}>Navn</th><th style={thStyle}>Kategori</th><th style={thStyle}>Pris</th><th style={thStyle}>Kostpris</th><th style={thStyle}>DB%</th><th style={thStyle}></th></tr></thead>
          <tbody>
            {produkter.map(p => {
              const db = p.unit_price > 0 ? ((p.unit_price - p.cost_price) / p.unit_price * 100).toFixed(0) : 0;
              return (
                <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={tdStyle}><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 12, color: COLORS.textLight }}>{p.description}</div></td>
                  <td style={tdStyle}><span style={{ padding: '4px 10px', background: COLORS.bg, borderRadius: 8, fontSize: 12 }}>{p.category}</span></td>
                  <td style={tdStyle}>{Number(p.unit_price).toLocaleString('da-DK')} kr</td>
                  <td style={tdStyle}>{Number(p.cost_price).toLocaleString('da-DK')} kr</td>
                  <td style={tdStyle}><span style={{ color: COLORS.success, fontWeight: 600 }}>{db}%</span></td>
                  <td style={tdStyle}><button onClick={() => deleteProdukt(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showCreate && <Modal title="Tilføj produkt" onClose={() => setShowCreate(false)}>
        <ProduktForm onSave={async (form) => { await supabase.from('products').insert([form]); setShowCreate(false); loadProdukter(); }} onCancel={() => setShowCreate(false)} />
      </Modal>}
    </div>
  );
}

function ProduktForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', category: 'El', unit_price: '', cost_price: '' });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FormField label="Navn" value={form.name} onChange={v => setForm({ ...form, name: v })} />
      <FormField label="Beskrivelse" value={form.description} onChange={v => setForm({ ...form, description: v })} />
      <div><label style={labelStyle}>Kategori</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={selectStyle}><option>El</option><option>Solceller</option><option>Batteri</option><option>El Bil Lader</option><option>Service</option></select></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField label="Salgspris (kr)" type="number" value={form.unit_price} onChange={v => setForm({ ...form, unit_price: v })} />
        <FormField label="Kostpris (kr)" type="number" value={form.cost_price} onChange={v => setForm({ ...form, cost_price: v })} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}><button onClick={onCancel} style={secondaryButtonStyle}>Annuller</button><button onClick={() => onSave(form)} style={primaryButtonStyle}>Gem</button></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TILBUD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function TilbudSystem() {
  const [tilbud, setTilbud] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadTilbud(); }, []);
  const loadTilbud = async () => { const { data } = await supabase.from('quotes').select('*, customers(name)').order('created_at', { ascending: false }); setTilbud(data || []); };

  const statusColors = { nyt: { bg: '#DBEAFE', text: '#1D4ED8' }, afventer: { bg: '#FEF3C7', text: '#D97706' }, accepteret: { bg: '#D1FAE5', text: '#059669' }, afvist: { bg: '#FEE2E2', text: '#DC2626' } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tilbud</h1>
        <button onClick={() => setShowCreate(true)} style={primaryButtonStyle}>+ Opret tilbud</button>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: COLORS.bg }}><th style={thStyle}>Nr.</th><th style={thStyle}>Kunde</th><th style={thStyle}>Titel</th><th style={thStyle}>Pris</th><th style={thStyle}>Status</th></tr></thead>
          <tbody>
            {tilbud.map(t => (
              <tr key={t.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                <td style={tdStyle}><span style={{ fontWeight: 600, color: COLORS.primary }}>{t.quote_number}</span></td>
                <td style={tdStyle}>{t.customers?.name || '-'}</td>
                <td style={tdStyle}>{t.title}</td>
                <td style={tdStyle}>{Number(t.total_price).toLocaleString('da-DK')} kr</td>
                <td style={tdStyle}><span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusColors[t.status]?.bg, color: statusColors[t.status]?.text }}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate && <TilbudModal onClose={() => { setShowCreate(false); loadTilbud(); }} />}
    </div>
  );
}

function TilbudModal({ onClose }) {
  const [kunder, setKunder] = useState([]);
  const [produkter, setProdukter] = useState([]);
  const [form, setForm] = useState({ customer_id: '', title: '' });
  const [lines, setLines] = useState([]);

  useEffect(() => { supabase.from('customers').select('*').then(({ data }) => setKunder(data || [])); supabase.from('products').select('*').then(({ data }) => setProdukter(data || [])); }, []);

  const addLine = (p) => setLines([...lines, { product_name: p.name, quantity: 1, unit_price: p.unit_price, total_price: p.unit_price }]);
  const updateQty = (i, q) => { const l = [...lines]; l[i].quantity = q; l[i].total_price = q * l[i].unit_price; setLines(l); };
  const total = lines.reduce((s, l) => s + Number(l.total_price), 0);

  const create = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase.from('quotes').select('*', { count: 'exact' });
    const num = `T-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
    const { data: q } = await supabase.from('quotes').insert([{ quote_number: num, customer_id: form.customer_id || null, title: form.title, total_price: total, status: 'nyt' }]).select().single();
    if (q && lines.length) await supabase.from('quote_lines').insert(lines.map(l => ({ ...l, quote_id: q.id })));
    onClose();
  };

  return (
    <Modal title="Opret tilbud" onClose={onClose} wide>
      <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        <div><label style={labelStyle}>Kunde</label><select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} style={selectStyle}><option value="">Vælg kunde...</option>{kunder.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}</select></div>
        <FormField label="Titel" value={form.title} onChange={v => setForm({ ...form, title: v })} />
      </div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Tilføj produkt</label><select onChange={e => { const p = produkter.find(x => x.id === e.target.value); if (p) addLine(p); e.target.value = ''; }} style={selectStyle}><option value="">Vælg...</option>{produkter.map(p => <option key={p.id} value={p.id}>{p.name} - {Number(p.unit_price).toLocaleString('da-DK')} kr</option>)}</select></div>
      {lines.length > 0 && <div style={{ background: COLORS.bg, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        {lines.map((l, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}><span style={{ flex: 1 }}>{l.product_name}</span><input type="number" value={l.quantity} onChange={e => updateQty(i, parseInt(e.target.value) || 1)} style={{ width: 60, padding: 8, border: `1px solid ${COLORS.border}`, borderRadius: 6, textAlign: 'center' }} /><span style={{ width: 100, textAlign: 'right' }}>{Number(l.total_price).toLocaleString('da-DK')} kr</span><button onClick={() => setLines(lines.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button></div>)}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total:</span><span>{total.toLocaleString('da-DK')} kr</span></div>
      </div>}
      <div style={{ display: 'flex', gap: 12 }}><button onClick={onClose} style={secondaryButtonStyle}>Annuller</button><button onClick={create} style={primaryButtonStyle}>Opret tilbud</button></div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BRUGERE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function BrugerSystem() {
  const [brugere, setBrugere] = useState([]);
  const { signUp } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadBrugere(); }, []);
  const loadBrugere = async () => { const { data } = await supabase.from('profiles').select('*').order('name'); setBrugere(data || []); };

  const rolleColors = { admin: '#DBEAFE', saelger: '#D1FAE5', montoer: '#FEF3C7', elev: '#F3E8FF' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Brugerstyring</h1>
        <button onClick={() => setShowCreate(true)} style={primaryButtonStyle}>+ Opret bruger</button>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: COLORS.bg }}><th style={thStyle}>Bruger</th><th style={thStyle}>Rolle</th><th style={thStyle}>Rettigheder</th></tr></thead>
          <tbody>
            {brugere.map(b => (
              <tr key={b.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                <td style={tdStyle}><div style={{ fontWeight: 600 }}>{b.name}</div><div style={{ fontSize: 12, color: COLORS.textLight }}>{b.email}</div></td>
                <td style={tdStyle}><span style={{ padding: '4px 12px', background: rolleColors[b.role], borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{b.role}</span></td>
                <td style={tdStyle}>{b.permissions?.map(p => <span key={p} style={{ marginRight: 4, padding: '2px 8px', background: COLORS.bg, borderRadius: 6, fontSize: 11 }}>{p}</span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate && <Modal title="Opret bruger" onClose={() => setShowCreate(false)}>
        <BrugerForm onSave={async (form) => { await signUp(form.email, form.password, form.name, form.role); setShowCreate(false); loadBrugere(); }} onCancel={() => setShowCreate(false)} />
      </Modal>}
    </div>
  );
}

function BrugerForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'saelger' });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FormField label="Navn" value={form.name} onChange={v => setForm({ ...form, name: v })} />
      <FormField label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
      <FormField label="Adgangskode" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} />
      <div><label style={labelStyle}>Rolle</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={selectStyle}><option value="admin">Admin</option><option value="saelger">Sælger</option><option value="montoer">Montør</option><option value="elev">Elev</option></select></div>
      <div style={{ display: 'flex', gap: 12 }}><button onClick={onCancel} style={secondaryButtonStyle}>Annuller</button><button onClick={() => onSave(form)} style={primaryButtonStyle}>Opret</button></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UDDANNELSE & INDSTILLINGER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function UddannelseSystem() {
  return (
    <div><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>🎓 Uddannelse</h1>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div><h2>Kommer snart!</h2><p style={{ color: COLORS.textLight }}>AI-hjælpelærer aktiveres i næste opdatering.</p>
      </div>
    </div>
  );
}

function Indstillinger() {
  return (
    <div><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>⚙️ Indstillinger</h1>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}`, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 16px' }}>Firma</h3><p><strong>Elta Solar</strong></p><p style={{ color: COLORS.textLight }}>kontakt@eltasolar.dk</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: wide ? 700 : 500 }}>
        <h2 style={{ margin: '0 0 24px' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text' }) {
  return (
    <div><label style={labelStyle}>{label}</label><input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} /></div>
  );
}

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 };
const inputStyle = { width: '100%', padding: '12px 16px', border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' };
const selectStyle = { width: '100%', padding: 12, border: `1px solid ${COLORS.border}`, borderRadius: 10 };
const primaryButtonStyle = { padding: '12px 24px', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' };
const secondaryButtonStyle = { padding: '12px 24px', background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12, cursor: 'pointer' };
const thStyle = { padding: '14px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: COLORS.textLight };
const tdStyle = { padding: '16px 20px' };
