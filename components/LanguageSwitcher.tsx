'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';

const languages = {
  km: {
    name: 'ភាសាខ្មែរ',
    countryCode: 'KH',
    font: 'font-kantumruy',
  },
  en: {
    name: 'English',
    countryCode: 'US',
    font: '',
  },
};

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = pathname.split('/')[1] || 'km';
  const currentLanguage = languages[currentLocale as keyof typeof languages];

  const switchLanguage = (locale: string) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <ReactCountryFlag
          countryCode={currentLanguage.countryCode}
          svg
          style={{
            width: '1.25rem',
            height: '1.25rem',
            borderRadius: '2px',
          }}
        />
        <span className={`text-sm font-medium text-[#363942] hidden sm:inline ${currentLocale === 'km' ? 'font-kantumruy' : ''}`}>
          {currentLanguage.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#363942]/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
            >
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => switchLanguage(code)}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${lang.font} ${
                    currentLocale === code
                      ? 'bg-[#E5F2FF] text-[#007FFF]'
                      : 'text-[#363942] hover:bg-gray-50'
                  }`}
                >
                  <ReactCountryFlag
                    countryCode={lang.countryCode}
                    svg
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      borderRadius: '2px',
                    }}
                  />
                  <span className={`text-sm font-medium ${lang.font}`}>
                    {lang.name}
                  </span>
                  {currentLocale === code && (
                    <div className="ml-auto w-2 h-2 bg-[#007FFF] rounded-full" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
