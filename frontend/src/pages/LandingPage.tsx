import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Box, Key, FileText, List, 
  Fingerprint, Shield, KeyRound, Handshake
} from 'lucide-react';

/* ─── COLOR TOKENS & CONSTANTS ─── */
const C = {
  // Backgrounds
  bgDark: '#2a3441',
  bgDarker: '#1e2532',
  bgSteel: '#546a7b',
  bgPanel: '#1a222c',
  
  // Metallics
  metalLight: 'linear-gradient(135deg, #d8e2eb 0%, #b8c4d1 50%, #98a5b5 100%)',
  metalMedium: 'linear-gradient(135deg, #9ca8b8 0%, #7d8b9e 50%, #5d6a7d 100%)',
  metalDark: 'linear-gradient(135deg, #2d3744 0%, #1e2532 50%, #131821 100%)',
  
  // Accents
  blueGlow: '#89cff0', // Light cyan/blue glow
  blueText: '#cce6f4',
  
  // Text
  textWhite: '#f4f7fa',
  textMuted: '#9ba8b8',
  textDark: '#1a222c',
};

/* ─── INLINE CSS & KEYFRAMES ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: ${C.bgDark};
  overflow-x: hidden;
}

/* Wires Background Animation */
.bg-wires {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}
.wire {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.02), inset 0 0 10px rgba(255, 255, 255, 0.02);
}
.wire-1 { top: -20%; left: -10%; width: 60%; height: 140%; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(15deg); }
.wire-2 { top: 10%; right: -20%; width: 70%; height: 120%; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(-25deg); }
.wire-3 { top: 40%; left: -30%; width: 80%; height: 80%; border-radius: 30% 70% 50% 50% / 50% 50% 70% 30%; transform: rotate(45deg); }

/* Buttons */
.btn-glass {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.4);
  color: ${C.textWhite};
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 1px;
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-glass:hover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.6);
}

.btn-primary {
  background: linear-gradient(180deg, #6bb8e3 0%, #4a98c7 100%);
  border: 1px solid #89cff0;
  box-shadow: 0 4px 25px rgba(137, 207, 240, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.5), inset 0 -2px 5px rgba(0, 0, 0, 0.2);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 1px;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-primary:hover {
  background: linear-gradient(180deg, #7dc3eb 0%, #5ba3cf 100%);
  box-shadow: 0 6px 30px rgba(137, 207, 240, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.btn-dark {
  background: linear-gradient(180deg, #323b47 0%, #1e2532 100%);
  border: 1px solid #4a5665;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
  color: ${C.textWhite};
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 1px;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-dark:hover {
  background: linear-gradient(180deg, #3c4654 0%, #262e3d 100%);
  border-color: #5d6a7d;
}

/* Vault Inner Glow Animation */
@keyframes vaultPulse {
  0% { box-shadow: 0 0 20px rgba(137, 207, 240, 0.3), inset 0 0 30px rgba(137, 207, 240, 0.2); }
  50% { box-shadow: 0 0 40px rgba(137, 207, 240, 0.6), inset 0 0 50px rgba(137, 207, 240, 0.4); }
  100% { box-shadow: 0 0 20px rgba(137, 207, 240, 0.3), inset 0 0 30px rgba(137, 207, 240, 0.2); }
}
`;

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at top right, ${C.bgSteel} 0%, ${C.bgDark} 50%, ${C.bgDarker} 100%)`,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{CSS}</style>

      {/* Abstract Wire Background */}
      <div className="bg-wires">
        <div className="wire wire-1"></div>
        <div className="wire wire-2"></div>
        <div className="wire wire-3"></div>
      </div>

      {/* Top Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 4rem',
        background: scrolled ? 'rgba(30, 37, 50, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(15px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ 
            background: C.metalLight, borderRadius: '6px', padding: '6px',
            boxShadow: 'inset 0 1px 2px #fff, 0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Handshake size={20} color={C.textDark} strokeWidth={2.5} />
          </div>
          <span style={{ 
            color: C.textWhite, fontSize: '1.2rem', fontWeight: 700, 
            letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
          }}>
            SafeHands
          </span>
        </div>



        <Link to="/login" className="btn-glass">
          LOGIN
        </Link>
      </nav>

      {/* Main Content Area */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8rem 2rem 6rem', position: 'relative', zIndex: 10
      }}>
        {/* Massive Hero Container */}
        <div style={{
          width: '100%', maxWidth: '1400px',
          background: C.bgPanel,
          borderRadius: '30px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Subtle container glow */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', width: '50%', height: '100%',
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          {/* Left Panel: Copy & CTA */}
          <div style={{ flex: '1 1 50%', padding: '5rem 4rem', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{
              color: C.textWhite, fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 800,
              lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '1.5rem',
              textShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}>
              IN SAFE HANDS:<br />
              <span style={{ color: C.textMuted }}>THE ULTIMATE</span><br />
              <span style={{ color: C.textWhite }}>CAMPUS LOST &</span><br />
              <span style={{ color: C.textMuted }}>FOUND NETWORK.</span>
            </h1>

            <p style={{
              color: C.textMuted, fontSize: '1rem', lineHeight: 1.6,
              marginBottom: '3rem', maxWidth: '90%',
            }}>
              Connect with your campus community to securely report, track, and recover your lost belongings. Powered by smart matching, real-time notifications, and a commitment to helping you find what matters most.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link to="/register" className="btn-primary">GET STARTED NOW</Link>
              <a href="#about-app" className="btn-dark">LEARN MORE</a>
            </div>
          </div>

          {/* Right Panel: Skeuomorphic Vault Interface */}
          <div style={{
            flex: '1 1 50%', position: 'relative', minHeight: '600px',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '2rem 0',
          }}>
            {/* The Vault Base Chassis */}
            <div style={{
              background: C.metalLight,
              width: '95%', height: '90%',
              borderTopLeftRadius: '100px', borderBottomLeftRadius: '60px',
              borderTopRightRadius: '0px', borderBottomRightRadius: '0px',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5), inset 2px 2px 10px rgba(255,255,255,0.8), inset -5px -5px 15px rgba(0,0,0,0.2)',
              position: 'relative',
              display: 'flex',
              padding: '2rem',
              gap: '1.5rem',
              alignItems: 'stretch',
            }}>
              {/* Inner chassis border detail */}
              <div style={{
                position: 'absolute', top: '10px', left: '10px', right: '-10px', bottom: '10px',
                border: '1px solid rgba(255,255,255,0.5)',
                borderTopLeftRadius: '90px', borderBottomLeftRadius: '50px',
                pointerEvents: 'none',
              }} />

              {/* Vault Left Sidebar Navigation */}
              <div style={{
                width: '180px', display: 'flex', flexDirection: 'column', gap: '1rem',
                paddingTop: '1rem', position: 'relative', zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', marginLeft: '0.5rem' }}>
                   <div style={{ 
                      background: C.metalDark, borderRadius: '4px', padding: '4px',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Handshake size={14} color={C.blueText} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: C.textDark, letterSpacing: '0.5px' }}>SAFEHANDS</span>
                </div>

                {[
                  { label: 'SECURE DASHBOARD', active: true },
                  { label: 'BROWSE ITEMS', active: false },
                  { label: 'ACTIVITY LOGS', active: false },
                  { label: 'SETTINGS', active: false },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '0.8rem 1rem',
                    background: item.active ? 'rgba(0,0,0,0.08)' : 'transparent',
                    borderRadius: '8px',
                    boxShadow: item.active ? 'inset 0 2px 5px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.6)' : 'none',
                    color: item.active ? C.textDark : '#5a6b7c',
                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Vault Center Core */}
              <div style={{
                flex: 1,
                background: C.metalMedium,
                borderRadius: '30px',
                boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.3), 0 2px 10px rgba(255,255,255,0.7)',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem',
              }}>
                {/* Outer Raised Bezel */}
                <div style={{
                  width: '100%', height: '100%',
                  background: C.metalLight,
                  borderRadius: '24px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.9), inset 0 -2px 5px rgba(0,0,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '2rem',
                }}>
                  {/* Glowing Core Cavity */}
                  <div style={{
                    width: '100%', height: '100%',
                    background: C.bgPanel,
                    borderRadius: '16px',
                    boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.8), 0 2px 4px rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Inner glowing screen border */}
                    <div style={{
                      position: 'absolute', inset: '10px',
                      border: `2px solid ${C.blueGlow}`,
                      borderRadius: '12px',
                      animation: 'vaultPulse 4s infinite',
                    }} />

                    {/* Inner Screen Lines */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(rgba(137, 207, 240, 0.05) 1px, transparent 1px)',
                      backgroundSize: '100% 4px',
                      pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 2 }}>
                      <ShieldCheck size={64} color={C.blueGlow} strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 10px rgba(137,207,240,0.5))' }} />
                      <div style={{
                        color: C.blueText, fontSize: '0.9rem', fontWeight: 600, letterSpacing: '2px',
                        textShadow: '0 0 10px rgba(137,207,240,0.5)', textAlign: 'center',
                      }}>
                        SAFEHANDS<br/>VAULT
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vault Right Widget Panels */}
              <div style={{
                width: '180px', display: 'flex', flexDirection: 'column', gap: '1rem',
                justifyContent: 'center', position: 'relative', zIndex: 2
              }}>
                {/* Widget 1 */}
                <div style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '12px', padding: '0.8rem',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.6), 0 4px 10px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.textDark, marginBottom: '0.8rem', lineHeight: 1.2 }}>
                    AI SMART<br/>MATCHING
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><Lock size={16} color={C.textDark} /></div>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><Box size={16} color={C.textDark} /></div>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><Key size={16} color={C.textDark} /></div>
                  </div>
                </div>

                {/* Widget 2 */}
                <div style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '12px', padding: '0.8rem',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.6), 0 4px 10px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.textDark, marginBottom: '0.8rem', lineHeight: 1.2 }}>
                    LOST ITEM<br/>DATABASE
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><Box size={16} color={C.textDark} /></div>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><FileText size={16} color={C.textDark} /></div>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><List size={16} color={C.textDark} /></div>
                  </div>
                </div>

                {/* Widget 3 */}
                <div style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '12px', padding: '0.8rem',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.6), 0 4px 10px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.textDark, marginBottom: '0.8rem', lineHeight: 1.2 }}>
                    SECURE<br/>RECOVERY
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><Fingerprint size={16} color={C.textDark} /></div>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><Shield size={16} color={C.textDark} /></div>
                    <div style={{ padding: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}><KeyRound size={16} color={C.textDark} /></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section id="about-app" style={{
        padding: '6rem 2rem',
        background: C.bgDarker,
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <h2 style={{
          color: C.textWhite, fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 800,
          marginBottom: '1.5rem', letterSpacing: '-0.5px'
        }}>WHAT IS SAFEHANDS?</h2>
        <p style={{
          color: C.textMuted, fontSize: '1.1rem', lineHeight: 1.6,
          maxWidth: '800px', marginBottom: '3rem'
        }}>
          SafeHands is a centralized Lost & Found platform designed exclusively for campus communities. 
          Our goal is to make recovering lost items as seamless and secure as possible. Whether you've lost your keys, 
          left behind a backpack, or found someone else's ID card, SafeHands acts as the secure vault that connects 
          the finder with the owner.
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem', maxWidth: '1000px', width: '100%'
        }}>
          <div style={{ padding: '2rem', background: C.bgPanel, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: C.blueGlow, fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700 }}>Report</h3>
            <p style={{ color: C.textMuted, fontSize: '0.95rem', lineHeight: 1.5 }}>Easily log found items or report something you've lost. Add detailed descriptions and photos.</p>
          </div>
          <div style={{ padding: '2rem', background: C.bgPanel, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: C.blueGlow, fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700 }}>Match</h3>
            <p style={{ color: C.textMuted, fontSize: '0.95rem', lineHeight: 1.5 }}>Our system intelligently categorizes and filters reports to help you find a match quickly.</p>
          </div>
          <div style={{ padding: '2rem', background: C.bgPanel, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: C.blueGlow, fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700 }}>Recover</h3>
            <p style={{ color: C.textMuted, fontSize: '0.95rem', lineHeight: 1.5 }}>Communicate securely through the platform to arrange a safe return of the item.</p>
          </div>
        </div>
      </section>

      {/* Bottom Metallic Feature Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #8190a3 0%, #aab6c4 25%, #d1dce6 50%, #aab6c4 75%, #8190a3 100%)',
        padding: '1.5rem 0',
        borderTop: '1px solid rgba(255,255,255,0.6)',
        borderBottom: '1px solid rgba(0,0,0,0.2)',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
        display: 'flex', justifyContent: 'center', gap: '4rem',
        position: 'relative', zIndex: 10,
      }}>
        {/* Shine overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {[
          { icon: <Lock size={16} />, label: 'SECURE CAMPUS' },
          { icon: <Box size={16} />, label: 'SMART MATCHING' },
          { icon: <ShieldCheck size={16} />, label: 'VERIFIED RECOVERY' },
          { icon: <FileText size={16} />, label: 'REAL-TIME ALERTS' },
        ].map((feat, i) => (
          <div key={i} style={{ 
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            color: '#2a3441', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px',
            textShadow: '0 1px 1px rgba(255,255,255,0.6)', zIndex: 2
          }}>
            <div style={{ opacity: 0.7 }}>{feat.icon}</div>
            {feat.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
