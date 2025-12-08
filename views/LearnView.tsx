import React from 'react';
import { UserX, Globe, Gift, Heart, AlertOctagon, ShieldAlert } from 'lucide-react';

const LearnView: React.FC = () => {
  const scams = [
    {
      title: 'Grandparent Scams',
      icon: UserX,
      gradient: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50 dark:bg-purple-900/10',
      borderLight: 'border-purple-200 dark:border-purple-800/30',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      desc: "Someone pretends to be your grandchild in trouble (jail, hospital) and begs you to send money immediately. They often beg you not to tell anyone.",
      signs: ["Caller sounds upset or different", "Urgent request for wire transfer or cash", "Begs for secrecy"]
    },
    {
      title: 'Tech Support Scams',
      icon: Globe,
      gradient: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50 dark:bg-blue-900/10',
      borderLight: 'border-blue-200 dark:border-blue-800/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      desc: "You get a popup or call saying your computer has a virus. They ask for remote access to your computer or payment to 'fix' it.",
      signs: ["Loud alarms on computer", "Asking for remote control", "Asking for gift cards for payment"]
    },
    {
      title: 'Lottery & Prize Scams',
      icon: Gift,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/10',
      borderLight: 'border-emerald-200 dark:border-emerald-800/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      desc: "You are told you won a huge prize, but you must pay 'taxes' or 'fees' first to get it. Real prizes never ask for money upfront.",
      signs: ["You didn't enter a lottery", "Asking for fees upfront", "High pressure to pay now"]
    },
    {
      title: 'Romance Scams',
      icon: Heart,
      gradient: 'from-pink-500 to-rose-600',
      bgLight: 'bg-pink-50 dark:bg-pink-900/10',
      borderLight: 'border-pink-200 dark:border-pink-800/30',
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
      desc: "Someone you met online professes love quickly but can never meet in person. Eventually, they ask for money for an emergency.",
      signs: ["Love declared very fast", "Always has an excuse not to meet", "Asks for money"]
    },
    {
      title: 'Fake Government Calls',
      icon: AlertOctagon,
      gradient: 'from-red-500 to-orange-600',
      bgLight: 'bg-red-50 dark:bg-red-900/10',
      borderLight: 'border-red-200 dark:border-red-800/30',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      desc: "Callers pretending to be IRS, Social Security, or Police say you will be arrested unless you pay immediately.",
      signs: ["Threats of arrest", "Demands for secrecy", "Payment by gift card"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center md:text-left animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium mb-4">
          <ShieldAlert className="w-4 h-4" />
          Stay Informed
        </div>
        <h2 className="text-4xl font-display font-bold text-txt dark:text-txt-dark tracking-tight">
          Common Scams to <span className="gradient-text">Watch For</span>
        </h2>
        <p className="text-xl text-stone-600 dark:text-stone-300 mt-3">
          Knowledge is your best protection. Learn the warning signs.
        </p>
      </div>

      {/* Scam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scams.map((scam, i) => {
          const Icon = scam.icon;
          return (
            <div 
              key={i} 
              className={`group p-6 rounded-3xl border-2 ${scam.borderLight} ${scam.bgLight} hover:shadow-lg transition-all hover-lift animate-slide-up bg-surface dark:bg-surface-dark`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`relative`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${scam.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity`} />
                  <div className={`relative p-3 ${scam.iconBg} rounded-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${scam.iconColor}`} strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark">
                  {scam.title}
                </h3>
              </div>
              
              {/* Description */}
              <p className="text-stone-700 dark:text-stone-300 text-lg mb-5 leading-relaxed">
                {scam.desc}
              </p>
              
              {/* Warning Signs */}
              <div className="bg-white/60 dark:bg-black/20 p-4 rounded-2xl border border-stone-200/50 dark:border-stone-700/50">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Warning Signs
                </span>
                <ul className="space-y-2">
                  {scam.signs.map((sign, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-stone-700 dark:text-stone-300">
                      <span className="mt-2 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
                      <span className="font-medium">{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Tip */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 md:p-8 text-white animate-slide-up stagger-5">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="text-center md:text-left flex-grow">
            <h3 className="text-2xl font-display font-bold mb-2">Remember the Golden Rule</h3>
            <p className="text-white/90 text-lg">
              If someone is pressuring you to act fast or keep a secret, it's almost always a scam. 
              Take your time and talk to someone you trust first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnView;
