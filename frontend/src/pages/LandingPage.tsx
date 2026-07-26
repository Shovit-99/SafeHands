import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Clock, MapPin, ArrowRight, ChevronRight, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#111111', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      
      {/* ─── Navigation ─── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: '#ccff00', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18, color: '#111' }}>L</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SafeHands</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontWeight: 600, fontSize: '0.95rem' }}>
          <a href="#about" style={{ textDecoration: 'none', color: '#666' }}>About</a>
          <a href="#features" style={{ textDecoration: 'none', color: '#666' }}>Features</a>
          <a href="#faq" style={{ textDecoration: 'none', color: '#666' }}>FAQ</a>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" style={{ padding: '0.6rem 1.2rem', fontWeight: 600, textDecoration: 'none', color: '#111' }}>Login</Link>
          <Link to="/explore" style={{ background: '#111', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: 999, fontWeight: 600, textDecoration: 'none' }}>Explore Items</Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section style={{ padding: '6rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ background: '#ccff00', padding: '0.4rem 1rem', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>✨</span> THE ULTIMATE CAMPUS FINDER
        </div>
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', maxWidth: 1000, margin: '0 auto 1.5rem', textTransform: 'uppercase' }}>
          FIND YOUR <span style={{ background: '#ccff00', padding: '0 1rem', display: 'inline-block', transform: 'rotate(-2deg)' }}>LOST ITEMS</span> EASILY
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: 600, marginBottom: '3rem', lineHeight: 1.6 }}>
          Join the community network dedicated to reuniting you with your lost belongings. Fast, secure, and intuitive.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/report" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ccff00', color: '#111', padding: '1rem 2rem', borderRadius: 999, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(204,255,0,0.4)', transition: 'transform 0.2s' }}>
            Report an Item <ArrowRight size={20} />
          </Link>
          <Link to="/explore" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', color: '#111', border: '2px solid #111', padding: '1rem 2rem', borderRadius: 999, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none' }}>
            Browse Found Items
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 120, height: 120, background: 'url(https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=300&h=300&fit=crop) center/cover', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', opacity: 0.9 }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 150, height: 150, background: 'url(https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&h=300&fit=crop) center/cover', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', opacity: 0.9 }}></div>
      </section>

      {/* ─── About Section (Dark) ─── */}
      <section id="about" style={{ background: '#111', color: '#fff', padding: '6rem 5%', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#ccff00', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>About Us</h2>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '2rem' }}>
            A community-driven platform focused on user-centered retrieval.
          </p>
          <p style={{ fontSize: '1.1rem', color: '#999', lineHeight: 1.7, marginBottom: '2rem' }}>
            With expertise in secure communication and intuitive digital experiences, SafeHands connects those who have lost items with those who have found them. Our goal is to make campus life stress-free.
          </p>
          <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#333', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: 999, fontWeight: 600, textDecoration: 'none' }}>
            Learn More <ArrowRight size={18} />
          </Link>
        </div>
        <div style={{ flex: '1 1 400px', display: 'flex', gap: '1rem' }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: 24, flex: 1 }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ccff00', marginBottom: '0.5rem' }}>1.5k+</div>
            <div style={{ color: '#999', fontWeight: 600 }}>Items Reunited</div>
          </div>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: 24, flex: 1 }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ccff00', marginBottom: '0.5rem' }}>99%</div>
            <div style={{ color: '#999', fontWeight: 600 }}>Success Rate</div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" style={{ padding: '6rem 5%', background: '#f4f5f5' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Tailored Solutions<br/>to Bring Your Items Back</h2>
          <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#111', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 999, fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
            Explore All Features <ArrowRight size={16} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Card 1 */}
          <div style={{ background: '#fff', padding: '3rem 2rem', borderRadius: 32, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ width: 60, height: 60, background: '#111', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Smart Search & Filtering</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>Find exactly what you're looking for with our advanced search and categorization system. Filter by date, location, or item type.</p>
            </div>
          </div>
          {/* Card 2 */}
          <div style={{ background: '#ccff00', padding: '3rem 2rem', borderRadius: 32, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ width: 60, height: 60, background: '#111', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Secure Communication</h3>
              <p style={{ color: '#111', lineHeight: 1.6 }}>Chat safely with finders or owners without exposing your personal contact information until you're ready.</p>
            </div>
          </div>
          {/* Card 3 */}
          <div style={{ background: '#fff', padding: '3rem 2rem', borderRadius: 32, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ width: 60, height: 60, background: '#111', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Real-time Notifications</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>Get instantly notified when an item matching your description is found or when someone replies to your report.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Recent Items (Portfolio Style) ─── */}
      <section style={{ padding: '6rem 5%' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '3rem', maxWidth: 600 }}>Where Community Meets Reliability. Explore Recent Finds</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'url(https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80) center/cover', height: 400, borderRadius: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Sony Headphones</h3>
              <p style={{ opacity: 0.8 }}>Found in Main Library • 2 hours ago</p>
            </div>
          </div>
          <div style={{ background: 'url(https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80) center/cover', height: 400, borderRadius: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Designer Sunglasses</h3>
              <p style={{ opacity: 0.8 }}>Found at Student Union • 5 hours ago</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" style={{ padding: '6rem 5%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '3rem' }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth: 800, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            'How do I report a lost item on campus?',
            'Is it completely free to use SafeHands?',
            'How do you verify the owner of an item?',
            'What happens if my item is never claimed?'
          ].map((q, i) => (
            <div key={i} style={{ background: i === 0 ? '#111' : '#f4f5f5', color: i === 0 ? '#fff' : '#111', padding: '1.5rem 2rem', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{q}</span>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? '#ccff00' : '#111', color: i === 0 ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={20} style={{ transform: i === 0 ? 'rotate(90deg)' : 'none' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section style={{ padding: '4rem 5%' }}>
        <div style={{ background: '#111', borderRadius: 40, padding: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ zIndex: 1 }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', maxWidth: 500 }}>Transform Your Losses into Happy Reunions</h2>
            <Link to="/report" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ccff00', color: '#111', padding: '1rem 2rem', borderRadius: 999, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none' }}>
              Report Lost Item <ArrowRight size={20} />
            </Link>
          </div>
          {/* Images decoration */}
          <div style={{ display: 'flex', gap: '1rem', zIndex: 1 }}>
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=200&fit=crop" alt="Students" style={{ borderRadius: 20, width: 200, height: 140, objectFit: 'cover', transform: 'rotate(-5deg)' }} />
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=200&fit=crop" alt="Campus" style={{ borderRadius: 20, width: 200, height: 140, objectFit: 'cover', transform: 'rotate(5deg)' }} />
          </div>
          <div style={{ position: 'absolute', right: '-10%', bottom: '-20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 70%)' }}></div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: '#0a0a0a', color: '#fff', padding: '6rem 5% 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', maxWidth: 400 }}>LET'S WORK TOGETHER TO FIND YOUR ITEMS</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#ccff00', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20, color: '#111' }}>L</div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>SafeHands</span>
            </div>
          </div>
          <div style={{ flex: '1 1 300px', background: '#1a1a1a', padding: '2.5rem', borderRadius: 24 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Get in Touch</h3>
            <input type="text" placeholder="Your Name" style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '1rem', borderRadius: 12, marginBottom: '1rem', color: '#fff', outline: 'none' }} />
            <input type="email" placeholder="Your Email" style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '1rem', borderRadius: 12, marginBottom: '1rem', color: '#fff', outline: 'none' }} />
            <textarea placeholder="How can we help?" style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', color: '#fff', outline: 'none', height: 100, resize: 'none' }}></textarea>
            <button style={{ width: '100%', background: '#ccff00', color: '#111', border: 'none', padding: '1rem', borderRadius: 12, fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>Send Message</button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2rem', borderTop: '1px solid #333', color: '#666', fontSize: '0.9rem' }}>
          <p>© 2026 SafeHands. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
