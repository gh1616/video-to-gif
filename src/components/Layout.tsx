import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Video, Menu, X, Wrench } from 'lucide-react';
import './Layout.css';

const navItems = [
  { path: '/', label: '首页', icon: null },
  { path: '/video-to-gif', label: '视频转GIF', icon: Video },
];

function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* 顶部导航 */}
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <Wrench className="logo-icon" />
            <span>工具箱</span>
          </Link>
          
          <nav className="desktop-nav">
            {navItems.slice(1).map(item => (
              <Link 
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon && <item.icon size={16} />}
                {item.label}
              </Link>
            ))}
          </nav>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.slice(1).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.icon && <item.icon size={18} />}
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* 主内容区 */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="footer">
        <p>视频转GIF工具 - 让工作更高效</p>
      </footer>
    </div>
  );
}

export default Layout;