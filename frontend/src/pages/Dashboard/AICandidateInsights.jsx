import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain,
    Search,
    Filter,
    ArrowUpDown,
    User,
    Users,
    MessageSquare,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Star,
    Award,
    Briefcase
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/ui/Button';
import './AICandidateInsights.css';

const AICandidateInsights = () => {
    const { t, dir } = useLanguage();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterScore, setFilterScore] = useState('all');
    const [sortBy, setSortBy] = useState('score');

    // Mock Data for Demonstration
    const candidates = [
        {
            id: 1,
            name: "Ahmad Al-Hassan",
            role: "Senior React Developer",
            score: 95,
            experience: 6,
            recommendation: "Exceptional match. Strong proficiency in all core requirements. Highly recommended for immediate interview.",
            skills: ["React", "TypeScript", "Node.js", "GraphQL", "Redux"],
            missingSkills: [],
            isTop: true
        },
        {
            id: 2,
            name: "Sara Suliman",
            role: "Frontend Engineer",
            score: 88,
            experience: 4,
            recommendation: "Strong technical background. Missing GraphQL but shows high potential based on similar projects.",
            skills: ["React", "TypeScript", "Redux", "SCSS"],
            missingSkills: ["GraphQL"],
            isTop: true
        },
        {
            id: 3,
            name: "Omar Bakri",
            role: "Fullstack Developer",
            score: 82,
            experience: 5,
            recommendation: "Solid experience. Good overlap with technical stack, though React experience is slightly below target.",
            skills: ["Node.js", "React", "MongoDB", "Express"],
            missingSkills: ["TypeScript", "GraphQL"],
            isTop: true
        },
        {
            id: 4,
            name: "Lina Mansour",
            role: "UI Engineer",
            score: 79,
            experience: 3,
            recommendation: "Great UI skills but lacks backend knowledge required for this specific hybrid role.",
            skills: ["React", "Figma", "CSS3", "HTML5"],
            missingSkills: ["Node.js", "TypeScript"],
            isTop: false
        },
        {
            id: 5,
            name: "Fatima Ahmed",
            role: "JavaScript Developer",
            score: 72,
            experience: 2,
            recommendation: "Promising junior. Strong foundational knowledge but requires significant mentorship.",
            skills: ["JavaScript", "HTML", "CSS", "React"],
            missingSkills: ["TypeScript", "GraphQL", "Node.js"],
            isTop: false
        }
    ];

    const filteredCandidates = useMemo(() => {
        return candidates
            .filter(c => {
                const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesScore = filterScore === 'all' ||
                    (filterScore === 'high' && c.score >= 85) ||
                    (filterScore === 'med' && c.score >= 75 && c.score < 85) ||
                    (filterScore === 'low' && c.score < 75);
                return matchesSearch && matchesScore;
            })
            .sort((a, b) => {
                if (sortBy === 'score') return b.score - a.score;
                if (sortBy === 'exp') return b.experience - a.experience;
                return 0;
            });
    }, [searchTerm, filterScore, sortBy]);

    const topFive = candidates.filter(c => c.isTop).sort((a, b) => b.score - a.score).slice(0, 5);

    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 80) return '#6366f1';
        if (score >= 70) return '#f59e0b';
        return '#ef4444';
    };

    const CandidateCard = ({ candidate, featured = false }) => (
        <div className={`candidate-card glass ${featured ? 'featured' : ''}`}>
            <div className="card-top">
                <div className="candidate-main">
                    <div className="candidate-avatar">
                        {candidate.name.charAt(0)}
                    </div>
                    <div className="candidate-name">
                        <h3>{candidate.name}</h3>
                        <span className="exp">{candidate.experience} {t('yearsExp')}</span>
                    </div>
                </div>
                <div className="score-badge" style={{ backgroundColor: `${getScoreColor(candidate.score)}15`, border: `1px solid ${getScoreColor(candidate.score)}30` }}>
                    <span className="label" style={{ color: getScoreColor(candidate.score) }}>{t('aiScore')}</span>
                    <span className="value" style={{ color: getScoreColor(candidate.score) }}>{candidate.score}%</span>
                </div>
            </div>

            <div className="ai-progress-container">
                <div className="ai-progress-bar">
                    <div
                        className="ai-progress-fill"
                        style={{
                            width: `${candidate.score}%`,
                            background: `linear-gradient(90deg, ${getScoreColor(candidate.score)}80, ${getScoreColor(candidate.score)})`
                        }}
                    ></div>
                </div>
            </div>

            <div className="recommendation-box">
                {candidate.recommendation}
            </div>

            <div className="tags-section">
                <div className="tags-label">{t('skills')}</div>
                <div className="tag-cloud">
                    {candidate.skills.map(s => (
                        <span key={s} className="tag match">{s}</span>
                    ))}
                </div>
            </div>

            {candidate.missingSkills.length > 0 && (
                <div className="tags-section">
                    <div className="tags-label">{t('missingSkills')}</div>
                    <div className="tag-cloud">
                        {candidate.missingSkills.map(s => (
                            <span key={s} className="tag missing">{s}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="card-actions">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/candidate/${candidate.id}`)}
                    className="btn-full"
                >
                    <User size={16} />
                    {t('viewProfile')}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="insights-container" dir={dir}>
            <div className="insights-header">
                <div className="header-content">
                    <h1>{t('aiCandidateInsights')}</h1>
                    <p>{t('candidateInsightsDesc')}</p>
                </div>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    {t('back')}
                </Button>
            </div>

            <div className="summary-grid">
                <div className="summary-card glass">
                    <div className="summary-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <Users size={24} />
                    </div>
                    <div className="summary-info">
                        <h4>{t('totalApplicants')}</h4>
                        <div className="value">128</div>
                    </div>
                </div>
                <div className="summary-card glass">
                    <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Award size={24} />
                    </div>
                    <div className="summary-info">
                        <h4>{t('highPotential')}</h4>
                        <div className="value">12</div>
                    </div>
                </div>
                <div className="summary-card glass">
                    <div className="summary-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="summary-info">
                        <h4>{t('avgScore')}</h4>
                        <div className="value">76%</div>
                    </div>
                </div>
            </div>

            <div className="top-section">
                <div className="section-label">
                    <Star size={20} className="text-primary" fill="var(--primary)" />
                    {t('topCandidates')}
                </div>
                <div className="top-grid">
                    {topFive.map(c => (
                        <CandidateCard key={c.id} candidate={c} featured={true} />
                    ))}
                </div>
            </div>

            <div className="filter-bar glass">
                <div className="search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t('searchCandidates')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                        <select
                            className="filter-select"
                            value={filterScore}
                            onChange={(e) => setFilterScore(e.target.value)}
                        >
                            <option value="all">{t('allStatuses')}</option>
                            <option value="high">{t('highScoreRange') || '85%+ Score'}</option>
                            <option value="med">{t('medScoreRange') || '75% - 85% Score'}</option>
                            <option value="low">{t('lowScoreRange') || 'Below 75%'}</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="score">{t('aiScore')}</option>
                            <option value="exp">{t('experience')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="candidate-list-grid">
                {filteredCandidates.map(c => (
                    <CandidateCard key={c.id} candidate={c} />
                ))}
            </div>
        </div>
    );
};

export default AICandidateInsights;
