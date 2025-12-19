import { Bell, Search, Settings } from './icons'
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="logo">Fundify</h1>
          <span className="logo-subtitle">Dashboard Financeiro</span>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={20} />
            <input type="text" placeholder="Buscar..." />
          </div>
          <button className="icon-button">
            <Bell size={20} />
            <span className="badge">3</span>
          </button>
          <button className="icon-button">
            <Settings size={20} />
          </button>
          <div className="user-avatar">
            <img src="https://ui-avatars.com/api/?name=Usuario&background=6366f1&color=fff" alt="User" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

