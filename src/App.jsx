// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ELTASOLAR FUNDAMENT v1.1
// Original layout bevaret - kun funktionelle rettelser
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fsziiscbfdduuuhfpfet.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzemlpc2NiZmRkdXV1aGZwZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTQ2MDcsImV4cCI6MjA4MzY5MDYwN30.OmVvoCMh17Yh0FaGo4vhd_7ihEtDtD422Rad2XaqyE0'
);

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STYLES (Original)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

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
    const { data } = await supabase.from('profiles').select('id, email, name, role, permissions, phone, title, active').eq('id', userId).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSection('dashboard');
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, profile, logout }}>
      <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Inter', -apple-system, sans-serif" }}>
        {!user ? <LoginPage /> : (
          <>
            <Navigation section={section} setSection={setSection} />
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
              {section === 'dashboard' && <Dashboard setSection={setSection} />}
              {section === 'kunder' && <KunderSystem />}
              {section === 'projekter' && <ProjekterSystem />}
              {section === 'indstillinger' && profile?.role === 'admin' && <IndstillingerSystem />}
            </main>
          </>
        )}
      </div>
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING & LOGO (Original)
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
// NAVIGATION (Original topmenu)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Navigation({ section, setSection }) {
  const { profile, logout } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const menuItems = [
    { id: 'dashboard', label: 'Overblik', icon: '📊' },
    { id: 'kunder', label: 'Kunder', icon: '👥' },
    { id: 'projekter', label: 'Projekter', icon: '🔧' },
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
// LOGIN (Original)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
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
          <p style={{ color: COLORS.textLight, fontSize: 14 }}>Fra sol til stikkontakt – nemt og sikkert</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={STYLES.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={STYLES.input} placeholder="din@email.dk" required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={STYLES.label}>Adgangskode</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={STYLES.input} placeholder="••••••••" required />
          </div>
          {error && <div style={{ padding: 12, background: '#FEE2E2', color: COLORS.error, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ ...STYLES.primaryBtn, width: '100%', padding: 16, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logger ind...' : 'Log ind'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD (Original)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Dashboard({ setSection }) {
  const [stats, setStats] = useState({ customers: 0, projects: 0 });
  const { profile } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [customers, projects] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true })
    ]);
    setStats({ customers: customers.count || 0, projects: projects.count || 0 });
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Velkommen, {profile?.name || 'bruger'}</h1>
        <p style={{ color: COLORS.textLight, marginTop: 4 }}>Her er dit overblik</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
        <StatCard icon="👥" label="Kunder" value={stats.customers} onClick={() => setSection('kunder')} />
        <StatCard icon="🔧" label="Projekter" value={stats.projects} onClick={() => setSection('projekter')} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, onClick }) {
  return (
    <div onClick={onClick} style={{ ...STYLES.card, cursor: 'pointer', transition: 'transform 0.2s' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.primary }}>{value}</div>
      <div style={{ color: COLORS.textLight, fontSize: 14 }}>{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KUNDER SYSTEM
// Database: id, name, company, cvr, email, phone, address, zip, city, 
//           delivery_address, delivery_zip, delivery_city, notes, created_at
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function KunderSystem() {
  const [kunder, setKunder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingKunde, setEditingKunde] = useState(null);

  useEffect(() => { loadKunder(); }, []);

  const loadKunder = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, company, cvr, email, phone, address, zip, city, delivery_address, delivery_zip, delivery_city, notes, created_at')
      .order('created_at', { ascending: false });
    if (error) { alert('Fejl: ' + error.message); return; }
    setKunder(data || []);
  };

  const saveKunde = async (form) => {
    const payload = {
      name: form.name,
      company: form.company || null,
      cvr: form.cvr || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      zip: form.zip || null,
      city: form.city || null,
      delivery_address: form.delivery_address || null,
      delivery_zip: form.delivery_zip || null,
      delivery_city: form.delivery_city || null,
      notes: form.notes || null
    };

    if (editingKunde) {
      const { error } = await supabase.from('customers').update(payload).eq('id', editingKunde.id);
      if (error) { alert('Fejl: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('customers').insert([payload]);
      if (error) { alert('Fejl: ' + error.message); return; }
    }
    setShowModal(false);
    setEditingKunde(null);
    loadKunder();
  };

  const deleteKunde = async (id) => {
    if (!confirm('Slet denne kunde?')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) { alert('Fejl: ' + error.message); return; }
    loadKunder();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Kunder</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{kunder.length} kunder</p>
        </div>
        <button onClick={() => { setEditingKunde(null); setShowModal(true); }} style={STYLES.primaryBtn}>+ Ny kunde</button>
      </div>

      {kunder.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3>Ingen kunder endnu</h3>
          <button onClick={() => setShowModal(true)} style={{ ...STYLES.primaryBtn, marginTop: 16 }}>+ Opret kunde</button>
        </div>
      ) : (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: COLORS.bg }}>
              <th style={STYLES.th}>Navn</th>
              <th style={STYLES.th}>Email</th>
              <th style={STYLES.th}>Telefon</th>
              <th style={STYLES.th}>By</th>
              <th style={STYLES.th}></th>
            </tr></thead>
            <tbody>
              {kunder.map(k => (
                <tr key={k.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600 }}>{k.company || k.name}</div>
                    {k.company && <div style={{ fontSize: 12, color: COLORS.textLight }}>{k.name}</div>}
                  </td>
                  <td style={STYLES.td}>{k.email || '-'}</td>
                  <td style={STYLES.td}>{k.phone || '-'}</td>
                  <td style={STYLES.td}>{k.city || '-'}</td>
                  <td style={STYLES.td}>
                    <button onClick={() => { setEditingKunde(k); setShowModal(true); }} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', marginRight: 8 }}>Rediger</button>
                    <button onClick={() => deleteKunde(k.id)} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', color: COLORS.error }}>Slet</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingKunde ? 'Rediger kunde' : 'Ny kunde'} onClose={() => { setShowModal(false); setEditingKunde(null); }}>
          <KundeForm initial={editingKunde} onSave={saveKunde} onCancel={() => { setShowModal(false); setEditingKunde(null); }} />
        </Modal>
      )}
    </div>
  );
}

function KundeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    company: initial?.company || '',
    cvr: initial?.cvr || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
    zip: initial?.zip || '',
    city: initial?.city || '',
    delivery_address: initial?.delivery_address || '',
    delivery_zip: initial?.delivery_zip || '',
    delivery_city: initial?.delivery_city || '',
    notes: initial?.notes || ''
  });
  const [sameAddress, setSameAddress] = useState(!initial?.delivery_address);

  const handleSubmit = () => {
    if (!form.name) { alert('Navn er påkrævet'); return; }
    const saveData = {
      ...form,
      delivery_address: sameAddress ? form.address : form.delivery_address,
      delivery_zip: sameAddress ? form.zip : form.delivery_zip,
      delivery_city: sameAddress ? form.city : form.delivery_city
    };
    onSave(saveData);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Firmanavn</label>
          <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={STYLES.input} placeholder="Firma ApS (valgfrit)" />
        </div>
        <div>
          <label style={STYLES.label}>CVR</label>
          <input value={form.cvr} onChange={e => setForm({ ...form, cvr: e.target.value })} style={STYLES.input} placeholder="12345678" />
        </div>
      </div>
      <div>
        <label style={STYLES.label}>Kontaktperson / Navn *</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={STYLES.input} placeholder="Jens Jensen" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={STYLES.input} placeholder="email@eksempel.dk" />
        </div>
        <div>
          <label style={STYLES.label}>Telefon</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={STYLES.input} placeholder="12 34 56 78" />
        </div>
      </div>
      <div>
        <label style={STYLES.label}>Adresse</label>
        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={STYLES.input} placeholder="Vejnavn 123" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Postnr</label>
          <input value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} style={STYLES.input} placeholder="1234" />
        </div>
        <div>
          <label style={STYLES.label}>By</label>
          <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={STYLES.input} placeholder="København" />
        </div>
      </div>
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={sameAddress} onChange={e => setSameAddress(e.target.checked)} />
          <span style={{ fontSize: 14 }}>Leveringsadresse er samme som adresse</span>
        </label>
      </div>
      {!sameAddress && (
        <>
          <div>
            <label style={STYLES.label}>Leveringsadresse</label>
            <input value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} style={STYLES.input} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div>
              <label style={STYLES.label}>Postnr</label>
              <input value={form.delivery_zip} onChange={e => setForm({ ...form, delivery_zip: e.target.value })} style={STYLES.input} />
            </div>
            <div>
              <label style={STYLES.label}>By</label>
              <input value={form.delivery_city} onChange={e => setForm({ ...form, delivery_city: e.target.value })} style={STYLES.input} />
            </div>
          </div>
        </>
      )}
      <div>
        <label style={STYLES.label}>Noter</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...STYLES.input, minHeight: 80 }} placeholder="Evt. bemærkninger..." />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>{initial ? 'Gem ændringer' : 'Opret kunde'}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROJEKTER SYSTEM
// Database: id, customer_id, name, description, address, zip, city, status, created_at, updated_at
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ProjekterSystem() {
  const [projekter, setProjekter] = useState([]);
  const [kunder, setKunder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProjekt, setEditingProjekt] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [pRes, kRes] = await Promise.all([
      supabase.from('projects').select('id, customer_id, name, description, address, zip, city, status, created_at, customers(name, company)').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name, company')
    ]);
    if (pRes.error) { alert('Fejl: ' + pRes.error.message); return; }
    setProjekter(pRes.data || []);
    setKunder(kRes.data || []);
  };

  const saveProjekt = async (form) => {
    const payload = {
      customer_id: form.customer_id || null,
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      zip: form.zip || null,
      city: form.city || null,
      status: form.status || 'aktiv'
    };

    if (editingProjekt) {
      payload.updated_at = new Date().toISOString();
      const { error } = await supabase.from('projects').update(payload).eq('id', editingProjekt.id);
      if (error) { alert('Fejl: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('projects').insert([payload]);
      if (error) { alert('Fejl: ' + error.message); return; }
    }
    setShowModal(false);
    setEditingProjekt(null);
    loadData();
  };

  const deleteProjekt = async (id) => {
    if (!confirm('Slet dette projekt?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { alert('Fejl: ' + error.message); return; }
    loadData();
  };

  const statusColors = { aktiv: { bg: '#D1FAE5', color: '#059669' }, afsluttet: { bg: '#DBEAFE', color: '#1D4ED8' }, annulleret: { bg: '#FEE2E2', color: '#DC2626' } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Projekter</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{projekter.length} projekter</p>
        </div>
        <button onClick={() => { setEditingProjekt(null); setShowModal(true); }} style={STYLES.primaryBtn}>+ Nyt projekt</button>
      </div>

      {projekter.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
          <h3>Ingen projekter endnu</h3>
          <button onClick={() => setShowModal(true)} style={{ ...STYLES.primaryBtn, marginTop: 16 }}>+ Opret projekt</button>
        </div>
      ) : (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: COLORS.bg }}>
              <th style={STYLES.th}>Projekt</th>
              <th style={STYLES.th}>Kunde</th>
              <th style={STYLES.th}>Adresse</th>
              <th style={STYLES.th}>Status</th>
              <th style={STYLES.th}></th>
            </tr></thead>
            <tbody>
              {projekter.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: COLORS.textLight }}>{p.description}</div>}
                  </td>
                  <td style={STYLES.td}>{p.customers?.company || p.customers?.name || '-'}</td>
                  <td style={STYLES.td}>{p.city || p.address || '-'}</td>
                  <td style={STYLES.td}>
                    <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, background: statusColors[p.status]?.bg, color: statusColors[p.status]?.color }}>{p.status}</span>
                  </td>
                  <td style={STYLES.td}>
                    <button onClick={() => { setEditingProjekt(p); setShowModal(true); }} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', marginRight: 8 }}>Rediger</button>
                    <button onClick={() => deleteProjekt(p.id)} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', color: COLORS.error }}>Slet</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingProjekt ? 'Rediger projekt' : 'Nyt projekt'} onClose={() => { setShowModal(false); setEditingProjekt(null); }}>
          <ProjektForm initial={editingProjekt} kunder={kunder} onSave={saveProjekt} onCancel={() => { setShowModal(false); setEditingProjekt(null); }} />
        </Modal>
      )}
    </div>
  );
}

function ProjektForm({ initial, kunder, onSave, onCancel }) {
  const [form, setForm] = useState({
    customer_id: initial?.customer_id || '',
    name: initial?.name || '',
    description: initial?.description || '',
    address: initial?.address || '',
    zip: initial?.zip || '',
    city: initial?.city || '',
    status: initial?.status || 'aktiv'
  });

  const handleSubmit = () => {
    if (!form.name) { alert('Projektnavn er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={STYLES.label}>Kunde</label>
        <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} style={STYLES.select}>
          <option value="">Ingen kunde valgt</option>
          {kunder.map(k => <option key={k.id} value={k.id}>{k.company || k.name}</option>)}
        </select>
      </div>
      <div>
        <label style={STYLES.label}>Projektnavn *</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={STYLES.input} placeholder="F.eks. Solcelleanlæg Villa" />
      </div>
      <div>
        <label style={STYLES.label}>Beskrivelse</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...STYLES.input, minHeight: 80 }} placeholder="Kort beskrivelse..." />
      </div>
      <div>
        <label style={STYLES.label}>Projektadresse</label>
        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={STYLES.input} placeholder="Vejnavn 123" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Postnr</label>
          <input value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} style={STYLES.input} />
        </div>
        <div>
          <label style={STYLES.label}>By</label>
          <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={STYLES.input} />
        </div>
      </div>
      <div>
        <label style={STYLES.label}>Status</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={STYLES.select}>
          <option value="aktiv">Aktiv</option>
          <option value="afsluttet">Afsluttet</option>
          <option value="annulleret">Annulleret</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>{initial ? 'Gem ændringer' : 'Opret projekt'}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INDSTILLINGER SYSTEM (Brugere)
// Database: id, email, name, role, permissions, phone, title, active, created_at
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function IndstillingerSystem() {
  const [brugere, setBrugere] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBruger, setEditingBruger] = useState(null);

  useEffect(() => { loadBrugere(); }, []);

  const loadBrugere = async () => {
    const { data, error } = await supabase.from('profiles').select('id, email, name, role, permissions, phone, title, active, created_at').order('name');
    if (error) { console.error(error); return; }
    setBrugere(data || []);
  };

  const saveBruger = async (form) => {
    const { error } = await supabase.from('profiles').update({
      name: form.name,
      role: form.role,
      permissions: form.permissions,
      phone: form.phone,
      title: form.title,
      active: form.active
    }).eq('id', form.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    setShowModal(false);
    setEditingBruger(null);
    loadBrugere();
  };

  const createBruger = async (form) => {
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, role: form.role } }
    });
    if (error) { alert('Fejl: ' + error.message); return; }
    setTimeout(async () => {
      await supabase.from('profiles').update({ name: form.name, role: form.role, permissions: form.permissions, phone: form.phone, title: form.title, active: true }).eq('email', form.email);
      loadBrugere();
    }, 1000);
    setShowModal(false);
    alert(`Bruger oprettet!\n\nEmail: ${form.email}\nAdgangskode: ${form.password}`);
  };

  const roleLabels = { admin: '👑 Administrator', saelger: '💼 Sælger', montoer: '🔧 Montør', elev: '📚 Elev' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Indstillinger</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>Brugere og administration</p>
        </div>
        <button onClick={() => { setEditingBruger(null); setShowModal(true); }} style={STYLES.primaryBtn}>+ Ny bruger</button>
      </div>

      <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: COLORS.bg }}>
            <th style={STYLES.th}>Navn</th>
            <th style={STYLES.th}>Email</th>
            <th style={STYLES.th}>Rolle</th>
            <th style={STYLES.th}>Status</th>
            <th style={STYLES.th}></th>
          </tr></thead>
          <tbody>
            {brugere.map(b => (
              <tr key={b.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                <td style={STYLES.td}>
                  <div style={{ fontWeight: 600 }}>{b.name || b.email}</div>
                  {b.title && <div style={{ fontSize: 12, color: COLORS.textLight }}>{b.title}</div>}
                </td>
                <td style={STYLES.td}>{b.email}</td>
                <td style={STYLES.td}>{roleLabels[b.role] || b.role}</td>
                <td style={STYLES.td}>
                  <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, background: b.active ? '#D1FAE5' : '#FEE2E2', color: b.active ? '#059669' : '#DC2626' }}>
                    {b.active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td style={STYLES.td}>
                  <button onClick={() => { setEditingBruger(b); setShowModal(true); }} style={{ ...STYLES.secondaryBtn, padding: '6px 12px' }}>Rediger</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingBruger ? 'Rediger bruger' : 'Ny bruger'} onClose={() => { setShowModal(false); setEditingBruger(null); }}>
          <BrugerForm initial={editingBruger} onSave={editingBruger ? saveBruger : createBruger} onCancel={() => { setShowModal(false); setEditingBruger(null); }} isEdit={!!editingBruger} />
        </Modal>
      )}
    </div>
  );
}

function BrugerForm({ initial, onSave, onCancel, isEdit }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    email: initial?.email || '',
    name: initial?.name || '',
    role: initial?.role || 'saelger',
    permissions: initial?.permissions || [],
    phone: initial?.phone || '',
    title: initial?.title || '',
    active: initial?.active !== false,
    password: ''
  });

  const allPermissions = [
    { id: 'kunder_se', label: 'Se kunder' },
    { id: 'kunder_opret', label: 'Oprette kunder' },
    { id: 'kunder_rediger', label: 'Redigere kunder' },
    { id: 'projekter_se', label: 'Se projekter' },
    { id: 'projekter_opret', label: 'Oprette projekter' },
    { id: 'projekter_rediger', label: 'Redigere projekter' },
  ];

  const togglePermission = (permId) => {
    if (form.permissions.includes(permId)) {
      setForm({ ...form, permissions: form.permissions.filter(p => p !== permId) });
    } else {
      setForm({ ...form, permissions: [...form.permissions, permId] });
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    setForm({ ...form, password: Array(12).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('') });
  };

  const handleSubmit = () => {
    if (!isEdit && !form.email) { alert('Email er påkrævet'); return; }
    if (!isEdit && !form.password) { alert('Adgangskode er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={STYLES.label}>Email *</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={STYLES.input} disabled={isEdit} placeholder="email@eksempel.dk" />
      </div>
      {!isEdit && (
        <div>
          <label style={STYLES.label}>Adgangskode *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ ...STYLES.input, flex: 1 }} placeholder="Min. 6 tegn" />
            <button type="button" onClick={generatePassword} style={STYLES.secondaryBtn}>Generer</button>
          </div>
        </div>
      )}
      <div>
        <label style={STYLES.label}>Navn</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={STYLES.input} placeholder="Jens Jensen" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Titel</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={STYLES.input} placeholder="F.eks. Salgschef" />
        </div>
        <div>
          <label style={STYLES.label}>Telefon</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={STYLES.input} placeholder="12 34 56 78" />
        </div>
      </div>
      <div>
        <label style={STYLES.label}>Rolle</label>
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={STYLES.select}>
          <option value="saelger">Sælger</option>
          <option value="montoer">Montør</option>
          <option value="elev">Elev</option>
          <option value="admin">Administrator</option>
        </select>
      </div>
      {form.role !== 'admin' && (
        <div style={{ background: COLORS.bg, padding: 16, borderRadius: 8 }}>
          <label style={{ ...STYLES.label, marginBottom: 12 }}>Rettigheder</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {allPermissions.map(perm => (
              <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                {perm.label}
              </label>
            ))}
          </div>
        </div>
      )}
      {form.role === 'admin' && (
        <div style={{ background: '#DBEAFE', padding: 12, borderRadius: 8, fontSize: 14, color: '#1D4ED8' }}>
          Administratorer har automatisk fuld adgang.
        </div>
      )}
      {isEdit && (
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            <span style={{ fontWeight: 500 }}>Bruger er aktiv</span>
          </label>
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>{isEdit ? 'Gem ændringer' : 'Opret bruger'}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MODAL (Original)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: COLORS.textLight }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
