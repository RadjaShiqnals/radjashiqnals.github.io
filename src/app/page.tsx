import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img
              src="https://placehold.co/200x200/6366f1/ffffff?text=Profile"
              alt="Profile"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full mx-auto mb-6 shadow-lg border-4 border-white dark:border-gray-700"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Hello, I'm{" "}
            <span className="text-blue-600 dark:text-blue-400">Your Name</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A passionate developer creating innovative solutions and beautiful
            experiences
          </p>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/projects"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              View My Work
            </Link>
            <Link
              href="/about"
              className="inline-block bg-transparent border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
            >
              About Me
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <FontAwesomeIcon
            icon={faArrowDown}
            className="w-6 h-6 text-gray-400 dark:text-gray-500"
          />
        </div>
      </section>

      {/* Brief Introduction Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              What I Do
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              I specialize in creating digital experiences that combine
              beautiful design with robust functionality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <img
                  src="https://placehold.co/40x40/6366f1/ffffff?text=💻"
                  alt="Web Development"
                  className="w-8 h-8"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Web Development
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Building responsive and performant web applications using modern
                technologies.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <img
                  src="https://placehold.co/40x40/10b981/ffffff?text=🎨"
                  alt="UI/UX Design"
                  className="w-8 h-8"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                UI/UX Design
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Creating intuitive and engaging user interfaces that provide
                exceptional user experiences.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <img
                  src="https://placehold.co/40x40/8b5cf6/ffffff?text=🚀"
                  alt="Performance"
                  className="w-8 h-8"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Performance
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Optimizing applications for speed, accessibility, and
                scalability across all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Let's Work Together
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            I'm always interested in new opportunities and exciting projects.
            Let's discuss how we can bring your ideas to life.
          </p>
          <Link
            href="/about"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Get In Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
