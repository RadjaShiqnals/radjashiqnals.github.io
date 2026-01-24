import './AboutMe.css';

interface AboutMeProps {
    introduction: string;
    experience: string;
    specializations: string[];
    currentFocus: string[];
    location: string;
    age: number;
    education: string;
}

const AboutMe = ({ introduction, experience, specializations, currentFocus, location, age, education }: AboutMeProps) => {
    return (
        <div className="about-me fade-in">
            <div className="about-header">
                <h1>About Me</h1>
                <p className="about-subtitle">Get to know me better</p>
            </div>

            <div className="about-content">
                <section className="about-section glass">
                    <div className="section-icon">📍</div>
                    <div className="section-content">
                        <h3>Who I Am</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Age:</span>
                                <span className="info-value">{age} years old</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Location:</span>
                                <span className="info-value">{location}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Education:</span>
                                <span className="info-value">{education}</span>
                            </div>
                        </div>
                        <p className="section-text">{introduction}</p>
                    </div>
                </section>

                <section className="about-section glass">
                    <div className="section-icon">💼</div>
                    <div className="section-content">
                        <h3>Experience</h3>
                        <p className="section-text">{experience}</p>
                    </div>
                </section>

                <section className="about-section glass">
                    <div className="section-icon">⚡</div>
                    <div className="section-content">
                        <h3>Specializations</h3>
                        <ul className="skills-list">
                            {specializations.map((skill, index) => (
                                <li key={index} className="skill-item">
                                    <span className="skill-bullet">▸</span>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="about-section glass">
                    <div className="section-icon">🎯</div>
                    <div className="section-content">
                        <h3>Current Focus</h3>
                        <ul className="focus-list">
                            {currentFocus.map((focus, index) => (
                                <li key={index} className="focus-item">
                                    <span className="focus-bullet">→</span>
                                    {focus}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutMe;
