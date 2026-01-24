import './Homepage.css';

interface HomepageProps {
    fullName: string;
    title: string;
    bio: string;
}

const Homepage = ({ fullName, title, bio }: HomepageProps) => {
    return (
        <div className="homepage fade-in">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="greeting">Hello, I'm</div>
                    <h1 className="hero-title">{fullName}</h1>
                    <p className="hero-subtitle">{title}</p>
                    <p className="hero-bio">{bio}</p>
                    <div className="hero-actions">
                        <button className="btn-primary">View Projects</button>
                        <button className="btn-secondary">Contact Me</button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="floating-card glass">
                        <div className="card-glow"></div>
                        <div className="card-content">
                            <span className="tech-emoji">⚡</span>
                            <span className="tech-text">Building the Future</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
