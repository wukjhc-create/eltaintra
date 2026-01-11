// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ELTASOLAR FUNDAMENT v1.1
// Scope: Login, Roller, Admin, Brugere, Kunder, Projekter
// CRUD virker 100%
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const supabase = createClient(
  'https://fsziiscbfdduuuhfpfet.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzemlpc2NiZmRkdXV1aGZwZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTQ2MDcsImV4cCI6MjA4MzY5MDYwN30.OmVvoCMh17Yh0FaGo4vhd_7ihEtDtD422Rad2XaqyE0'
);

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
};

const STYLES = {
  input: { 
    width: '100%', 
    padding: '12px 16px', 
    border: `1px solid ${COLORS.border}`, 
    borderRadius: 8, 
    fontSize: 15, 
    boxSizing: 'border-box' 
  },
  select: { 
    width: '100%', 
    padding: '12px 16px', 
    border: `1px solid ${COLORS.border}`, 
    borderRadius: 8, 
    fontSize: 15, 
    boxSizing: 'border-box',
    background: 'white'
  },
  primaryBtn: { 
    background: COLORS.primary, 
    color: 'white', 
    border: 'none', 
    borderRadius: 8, 
    padding: '12px 24px', 
    fontWeight: 600, 
    cursor: 'pointer', 
    fontSize: 14 
  },
  secondaryBtn: { 
    background: 'white', 
    color: COLORS.text, 
    border: `1px solid ${COLORS.border}`, 
    borderRadius: 8, 
    padding: '12px 24px', 
    fontWeight: 600, 
    cursor: 'pointer', 
    fontSize: 14 
  },
  card: { 
    background: 'white', 
    borderRadius: 12, 
    padding: 24, 
    border: `1px solid ${COLORS.border}` 
  },
  th: { 
    textAlign: 'left', 
    padding: '12px 16px', 
    fontSize: 12, 
    fontWeight: 600, 
    color: COLORS.textLight, 
    textTransform: 'uppercase',
    background: COLORS.bg
  },
  td: { 
    padding: '16px', 
    fontSize: 14,
    borderTop: `1px solid ${COLORS.border}`
  },
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
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, permissions, phone, title, active')
      .eq('id', userId)
      .single();
    
    if (error) console.error('Error fetching profile:', error);
    if (data) setProfile(data);
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSection('dashboard');
  };

  const isAdmin = profile?.role === 'admin';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: COLORS.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>☀️</div>
          <div style={{ color: COLORS.textLight }}>Indlæser...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AuthContext.Provider value={{ user, profile, logout, isAdmin }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.bg }}>
        <nav style={{ width: 240, background: 'white', borderRight: `1px solid ${COLORS.border}`, padding: 20, position: 'relative' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>☀️ Elta Solar</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <NavButton active={section === 'dashboard'} onClick={() => setSection('dashboard')}>📊 Overblik</NavButton>
            <NavButton active={section === 'kunder'} onClick={() => setSection('kunder')}>👥 Kunder</NavButton>
            <NavButton active={section === 'projekter'} onClick={() => setSection('projekter')}>📁 Projekter</NavButton>
            {isAdmin && (
              <NavButton active={section === 'indstillinger'} onClick={() => setSection('indstillinger')}>⚙️ Indstillinger</NavButton>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <div style={{ padding: 12, background: COLORS.bg, borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.name || profile?.email}</div>
              <div style={{ fontSize: 12, color: COLORS.textLight }}>
                {profile?.role === 'admin' ? '👑 Administrator' : profile?.role}
              </div>
            </div>
            <button onClick={logout} style={{ ...STYLES.secondaryBtn, width: '100%', padding: '8px 16px' }}>
              Log ud
            </button>
          </div>
        </nav>

        <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
          {section === 'dashboard' && <Dashboard />}
          {section === 'kunder' && <KunderPage />}
          {section === 'projekter' && <ProjekterPage />}
          {section === 'indstillinger' && isAdmin && <IndstillingerPage />}
        </main>
      </div>
    </AuthContext.Provider>
  );
}

function NavButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        border: 'none',
        borderRadius: 8,
        background: active ? COLORS.primary : 'transparent',
        color: active ? 'white' : COLORS.text,
        fontWeight: 500,
        cursor: 'pointer',
        fontSize: 14
      }}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: COLORS.bg }}>
      <div style={{ ...STYLES.card, width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>☀️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: COLORS.primary }}>Elta Solar</h1>
          <p style={{ color: COLORS.textLight, marginTop: 8 }}>Log ind for at fortsætte</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={STYLES.input} required />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Adgangskode</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={STYLES.input} required />
          </div>

          {error && (
            <div style={{ padding: 12, background: '#FEE2E2', color: COLORS.error, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...STYLES.primaryBtn, width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logger ind...' : 'Log ind'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Dashboard() {
  const [stats, setStats] = useState({ kunder: 0, projekter: 0 });
  const { profile } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [kunderRes, projekterRes] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true })
    ]);
    setStats({
      kunder: kunderRes.count || 0,
      projekter: projekterRes.count || 0
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Velkommen, {profile?.name || 'bruger'}</h1>
      <p style={{ color: COLORS.textLight, marginBottom: 32 }}>Her er dit overblik</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        <div style={STYLES.card}>
          <div style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 8 }}>Kunder</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.primary }}>{stats.kunder}</div>
        </div>
        <div style={STYLES.card}>
          <div style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 8 }}>Projekter</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.primary }}>{stats.projekter}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KUNDER PAGE
// Database kolonner: id, name, company, cvr, email, phone, address, zip, city, 
//                    delivery_address, delivery_zip, delivery_city, notes, created_at
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function KunderPage() {
  const [kunder, setKunder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingKunde, setEditingKunde] = useState(null);

  useEffect(() => {
    loadKunder();
  }, []);

  const loadKunder = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, company, cvr, email, phone, address, zip, city, delivery_address, delivery_zip, delivery_city, notes, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading customers:', error);
      alert('Fejl ved indlæsning: ' + error.message);
      return;
    }
    setKunder(data || []);
  };

  const saveKunde = async (form) => {
    // Byg payload med KUN de kolonner der findes i databasen
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
      // UPDATE
      const { error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', editingKunde.id);

      if (error) {
        alert('Fejl ved opdatering: ' + error.message);
        return;
      }
    } else {
      // INSERT
      const { error } = await supabase
        .from('customers')
        .insert([payload]);

      if (error) {
        alert('Fejl ved oprettelse: ' + error.message);
        return;
      }
    }

    setShowModal(false);
    setEditingKunde(null);
    loadKunder();
  };

  const deleteKunde = async (id) => {
    if (!confirm('Er du sikker på du vil slette denne kunde?')) return;
    
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      alert('Fejl ved sletning: ' + error.message);
      return;
    }
    loadKunder();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Kunder</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{kunder.length} kunder i systemet</p>
        </div>
        <button onClick={() => { setEditingKunde(null); setShowModal(true); }} style={STYLES.primaryBtn}>
          + Ny kunde
        </button>
      </div>

      {kunder.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Ingen kunder endnu</h3>
          <p style={{ color: COLORS.textLight, marginBottom: 16 }}>Opret din første kunde</p>
          <button onClick={() => setShowModal(true)} style={STYLES.primaryBtn}>+ Opret kunde</button>
        </div>
      ) : (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={STYLES.th}>Navn</th>
                <th style={STYLES.th}>Email</th>
                <th style={STYLES.th}>Telefon</th>
                <th style={STYLES.th}>By</th>
                <th style={STYLES.th}></th>
              </tr>
            </thead>
            <tbody>
              {kunder.map(kunde => (
                <tr key={kunde.id}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600 }}>{kunde.company || kunde.name}</div>
                    {kunde.company && <div style={{ fontSize: 12, color: COLORS.textLight }}>{kunde.name}</div>}
                  </td>
                  <td style={STYLES.td}>{kunde.email || '-'}</td>
                  <td style={STYLES.td}>{kunde.phone || '-'}</td>
                  <td style={STYLES.td}>{kunde.city || '-'}</td>
                  <td style={STYLES.td}>
                    <button 
                      onClick={() => { setEditingKunde(kunde); setShowModal(true); }} 
                      style={{ ...STYLES.secondaryBtn, padding: '6px 12px', marginRight: 8 }}
                    >
                      Rediger
                    </button>
                    <button 
                      onClick={() => deleteKunde(kunde.id)} 
                      style={{ ...STYLES.secondaryBtn, padding: '6px 12px', color: COLORS.error }}
                    >
                      Slet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingKunde ? 'Rediger kunde' : 'Ny kunde'} onClose={() => { setShowModal(false); setEditingKunde(null); }}>
          <KundeForm 
            initial={editingKunde} 
            onSave={saveKunde} 
            onCancel={() => { setShowModal(false); setEditingKunde(null); }} 
          />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KUNDE FORM
// Felter: name, company, cvr, email, phone, address, zip, city, 
//         delivery_address, delivery_zip, delivery_city, notes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

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
    if (!form.name) {
      alert('Navn er påkrævet');
      return;
    }
    
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
      {/* Firma info */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Firmanavn</label>
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            style={STYLES.input}
            placeholder="Firma ApS (valgfrit)"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>CVR</label>
          <input
            value={form.cvr}
            onChange={(e) => setForm({ ...form, cvr: e.target.value })}
            style={STYLES.input}
            placeholder="12345678"
          />
        </div>
      </div>

      {/* Kontaktperson / Navn */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Kontaktperson / Navn *</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={STYLES.input}
          placeholder="Jens Jensen"
        />
      </div>

      {/* Kontakt */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={STYLES.input}
            placeholder="email@eksempel.dk"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Telefon</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={STYLES.input}
            placeholder="12 34 56 78"
          />
        </div>
      </div>

      {/* Adresse */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Adresse</label>
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          style={STYLES.input}
          placeholder="Vejnavn 123"
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Postnr</label>
          <input
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
            style={STYLES.input}
            placeholder="1234"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>By</label>
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            style={STYLES.input}
            placeholder="København"
          />
        </div>
      </div>

      {/* Leveringsadresse */}
      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} />
          <span style={{ fontSize: 14 }}>Leveringsadresse er samme som adresse</span>
        </label>
      </div>

      {!sameAddress && (
        <>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Leveringsadresse</label>
            <input
              value={form.delivery_address}
              onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
              style={STYLES.input}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Postnr</label>
              <input
                value={form.delivery_zip}
                onChange={(e) => setForm({ ...form, delivery_zip: e.target.value })}
                style={STYLES.input}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>By</label>
              <input
                value={form.delivery_city}
                onChange={(e) => setForm({ ...form, delivery_city: e.target.value })}
                style={STYLES.input}
              />
            </div>
          </div>
        </>
      )}

      {/* Noter */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Noter</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...STYLES.input, minHeight: 80, resize: 'vertical' }}
          placeholder="Evt. bemærkninger..."
        />
      </div>

      {/* Knapper */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onCancel} style={STYLES.secondaryBtn}>Annuller</button>
        <button onClick={handleSubmit} style={STYLES.primaryBtn}>
          {initial ? 'Gem ændringer' : 'Opret kunde'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROJEKTER PAGE
// Database kolonner: id, customer_id, name, description, address, zip, city, status, created_at, updated_at
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ProjekterPage() {
  const [projekter, setProjekter] = useState([]);
  const [kunder, setKunder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProjekt, setEditingProjekt] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [projekterRes, kunderRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, customer_id, name, description, address, zip, city, status, created_at, customers(name, company)')
        .order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name, company')
    ]);
    
    if (projekterRes.error) {
      console.error('Error loading projects:', projekterRes.error);
      alert('Fejl ved indlæsning: ' + projekterRes.error.message);
      return;
    }
    setProjekter(projekterRes.data || []);
    setKunder(kunderRes.data || []);
  };

  const saveProjekt = async (form) => {
    // Byg payload med KUN de kolonner der findes i databasen
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
      // UPDATE
      payload.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', editingProjekt.id);

      if (error) {
        alert('Fejl ved opdatering: ' + error.message);
        return;
      }
    } else {
      // INSERT
      const { error } = await supabase
        .from('projects')
        .insert([payload]);

      if (error) {
        alert('Fejl ved oprettelse: ' + error.message);
        return;
      }
    }

    setShowModal(false);
    setEditingProjekt(null);
    loadData();
  };

  const deleteProjekt = async (id) => {
    if (!confirm('Er du sikker på du vil slette dette projekt?')) return;
    
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      alert('Fejl ved sletning: ' + error.message);
      return;
    }
    loadData();
  };

  const statusColors = {
    aktiv: { bg: '#D1FAE5', color: '#059669' },
    afsluttet: { bg: '#DBEAFE', color: '#1D4ED8' },
    annulleret: { bg: '#FEE2E2', color: '#DC2626' }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Projekter</h1>
          <p style={{ color: COLORS.textLight, marginTop: 4 }}>{projekter.length} projekter i systemet</p>
        </div>
        <button onClick={() => { setEditingProjekt(null); setShowModal(true); }} style={STYLES.primaryBtn}>
          + Nyt projekt
        </button>
      </div>

      {projekter.length === 0 ? (
        <div style={{ ...STYLES.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Ingen projekter endnu</h3>
          <p style={{ color: COLORS.textLight, marginBottom: 16 }}>Opret dit første projekt</p>
          <button onClick={() => setShowModal(true)} style={STYLES.primaryBtn}>+ Opret projekt</button>
        </div>
      ) : (
        <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={STYLES.th}>Projekt</th>
                <th style={STYLES.th}>Kunde</th>
                <th style={STYLES.th}>Adresse</th>
                <th style={STYLES.th}>Status</th>
                <th style={STYLES.th}></th>
              </tr>
            </thead>
            <tbody>
              {projekter.map(projekt => (
                <tr key={projekt.id}>
                  <td style={STYLES.td}>
                    <div style={{ fontWeight: 600 }}>{projekt.name}</div>
                    {projekt.description && <div style={{ fontSize: 12, color: COLORS.textLight }}>{projekt.description}</div>}
                  </td>
                  <td style={STYLES.td}>{projekt.customers?.company || projekt.customers?.name || '-'}</td>
                  <td style={STYLES.td}>{projekt.city || projekt.address || '-'}</td>
                  <td style={STYLES.td}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 4, 
                      fontSize: 12,
                      background: statusColors[projekt.status]?.bg || '#F3F4F6',
                      color: statusColors[projekt.status]?.color || '#6B7280'
                    }}>
                      {projekt.status}
                    </span>
                  </td>
                  <td style={STYLES.td}>
                    <button 
                      onClick={() => { setEditingProjekt(projekt); setShowModal(true); }} 
                      style={{ ...STYLES.secondaryBtn, padding: '6px 12px', marginRight: 8 }}
                    >
                      Rediger
                    </button>
                    <button 
                      onClick={() => deleteProjekt(projekt.id)} 
                      style={{ ...STYLES.secondaryBtn, padding: '6px 12px', color: COLORS.error }}
                    >
                      Slet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingProjekt ? 'Rediger projekt' : 'Nyt projekt'} onClose={() => { setShowModal(false); setEditingProjekt(null); }}>
          <ProjektForm 
            initial={editingProjekt} 
            kunder={kunder}
            onSave={saveProjekt} 
            onCancel={() => { setShowModal(false); setEditingProjekt(null); }} 
          />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROJEKT FORM
// Felter: customer_id, name, description, address, zip, city, status
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

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
    if (!form.name) {
      alert('Projektnavn er påkrævet');
      return;
    }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Kunde</label>
        <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} style={STYLES.select}>
          <option value="">Ingen kunde valgt</option>
          {kunder.map(k => (
            <option key={k.id} value={k.id}>{k.company || k.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Projektnavn *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={STYLES.input} placeholder="F.eks. Solcelleanlæg Villa" />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Beskrivelse</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...STYLES.input, minHeight: 80, resize: 'vertical' }} placeholder="Kort beskrivelse af projektet..." />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Projektadresse</label>
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={STYLES.input} placeholder="Vejnavn 123" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Postnr</label>
          <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} style={STYLES.input} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>By</label>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={STYLES.input} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={STYLES.select}>
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
// INDSTILLINGER PAGE (Admin only)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function IndstillingerPage() {
  const [brugere, setBrugere] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBruger, setEditingBruger] = useState(null);

  useEffect(() => {
    loadBrugere();
  }, []);

  const loadBrugere = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, permissions, phone, title, active, created_at')
      .order('name');
    
    if (error) {
      console.error('Error loading users:', error);
      return;
    }
    setBrugere(data || []);
  };

  const saveBruger = async (form) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: form.name,
        role: form.role,
        permissions: form.permissions,
        phone: form.phone,
        title: form.title,
        active: form.active
      })
      .eq('id', form.id);

    if (error) {
      alert('Fejl ved opdatering: ' + error.message);
      return;
    }

    setShowModal(false);
    setEditingBruger(null);
    loadBrugere();
  };

  const createBruger = async (form) => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, role: form.role } }
    });

    if (error) {
      alert('Fejl ved oprettelse: ' + error.message);
      return;
    }

    setTimeout(async () => {
      await supabase
        .from('profiles')
        .update({
          name: form.name,
          role: form.role,
          permissions: form.permissions,
          phone: form.phone,
          title: form.title,
          active: true
        })
        .eq('email', form.email);
      
      loadBrugere();
    }, 1000);

    setShowModal(false);
    alert(`Bruger oprettet!\n\nEmail: ${form.email}\nAdgangskode: ${form.password}`);
  };

  const roleLabels = {
    admin: '👑 Administrator',
    saelger: '💼 Sælger',
    montoer: '🔧 Montør',
    elev: '📚 Elev'
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Indstillinger</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>👥 Brugere</h2>
        <button onClick={() => { setEditingBruger(null); setShowModal(true); }} style={STYLES.primaryBtn}>
          + Ny bruger
        </button>
      </div>

      <div style={{ ...STYLES.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={STYLES.th}>Navn</th>
              <th style={STYLES.th}>Email</th>
              <th style={STYLES.th}>Rolle</th>
              <th style={STYLES.th}>Status</th>
              <th style={STYLES.th}></th>
            </tr>
          </thead>
          <tbody>
            {brugere.map(bruger => (
              <tr key={bruger.id}>
                <td style={STYLES.td}>
                  <div style={{ fontWeight: 600 }}>{bruger.name || bruger.email}</div>
                  {bruger.title && <div style={{ fontSize: 12, color: COLORS.textLight }}>{bruger.title}</div>}
                </td>
                <td style={STYLES.td}>{bruger.email}</td>
                <td style={STYLES.td}>{roleLabels[bruger.role] || bruger.role}</td>
                <td style={STYLES.td}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 12,
                    background: bruger.active ? '#D1FAE5' : '#FEE2E2',
                    color: bruger.active ? '#059669' : '#DC2626'
                  }}>
                    {bruger.active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td style={STYLES.td}>
                  <button 
                    onClick={() => { setEditingBruger(bruger); setShowModal(true); }} 
                    style={{ ...STYLES.secondaryBtn, padding: '6px 12px' }}
                  >
                    Rediger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingBruger ? 'Rediger bruger' : 'Ny bruger'} onClose={() => { setShowModal(false); setEditingBruger(null); }}>
          <BrugerForm 
            initial={editingBruger} 
            onSave={editingBruger ? saveBruger : createBruger} 
            onCancel={() => { setShowModal(false); setEditingBruger(null); }}
            isEdit={!!editingBruger}
          />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BRUGER FORM
// Felter: email, name, role, permissions, phone, title, active
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

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
    const pwd = Array(12).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    setForm({ ...form, password: pwd });
  };

  const handleSubmit = () => {
    if (!isEdit && !form.email) { alert('Email er påkrævet'); return; }
    if (!isEdit && !form.password) { alert('Adgangskode er påkrævet'); return; }
    onSave(form);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Email *</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={STYLES.input} disabled={isEdit} placeholder="email@eksempel.dk" />
      </div>

      {!isEdit && (
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Adgangskode *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ ...STYLES.input, flex: 1 }} placeholder="Min. 6 tegn" />
            <button type="button" onClick={generatePassword} style={STYLES.secondaryBtn}>Generer</button>
          </div>
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Navn</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={STYLES.input} placeholder="Jens Jensen" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Titel</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={STYLES.input} placeholder="F.eks. Salgschef" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Telefon</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={STYLES.input} placeholder="12 34 56 78" />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Rolle</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={STYLES.select}>
          <option value="saelger">Sælger</option>
          <option value="montoer">Montør</option>
          <option value="elev">Elev</option>
          <option value="admin">Administrator (fuld adgang)</option>
        </select>
      </div>

      {form.role !== 'admin' && (
        <div style={{ background: COLORS.bg, padding: 16, borderRadius: 8 }}>
          <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: 14 }}>Rettigheder</label>
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
          Administratorer har automatisk fuld adgang til alle funktioner.
        </div>
      )}

      {isEdit && (
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span style={{ fontWeight: 500 }}>Bruger er aktiv</span>
          </label>
          <p style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>Inaktive brugere kan ikke logge ind</p>
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
// MODAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: COLORS.textLight }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
