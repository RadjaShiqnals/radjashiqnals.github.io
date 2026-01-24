import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faXTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faHome, faUser, faLaptopCode, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import type { SocialMedia } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import './Sidebar.css';

interface SidebarProps {
    profileImage: string;
    name: string;
    title: string;
    socialMedia: SocialMedia[];
    activeView: string;
    onNavigate: (view: string) => void;
}

const iconMap: Record<string, any> = {
    github: faGithub,
    linkedin: faLinkedin,
    x: faXTwitter,
    instagram: faInstagram,
    youtube: faYoutube
};

const Sidebar = ({ profileImage, name, title, socialMedia, activeView, onNavigate }: SidebarProps) => {
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { id: 'home', label: 'Homepage', icon: faHome },
        { id: 'about', label: 'About Me', icon: faUser },
        { id: 'projects', label: 'Projects', icon: faLaptopCode }
    ];

    return (
        <aside className="sidebar glass">
            <div className="sidebar-content">
                <div className="profile-section">
                    <div className="profile-image-wrapper">
                        <img src={profileImage} alt={name} className="profile-image" />
                        <div className="profile-ring"></div>
                    </div>
                    <h2 className="profile-name">{name}</h2>
                    <p className="profile-title">{title}</p>
                </div>

                <div className="social-links">
                    {socialMedia.map((social) => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link glass-hover"
                            title={social.name}
                        >
                            <FontAwesomeIcon icon={iconMap[social.icon] || faGithub} />
                        </a>
                    ))}
                </div>

                <nav className="navigation">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                        >
                            <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button onClick={toggleTheme} className="theme-toggle glass-hover" title="Toggle theme">
                    <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
