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
  const [selectedProjektId, setSelectedProjektId] = useState(null);

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

  const navigateToProjekt = (projektId) => {
    setSelectedProjektId(projektId);
    setSection('projekter');
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, profile, logout }}>
      <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Inter', -apple-system, sans-serif" }}>
        {!user ? <LoginPage /> : (
          <>
            <Navigation section={section} setSection={(s) => { setSection(s); setSelectedProjektId(null); }} />
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
              {section === 'dashboard' && <Dashboard setSection={setSection} />}
              {section === 'kunder' && <KunderSystem onNavigateToProjekt={navigateToProjekt} />}
              {section === 'projekter' && <ProjekterSystem initialProjektId={selectedProjektId} onProjektOpened={() => setSelectedProjektId(null)} />}
              {section === 'pakker' && (profile?.role === 'admin' || profile?.role === 'saelger' || profile?.role === 'serviceleder') && <PakkerSystem />}
              {section === 'katalog' && (profile?.role === 'admin' || profile?.role === 'saelger' || profile?.role === 'serviceleder') && <VarekatalogSystem />}
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
  const canManage = profile?.role === 'admin' || profile?.role === 'saelger' || profile?.role === 'serviceleder';
  
  const menuItems = [
    { id: 'dashboard', label: 'Overblik', icon: '📊' },
    { id: 'kunder', label: 'Kunder', icon: '👥' },
    { id: 'projekter', label: 'Projekter', icon: '🔧' },
    { id: 'pakker', label: 'Pakker', icon: '📦', managerOnly: true },
    { id: 'katalog', label: 'Varekatalog', icon: '🏷️', managerOnly: true },
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
            (!item.adminOnly || isAdmin) && (!item.managerOnly || canManage) && (
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

function KunderSystem({ onNavigateToProjekt }) {
  const [kunder, setKunder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingKunde, setEditingKunde] = useState(null);
  const [selectedKunde, setSelectedKunde] = useState(null);
  const [kundeProjekter, setKundeProjekter] = useState([]);
  
  // Søgning, filtrering, sortering
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState('alle'); // alle, med-email, uden-email
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => { loadKunder(); }, []);

  const loadKunder = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, company, cvr, email, phone, address, zip, city, delivery_address, delivery_zip, delivery_city, notes, created_at')
      .order('created_at', { ascending: false });
    if (error) { alert('Fejl: ' + error.message); return; }
    setKunder(data || []);
  };

  const loadKundeProjekter = async (kundeId) => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description, address, city, status, created_at')
      .eq('customer_id', kundeId)
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setKundeProjekter(data || []);
  };

  const selectKunde = (kunde) => {
    setSelectedKunde(kunde);
    loadKundeProjekter(kunde.id);
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
    if (selectedKunde?.id === id) setSelectedKunde(null);
    loadKunder();
  };

  // Filtrering
  let filteredKunder = kunder.filter(k => {
    if (filterBy === 'med-email' && !k.email) return false;
    if (filterBy === 'uden-email' && k.email) return false;
    return true;
  });

  // Søgning
  if (search.trim()) {
    const s = search.toLowerCase();
    filteredKunder = filteredKunder.filter(k => 
      (k.name || '').toLowerCase().includes(s) ||
      (k.company || '').toLowerCase().includes(s) ||
      (k.email || '').toLowerCase().includes(s) ||
      (k.phone || '').includes(s) ||
      (k.city || '').toLowerCase().includes(s) ||
      (k.cvr || '').includes(s)
    );
  }

  // Sortering
  filteredKunder = [...filteredKunder].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === 'name') {
      aVal = (a.company || a.name || '').toLowerCase();
      bVal = (b.company || b.name || '').toLowerCase();
    } else if (sortBy === 'city') {
      aVal = (a.city || '').toLowerCase();
      bVal = (b.city || '').toLowerCase();
    } else if (sortBy === 'email') {
      aVal = (a.email || '').toLowerCase();
      bVal = (b.email || '').toLowerCase();
    } else {
      aVal = a.created_at || '';
      bVal = b.created_at || '';
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ column, children }) => (
    <th style={{ ...STYLES.th, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort(column)}>
      {children} {sortBy === column && (sortDir === 'asc' ? '↑' : '↓')}
    </th>
  );

  // Hvis en kunde er valgt, vis kundedetaljer
  if (selectedKunde) {
    return (
      <div>
        <button onClick={() => setSelectedKunde(null)} style={{ ...STYLES.secondaryBtn, marginBottom: 24 }}>← Tilbage til kunder</button>
        
        <div style={{ ...STYLES.card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{selectedKunde.company || selectedKunde.name}</h1>
              {selectedKunde.company && <p style={{ color: COLORS.textLight, marginTop: 4 }}>{selectedKunde.name}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditingKunde(selectedKunde); setShowModal(true); }} style={STYLES.secondaryBtn}>Rediger</button>
              <button onClick={() => deleteKunde(selectedKunde.id)} style={{ ...STYLES.secondaryBtn, color: COLORS.error }}>Slet</button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>KONTAKT</div>
              {selectedKunde.email && <div style={{ marginBottom: 4 }}>📧 {selectedKunde.email}</div>}
              {selectedKunde.phone && <div>📞 {selectedKunde.phone}</div>}
              {!selectedKunde.email && !selectedKunde.phone && <div style={{ color: COLORS.textLight }}>Ingen kontaktinfo</div>}
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>ADRESSE</div>
              {selectedKunde.address && <div>{selectedKunde.address}</div>}
              {(selectedKunde.zip || selectedKunde.city) && <div>{selectedKunde.zip} {selectedKunde.city}</div>}
              {!selectedKunde.address && !selectedKunde.city && <div style={{ color: COLORS.textLight }}>Ingen adresse</div>}
            </div>
            {selectedKunde.cvr && (
              <div>
                <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>CVR</div>
                <div>{selectedKunde.cvr}</div>
              </div>
            )}
          </div>
          
          {selectedKunde.notes && (
            <div style={{ marginTop: 24, padding: 16, background: COLORS.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>NOTER</div>
              <div>{selectedKunde.notes}</div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Projekter ({kundeProjekter.length})</h2>
        </div>

        {kundeProjekter.length === 0 ? (
          <div style={{ ...STYLES.card, textAlign: 'center', padding: 32, color: COLORS.textLight }}>
            Ingen projekter for denne kunde
          </div>
        ) : (
          <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Projekt</th>
                <th style={STYLES.th}>Adresse</th>
                <th style={STYLES.th}>Status</th>
                <th style={STYLES.th}>Oprettet</th>
              </tr></thead>
              <tbody>
                {kundeProjekter.map(p => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => onNavigateToProjekt && onNavigateToProjekt(p.id)}>
                    <td style={STYLES.td}>
                      <div style={{ fontWeight: 600, color: COLORS.primary }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: 12, color: COLORS.textLight }}>{p.description}</div>}
                    </td>
                    <td style={STYLES.td}>{p.city || p.address || '-'}</td>
                    <td style={STYLES.td}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: 4, fontSize: 12,
                        background: p.status === 'aktiv' ? '#D1FAE5' : p.status === 'afsluttet' ? '#DBEAFE' : '#FEE2E2',
                        color: p.status === 'aktiv' ? '#059669' : p.status === 'afsluttet' ? '#1D4ED8' : '#DC2626'
                      }}>{p.status}</span>
                    </td>
                    <td style={STYLES.td}>{new Date(p.created_at).toLocaleDateString('da-DK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <Modal title="Rediger kunde" onClose={() => { setShowModal(false); setEditingKunde(null); }}>
            <KundeForm initial={editingKunde} onSave={(form) => { saveKunde(form); setSelectedKunde({ ...selectedKunde, ...form }); }} onCancel={() => { setShowModal(false); setEditingKunde(null); }} />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Kunder</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{filteredKunder.length} af {kunder.length} kunder</p>
        </div>
        <button onClick={() => { setEditingKunde(null); setShowModal(true); }} style={STYLES.primaryBtn}>+ Ny kunde</button>
      </div>

      {/* Søgning og filtrering */}
      <div style={{ ...STYLES.card, marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="🔍 Søg efter navn, firma, email, telefon, by eller CVR..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={STYLES.input}
            />
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <select value={filterBy} onChange={e => setFilterBy(e.target.value)} style={STYLES.select}>
              <option value="alle">Alle kunder</option>
              <option value="med-email">Med email</option>
              <option value="uden-email">Uden email</option>
            </select>
          </div>
        </div>
      </div>

      {kunder.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3>Ingen kunder endnu</h3>
          <button onClick={() => setShowModal(true)} style={{ ...STYLES.primaryBtn, marginTop: 16 }}>+ Opret kunde</button>
        </div>
      ) : filteredKunder.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48, color: COLORS.textLight }}>
          Ingen kunder matcher søgningen
        </div>
      ) : (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: COLORS.bg }}>
              <SortHeader column="name">Navn</SortHeader>
              <SortHeader column="email">Email</SortHeader>
              <th style={STYLES.th}>Telefon</th>
              <SortHeader column="city">By</SortHeader>
              <th style={STYLES.th}></th>
            </tr></thead>
            <tbody>
              {filteredKunder.map(k => (
                <tr key={k.id} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => selectKunde(k)}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600, color: COLORS.primary }}>{k.company || k.name}</div>
                    {k.company && <div style={{ fontSize: 12, color: COLORS.textLight }}>{k.name}</div>}
                  </td>
                  <td style={STYLES.td}>{k.email || '-'}</td>
                  <td style={STYLES.td}>{k.phone || '-'}</td>
                  <td style={STYLES.td}>{k.city || '-'}</td>
                  <td style={STYLES.td} onClick={e => e.stopPropagation()}>
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

function ProjekterSystem({ initialProjektId, onProjektOpened }) {
  const { user, profile } = useAuth();
  const [projekter, setProjekter] = useState([]);
  const [kunder, setKunder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProjekt, setEditingProjekt] = useState(null);
  const [selectedProjekt, setSelectedProjekt] = useState(null);
  const [projektFiler, setProjektFiler] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Tilbud state
  const [tilbud, setTilbud] = useState([]);
  const [showTilbudModal, setShowTilbudModal] = useState(false);
  const [editingTilbud, setEditingTilbud] = useState(null);
  const [selectedTilbud, setSelectedTilbud] = useState(null);
  const [tilbudLinjer, setTilbudLinjer] = useState([]);
  const [showLinjeModal, setShowLinjeModal] = useState(false);
  const [editingLinje, setEditingLinje] = useState(null);
  const [showPakkeVaelger, setShowPakkeVaelger] = useState(false);
  const [showProduktVaelger, setShowProduktVaelger] = useState(false);
  const [marginSettings, setMarginSettings] = useState(null);

  // Søgning, filtrering, sortering
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('alle'); // alle, aktiv, afsluttet, annulleret
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Rettigheder: admin, sælger og serviceleder har skriveadgang
  const canManage = profile?.role === 'admin' || profile?.role === 'saelger' || profile?.role === 'serviceleder';

  useEffect(() => { loadData(); }, []);

  // Håndter navigation fra kundesiden
  useEffect(() => {
    if (initialProjektId && projekter.length > 0) {
      const projekt = projekter.find(p => p.id === initialProjektId);
      if (projekt) {
        setSelectedProjekt(projekt);
        loadProjektFiler(initialProjektId);
        loadTilbud(initialProjektId);
        if (onProjektOpened) onProjektOpened();
      }
    }
  }, [initialProjektId, projekter]);

  // Load filer og tilbud når projekt vælges
  useEffect(() => {
    if (selectedProjekt) {
      loadProjektFiler(selectedProjekt.id);
      loadTilbud(selectedProjekt.id);
    }
  }, [selectedProjekt?.id]);

  // Load linjer når tilbud vælges
  useEffect(() => {
    if (selectedTilbud) {
      loadTilbudLinjer(selectedTilbud.id);
    }
  }, [selectedTilbud?.id]);

  const loadData = async () => {
    const [pRes, kRes, mRes] = await Promise.all([
      supabase.from('projects').select('id, customer_id, name, description, address, zip, city, status, created_at, customers(id, name, company, email, phone)').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name, company'),
      supabase.from('margin_settings').select('*').limit(1).single()
    ]);
    if (pRes.error) { alert('Fejl: ' + pRes.error.message); return; }
    setProjekter(pRes.data || []);
    setKunder(kRes.data || []);
    if (mRes.data) setMarginSettings(mRes.data);
  };

  const loadProjektFiler = async (projektId) => {
    const { data, error } = await supabase
      .from('project_files')
      .select('id, file_name, file_path, file_size, file_type, uploaded_by, created_at, profiles(name)')
      .eq('project_id', projektId)
      .order('created_at', { ascending: false });
    if (error) { console.error('Fejl ved load af filer:', error); return; }
    setProjektFiler(data || []);
  };

  const uploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProjekt) return;

    setUploadingFile(true);
    try {
      // Upload til storage
      const filePath = `${selectedProjekt.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Gem metadata i database
      const { error: dbError } = await supabase.from('project_files').insert([{
        project_id: selectedProjekt.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user?.id
      }]);

      if (dbError) throw dbError;

      loadProjektFiler(selectedProjekt.id);
    } catch (err) {
      alert('Fejl ved upload: ' + err.message);
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  const downloadFile = async (fil) => {
    const { data, error } = await supabase.storage
      .from('project-files')
      .download(fil.file_path);

    if (error) { alert('Fejl ved download: ' + error.message); return; }

    // Opret download link
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fil.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteFile = async (fil) => {
    if (!confirm(`Slet "${fil.file_name}"?`)) return;

    try {
      // Slet fra storage
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([fil.file_path]);

      if (storageError) throw storageError;

      // Slet fra database
      const { error: dbError } = await supabase
        .from('project_files')
        .delete()
        .eq('id', fil.id);

      if (dbError) throw dbError;

      loadProjektFiler(selectedProjekt.id);
    } catch (err) {
      alert('Fejl ved sletning: ' + err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (!type) return '📄';
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📘';
    if (type.includes('sheet') || type.includes('excel')) return '📗';
    return '📄';
  };

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // TILBUD FUNKTIONER
  // ═══════════════════════════════════════════════════════════════════════════════════════

  const loadTilbud = async (projektId) => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('project_id', projektId)
      .order('created_at', { ascending: false });
    if (error) { console.error('Fejl ved load af tilbud:', error); return; }
    setTilbud(data || []);
  };

  const loadTilbudLinjer = async (tilbudId) => {
    const { data, error } = await supabase
      .from('quote_lines')
      .select('*')
      .eq('quote_id', tilbudId)
      .order('sort_order');
    if (error) { console.error('Fejl ved load af linjer:', error); return; }
    setTilbudLinjer(data || []);
  };

  const saveTilbud = async (form) => {
    const payload = {
      project_id: selectedProjekt.id,
      title: form.title,
      description: form.description || null,
      total_price: parseFloat(form.total_price) || 0,
      status: form.status || 'kladde',
      show_lines: form.show_lines !== false,
      updated_at: new Date().toISOString()
    };

    let tilbudId = editingTilbud?.id;

    if (editingTilbud) {
      const { error } = await supabase.from('quotes').update(payload).eq('id', editingTilbud.id);
      if (error) { alert('Fejl: ' + error.message); return; }
    } else {
      const { data, error } = await supabase.from('quotes').insert([payload]).select();
      if (error) { alert('Fejl: ' + error.message); return; }
      tilbudId = data[0].id;
      
      // Hvis der er valgt pakkelinjer, kopier dem
      if (form.packageLines && form.packageLines.length > 0) {
        const linesToInsert = form.packageLines.map((l, i) => ({
          quote_id: tilbudId,
          type: l.type,
          title: l.title,
          quantity: l.quantity,
          cost_price: l.cost_price,
          sale_price: l.sale_price,
          show_on_quote: true,
          sort_order: i
        }));
        await supabase.from('quote_lines').insert(linesToInsert);
      }
    }
    setShowTilbudModal(false);
    setEditingTilbud(null);
    loadTilbud(selectedProjekt.id);
  };

  const saveTilbudLinje = async (form) => {
    const payload = {
      quote_id: selectedTilbud.id,
      product_id: form.product_id || null,
      type: form.type || 'materiale',
      title: form.title,
      quantity: parseFloat(form.quantity) || 1,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      show_on_quote: form.show_on_quote !== false,
      sort_order: form.sort_order || tilbudLinjer.length
    };

    if (editingLinje) {
      const { error } = await supabase.from('quote_lines').update(payload).eq('id', editingLinje.id);
      if (error) { alert('Fejl: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('quote_lines').insert([payload]);
      if (error) { alert('Fejl: ' + error.message); return; }
    }
    setShowLinjeModal(false);
    setEditingLinje(null);
    loadTilbudLinjer(selectedTilbud.id);
    updateTilbudTotals();
  };

  // Tilføj linje fra varekatalog
  const addProduktTilLinje = async (produkt) => {
    const payload = {
      quote_id: selectedTilbud.id,
      product_id: produkt.id,
      type: produkt.type,
      title: produkt.title,
      quantity: 1,
      cost_price: produkt.cost_price,
      sale_price: produkt.sale_price,
      show_on_quote: true,
      sort_order: tilbudLinjer.length
    };
    const { error } = await supabase.from('quote_lines').insert([payload]);
    if (error) { alert('Fejl: ' + error.message); return; }
    setShowProduktVaelger(false);
    loadTilbudLinjer(selectedTilbud.id);
    updateTilbudTotals();
  };

  const deleteTilbudLinje = async (linje) => {
    if (!confirm(`Slet "${linje.title}"?`)) return;
    const { error } = await supabase.from('quote_lines').delete().eq('id', linje.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    loadTilbudLinjer(selectedTilbud.id);
    updateTilbudTotals();
  };

  const updateTilbudTotals = async () => {
    setTimeout(async () => {
      const { data } = await supabase.from('quote_lines').select('quantity, sale_price').eq('quote_id', selectedTilbud.id);
      const total = (data || []).reduce((sum, l) => sum + (l.quantity * l.sale_price), 0);
      await supabase.from('quotes').update({ total_price: total, updated_at: new Date().toISOString() }).eq('id', selectedTilbud.id);
      loadTilbud(selectedProjekt.id);
      setSelectedTilbud(prev => prev ? { ...prev, total_price: total } : null);
    }, 100);
  };

  const insertPakkeLinjer = async (pakkeId) => {
    const { data: lines } = await supabase.from('package_lines').select('*').eq('package_id', pakkeId).order('sort_order');
    if (!lines || lines.length === 0) return;
    
    const linesToInsert = lines.map((l, i) => ({
      quote_id: selectedTilbud.id,
      product_id: l.product_id || null,
      type: l.type,
      title: l.title,
      quantity: l.quantity,
      cost_price: l.cost_price,
      sale_price: l.sale_price,
      show_on_quote: true,
      sort_order: tilbudLinjer.length + i
    }));
    await supabase.from('quote_lines').insert(linesToInsert);
    setShowPakkeVaelger(false);
    loadTilbudLinjer(selectedTilbud.id);
    updateTilbudTotals();
  };

  const toggleShowLines = async () => {
    const newValue = !selectedTilbud.show_lines;
    await supabase.from('quotes').update({ show_lines: newValue }).eq('id', selectedTilbud.id);
    setSelectedTilbud({ ...selectedTilbud, show_lines: newValue });
    loadTilbud(selectedProjekt.id);
  };

  const deleteTilbud = async (t) => {
    if (!confirm(`Slet tilbud "${t.title}"?`)) return;
    const { error } = await supabase.from('quotes').delete().eq('id', t.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    if (selectedTilbud?.id === t.id) setSelectedTilbud(null);
    loadTilbud(selectedProjekt.id);
  };

  // Beregninger
  const calcTilbudTotals = (linjer) => {
    const totalKost = linjer.reduce((sum, l) => sum + (l.quantity * l.cost_price), 0);
    const totalSalg = linjer.reduce((sum, l) => sum + (l.quantity * l.sale_price), 0);
    const dbKr = totalSalg - totalKost;
    const dbPct = totalSalg > 0 ? (dbKr / totalSalg) * 100 : 0;
    return { totalKost, totalSalg, dbKr, dbPct };
  };

  // Beregn DB for enkelt linje
  const calcLinjeDB = (l) => {
    const kost = l.quantity * l.cost_price;
    const salg = l.quantity * l.sale_price;
    const dbKr = salg - kost;
    const dbPct = salg > 0 ? (dbKr / salg) * 100 : 0;
    return { kost, salg, dbKr, dbPct };
  };

  // Hent minimum margin for type
  const getMinMargin = (type) => {
    if (!marginSettings) return 25;
    switch(type) {
      case 'materiale': return marginSettings.min_margin_materiale || 20;
      case 'timer': return marginSettings.min_margin_timer || 30;
      case 'ydelse': return marginSettings.min_margin_ydelse || 25;
      default: return marginSettings.min_margin_global || 25;
    }
  };

  // Farve baseret på margin
  const getMarginColor = (dbPct, type = null) => {
    const minMargin = type ? getMinMargin(type) : (marginSettings?.min_margin_global || 25);
    const warning = marginSettings?.warning_threshold || 5;
    
    if (dbPct < minMargin) return { bg: '#FEE2E2', color: '#DC2626' }; // Rød
    if (dbPct < minMargin + warning) return { bg: '#FEF3C7', color: '#D97706' }; // Gul
    return { bg: '#D1FAE5', color: '#059669' }; // Grøn
  };

  // Check om tilbud er under minimum
  const isUnderMinimum = (dbPct) => {
    const minMargin = marginSettings?.min_margin_global || 25;
    return dbPct < minMargin;
  };

  const typeLabels = { materiale: '🔩 Materiale', timer: '⏱️ Timer', ydelse: '📋 Ydelse' };
  const typeColors = { materiale: '#3B82F6', timer: '#F59E0B', ydelse: '#8B5CF6' };

  const downloadTilbudPDF = async (t) => {
    // Hent linjer for PDF (kun dem med show_on_quote)
    const { data: linjer } = await supabase.from('quote_lines').select('*').eq('quote_id', t.id).eq('show_on_quote', true).order('sort_order');
    const kunde = selectedProjekt.customers;
    const showLines = t.show_lines && linjer && linjer.length > 0;
    
    // Generer linjer HTML
    const linjerHtml = showLines ? `
      <div class="section">
        <div class="label">SPECIFIKATION</div>
        <table class="lines-table">
          <thead>
            <tr>
              <th style="text-align: left;">Beskrivelse</th>
              <th style="text-align: right; width: 60px;">Antal</th>
              <th style="text-align: right; width: 100px;">Pris</th>
              <th style="text-align: right; width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${linjer.map(l => `
              <tr>
                <td>${l.title}</td>
                <td style="text-align: right;">${l.quantity}</td>
                <td style="text-align: right;">${Number(l.sale_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
                <td style="text-align: right;">${(l.quantity * l.sale_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tilbud - ${t.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1E3A5F; border-bottom: 2px solid #1E3A5F; padding-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .label { color: #666; font-size: 12px; margin-bottom: 4px; }
          .value { font-size: 14px; }
          .price { font-size: 24px; font-weight: bold; color: #059669; }
          .description { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 8px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
          .status-kladde { background: #FEF3C7; color: #92400E; }
          .status-sendt { background: #DBEAFE; color: #1D4ED8; }
          .status-accepteret { background: #D1FAE5; color: #059669; }
          .status-afvist { background: #FEE2E2; color: #DC2626; }
          .lines-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .lines-table th, .lines-table td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 13px; }
          .lines-table th { background: #f5f5f5; font-weight: 600; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TILBUD</h1>
          <div class="section">
            <div class="label">TILBUDSNUMMER</div>
            <div class="value">${t.id.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="label">KUNDE</div>
          <div class="value">${kunde?.company || kunde?.name || 'Ingen kunde'}</div>
          ${kunde?.name && kunde?.company ? `<div class="value">${kunde.name}</div>` : ''}
          ${kunde?.email ? `<div class="value">${kunde.email}</div>` : ''}
          ${kunde?.phone ? `<div class="value">${kunde.phone}</div>` : ''}
        </div>
        
        <div class="section">
          <div class="label">PROJEKT</div>
          <div class="value">${selectedProjekt.name}</div>
          ${selectedProjekt.address ? `<div class="value">${selectedProjekt.address}, ${selectedProjekt.zip || ''} ${selectedProjekt.city || ''}</div>` : ''}
        </div>
        
        <div class="section">
          <div class="label">TILBUD</div>
          <div class="value" style="font-size: 18px; font-weight: bold;">${t.title}</div>
        </div>
        
        ${t.description ? `
        <div class="section">
          <div class="label">BESKRIVELSE</div>
          <div class="description">${t.description}</div>
        </div>
        ` : ''}
        
        ${linjerHtml}
        
        <div class="section" style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #1E3A5F;">
          <div class="label">TOTALPRIS ${showLines ? '(INKL. MOMS)' : ''}</div>
          <div class="price">${Number(t.total_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
        </div>
        
        <div class="footer">
          <div>Dato: ${new Date(t.created_at).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div>EltaSolar • CVR: XXXXXXXX</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const tilbudStatusColors = {
    kladde: { bg: '#FEF3C7', color: '#92400E' },
    sendt: { bg: '#DBEAFE', color: '#1D4ED8' },
    accepteret: { bg: '#D1FAE5', color: '#059669' },
    afvist: { bg: '#FEE2E2', color: '#DC2626' }
  };

  const tilbudStatusLabels = {
    kladde: 'Kladde',
    sendt: 'Sendt',
    accepteret: 'Accepteret',
    afvist: 'Afvist'
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
    if (selectedProjekt?.id === id) setSelectedProjekt(null);
    loadData();
  };

  const statusColors = { aktiv: { bg: '#D1FAE5', color: '#059669' }, afsluttet: { bg: '#DBEAFE', color: '#1D4ED8' }, annulleret: { bg: '#FEE2E2', color: '#DC2626' } };
  const statusLabels = { aktiv: 'Aktiv', afsluttet: 'Afsluttet', annulleret: 'Annulleret' };

  // Filtrering
  let filteredProjekter = projekter.filter(p => {
    if (filterStatus !== 'alle' && p.status !== filterStatus) return false;
    return true;
  });

  // Søgning
  if (search.trim()) {
    const s = search.toLowerCase();
    filteredProjekter = filteredProjekter.filter(p => 
      (p.name || '').toLowerCase().includes(s) ||
      (p.description || '').toLowerCase().includes(s) ||
      (p.address || '').toLowerCase().includes(s) ||
      (p.city || '').toLowerCase().includes(s) ||
      (p.customers?.name || '').toLowerCase().includes(s) ||
      (p.customers?.company || '').toLowerCase().includes(s)
    );
  }

  // Sortering
  filteredProjekter = [...filteredProjekter].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === 'name') {
      aVal = (a.name || '').toLowerCase();
      bVal = (b.name || '').toLowerCase();
    } else if (sortBy === 'kunde') {
      aVal = (a.customers?.company || a.customers?.name || '').toLowerCase();
      bVal = (b.customers?.company || b.customers?.name || '').toLowerCase();
    } else if (sortBy === 'city') {
      aVal = (a.city || '').toLowerCase();
      bVal = (b.city || '').toLowerCase();
    } else if (sortBy === 'status') {
      aVal = a.status || '';
      bVal = b.status || '';
    } else {
      aVal = a.created_at || '';
      bVal = b.created_at || '';
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ column, children }) => (
    <th style={{ ...STYLES.th, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort(column)}>
      {children} {sortBy === column && (sortDir === 'asc' ? '↑' : '↓')}
    </th>
  );

  // Tilbud-detaljevisning
  if (selectedTilbud && selectedProjekt) {
    const totals = calcTilbudTotals(tilbudLinjer);
    const marginColor = getMarginColor(totals.dbPct);
    const underMinimum = isUnderMinimum(totals.dbPct);
    
    return (
      <div>
        <button onClick={() => setSelectedTilbud(null)} style={{ ...STYLES.secondaryBtn, marginBottom: 24 }}>← Tilbage til projekt</button>
        
        {/* Advarsel hvis under minimum */}
        {canManage && underMinimum && (
          <div style={{ 
            background: '#FEE2E2', 
            border: '1px solid #FECACA', 
            borderRadius: 8, 
            padding: 16, 
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#DC2626' }}>Dette tilbud er under minimum dækningsbidrag</div>
              <div style={{ fontSize: 13, color: '#B91C1C' }}>
                Nuværende: {totals.dbPct.toFixed(1)}% | Minimum: {marginSettings?.min_margin_global || 25}%
              </div>
            </div>
          </div>
        )}
        
        <div style={{ ...STYLES.card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{selectedTilbud.title}</h1>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ 
                  padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                  background: tilbudStatusColors[selectedTilbud.status]?.bg,
                  color: tilbudStatusColors[selectedTilbud.status]?.color
                }}>{tilbudStatusLabels[selectedTilbud.status]}</span>
                <span style={{ fontSize: 13, color: COLORS.textLight }}>Projekt: {selectedProjekt.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => downloadTilbudPDF(selectedTilbud)} style={STYLES.secondaryBtn}>📄 Download PDF</button>
              {canManage && (
                <>
                  <button onClick={() => { setEditingTilbud(selectedTilbud); setShowTilbudModal(true); }} style={STYLES.secondaryBtn}>Rediger info</button>
                  <button onClick={() => deleteTilbud(selectedTilbud)} style={{ ...STYLES.secondaryBtn, color: COLORS.error }}>Slet</button>
                </>
              )}
            </div>
          </div>
          {selectedTilbud.description && (
            <p style={{ color: COLORS.textLight, marginTop: 16, whiteSpace: 'pre-wrap' }}>{selectedTilbud.description}</p>
          )}
        </div>

        {/* Økonomi-overblik - KUN for managers */}
        {canManage ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{ ...STYLES.card, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>KOSTPRIS</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{totals.totalKost.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
            </div>
            <div style={{ ...STYLES.card, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>SALGSPRIS</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{totals.totalSalg.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
            </div>
            <div style={{ ...STYLES.card, textAlign: 'center', background: marginColor.bg }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>DB (KR.)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: marginColor.color }}>{totals.dbKr.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
            </div>
            <div style={{ ...STYLES.card, textAlign: 'center', background: marginColor.bg }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>DB (%)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: marginColor.color }}>{totals.dbPct.toFixed(1)}%</div>
              <div style={{ fontSize: 10, color: COLORS.textLight, marginTop: 2 }}>Min: {marginSettings?.min_margin_global || 25}%</div>
            </div>
          </div>
        ) : (
          /* Kun salgspris for montør/elev */
          <div style={{ ...STYLES.card, marginBottom: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>TOTALPRIS</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{totals.totalSalg.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
          </div>
        )}

        {/* Vis linjer toggle */}
        {canManage && (
          <div style={{ ...STYLES.card, marginBottom: 24, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Vis linjer på PDF til kunde</strong>
              <div style={{ fontSize: 13, color: COLORS.textLight }}>Når slået fra vises kun totalpris på PDF</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedTilbud.show_lines !== false} onChange={toggleShowLines} />
              <span>{selectedTilbud.show_lines !== false ? 'Vis linjer' : 'Kun total'}</span>
            </label>
          </div>
        )}

        {/* Linjer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Linjer ({tilbudLinjer.length})</h2>
          {canManage && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowProduktVaelger(true)} style={STYLES.secondaryBtn}>🏷️ Fra katalog</button>
              <button onClick={() => setShowPakkeVaelger(true)} style={STYLES.secondaryBtn}>📦 Indsæt pakke</button>
              <button onClick={() => { setEditingLinje(null); setShowLinjeModal(true); }} style={STYLES.primaryBtn}>+ Tilføj linje</button>
            </div>
          )}
        </div>

        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          {tilbudLinjer.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: COLORS.textLight }}>
              Ingen linjer endnu. Tilføj materialer, timer eller ydelser.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Type</th>
                <th style={STYLES.th}>Beskrivelse</th>
                <th style={{ ...STYLES.th, textAlign: 'right' }}>Antal</th>
                {canManage && <th style={{ ...STYLES.th, textAlign: 'right' }}>Kost</th>}
                <th style={{ ...STYLES.th, textAlign: 'right' }}>Salg</th>
                <th style={{ ...STYLES.th, textAlign: 'right' }}>Total</th>
                {canManage && <th style={{ ...STYLES.th, textAlign: 'right' }}>DB %</th>}
                <th style={{ ...STYLES.th, textAlign: 'center' }}>Vis</th>
                {canManage && <th style={STYLES.th}></th>}
              </tr></thead>
              <tbody>
                {tilbudLinjer.map(l => {
                  const linjeDB = calcLinjeDB(l);
                  const linjeMarginColor = getMarginColor(linjeDB.dbPct, l.type);
                  return (
                    <tr key={l.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td style={STYLES.td}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${typeColors[l.type]}20`, color: typeColors[l.type] }}>
                          {typeLabels[l.type]}
                        </span>
                      </td>
                      <td style={STYLES.td}>{l.title}</td>
                      <td style={{ ...STYLES.td, textAlign: 'right' }}>{l.quantity}</td>
                      {canManage && <td style={{ ...STYLES.td, textAlign: 'right' }}>{Number(l.cost_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>}
                      <td style={{ ...STYLES.td, textAlign: 'right' }}>{Number(l.sale_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
                      <td style={{ ...STYLES.td, textAlign: 'right', fontWeight: 600 }}>{(l.quantity * l.sale_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
                      {canManage && (
                        <td style={{ ...STYLES.td, textAlign: 'right' }}>
                          <span style={{ 
                            padding: '2px 6px', 
                            borderRadius: 4, 
                            fontSize: 11, 
                            fontWeight: 600,
                            background: linjeMarginColor.bg, 
                            color: linjeMarginColor.color 
                          }}>
                            {linjeDB.dbPct.toFixed(1)}%
                          </span>
                        </td>
                      )}
                      <td style={{ ...STYLES.td, textAlign: 'center' }}>{l.show_on_quote ? '✓' : '–'}</td>
                      {canManage && (
                        <td style={STYLES.td}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => { setEditingLinje(l); setShowLinjeModal(true); }} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 12 }}>Ret</button>
                            <button onClick={() => deleteTilbudLinje(l)} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 12, color: COLORS.error }}>Slet</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {showTilbudModal && (
          <Modal title="Rediger tilbud" onClose={() => { setShowTilbudModal(false); setEditingTilbud(null); }}>
            <TilbudInfoForm initial={editingTilbud} onSave={saveTilbud} onCancel={() => { setShowTilbudModal(false); setEditingTilbud(null); }} />
          </Modal>
        )}

        {showLinjeModal && (
          <Modal title={editingLinje ? 'Rediger linje' : 'Tilføj linje'} onClose={() => { setShowLinjeModal(false); setEditingLinje(null); }}>
            <TilbudLinjeForm initial={editingLinje} onSave={saveTilbudLinje} onCancel={() => { setShowLinjeModal(false); setEditingLinje(null); }} />
          </Modal>
        )}

        {showPakkeVaelger && (
          <Modal title="Indsæt pakke" onClose={() => setShowPakkeVaelger(false)}>
            <PakkeVaelger onSelect={insertPakkeLinjer} onCancel={() => setShowPakkeVaelger(false)} />
          </Modal>
        )}

        {showProduktVaelger && (
          <Modal title="Tilføj fra varekatalog" onClose={() => setShowProduktVaelger(false)}>
            <ProduktVaelger onSelect={addProduktTilLinje} onCancel={() => setShowProduktVaelger(false)} />
          </Modal>
        )}
      </div>
    );
  }

  // Projekt-detaljevisning
  if (selectedProjekt) {
    const kunde = selectedProjekt.customers;
    return (
      <div>
        <button onClick={() => setSelectedProjekt(null)} style={{ ...STYLES.secondaryBtn, marginBottom: 24 }}>← Tilbage til projekter</button>
        
        <div style={{ ...STYLES.card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{selectedProjekt.name}</h1>
                <span style={{ 
                  padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: statusColors[selectedProjekt.status]?.bg,
                  color: statusColors[selectedProjekt.status]?.color
                }}>{statusLabels[selectedProjekt.status]}</span>
              </div>
              {selectedProjekt.description && <p style={{ color: COLORS.textLight, marginTop: 8 }}>{selectedProjekt.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditingProjekt(selectedProjekt); setShowModal(true); }} style={STYLES.secondaryBtn}>Rediger</button>
              <button onClick={() => deleteProjekt(selectedProjekt.id)} style={{ ...STYLES.secondaryBtn, color: COLORS.error }}>Slet</button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>PROJEKTADRESSE</div>
              {selectedProjekt.address && <div>{selectedProjekt.address}</div>}
              {(selectedProjekt.zip || selectedProjekt.city) && <div>{selectedProjekt.zip} {selectedProjekt.city}</div>}
              {!selectedProjekt.address && !selectedProjekt.city && <div style={{ color: COLORS.textLight }}>Ingen adresse</div>}
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>OPRETTET</div>
              <div>{new Date(selectedProjekt.created_at).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Kunde-info */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Kunde</h2>
        </div>

        {kunde ? (
          <div style={{ ...STYLES.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{kunde.company || kunde.name}</div>
                {kunde.company && <div style={{ color: COLORS.textLight, marginTop: 2 }}>{kunde.name}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
              {kunde.email && (
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textLight }}>EMAIL</div>
                  <div>📧 {kunde.email}</div>
                </div>
              )}
              {kunde.phone && (
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textLight }}>TELEFON</div>
                  <div>📞 {kunde.phone}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ ...STYLES.card, textAlign: 'center', padding: 32, color: COLORS.textLight }}>
            Ingen kunde tilknyttet dette projekt
          </div>
        )}

        {/* Dokumenter */}
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Dokumenter ({projektFiler.length})</h2>
        </div>

        <div style={{ ...STYLES.card }}>
          {/* Upload sektion - kun for admin/sælger */}
          {canManage && (
            <div style={{ marginBottom: projektFiler.length > 0 ? 20 : 0 }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8,
                padding: 16,
                border: `2px dashed ${COLORS.border}`,
                borderRadius: 12,
                cursor: uploadingFile ? 'wait' : 'pointer',
                background: COLORS.bg,
                transition: 'border-color 0.2s'
              }}>
                <input 
                  type="file" 
                  onChange={uploadFile} 
                  disabled={uploadingFile}
                  style={{ display: 'none' }} 
                />
                {uploadingFile ? (
                  <span style={{ color: COLORS.textLight }}>Uploader...</span>
                ) : (
                  <>
                    <span style={{ fontSize: 20 }}>📎</span>
                    <span style={{ color: COLORS.primary, fontWeight: 500 }}>Klik for at uploade fil</span>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Fil-liste */}
          {projektFiler.length === 0 ? (
            <div style={{ textAlign: 'center', padding: canManage ? 16 : 32, color: COLORS.textLight }}>
              Ingen dokumenter uploadet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projektFiler.map(fil => (
                <div key={fil.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 12,
                  background: COLORS.bg,
                  borderRadius: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 24 }}>{getFileIcon(fil.file_type)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fil.file_name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textLight }}>
                        {formatFileSize(fil.file_size)} • {new Date(fil.created_at).toLocaleDateString('da-DK')}
                        {fil.profiles?.name && ` • ${fil.profiles.name}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => downloadFile(fil)} 
                      style={{ ...STYLES.secondaryBtn, padding: '6px 12px' }}
                    >
                      Download
                    </button>
                    {canManage && (
                      <button 
                        onClick={() => deleteFile(fil)} 
                        style={{ ...STYLES.secondaryBtn, padding: '6px 12px', color: COLORS.error }}
                      >
                        Slet
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tilbud sektion */}
        <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>🧾 Tilbud ({tilbud.length})</h2>
          {canManage && (
            <button onClick={() => { setEditingTilbud(null); setShowTilbudModal(true); }} style={STYLES.primaryBtn}>+ Opret tilbud</button>
          )}
        </div>

        <div style={{ ...STYLES.card }}>
          {tilbud.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: COLORS.textLight }}>
              Ingen tilbud på dette projekt
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tilbud.map(t => (
                <div key={t.id} style={{ 
                  padding: 16,
                  background: COLORS.bg,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  cursor: 'pointer'
                }} onClick={() => setSelectedTilbud(t)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, color: COLORS.primary }}>{t.title}</div>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '2px 8px', 
                        borderRadius: 4, 
                        fontSize: 11, 
                        fontWeight: 600,
                        marginTop: 4,
                        background: tilbudStatusColors[t.status]?.bg,
                        color: tilbudStatusColors[t.status]?.color
                      }}>{tilbudStatusLabels[t.status]}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
                        {Number(t.total_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textLight }}>
                        {new Date(t.created_at).toLocaleDateString('da-DK')}
                      </div>
                    </div>
                  </div>
                  {t.description && (
                    <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 12, whiteSpace: 'pre-wrap' }}>
                      {t.description.length > 150 ? t.description.slice(0, 150) + '...' : t.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedTilbud(t)} style={{ ...STYLES.primaryBtn, padding: '6px 12px' }}>
                      Se detaljer / Linjer
                    </button>
                    <button onClick={() => downloadTilbudPDF(t)} style={{ ...STYLES.secondaryBtn, padding: '6px 12px' }}>
                      📄 PDF
                    </button>
                    {canManage && (
                      <>
                        <button onClick={() => deleteTilbud(t)} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', color: COLORS.error }}>
                          Slet
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <Modal title="Rediger projekt" onClose={() => { setShowModal(false); setEditingProjekt(null); }}>
            <ProjektForm initial={editingProjekt} kunder={kunder} onSave={(form) => { saveProjekt(form); loadData().then(() => { const updated = projekter.find(p => p.id === selectedProjekt.id); if (updated) setSelectedProjekt(updated); }); }} onCancel={() => { setShowModal(false); setEditingProjekt(null); }} />
          </Modal>
        )}

        {showTilbudModal && (
          <Modal title={editingTilbud ? 'Rediger tilbud' : 'Nyt tilbud'} onClose={() => { setShowTilbudModal(false); setEditingTilbud(null); }}>
            <TilbudForm initial={editingTilbud} onSave={saveTilbud} onCancel={() => { setShowTilbudModal(false); setEditingTilbud(null); }} />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Projekter</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{filteredProjekter.length} af {projekter.length} projekter</p>
        </div>
        <button onClick={() => { setEditingProjekt(null); setShowModal(true); }} style={STYLES.primaryBtn}>+ Nyt projekt</button>
      </div>

      {/* Søgning og filtrering */}
      <div style={{ ...STYLES.card, marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="🔍 Søg efter projektnavn, adresse, by eller kundenavn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={STYLES.input}
            />
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={STYLES.select}>
              <option value="alle">Alle status</option>
              <option value="aktiv">Aktive</option>
              <option value="afsluttet">Afsluttede</option>
              <option value="annulleret">Annullerede</option>
            </select>
          </div>
        </div>
      </div>

      {projekter.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
          <h3>Ingen projekter endnu</h3>
          <button onClick={() => setShowModal(true)} style={{ ...STYLES.primaryBtn, marginTop: 16 }}>+ Opret projekt</button>
        </div>
      ) : filteredProjekter.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48, color: COLORS.textLight }}>
          Ingen projekter matcher søgningen
        </div>
      ) : (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: COLORS.bg }}>
              <SortHeader column="name">Projekt</SortHeader>
              <SortHeader column="kunde">Kunde</SortHeader>
              <SortHeader column="city">Adresse</SortHeader>
              <SortHeader column="status">Status</SortHeader>
              <th style={STYLES.th}></th>
            </tr></thead>
            <tbody>
              {filteredProjekter.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => setSelectedProjekt(p)}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600, color: COLORS.primary }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: COLORS.textLight }}>{p.description}</div>}
                  </td>
                  <td style={STYLES.td}>{p.customers?.company || p.customers?.name || '-'}</td>
                  <td style={STYLES.td}>{p.city || p.address || '-'}</td>
                  <td style={STYLES.td}>
                    <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, background: statusColors[p.status]?.bg, color: statusColors[p.status]?.color }}>{p.status}</span>
                  </td>
                  <td style={STYLES.td} onClick={e => e.stopPropagation()}>
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
// TILBUD FORM (Opret nyt tilbud med evt. pakke-linjer)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function TilbudForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    title: initial?.title || '',
    description: initial?.description || '',
    total_price: initial?.total_price || '',
    status: initial?.status || 'kladde',
    show_lines: initial?.show_lines !== false,
    packageLines: []
  });
  const [showPakkeModal, setShowPakkeModal] = useState(false);
  const [pakker, setPakker] = useState([]);

  useEffect(() => {
    loadPakker();
  }, []);

  const loadPakker = async () => {
    const { data } = await supabase
      .from('quote_packages')
      .select('*')
      .eq('active', true)
      .order('title');
    setPakker(data || []);
  };

  const selectPakke = async (pakke) => {
    // Hent pakke-linjer
    const { data: lines } = await supabase.from('package_lines').select('*').eq('package_id', pakke.id).order('sort_order');
    setForm({
      ...form,
      title: pakke.title,
      description: pakke.description || '',
      total_price: pakke.default_price || '',
      packageLines: lines || []
    });
    setShowPakkeModal(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) { alert('Titel er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {!initial && (
        <div style={{ background: '#F0F9FF', padding: 12, borderRadius: 8, border: '1px dashed #0EA5E9' }}>
          <button onClick={() => setShowPakkeModal(true)} style={{ ...STYLES.secondaryBtn, width: '100%', background: 'white' }}>
            📦 Start fra pakkebibliotek
          </button>
          {form.packageLines.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#059669' }}>✓ {form.packageLines.length} linjer vil blive kopieret fra pakke</div>
          )}
        </div>
      )}
      <div>
        <label style={STYLES.label}>Titel *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={STYLES.input} placeholder="F.eks. Solcelleanlæg 10kW" />
      </div>
      <div>
        <label style={STYLES.label}>Beskrivelse</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...STYLES.input, minHeight: 80, resize: 'vertical' }} placeholder="Detaljeret beskrivelse..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Totalpris (kr.)</label>
          <input type="number" value={form.total_price} onChange={e => setForm({ ...form, total_price: e.target.value })} style={STYLES.input} placeholder="0.00" step="0.01" min="0" />
        </div>
        <div>
          <label style={STYLES.label}>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={STYLES.select}>
            <option value="kladde">Kladde</option>
            <option value="sendt">Sendt</option>
            <option value="accepteret">Accepteret</option>
            <option value="afvist">Afvist</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>{initial ? 'Gem ændringer' : 'Opret tilbud'}</button>
      </div>

      {showPakkeModal && (
        <Modal title="Vælg pakke" onClose={() => setShowPakkeModal(false)}>
          {pakker.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: COLORS.textLight }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <p>Ingen aktive pakker</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflow: 'auto' }}>
              {pakker.map(p => (
                <div key={p.id} onClick={() => selectPakke(p)} style={{ padding: 16, background: COLORS.bg, borderRadius: 8, cursor: 'pointer', border: `1px solid ${COLORS.border}` }}
                  onMouseOver={e => e.currentTarget.style.borderColor = COLORS.primary}
                  onMouseOut={e => e.currentTarget.style.borderColor = COLORS.border}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontWeight: 700, color: COLORS.primary }}>{Number(p.default_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function TilbudInfoForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    title: initial?.title || '',
    description: initial?.description || '',
    total_price: initial?.total_price || '',
    status: initial?.status || 'kladde',
    show_lines: initial?.show_lines !== false
  });

  const handleSubmit = () => {
    if (!form.title.trim()) { alert('Titel er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={STYLES.label}>Titel *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={STYLES.input} />
      </div>
      <div>
        <label style={STYLES.label}>Beskrivelse</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...STYLES.input, minHeight: 80 }} />
      </div>
      <div>
        <label style={STYLES.label}>Status</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={STYLES.select}>
          <option value="kladde">Kladde</option>
          <option value="sendt">Sendt</option>
          <option value="accepteret">Accepteret</option>
          <option value="afvist">Afvist</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>Gem</button>
      </div>
    </div>
  );
}

function TilbudLinjeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    type: initial?.type || 'materiale',
    title: initial?.title || '',
    quantity: initial?.quantity || 1,
    cost_price: initial?.cost_price || '',
    sale_price: initial?.sale_price || '',
    show_on_quote: initial?.show_on_quote !== false,
    sort_order: initial?.sort_order || 0
  });

  const handleSubmit = () => {
    if (!form.title.trim()) { alert('Beskrivelse er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={STYLES.label}>Type</label>
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={STYLES.select}>
          <option value="materiale">🔩 Materiale</option>
          <option value="timer">⏱️ Timer</option>
          <option value="ydelse">📋 Ydelse</option>
        </select>
      </div>
      <div>
        <label style={STYLES.label}>Beskrivelse *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={STYLES.input} placeholder="F.eks. Solpaneler 400W" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Antal</label>
          <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={STYLES.input} min="0" step="0.01" />
        </div>
        <div>
          <label style={STYLES.label}>Kostpris</label>
          <input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} style={STYLES.input} min="0" step="0.01" />
        </div>
        <div>
          <label style={STYLES.label}>Salgspris</label>
          <input type="number" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} style={STYLES.input} min="0" step="0.01" />
        </div>
      </div>
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.show_on_quote} onChange={e => setForm({ ...form, show_on_quote: e.target.checked })} />
          <span style={{ fontWeight: 500 }}>Vis linje på tilbud til kunde</span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>{initial ? 'Gem' : 'Tilføj'}</button>
      </div>
    </div>
  );
}

function PakkeVaelger({ onSelect, onCancel }) {
  const [pakker, setPakker] = useState([]);

  useEffect(() => {
    loadPakker();
  }, []);

  const loadPakker = async () => {
    const { data } = await supabase.from('quote_packages').select('*').eq('active', true).order('title');
    setPakker(data || []);
  };

  return (
    <div>
      {pakker.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: COLORS.textLight }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <p>Ingen aktive pakker</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflow: 'auto' }}>
          {pakker.map(p => (
            <div key={p.id} onClick={() => onSelect(p.id)} style={{ padding: 16, background: COLORS.bg, borderRadius: 8, cursor: 'pointer', border: `1px solid ${COLORS.border}` }}
              onMouseOver={e => e.currentTarget.style.borderColor = COLORS.primary}
              onMouseOut={e => e.currentTarget.style.borderColor = COLORS.border}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontWeight: 700, color: COLORS.primary }}>{Number(p.default_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
              </div>
              {p.description && <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4 }}>{p.description.slice(0, 80)}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PAKKER SYSTEM (Pakkebibliotek)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function PakkerSystem() {
  const [pakker, setPakker] = useState([]);
  const [selectedPakke, setSelectedPakke] = useState(null);
  const [pakkeLinjer, setPakkeLinjer] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLinjeModal, setShowLinjeModal] = useState(false);
  const [showProduktModal, setShowProduktModal] = useState(false);
  const [editingPakke, setEditingPakke] = useState(null);
  const [editingLinje, setEditingLinje] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAktiv, setFilterAktiv] = useState('aktiv');

  useEffect(() => { loadPakker(); }, []);

  useEffect(() => {
    if (selectedPakke) loadPakkeLinjer(selectedPakke.id);
  }, [selectedPakke?.id]);

  const loadPakker = async () => {
    const { data, error } = await supabase
      .from('quote_packages')
      .select('*')
      .order('title');
    if (error) { console.error(error); return; }
    setPakker(data || []);
  };

  const loadPakkeLinjer = async (pakkeId) => {
    const { data, error } = await supabase
      .from('package_lines')
      .select('*')
      .eq('package_id', pakkeId)
      .order('sort_order');
    if (error) { console.error(error); return; }
    setPakkeLinjer(data || []);
  };

  const savePakke = async (form) => {
    const payload = {
      title: form.title,
      description: form.description || null,
      default_price: parseFloat(form.default_price) || 0,
      active: form.active !== false
    };

    if (editingPakke) {
      const { error } = await supabase.from('quote_packages').update(payload).eq('id', editingPakke.id);
      if (error) { alert('Fejl: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('quote_packages').insert([payload]);
      if (error) { alert('Fejl: ' + error.message); return; }
    }
    setShowModal(false);
    setEditingPakke(null);
    loadPakker();
    if (selectedPakke && editingPakke?.id === selectedPakke.id) {
      setSelectedPakke({ ...selectedPakke, ...payload });
    }
  };

  const saveLinje = async (form) => {
    const payload = {
      package_id: selectedPakke.id,
      product_id: form.product_id || null,
      type: form.type || 'materiale',
      title: form.title,
      quantity: parseFloat(form.quantity) || 1,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      sort_order: form.sort_order || pakkeLinjer.length
    };

    if (editingLinje) {
      const { error } = await supabase.from('package_lines').update(payload).eq('id', editingLinje.id);
      if (error) { alert('Fejl: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('package_lines').insert([payload]);
      if (error) { alert('Fejl: ' + error.message); return; }
    }
    setShowLinjeModal(false);
    setEditingLinje(null);
    loadPakkeLinjer(selectedPakke.id);
    updatePakkePrice();
  };

  // Tilføj linje fra varekatalog
  const addProduktLinje = async (produkt) => {
    const payload = {
      package_id: selectedPakke.id,
      product_id: produkt.id,
      type: produkt.type,
      title: produkt.title,
      quantity: 1,
      cost_price: produkt.cost_price,
      sale_price: produkt.sale_price,
      sort_order: pakkeLinjer.length
    };
    const { error } = await supabase.from('package_lines').insert([payload]);
    if (error) { alert('Fejl: ' + error.message); return; }
    setShowProduktModal(false);
    loadPakkeLinjer(selectedPakke.id);
    updatePakkePrice();
  };

  const deleteLinje = async (linje) => {
    if (!confirm(`Slet "${linje.title}"?`)) return;
    const { error } = await supabase.from('package_lines').delete().eq('id', linje.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    loadPakkeLinjer(selectedPakke.id);
    updatePakkePrice();
  };

  const updatePakkePrice = async () => {
    setTimeout(async () => {
      const { data } = await supabase.from('package_lines').select('quantity, sale_price').eq('package_id', selectedPakke.id);
      const total = (data || []).reduce((sum, l) => sum + (l.quantity * l.sale_price), 0);
      await supabase.from('quote_packages').update({ default_price: total }).eq('id', selectedPakke.id);
      loadPakker();
    }, 100);
  };

  const deletePakke = async (pakke) => {
    if (!confirm(`Slet pakken "${pakke.title}"?`)) return;
    const { error } = await supabase.from('quote_packages').delete().eq('id', pakke.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    if (selectedPakke?.id === pakke.id) setSelectedPakke(null);
    loadPakker();
  };

  const toggleAktiv = async (pakke) => {
    const { error } = await supabase.from('quote_packages').update({ active: !pakke.active }).eq('id', pakke.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    loadPakker();
    if (selectedPakke?.id === pakke.id) setSelectedPakke({ ...selectedPakke, active: !pakke.active });
  };

  // Beregninger
  const calcTotals = (linjer) => {
    const totalKost = linjer.reduce((sum, l) => sum + (l.quantity * l.cost_price), 0);
    const totalSalg = linjer.reduce((sum, l) => sum + (l.quantity * l.sale_price), 0);
    const dbKr = totalSalg - totalKost;
    const dbPct = totalSalg > 0 ? (dbKr / totalSalg) * 100 : 0;
    return { totalKost, totalSalg, dbKr, dbPct };
  };

  const typeLabels = { materiale: '🔩 Materiale', timer: '⏱️ Timer', ydelse: '📋 Ydelse' };
  const typeColors = { materiale: '#3B82F6', timer: '#F59E0B', ydelse: '#8B5CF6' };

  // Filtrering
  let filteredPakker = pakker.filter(p => {
    if (filterAktiv === 'aktiv' && !p.active) return false;
    if (filterAktiv === 'inaktiv' && p.active) return false;
    return true;
  });
  if (search.trim()) {
    const s = search.toLowerCase();
    filteredPakker = filteredPakker.filter(p =>
      (p.title || '').toLowerCase().includes(s) ||
      (p.description || '').toLowerCase().includes(s)
    );
  }

  // Detaljevisning
  if (selectedPakke) {
    const totals = calcTotals(pakkeLinjer);
    return (
      <div>
        <button onClick={() => setSelectedPakke(null)} style={{ ...STYLES.secondaryBtn, marginBottom: 16 }}>← Tilbage til oversigt</button>
        
        <div style={{ ...STYLES.card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{selectedPakke.title}</h1>
              <span style={{ 
                display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                background: selectedPakke.active ? '#D1FAE5' : '#FEE2E2',
                color: selectedPakke.active ? '#059669' : '#DC2626'
              }}>{selectedPakke.active ? 'Aktiv' : 'Inaktiv'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleAktiv(selectedPakke)} style={STYLES.secondaryBtn}>
                {selectedPakke.active ? 'Deaktiver' : 'Aktiver'}
              </button>
              <button onClick={() => { setEditingPakke(selectedPakke); setShowModal(true); }} style={STYLES.secondaryBtn}>Rediger info</button>
            </div>
          </div>
          {selectedPakke.description && (
            <p style={{ color: COLORS.textLight, marginTop: 16, whiteSpace: 'pre-wrap' }}>{selectedPakke.description}</p>
          )}
        </div>

        {/* Totaler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ ...STYLES.card, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>KOSTPRIS</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{totals.totalKost.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
          </div>
          <div style={{ ...STYLES.card, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>SALGSPRIS</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{totals.totalSalg.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
          </div>
          <div style={{ ...STYLES.card, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>DB (KR.)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: totals.dbKr >= 0 ? '#059669' : '#DC2626' }}>{totals.dbKr.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</div>
          </div>
          <div style={{ ...STYLES.card, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>DB (%)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: totals.dbPct >= 0 ? '#059669' : '#DC2626' }}>{totals.dbPct.toFixed(1)}%</div>
          </div>
        </div>

        {/* Linjer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Linjer ({pakkeLinjer.length})</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowProduktModal(true)} style={STYLES.secondaryBtn}>🏷️ Fra katalog</button>
            <button onClick={() => { setEditingLinje(null); setShowLinjeModal(true); }} style={STYLES.primaryBtn}>+ Tilføj linje</button>
          </div>
        </div>

        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          {pakkeLinjer.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: COLORS.textLight }}>
              Ingen linjer endnu. Tilføj materialer, timer eller ydelser.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: COLORS.bg }}>
                <th style={STYLES.th}>Type</th>
                <th style={STYLES.th}>Beskrivelse</th>
                <th style={{ ...STYLES.th, textAlign: 'right' }}>Antal</th>
                <th style={{ ...STYLES.th, textAlign: 'right' }}>Kost</th>
                <th style={{ ...STYLES.th, textAlign: 'right' }}>Salg</th>
                <th style={{ ...STYLES.th, textAlign: 'right' }}>Total</th>
                <th style={STYLES.th}></th>
              </tr></thead>
              <tbody>
                {pakkeLinjer.map(l => (
                  <tr key={l.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={STYLES.td}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${typeColors[l.type]}20`, color: typeColors[l.type] }}>
                        {typeLabels[l.type]}
                      </span>
                    </td>
                    <td style={STYLES.td}>{l.title}</td>
                    <td style={{ ...STYLES.td, textAlign: 'right' }}>{l.quantity}</td>
                    <td style={{ ...STYLES.td, textAlign: 'right' }}>{Number(l.cost_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
                    <td style={{ ...STYLES.td, textAlign: 'right' }}>{Number(l.sale_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
                    <td style={{ ...STYLES.td, textAlign: 'right', fontWeight: 600 }}>{(l.quantity * l.sale_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
                    <td style={STYLES.td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { setEditingLinje(l); setShowLinjeModal(true); }} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 12 }}>Ret</button>
                        <button onClick={() => deleteLinje(l)} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 12, color: COLORS.error }}>Slet</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <Modal title="Rediger pakke" onClose={() => { setShowModal(false); setEditingPakke(null); }}>
            <PakkeInfoForm initial={editingPakke} onSave={savePakke} onCancel={() => { setShowModal(false); setEditingPakke(null); }} />
          </Modal>
        )}

        {showLinjeModal && (
          <Modal title={editingLinje ? 'Rediger linje' : 'Tilføj linje'} onClose={() => { setShowLinjeModal(false); setEditingLinje(null); }}>
            <LinjeForm initial={editingLinje} onSave={saveLinje} onCancel={() => { setShowLinjeModal(false); setEditingLinje(null); }} />
          </Modal>
        )}

        {showProduktModal && (
          <Modal title="Tilføj fra varekatalog" onClose={() => setShowProduktModal(false)}>
            <ProduktVaelger onSelect={addProduktLinje} onCancel={() => setShowProduktModal(false)} />
          </Modal>
        )}
      </div>
    );
  }

  // Listevisning
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>📦 Pakkebibliotek</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{filteredPakker.length} af {pakker.length} pakker</p>
        </div>
        <button onClick={() => { setEditingPakke(null); setShowModal(true); }} style={STYLES.primaryBtn}>+ Ny pakke</button>
      </div>

      <div style={{ ...STYLES.card, marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input type="text" placeholder="🔍 Søg efter pakkenavn..." value={search} onChange={e => setSearch(e.target.value)} style={STYLES.input} />
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <select value={filterAktiv} onChange={e => setFilterAktiv(e.target.value)} style={STYLES.select}>
              <option value="alle">Alle</option>
              <option value="aktiv">Aktive</option>
              <option value="inaktiv">Inaktive</option>
            </select>
          </div>
        </div>
      </div>

      {pakker.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3>Ingen pakker endnu</h3>
          <p style={{ color: COLORS.textLight }}>Opret standardpakker med materialer, timer og ydelser</p>
          <button onClick={() => setShowModal(true)} style={{ ...STYLES.primaryBtn, marginTop: 16 }}>+ Opret pakke</button>
        </div>
      ) : filteredPakker.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48, color: COLORS.textLight }}>Ingen pakker matcher</div>
      ) : (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: COLORS.bg }}>
              <th style={STYLES.th}>Pakke</th>
              <th style={{ ...STYLES.th, textAlign: 'right' }}>Salgspris</th>
              <th style={STYLES.th}>Status</th>
              <th style={STYLES.th}></th>
            </tr></thead>
            <tbody>
              {filteredPakker.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => setSelectedPakke(p)}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600, color: COLORS.primary }}>{p.title}</div>
                    {p.description && <div style={{ fontSize: 12, color: COLORS.textLight }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '...' : ''}</div>}
                  </td>
                  <td style={{ ...STYLES.td, textAlign: 'right', fontWeight: 600 }}>{Number(p.default_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</td>
                  <td style={STYLES.td}>
                    <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, background: p.active ? '#D1FAE5' : '#FEE2E2', color: p.active ? '#059669' : '#DC2626' }}>
                      {p.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td style={STYLES.td} onClick={e => e.stopPropagation()}>
                    <button onClick={() => deletePakke(p)} style={{ ...STYLES.secondaryBtn, padding: '6px 12px', color: COLORS.error }}>Slet</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingPakke ? 'Rediger pakke' : 'Ny pakke'} onClose={() => { setShowModal(false); setEditingPakke(null); }}>
          <PakkeInfoForm initial={editingPakke} onSave={savePakke} onCancel={() => { setShowModal(false); setEditingPakke(null); }} />
        </Modal>
      )}
    </div>
  );
}

function PakkeInfoForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    title: initial?.title || '',
    description: initial?.description || '',
    default_price: initial?.default_price || 0,
    active: initial?.active !== false
  });

  const handleSubmit = () => {
    if (!form.title.trim()) { alert('Titel er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={STYLES.label}>Pakkenavn *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={STYLES.input} placeholder="F.eks. Solcelleanlæg 10kW" />
      </div>
      <div>
        <label style={STYLES.label}>Beskrivelse</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...STYLES.input, minHeight: 80, resize: 'vertical' }} placeholder="Kort beskrivelse..." />
      </div>
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          <span style={{ fontWeight: 500 }}>Pakke er aktiv</span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>{initial ? 'Gem' : 'Opret'}</button>
      </div>
    </div>
  );
}

function LinjeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    type: initial?.type || 'materiale',
    title: initial?.title || '',
    quantity: initial?.quantity || 1,
    cost_price: initial?.cost_price || '',
    sale_price: initial?.sale_price || '',
    sort_order: initial?.sort_order || 0
  });

  const handleSubmit = () => {
    if (!form.title.trim()) { alert('Beskrivelse er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={STYLES.label}>Type</label>
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={STYLES.select}>
          <option value="materiale">🔩 Materiale</option>
          <option value="timer">⏱️ Timer</option>
          <option value="ydelse">📋 Ydelse</option>
        </select>
      </div>
      <div>
        <label style={STYLES.label}>Beskrivelse *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={STYLES.input} placeholder="F.eks. Solpaneler 400W" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Antal</label>
          <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={STYLES.input} min="0" step="0.01" />
        </div>
        <div>
          <label style={STYLES.label}>Kostpris (kr.)</label>
          <input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} style={STYLES.input} min="0" step="0.01" placeholder="0.00" />
        </div>
        <div>
          <label style={STYLES.label}>Salgspris (kr.)</label>
          <input type="number" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} style={STYLES.input} min="0" step="0.01" placeholder="0.00" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>{initial ? 'Gem' : 'Tilføj'}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VAREKATALOG SYSTEM (Produkter og timer)
// Database: id, sku, title, type, unit, cost_price, sale_price, category, active, created_at
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function VarekatalogSystem() {
  const [produkter, setProdukter] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProdukt, setEditingProdukt] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('alle');
  const [filterKategori, setFilterKategori] = useState('alle');
  const [filterAktiv, setFilterAktiv] = useState('aktiv');

  useEffect(() => { loadProdukter(); }, []);

  const loadProdukter = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('title');
    if (error) { console.error(error); return; }
    setProdukter(data || []);
  };

  const saveProdukt = async (form) => {
    const payload = {
      sku: form.sku || null,
      title: form.title,
      type: form.type || 'materiale',
      unit: form.unit || 'stk',
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      category: form.category || null,
      active: form.active !== false
    };

    if (editingProdukt) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProdukt.id);
      if (error) { alert('Fejl: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) { alert('Fejl: ' + error.message); return; }
    }
    setShowModal(false);
    setEditingProdukt(null);
    loadProdukter();
  };

  const deleteProdukt = async (produkt) => {
    if (!confirm(`Slet "${produkt.title}"?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', produkt.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    loadProdukter();
  };

  const toggleAktiv = async (produkt) => {
    const { error } = await supabase.from('products').update({ active: !produkt.active }).eq('id', produkt.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    loadProdukter();
  };

  // Kategorier fra data
  const kategorier = [...new Set(produkter.filter(p => p.category).map(p => p.category))].sort();

  // Filtrering
  let filteredProdukter = produkter.filter(p => {
    if (filterAktiv === 'aktiv' && !p.active) return false;
    if (filterAktiv === 'inaktiv' && p.active) return false;
    if (filterType !== 'alle' && p.type !== filterType) return false;
    if (filterKategori !== 'alle' && p.category !== filterKategori) return false;
    return true;
  });

  // Søgning
  if (search.trim()) {
    const s = search.toLowerCase();
    filteredProdukter = filteredProdukter.filter(p =>
      (p.sku || '').toLowerCase().includes(s) ||
      (p.title || '').toLowerCase().includes(s) ||
      (p.category || '').toLowerCase().includes(s)
    );
  }

  const typeLabels = { materiale: '🔩 Materiale', timer: '⏱️ Timer', ydelse: '📋 Ydelse' };
  const typeColors = { materiale: '#3B82F6', timer: '#F59E0B', ydelse: '#8B5CF6' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>🏷️ Varekatalog</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{filteredProdukter.length} af {produkter.length} produkter</p>
        </div>
        <button onClick={() => { setEditingProdukt(null); setShowModal(true); }} style={STYLES.primaryBtn}>+ Nyt produkt</button>
      </div>

      {/* Søgning og filtrering */}
      <div style={{ ...STYLES.card, marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input type="text" placeholder="🔍 Søg efter varenr, navn eller kategori..." value={search} onChange={e => setSearch(e.target.value)} style={STYLES.input} />
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={STYLES.select}>
              <option value="alle">Alle typer</option>
              <option value="materiale">🔩 Materiale</option>
              <option value="timer">⏱️ Timer</option>
              <option value="ydelse">📋 Ydelse</option>
            </select>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} style={STYLES.select}>
              <option value="alle">Alle kategorier</option>
              {kategorier.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <select value={filterAktiv} onChange={e => setFilterAktiv(e.target.value)} style={STYLES.select}>
              <option value="alle">Alle</option>
              <option value="aktiv">Aktive</option>
              <option value="inaktiv">Inaktive</option>
            </select>
          </div>
        </div>
      </div>

      {produkter.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏷️</div>
          <h3>Ingen produkter endnu</h3>
          <p style={{ color: COLORS.textLight }}>Opret materialer, timer og ydelser der kan bruges i pakker og tilbud</p>
          <button onClick={() => setShowModal(true)} style={{ ...STYLES.primaryBtn, marginTop: 16 }}>+ Opret produkt</button>
        </div>
      ) : filteredProdukter.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48, color: COLORS.textLight }}>Ingen produkter matcher</div>
      ) : (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: COLORS.bg }}>
              <th style={STYLES.th}>Varenr</th>
              <th style={STYLES.th}>Navn</th>
              <th style={STYLES.th}>Type</th>
              <th style={STYLES.th}>Enhed</th>
              <th style={{ ...STYLES.th, textAlign: 'right' }}>Kost</th>
              <th style={{ ...STYLES.th, textAlign: 'right' }}>Salg</th>
              <th style={STYLES.th}>Kategori</th>
              <th style={STYLES.th}>Status</th>
              <th style={STYLES.th}></th>
            </tr></thead>
            <tbody>
              {filteredProdukter.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={STYLES.td}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.sku || '–'}</span></td>
                  <td style={{ ...STYLES.td, fontWeight: 500 }}>{p.title}</td>
                  <td style={STYLES.td}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${typeColors[p.type]}20`, color: typeColors[p.type] }}>
                      {typeLabels[p.type]}
                    </span>
                  </td>
                  <td style={STYLES.td}>{p.unit}</td>
                  <td style={{ ...STYLES.td, textAlign: 'right' }}>{Number(p.cost_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
                  <td style={{ ...STYLES.td, textAlign: 'right', fontWeight: 600 }}>{Number(p.sale_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })}</td>
                  <td style={STYLES.td}>{p.category || '–'}</td>
                  <td style={STYLES.td}>
                    <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, background: p.active ? '#D1FAE5' : '#FEE2E2', color: p.active ? '#059669' : '#DC2626' }}>
                      {p.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td style={STYLES.td}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => toggleAktiv(p)} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 12 }}>
                        {p.active ? 'Deaktiver' : 'Aktiver'}
                      </button>
                      <button onClick={() => { setEditingProdukt(p); setShowModal(true); }} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 12 }}>Ret</button>
                      <button onClick={() => deleteProdukt(p)} style={{ ...STYLES.secondaryBtn, padding: '4px 8px', fontSize: 12, color: COLORS.error }}>Slet</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingProdukt ? 'Rediger produkt' : 'Nyt produkt'} onClose={() => { setShowModal(false); setEditingProdukt(null); }}>
          <ProduktForm initial={editingProdukt} kategorier={kategorier} onSave={saveProdukt} onCancel={() => { setShowModal(false); setEditingProdukt(null); }} />
        </Modal>
      )}
    </div>
  );
}

function ProduktForm({ initial, kategorier, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    sku: initial?.sku || '',
    title: initial?.title || '',
    type: initial?.type || 'materiale',
    unit: initial?.unit || 'stk',
    cost_price: initial?.cost_price || '',
    sale_price: initial?.sale_price || '',
    category: initial?.category || '',
    active: initial?.active !== false
  });

  const handleSubmit = () => {
    if (!form.title.trim()) { alert('Navn er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Varenr</label>
          <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} style={STYLES.input} placeholder="F.eks. SOL-400W" />
        </div>
        <div>
          <label style={STYLES.label}>Navn *</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={STYLES.input} placeholder="F.eks. Solpanel 400W" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Type</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={STYLES.select}>
            <option value="materiale">🔩 Materiale</option>
            <option value="timer">⏱️ Timer</option>
            <option value="ydelse">📋 Ydelse</option>
          </select>
        </div>
        <div>
          <label style={STYLES.label}>Enhed</label>
          <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={STYLES.input} placeholder="stk, m, time, etc." />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>Kostpris (kr.)</label>
          <input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} style={STYLES.input} min="0" step="0.01" placeholder="0.00" />
        </div>
        <div>
          <label style={STYLES.label}>Salgspris (kr.)</label>
          <input type="number" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} style={STYLES.input} min="0" step="0.01" placeholder="0.00" />
        </div>
      </div>
      <div>
        <label style={STYLES.label}>Kategori</label>
        <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={STYLES.input} placeholder="F.eks. Solpaneler, Inverter, Montage" list="kategorier" />
        <datalist id="kategorier">
          {kategorier.map(k => <option key={k} value={k} />)}
        </datalist>
      </div>
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          <span style={{ fontWeight: 500 }}>Produkt er aktivt</span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>{initial ? 'Gem' : 'Opret'}</button>
      </div>
    </div>
  );
}

// Produkt-vælger modal komponent (bruges i pakker og tilbud)
function ProduktVaelger({ onSelect, onCancel }) {
  const [produkter, setProdukter] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('alle');

  useEffect(() => { loadProdukter(); }, []);

  const loadProdukter = async () => {
    const { data } = await supabase.from('products').select('*').eq('active', true).order('title');
    setProdukter(data || []);
  };

  let filtered = produkter;
  if (filterType !== 'alle') {
    filtered = filtered.filter(p => p.type === filterType);
  }
  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p => 
      (p.sku || '').toLowerCase().includes(s) || 
      (p.title || '').toLowerCase().includes(s) ||
      (p.category || '').toLowerCase().includes(s)
    );
  }

  const typeLabels = { materiale: '🔩', timer: '⏱️', ydelse: '📋' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input type="text" placeholder="🔍 Søg..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...STYLES.input, flex: 1 }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={STYLES.select}>
          <option value="alle">Alle</option>
          <option value="materiale">Materiale</option>
          <option value="timer">Timer</option>
          <option value="ydelse">Ydelse</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: COLORS.textLight }}>Ingen produkter fundet</div>
      ) : (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: COLORS.bg }}>
              <th style={STYLES.th}>Produkt</th>
              <th style={{ ...STYLES.th, textAlign: 'right' }}>Salg</th>
              <th style={STYLES.th}></th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 500 }}>{typeLabels[p.type]} {p.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.textLight }}>{p.sku || ''} {p.category && `• ${p.category}`}</div>
                  </td>
                  <td style={{ ...STYLES.td, textAlign: 'right', fontWeight: 600 }}>{Number(p.sale_price).toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</td>
                  <td style={STYLES.td}>
                    <button onClick={() => onSelect(p)} style={{ ...STYLES.primaryBtn, padding: '4px 12px', fontSize: 12 }}>Vælg</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INDSTILLINGER SYSTEM (Brugere)
// Database: id, email, name, role, permissions, phone, title, active, created_at
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function IndstillingerSystem() {
  // Alle hooks FØRST
  const { user } = useAuth();
  const [brugere, setBrugere] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBruger, setEditingBruger] = useState(null);
  const [selectedBruger, setSelectedBruger] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRolle, setFilterRolle] = useState('alle');
  const [filterAktiv, setFilterAktiv] = useState('alle');
  
  // Margin settings
  const [marginSettings, setMarginSettings] = useState(null);
  const [showMarginModal, setShowMarginModal] = useState(false);
  
  // Password reset
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const currentUserId = user?.id;

  useEffect(() => { loadBrugere(); loadMarginSettings(); }, []);

  const loadMarginSettings = async () => {
    const { data } = await supabase.from('margin_settings').select('*').limit(1).single();
    if (data) setMarginSettings(data);
  };

  const saveMarginSettings = async (form) => {
    const { error } = await supabase.from('margin_settings').update({
      min_margin_global: parseFloat(form.min_margin_global) || 25,
      min_margin_materiale: parseFloat(form.min_margin_materiale) || 20,
      min_margin_timer: parseFloat(form.min_margin_timer) || 30,
      min_margin_ydelse: parseFloat(form.min_margin_ydelse) || 25,
      warning_threshold: parseFloat(form.warning_threshold) || 5,
      updated_at: new Date().toISOString(),
      updated_by: user?.id
    }).eq('id', marginSettings.id);
    if (error) { alert('Fejl: ' + error.message); return; }
    setShowMarginModal(false);
    loadMarginSettings();
  };

  const loadBrugere = async () => {
    const { data, error } = await supabase.from('profiles').select('id, email, name, role, permissions, phone, title, active, created_at').order('name');
    if (error) { console.error(error); return; }
    setBrugere(data || []);
  };

  const sendPasswordResetEmail = async () => {
    if (!selectedBruger || selectedBruger.id === currentUserId) return;
    
    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(selectedBruger.email, {
        redirectTo: window.location.origin
      });
      
      if (error) throw error;
      
      setPasswordMessage({ type: 'success', text: `Password reset link sendt til ${selectedBruger.email}` });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Fejl: ' + err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const saveBruger = async (form) => {
    // Beskyt mod at ændre sin egen admin-rolle eller deaktivere sig selv
    const isEditingSelf = form.id === currentUserId;
    const currentUserData = brugere.find(b => b.id === currentUserId);
    
    if (isEditingSelf && currentUserData?.role === 'admin') {
      // Behold original rolle og aktiv status
      form.role = 'admin';
      form.active = true;
    }

    const { error } = await supabase.from('profiles').update({
      name: form.name,
      role: form.role,
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
      await supabase.from('profiles').update({ name: form.name, role: form.role, phone: form.phone, title: form.title, active: true }).eq('email', form.email);
      loadBrugere();
    }, 1000);
    setShowModal(false);
    alert(`Bruger oprettet!\n\nEmail: ${form.email}\nAdgangskode: ${form.password}`);
  };

  const roleLabels = { admin: '👑 Administrator', saelger: '💼 Sælger', serviceleder: '🔧 Serviceleder', montoer: '👷 Montør', elev: '📚 Elev' };

  // Filtrering
  let filteredBrugere = brugere.filter(b => {
    if (filterRolle !== 'alle' && b.role !== filterRolle) return false;
    if (filterAktiv === 'aktiv' && !b.active) return false;
    if (filterAktiv === 'inaktiv' && b.active) return false;
    return true;
  });

  // Søgning
  if (search.trim()) {
    const s = search.toLowerCase();
    filteredBrugere = filteredBrugere.filter(b =>
      (b.name || '').toLowerCase().includes(s) ||
      (b.email || '').toLowerCase().includes(s) ||
      (b.title || '').toLowerCase().includes(s)
    );
  }

  // Bruger-detaljevisning
  if (selectedBruger) {
    return (
      <div>
        <button onClick={() => setSelectedBruger(null)} style={{ ...STYLES.secondaryBtn, marginBottom: 24 }}>← Tilbage til brugere</button>
        
        <div style={{ ...STYLES.card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{selectedBruger.name || selectedBruger.email}</h1>
                <span style={{ 
                  padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: selectedBruger.active ? '#D1FAE5' : '#FEE2E2',
                  color: selectedBruger.active ? '#059669' : '#DC2626'
                }}>{selectedBruger.active ? 'Aktiv' : 'Inaktiv'}</span>
              </div>
              {selectedBruger.title && <p style={{ color: COLORS.textLight, marginTop: 4 }}>{selectedBruger.title}</p>}
            </div>
            <button onClick={() => { setEditingBruger(selectedBruger); setShowModal(true); }} style={STYLES.secondaryBtn}>Rediger</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>EMAIL</div>
              <div>📧 {selectedBruger.email}</div>
            </div>
            {selectedBruger.phone && (
              <div>
                <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>TELEFON</div>
                <div>📞 {selectedBruger.phone}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>ROLLE</div>
              <div>{roleLabels[selectedBruger.role] || selectedBruger.role}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>OPRETTET</div>
              <div>{new Date(selectedBruger.created_at).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          {/* Rolle-baseret adgangsinfo */}
          {(selectedBruger.role === 'admin' || selectedBruger.role === 'saelger' || selectedBruger.role === 'serviceleder') && (
            <div style={{ marginTop: 24, padding: 12, background: '#DBEAFE', borderRadius: 8, fontSize: 14, color: '#1D4ED8' }}>
              ✓ Fuld adgang til kunder, projekter og dokumenter
            </div>
          )}
          {(selectedBruger.role === 'montoer' || selectedBruger.role === 'elev') && (
            <div style={{ marginTop: 24, padding: 12, background: COLORS.bg, borderRadius: 8, fontSize: 14, color: COLORS.textLight }}>
              👁 Kun læseadgang
            </div>
          )}
        </div>

        {/* Password-styring - kun for andre brugere (ikke sig selv) */}
        {selectedBruger.id !== currentUserId && (
          <>
            <div style={{ marginTop: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>🔐 Login & Password</h2>
            </div>

            <div style={{ ...STYLES.card }}>
              {/* Besked */}
              {passwordMessage && (
                <div style={{ 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 16,
                  background: passwordMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                  color: passwordMessage.type === 'success' ? '#059669' : '#DC2626'
                }}>
                  {passwordMessage.text}
                </div>
              )}

              <p style={{ color: COLORS.textLight, marginBottom: 16, marginTop: 0 }}>
                Send et reset-link til brugerens email, så de selv kan vælge et nyt password.
              </p>

              <button 
                onClick={sendPasswordResetEmail} 
                disabled={passwordLoading}
                style={{ 
                  ...STYLES.primaryBtn,
                  opacity: passwordLoading ? 0.6 : 1
                }}
              >
                {passwordLoading ? 'Sender...' : '📧 Send password reset email'}
              </button>
            </div>
          </>
        )}

        {/* Advarsel hvis man ser sin egen profil */}
        {selectedBruger.id === currentUserId && (
          <div style={{ ...STYLES.card, marginTop: 24, background: '#FEF3C7', borderColor: '#F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400E' }}>
              <span>⚠️</span>
              <span>Du kan ikke nulstille dit eget password her. Brug "Glemt password" på login-siden.</span>
            </div>
          </div>
        )}

        {showModal && (
          <Modal title="Rediger bruger" onClose={() => { setShowModal(false); setEditingBruger(null); }}>
            <BrugerForm initial={editingBruger} currentUserId={currentUserId} onSave={(form) => { saveBruger(form); setSelectedBruger({ ...selectedBruger, ...form }); }} onCancel={() => { setShowModal(false); setEditingBruger(null); }} isEdit={true} />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Indstillinger</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{filteredBrugere.length} af {brugere.length} brugere</p>
        </div>
        <button onClick={() => { setEditingBruger(null); setShowModal(true); }} style={STYLES.primaryBtn}>+ Ny bruger</button>
      </div>

      {/* Margin Settings Panel */}
      <div style={{ ...STYLES.card, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>📊 Dækningsbidrag (DB) Grænser</h2>
            <p style={{ color: COLORS.textLight, marginTop: 4, marginBottom: 0 }}>Minimum krav til dækningsbidrag pr. type</p>
          </div>
          <button onClick={() => setShowMarginModal(true)} style={STYLES.secondaryBtn}>Rediger</button>
        </div>
        {marginSettings ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, background: COLORS.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>GLOBAL MIN.</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{marginSettings.min_margin_global}%</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#EFF6FF', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>🔩 MATERIALE</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#3B82F6' }}>{marginSettings.min_margin_materiale}%</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#FFFBEB', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>⏱️ TIMER</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{marginSettings.min_margin_timer}%</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#F5F3FF', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>📋 YDELSE</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#8B5CF6' }}>{marginSettings.min_margin_ydelse}%</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#FEF3C7', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>⚠️ ADVARSEL</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>+{marginSettings.warning_threshold}%</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: COLORS.textLight }}>Indlæser...</div>
        )}
      </div>

      {/* Brugere sektion */}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>👥 Brugere</h2>

      {/* Søgning og filtrering */}
      <div style={{ ...STYLES.card, marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px' }}>
            <input
              type="text"
              placeholder="🔍 Søg efter navn, email eller titel..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={STYLES.input}
            />
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <select value={filterRolle} onChange={e => setFilterRolle(e.target.value)} style={STYLES.select}>
              <option value="alle">Alle roller</option>
              <option value="admin">Administrator</option>
              <option value="saelger">Sælger</option>
              <option value="serviceleder">Serviceleder</option>
              <option value="montoer">Montør</option>
              <option value="elev">Elev</option>
            </select>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <select value={filterAktiv} onChange={e => setFilterAktiv(e.target.value)} style={STYLES.select}>
              <option value="alle">Alle status</option>
              <option value="aktiv">Aktive</option>
              <option value="inaktiv">Inaktive</option>
            </select>
          </div>
        </div>
      </div>

      {filteredBrugere.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48, color: COLORS.textLight }}>
          Ingen brugere matcher søgningen
        </div>
      ) : (
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
              {filteredBrugere.map(b => (
                <tr key={b.id} style={{ borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer' }} onClick={() => setSelectedBruger(b)}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600, color: COLORS.primary }}>{b.name || b.email}</div>
                    {b.title && <div style={{ fontSize: 12, color: COLORS.textLight }}>{b.title}</div>}
                  </td>
                  <td style={STYLES.td}>{b.email}</td>
                  <td style={STYLES.td}>{roleLabels[b.role] || b.role}</td>
                  <td style={STYLES.td}>
                    <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, background: b.active ? '#D1FAE5' : '#FEE2E2', color: b.active ? '#059669' : '#DC2626' }}>
                      {b.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td style={STYLES.td} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditingBruger(b); setShowModal(true); }} style={{ ...STYLES.secondaryBtn, padding: '6px 12px' }}>Rediger</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingBruger ? 'Rediger bruger' : 'Ny bruger'} onClose={() => { setShowModal(false); setEditingBruger(null); }}>
          <BrugerForm initial={editingBruger} currentUserId={currentUserId} onSave={editingBruger ? saveBruger : createBruger} onCancel={() => { setShowModal(false); setEditingBruger(null); }} isEdit={!!editingBruger} />
        </Modal>
      )}

      {showMarginModal && (
        <Modal title="Rediger DB-grænser" onClose={() => setShowMarginModal(false)}>
          <MarginSettingsForm initial={marginSettings} onSave={saveMarginSettings} onCancel={() => setShowMarginModal(false)} />
        </Modal>
      )}
    </div>
  );
}

// Margin Settings Form
function MarginSettingsForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    min_margin_global: initial?.min_margin_global || 25,
    min_margin_materiale: initial?.min_margin_materiale || 20,
    min_margin_timer: initial?.min_margin_timer || 30,
    min_margin_ydelse: initial?.min_margin_ydelse || 25,
    warning_threshold: initial?.warning_threshold || 5
  });

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ background: '#EFF6FF', padding: 12, borderRadius: 8, fontSize: 14, color: '#1D4ED8' }}>
        💡 Disse grænser bruges til at advare når et tilbud eller en linje har for lavt dækningsbidrag.
      </div>
      <div>
        <label style={STYLES.label}>Global minimum DB %</label>
        <input type="number" value={form.min_margin_global} onChange={e => setForm({ ...form, min_margin_global: e.target.value })} style={STYLES.input} min="0" max="100" step="0.1" />
        <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>Bruges til samlet tilbud-vurdering</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={STYLES.label}>🔩 Materiale min. %</label>
          <input type="number" value={form.min_margin_materiale} onChange={e => setForm({ ...form, min_margin_materiale: e.target.value })} style={STYLES.input} min="0" max="100" step="0.1" />
        </div>
        <div>
          <label style={STYLES.label}>⏱️ Timer min. %</label>
          <input type="number" value={form.min_margin_timer} onChange={e => setForm({ ...form, min_margin_timer: e.target.value })} style={STYLES.input} min="0" max="100" step="0.1" />
        </div>
        <div>
          <label style={STYLES.label}>📋 Ydelse min. %</label>
          <input type="number" value={form.min_margin_ydelse} onChange={e => setForm({ ...form, min_margin_ydelse: e.target.value })} style={STYLES.input} min="0" max="100" step="0.1" />
        </div>
      </div>
      <div>
        <label style={STYLES.label}>⚠️ Advarselsgrænse (% over minimum)</label>
        <input type="number" value={form.warning_threshold} onChange={e => setForm({ ...form, warning_threshold: e.target.value })} style={STYLES.input} min="0" max="50" step="0.1" />
        <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>Gul advarsel når DB er mellem minimum og minimum + denne værdi</div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={() => onSave(form)} style={STYLES.primaryBtn}>Gem</button>
      </div>
    </div>
  );
}

function BrugerForm({ initial, currentUserId, onSave, onCancel, isEdit }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    email: initial?.email || '',
    name: initial?.name || '',
    role: initial?.role || 'saelger',
    phone: initial?.phone || '',
    title: initial?.title || '',
    active: initial?.active !== false,
    password: ''
  });

  // Self-edit check: admin kan ikke ændre sin egen rolle eller deaktivere sig selv
  const isEditingSelf = isEdit && initial?.id === currentUserId;
  const isSelfAdmin = isEditingSelf && initial?.role === 'admin';

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
      {isSelfAdmin && (
        <div style={{ background: '#FEF3C7', padding: 12, borderRadius: 8, fontSize: 14, color: '#92400E' }}>
          ⚠️ Du redigerer din egen profil. Du kan ikke ændre din rolle eller deaktivere dig selv.
        </div>
      )}
      <div>
        <label style={STYLES.label}>Email *</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...STYLES.input, background: isEdit ? '#F3F4F6' : 'white' }} disabled={isEdit} placeholder="email@eksempel.dk" />
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
        <label style={STYLES.label}>Rolle {isSelfAdmin && <span style={{ fontWeight: 400, color: COLORS.textLight }}>(låst)</span>}</label>
        <select 
          value={form.role} 
          onChange={e => setForm({ ...form, role: e.target.value })} 
          style={{ ...STYLES.select, background: isSelfAdmin ? '#F3F4F6' : 'white', cursor: isSelfAdmin ? 'not-allowed' : 'pointer' }}
          disabled={isSelfAdmin}
        >
          <option value="admin">Administrator</option>
          <option value="saelger">Sælger</option>
          <option value="serviceleder">Serviceleder</option>
          <option value="montoer">Montør</option>
          <option value="elev">Elev</option>
        </select>
      </div>
      {(form.role === 'admin' || form.role === 'saelger' || form.role === 'serviceleder') && (
        <div style={{ background: '#DBEAFE', padding: 12, borderRadius: 8, fontSize: 14, color: '#1D4ED8' }}>
          {form.role === 'admin' ? 'Administratorer' : form.role === 'saelger' ? 'Sælgere' : 'Serviceledere'} har fuld adgang til kunder, projekter og dokumenter.
        </div>
      )}
      {(form.role === 'montoer' || form.role === 'elev') && (
        <div style={{ background: COLORS.bg, padding: 12, borderRadius: 8, fontSize: 14, color: COLORS.textLight }}>
          {form.role === 'montoer' ? 'Montører' : 'Elever'} har kun læseadgang.
        </div>
      )}
      {isEdit && (
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: isSelfAdmin ? 'not-allowed' : 'pointer', opacity: isSelfAdmin ? 0.6 : 1 }}>
            <input 
              type="checkbox" 
              checked={form.active} 
              onChange={e => setForm({ ...form, active: e.target.checked })} 
              disabled={isSelfAdmin}
            />
            <span style={{ fontWeight: 500 }}>Bruger er aktiv {isSelfAdmin && <span style={{ fontWeight: 400, color: COLORS.textLight }}>(låst)</span>}</span>
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
