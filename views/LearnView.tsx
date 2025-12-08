import React from 'react';
import { UserX, Globe, Smartphone, Gift, Heart, AlertOctagon } from 'lucide-react';

const LearnView: React.FC = () => {
  const scams = [
    {
      title: 'Grandparent Scams',
      icon: <UserX className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      color: 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30',
      desc: "Someone pretends to be your grandchild in trouble (jail, hospital) and begs you to send money immediately. They often beg you not to tell anyone.",
      signs: ["Caller sounds upset or different", "Urgent request for wire transfer or cash", "Begs for secrecy"]
    },
    {
      title: 'Tech Support Scams',
      icon: <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30',
      desc: "You get a popup or call saying your computer has a virus. They ask for remote access to your computer or payment to 'fix' it.",
      signs: ["Loud alarms on computer", "Asking for remote control", "Asking for gift cards for payment"]
    },
    {
      title: 'Lottery & Prize Scams',
      icon: <Gift className="w-8 h-8 text-green-600 dark:text-green-400" />,
      color: 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30',
      desc: "You are told you won a huge prize, but you must pay 'taxes' or 'fees' first to get it. Real prizes never ask for money upfront.",
      signs: ["You didn't enter a lottery", "Asking for fees upfront", "High pressure to pay now"]
    },
    {
      title: 'Romance Scams',
      icon: <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
      color: 'bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-900/30',
      desc: "Someone you met online professes love quickly but can never meet in person. Eventually, they ask for money for an emergency.",
      signs: ["Love declared very fast", "Always has an excuse not to meet", "Asks for money"]
    },
     {
      title: 'Fake Government Calls',
      icon: <AlertOctagon className="w-8 h-8 text-red-600 dark:text-red-400" />,
      color: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30',
      desc: "Callers pretending to be IRS, Social Security, or Police say you will be arrested unless you pay immediately.",
      signs: ["Threats of arrest", "Demands for secrecy", "Payment by gift card"]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Common Scams to Watch For</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">Knowledge is your best protection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scams.map((scam, i) => (
          <div key={i} className={`p-6 rounded-3xl border-2 ${scam.color} hover:shadow-md transition-shadow bg-white dark:bg-gray-800`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                {scam.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{scam.title}</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 leading-relaxed">
              {scam.desc}
            </p>
            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Signs to look for:</span>
              <ul className="mt-2 space-y-1">
                {scam.signs.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-800 dark:text-gray-200 font-medium">
                    <span className="text-red-400 mt-1.5">•</span>
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearnView;