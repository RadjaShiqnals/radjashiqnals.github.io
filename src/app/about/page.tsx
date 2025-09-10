import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faGithub,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faDownload } from "@fortawesome/free-solid-svg-icons";

export default function About() {
  const skills = [
    {
      category: "Frontend",
      technologies: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Vue.js",
        "HTML5",
        "CSS3",
      ],
    },
    {
      category: "Backend",
      technologies: [
        "Node.js",
        "Python",
        "Express",
        "Django",
        "PostgreSQL",
        "MongoDB",
        "REST APIs",
      ],
    },
    {
      category: "Tools & Others",
      technologies: [
        "Git",
        "Docker",
        "AWS",
        "Figma",
        "Jest",
        "Webpack",
        "GraphQL",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About Me
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get to know more about my background, skills, and passion for
            development.
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="md:flex">
            <div className="md:w-1/3 p-8 flex justify-center items-center">
              <img
                src="https://placehold.co/300x300/6366f1/ffffff?text=Profile+Photo"
                alt="Profile"
                className="w-48 h-48 rounded-full shadow-lg border-4 border-white dark:border-gray-700"
              />
            </div>
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Hello, I'm Your Name
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-4">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Skills & Technologies
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {skillGroup.category}
                </h3>
                <div className="space-y-2">
                  {skillGroup.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-block mx-1 mb-2 px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Experience
          </h2>
          <div className="space-y-8">
            <div className="relative pl-8 border-l-2 border-blue-200 dark:border-blue-800">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Senior Frontend Developer
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Tech Company • 2022 - Present
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Developed and maintained multiple web applications using React
                  and Next.js.
                </p>
              </div>
            </div>
            <div className="relative pl-8 border-l-2 border-blue-200 dark:border-blue-800">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Full Stack Developer
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Startup Inc • 2020 - 2022
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua. Built scalable web applications and RESTful APIs.
                </p>
              </div>
            </div>
            <div className="relative pl-8 border-l-2 border-blue-200 dark:border-blue-800">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Junior Developer
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Digital Agency • 2019 - 2020
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Ut enim ad minim veniam, quis nostrud exercitation. Assisted
                  in developing client websites and learned modern web
                  development practices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Let's Connect
          </h2>
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              I'm always open to discussing new opportunities, interesting
              projects, or just having a chat about technology. Feel free to
              reach out through any of these platforms.
            </p>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center space-x-6 mb-8">
            <a
              href="#"
              className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} className="w-6 h-6" />
            </a>
            <a
              href="#"
              className="flex items-center justify-center w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
              aria-label="GitHub"
            >
              <FontAwesomeIcon icon={faGithub} className="w-6 h-6" />
            </a>
            <a
              href="#"
              className="flex items-center justify-center w-12 h-12 bg-blue-400 hover:bg-blue-500 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
              aria-label="Twitter"
            >
              <FontAwesomeIcon icon={faTwitter} className="w-6 h-6" />
            </a>
            <a
              href="mailto:your.email@example.com"
              className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
              aria-label="Email"
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6" />
            </a>
          </div>

          {/* Download Resume Button */}
          <div className="text-center">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
              Download Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
