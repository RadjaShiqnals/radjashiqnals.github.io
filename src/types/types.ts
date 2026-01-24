export interface SocialMedia {
    name: string;
    url: string;
    icon: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    image: string;
    technologies: string[];
    link?: string;
}

export interface PortfolioData {
    profile: {
        name: string;
        fullName: string;
        title: string;
        image: string;
        bio: string;
        location: string;
        age: number;
        education: string;
    };
    socialMedia: SocialMedia[];
    about: {
        introduction: string;
        experience: string;
        specializations: string[];
        currentFocus: string[];
    };
    projects: Project[];
}
