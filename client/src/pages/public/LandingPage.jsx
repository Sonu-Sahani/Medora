import { Link } from "react-router-dom";
import {
  HeartPulse,
  Calendar,
  FileText,
  Shield,
  Star,
  ArrowRight,
  CheckCircle2,
  Flower2,
  ScanLine,
  Smile,
  Stethoscope,
  Ear,
  Brain,
  Sparkles,
  Baby,
  Bone,
  Activity,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

const specialties = [
  { name: "Gynecology", icon: Flower2, color: "bg-pink-50 text-pink-600" },
  { name: "Radiology", icon: ScanLine, color: "bg-blue-50 text-blue-600" },
  { name: "Dentistry", icon: Smile, color: "bg-yellow-50 text-yellow-600" },
  {
    name: "General Medicine",
    icon: Stethoscope,
    color: "bg-green-50 text-green-600",
  },
  { name: "ENT", icon: Ear, color: "bg-orange-50 text-orange-600" },
  { name: "Cardiology", icon: HeartPulse, color: "bg-red-50 text-red-600" },
  {
    name: "Dermatology",
    icon: Sparkles,
    color: "bg-purple-50 text-purple-600",
  },
  { name: "Orthopedics", icon: Bone, color: "bg-slate-50 text-slate-600" },
  { name: "Pediatrics", icon: Baby, color: "bg-teal-50 text-teal-600" },
  { name: "Psychiatry", icon: Brain, color: "bg-indigo-50 text-indigo-600" },
];

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up in minutes. No paperwork, no hassle — just a simple form to get started.",
    icon: Shield,
  },
  {
    step: "02",
    title: "Choose a Specialty",
    description:
      "Browse through our wide range of medical specialties and find the care you need.",
    icon: Activity,
  },
  {
    step: "03",
    title: "Book an Appointment",
    description:
      "View available slots and book a consultation with your preferred doctor instantly.",
    icon: Calendar,
  },
  {
    step: "04",
    title: "Get Your Reports",
    description:
      "Receive AI-powered medical reports in simple language with health recommendations.",
    icon: FileText,
  },
];

const stats = [
  { value: "50+", label: "Specialist Doctors" },
  { value: "10+", label: "Medical Specialties" },
  { value: "98%", label: "Patient Satisfaction" },
  { value: "24/7", label: "Platform Available" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-32">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full opacity-30 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-100 rounded-full opacity-30 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-600 animate-pulse" />
            Modern Healthcare, Simplified
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6 animate-slide-up">
            Your Health,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
              Our Priority
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Connect with top specialist doctors, book appointments in seconds,
            and get AI-powered health insights — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              to="/register"
              className="btn-primary text-base px-8 py-3.5 rounded-xl inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary text-base px-8 py-3.5 rounded-xl"
            >
              See How It Works
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-slate-500">
            {[
              "HIPAA Compliant",
              "AI-Powered Reports",
              "Verified Doctors",
              "Instant Booking",
            ].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-secondary-500" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary-600 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold text-white mb-1">
                  {value}
                </div>
                <div className="text-primary-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">
              What We Cover
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4">
              Medical Specialties
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              From general care to specialized treatment — our platform covers
              all your health needs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {specialties.map(({ name, icon: Icon, color }) => (
              <Link
                to="/login"
                key={name}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-cardHover transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={22} />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center leading-tight">
                  {name}
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/register"
              className="btn-secondary inline-flex items-center gap-2 text-sm"
            >
              View All Specialties
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4">
              How Medora Works
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Getting quality healthcare has never been this easy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ step, title, description, icon: Icon }, index) => (
              <div key={step} className="relative">
                {/* Connector line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-primary-100 z-0" />
                )}
                <div className="relative z-10 bg-white rounded-2xl p-6 shadow-card hover:shadow-cardHover transition-all duration-300 border border-slate-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Icon size={22} className="text-primary-600" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-100">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Feature Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">
                AI-Powered
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-6">
                Smart Reports You <br />
                Can Actually Understand
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Our AI analyzes your medical data and generates clear,
                easy-to-understand reports — no medical jargon, just simple
                language with actionable health recommendations and safety tips.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Specialty-specific AI report generation for doctors",
                  "Plain-language summaries for patients",
                  "Personalized precautions and health tips",
                  "Secure and HIPAA-compliant storage",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-secondary-500 mt-0.5 shrink-0"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="btn-primary inline-flex items-center gap-2"
              >
                Try It Free
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Visual placeholder for AI card */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 border border-primary-100">
                <div className="bg-white rounded-2xl p-6 shadow-card mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                      <FileText size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        AI Medical Report
                      </p>
                      <p className="text-xs text-slate-400">
                        Generated by Medora AI
                      </p>
                    </div>
                    <span className="ml-auto text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                      Ready
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-slate-100 rounded-full w-full" />
                    <div className="h-2.5 bg-slate-100 rounded-full w-4/5" />
                    <div className="h-2.5 bg-slate-100 rounded-full w-3/4" />
                  </div>
                  <div className="mt-4 p-3 bg-secondary-50 rounded-xl border border-secondary-100">
                    <p className="text-xs text-secondary-700 font-medium mb-1">
                      💡 AI Recommendation
                    </p>
                    <div className="h-2 bg-secondary-100 rounded-full w-full mb-1.5" />
                    <div className="h-2 bg-secondary-100 rounded-full w-2/3" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["Overall Health", "Risk Level", "Follow Up"].map(
                    (label) => (
                      <div
                        key={label}
                        className="bg-white rounded-xl p-3 shadow-sm text-center border border-slate-100"
                      >
                        <div className="h-6 w-6 rounded-full bg-primary-100 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">{label}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Floating rating card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-cardHover p-4 border border-slate-100 flex items-center gap-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    4.9 / 5.0
                  </p>
                  <p className="text-xs text-slate-400">Patient Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to take control of your health?
          </h2>
          <p className="text-primary-200 mb-8 text-lg">
            Join thousands of patients who trust Medora for their healthcare
            needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-2"
            >
              Create Free Account
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="border border-primary-400 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-500 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
