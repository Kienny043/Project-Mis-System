function Footer() {
  return (
    <>
      {/* Footer - Now outside relative positioning */}
      <footer className="relative z-20 bg-gray-900 text-gray-300 py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand Info */}
          <div>
            <h2 className="text-xl font-semibold text-white">Maintenance Tracker</h2>
            <p className="mt-3 text-sm leading-6">
              A streamlined platform designed to simplify request submissions, 
              monitor maintenance tasks, and ensure faster response times.
            </p>
          </div>

          {/* Quick Links (non-clickable until login) */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li className="opacity-50 cursor-not-allowed">Dashboard</li>
              <li className="opacity-50 cursor-not-allowed">Maintenance Requests</li>
              <li className="opacity-50 cursor-not-allowed">Staff Portal</li>
              <li className="opacity-50 cursor-not-allowed">Reports</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: support@maintenancetracker.com</li>
              <li>Phone: +63 912 345 6789</li>
              <li>Location: Quezon Province, Philippines</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Maintenance Tracker. All rights reserved.
        </div>
      </footer>
    </>
  );
}

export default Footer;
