import React from 'react';
import { UserX, Globe, Gift, Heart, AlertOctagon, ShieldAlert, Mail, TrendingUp, ShoppingBag, Briefcase } from 'lucide-react';

const LearnView: React.FC = () => {
  const scams = [
    {
      title: 'Grandparent Scams',
      category: 'Family Impersonation',
      icon: UserX,
      image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50 dark:bg-purple-900/10',
      borderLight: 'border-purple-200 dark:border-purple-800/30',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      desc: "Someone pretends to be your grandchild in trouble (jail, hospital) and begs you to send money immediately.",
      signs: ["Caller sounds upset", "Urgent request", "Begs for secrecy"]
    },
    {
      title: 'Tech Support Scams',
      category: 'Cyber Security',
      icon: Globe,
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50 dark:bg-blue-900/10',
      borderLight: 'border-blue-200 dark:border-blue-800/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      desc: "You get a popup or call saying your computer has a virus. They ask for remote access for payment to 'fix' it.",
      signs: ["Loud alarms", "Requesting access", "Gift card payment"]
    },
    {
      title: 'Lottery & Prize Scams',
      category: 'Financial Fraud',
      icon: Gift,
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/10',
      borderLight: 'border-emerald-200 dark:border-emerald-800/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      desc: "You are told you won a huge prize, but you must pay 'taxes' or 'fees' first to get it.",
      signs: ["Unentered lottery", "Upfront fees", "Pressure to pay"]
    },
    {
      title: 'Romance Scams',
      category: 'Social Engineering',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1516575150278-77136aed6920?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-pink-500 to-rose-600',
      bgLight: 'bg-pink-50 dark:bg-pink-900/10',
      borderLight: 'border-pink-200 dark:border-pink-800/30',
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
      desc: "Someone you met online professes love quickly but can never meet in person. Eventually, they ask for money.",
      signs: ["Fast declarations", "Excuses not to meet", "Money requests"]
    },
    {
      title: 'Fake Government Calls',
      category: 'Impersonation',
      icon: AlertOctagon,
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-red-500 to-orange-600',
      bgLight: 'bg-red-50 dark:bg-red-900/10',
      borderLight: 'border-red-200 dark:border-red-800/30',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      desc: "Callers pretending to be IRS or Police say you will be arrested unless you pay immediately.",
      signs: ["Threats of arrest", "Demands secrecy", "Unusual payment"]
    },
    {
      title: 'Phishing Scams',
      category: 'Digital Fraud',
      icon: Mail,
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-amber-500 to-yellow-600',
      bgLight: 'bg-amber-50 dark:bg-amber-900/10',
      borderLight: 'border-amber-200 dark:border-amber-800/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      desc: "Fake emails or texts pretending to be legitimate companies ask you to click links and provide private info.",
      signs: ["Generic greetings", "Suspicious links", "Urgent warnings"]
    },
    {
      title: 'Investment & Crypto',
      category: 'Financial Fraud',
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50 dark:bg-green-900/10',
      borderLight: 'border-green-200 dark:border-green-800/30',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      desc: "Promises of 'guaranteed' high returns with little risk, often involving cryptocurrency or foreign exchange.",
      signs: ["Guaranteed returns", "Complex strategies", "Unregistered sellers"]
    },
    {
      title: 'Online Shopping',
      category: 'E-commerce Fraud',
      icon: ShoppingBag,
      image: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-indigo-500 to-blue-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/10',
      borderLight: 'border-indigo-200 dark:border-indigo-800/30',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      desc: "Fake online stores or sellers seeking payment for goods that are fake, poor quality, or never arrive.",
      signs: ["Prices too low", "Unsecure website", "Wire transfer only"]
    },
    {
      title: 'Employment Scams',
      category: 'Job Fraud',
      icon: Briefcase,
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=60',
      gradient: 'from-cyan-500 to-sky-600',
      bgLight: 'bg-cyan-50 dark:bg-cyan-900/10',
      borderLight: 'border-cyan-200 dark:border-cyan-800/30',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      desc: "Job offers that require you to pay a fee for training/equipment or ask for too much personal info upfront.",
      signs: ["High pay/low work", "Upfront fees", "Instant hiring"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center md:text-left animate-slide-up">
        <h2 className="text-4xl font-display font-bold text-txt dark:text-txt-dark tracking-tight">
          Common Scams to <span className="gradient-text">Watch For</span>
        </h2>
        <p className="text-xl text-stone-600 dark:text-stone-300 mt-3">
          Knowledge is your best protection. Learn the warning signs.
        </p>
      </div>

      {/* Tip */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200 dark:border-orange-800/30 rounded-2xl p-2 md:p-4 animate-slide-up stagger-5">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white h-fit rounded-xl shadow-lg shadow-orange-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="text-center md:text-left flex-grow">
            <h3 className="text-xl font-display font-bold text-stone-900 dark:text-white mb-2">Remember the Golden Rule</h3>
            <p className="text-stone-600 dark:text-stone-400 text-md leading-relaxed">
              Legitimate entities do not require immediate action or secrecy. If a request involves pressure tactics, it is likely a security threat. Please pause, verify the source, and consult a trusted advisor before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Scam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scams.map((scam, i) => {
          const Icon = scam.icon;
          return (
            <div
              key={i}
              className="group relative flex flex-col bg-surface dark:bg-[#1a1c1e] rounded-[16px] border border-border dark:border-border-dark overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Image Section */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img
                  src={scam.image}
                  alt={scam.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute top-4 left-4 z-20">
                  <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${scam.gradient} animate-pulse`} />
                    <span className="text-xs font-medium text-white/90">{scam.category}</span>
                  </div>
                </div>

                <div className={`absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-2xl font-display font-bold text-txt dark:text-white mb-2 line-clamp-1">
                  {scam.title}
                </h3>

                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-6 line-clamp-3">
                  {scam.desc}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Warning Signs</span>
                    <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {scam.signs.map((sign, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50 text-xs font-medium text-stone-600 dark:text-stone-300"
                      >
                        {sign}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearnView;