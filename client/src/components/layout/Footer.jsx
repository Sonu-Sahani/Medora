import { HeartPulse, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center">
                <HeartPulse size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Med<span className="text-primary-400">ora</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Modern healthcare management platform connecting patients with
              top doctors across all specialties.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-primary-400" />
                support@medora.health
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-primary-400" />
                +1 (800) MEDORA
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-primary-400" />
                Available Nationwide
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#specialties" className="hover:text-white transition-colors">Specialties</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Doctor Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 mb-6" />
        <p className="text-center text-xs">
          © {new Date().getFullYear()} Medora. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;