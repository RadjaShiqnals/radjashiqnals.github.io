export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  screenshots: string[];
  tags: string[];
  url: string;
  urlLabel?: string;
  isFigma?: boolean;
}

export type DummyProject = ProjectItem;

export const dummyProjects: ProjectItem[] = [
  {
    id: "medtrack",
    title: "MedTrack Clinic OS",
    category: "UI/UX & Health Platform",
    description:
      "A comprehensive clinic web portal and pharmacy concept where users can consult healthcare guides and browse remedies for common ailments.",
    image: "/projects/MedTrackLogo.png",
    screenshots: [
      "/projects/MedTrackLogo.png",
      "/projects/MedTrack1.png",
      "/projects/MedTrack2.png",
      "/projects/MedTrack3.png",
    ],
    tags: ["Figma", "UI/UX Design", "Clinic Portal", "Healthcare"],
    url: "https://www.figma.com/design/lsYYkr3WivyFrGkZNYAWK5/MedTrack--nai-archive?node-id=0-1&node-type=CANVAS&t=Q0nZ34F9n1mB65PE-0",
    urlLabel: "View Figma Design",
    isFigma: true,
  },
  {
    id: "toko-online",
    title: "Toko Online E-Commerce",
    category: "Full Stack Web App",
    description:
      "A clean e-commerce web application featuring CRUD authentication, product catalog management, and an administrative dashboard for store operations.",
    image: "/projects/TokoOnline.jpeg",
    screenshots: [
      "/projects/TokoOnline.jpeg",
      "/projects/TokoOnline2.jpeg",
      "/projects/TokoOnline3.jpeg",
      "/projects/TokoOnline4.jpeg",
    ],
    tags: ["PHP", "MySQL", "Authentication", "CRUD", "E-Commerce"],
    url: "https://github.com/RadjaShiqnals/TokoOnline",
    urlLabel: "View Repository",
    isFigma: false,
  },
  {
    id: "java-project",
    title: "Java Geometric Calculator",
    category: "Desktop Application",
    description:
      "A desktop software built in Java that calculates geometric properties, area, volume, and perimeter for rectangular solids and prisms.",
    image: "/projects/Java.png",
    screenshots: [
      "/projects/Java.png",
      "/projects/Java1.png",
      "/projects/Java2.png",
      "/projects/Java3.png",
    ],
    tags: ["Java", "OOP", "Desktop Software", "Algorithms"],
    url: "https://github.com/RadjaShiqnals/JavaProject",
    urlLabel: "View Repository",
    isFigma: false,
  },
];

export interface DummySkillGroup {
  name: string;
  items: { name: string; level: string; iconName: string }[];
}

export const dummySkills: DummySkillGroup[] = [
  {
    name: "Backend & Systems",
    items: [
      { name: "PHP / Laravel", level: "Web Dev & REST API", iconName: "Server" },
      { name: "Python", level: "Basic Scripting", iconName: "FileCode" },
      { name: "Node.js / JavaScript", level: "Runtime & Tooling", iconName: "Cpu" },
      { name: "MySQL", level: "Database & CRUD Queries", iconName: "Database" },
      { name: "Linux / CachyOS", level: "Daily OS & Hyprland", iconName: "Terminal" },
    ],
  },
  {
    name: "Frontend & Interfaces",
    items: [
      { name: "Vue.js 3 (Composition API)", level: "Components & Reactive UI", iconName: "Layout" },
      { name: "Astro 5", level: "Static Sites & Portfolio", iconName: "Rocket" },
      { name: "Tailwind CSS v4", level: "Responsive UI & Styling", iconName: "Palette" },
      { name: "React", level: "Component Basics", iconName: "Component" },
    ],
  },
  {
    name: "Dev Workflow & Toolchain",
    items: [
      { name: "Neovim (NvChad)", level: "Primary Code Editor", iconName: "TerminalSquare" },
      { name: "Bruno / Postman", level: "API Testing", iconName: "Zap" },
      { name: "Git & GitHub", level: "Version Control", iconName: "GitBranch" },
      { name: "Docker", level: "Basic Containerization", iconName: "Box" },
    ],
  },
];

export interface DummyExperience {
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string[];
}

export const dummyExperiences: DummyExperience[] = [
  {
    role: "Junior Full Stack Developer",
    company: "SIDIGS",
    period: "2023 — Present",
    location: "Lawang, Malang, Indonesia",
    summary: [
      "Building school management web features using Laravel and Vue 3.",
      "Developing CRUD APIs, database migrations, and responsive UI components.",
      "Collaborating on sprint tasks, fixing bugs, and maintaining clean git commits.",
    ],
  },
  {
    role: "Software Engineering Alumnus",
    company: "SMK Telkom Malang",
    period: "2020 — 2023",
    location: "Malang, East Java, Indonesia",
    summary: [
      "Learned fundamental software engineering, web development, and relational databases.",
      "Built several student projects, web capstones, and point-of-sale desktop software.",
    ],
  },
];

export interface TrashItem {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  joke: string;
}

export const trashItems: TrashItem[] = [
  {
    id: "trash-1",
    name: "node_modules",
    size: "999.4 GB",
    type: "Black Hole Directory",
    date: "A few minutes ago",
    joke: "Contains 84,000 left-pad dependencies you never asked for.",
  },
  {
    id: "trash-2",
    name: "fix_bug_sidigs_final_v2_beneran.php",
    size: "14.2 KB",
    type: "PHP Script",
    date: "Yesterday at 03:42 AM",
    joke: "The bug was actually in a missing semicolon on line 12.",
  },
  {
    id: "trash-3",
    name: "curhat_kenapa_css_susah_center.txt",
    size: "4.8 KB",
    type: "Text Document",
    date: "Last week",
    joke: "Just use 'place-items: center', bro.",
  },
  {
    id: "trash-4",
    name: "unreal_engine_game_idea_never_finished.blend",
    size: "4.2 GB",
    type: "3D Project File",
    date: "2 months ago",
    joke: "MMORPG with 100% science-based dragons.",
  },
];
