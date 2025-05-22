import { FiGithub, FiMail, FiGlobe, FiShield, FiHeart } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "How It Works", href: "#how-it-works" },
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Demo", href: "#demo" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#about" },
        { name: "Blog", href: "#blog" },
        { name: "Careers", href: "#careers" },
        { name: "Contact", href: "#contact" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#docs" },
        { name: "API Reference", href: "#api" },
        { name: "Support", href: "#support" },
        { name: "Status", href: "#status" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#privacy" },
        { name: "Terms of Service", href: "#terms" },
        { name: "Cookie Policy", href: "#cookies" },
        { name: "GDPR", href: "#gdpr" }
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                EDGUARD
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Protecting academic integrity through AI-powered understanding and empathetic support. 
              Building trust, not surveillance.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 group"
              >
                <FiGithub className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="mailto:hello@edguard.ai"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 group"
              >
                <FiMail className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 group"
              >
                <FiGlobe className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-300 transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400">
                Get the latest updates on AI ethics, academic integrity, and EDGUARD features.
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <span>© {currentYear} EDGUARD. All rights reserved.</span>
              <div className="hidden md:flex items-center gap-1">
                <span>Made with</span>
                <FiHeart className="w-4 h-4 text-red-400" />
                <span>at Hackathon Morocco 2025</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FiShield className="w-4 h-4 text-green-400" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-sm"></div>
                <span>Blockchain Secured</span>
              </div>
            </div>
          </div>

          {/* Mobile "Made with love" */}
          <div className="md:hidden flex items-center justify-center gap-1 text-gray-400 text-sm mt-2">
            <span>Made with</span>
            <FiHeart className="w-4 h-4 text-red-400" />
            <span>at Hackathon Morocco 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
}