import { ref, computed } from 'vue';

// Define available languages
export type AvailableLanguage = 'en' | 'de';

// Define translation structure
export interface Translations {
  [key: string]: string | Translations;
}

// Define translations for each language
const translations: Record<AvailableLanguage, Translations> = {
  en: {
    app: {
      title: 'Pii AR',
      ready: 'Ready to connect (secure connection)',
      lightRequired: 'More light required',
    },
    buttons: {
      scanQR: 'Scan QR Code',
      createTutorial: 'Make a video guide',
      startNow: 'Start now',
      rateUs: 'Rate us',
      giveFeedback: 'Give feedback',
    },
    settings: {
      title: 'Settings',
      general: 'General',
      configuration: 'Configuration',
      logs: 'Logs',
      about: 'About',
      microphone: 'Microphone',
      microphoneDesc: 'Start sessions with microphone activated',
      showARSurfaces: 'Show surfaces and notable points',
      showARSurfacesDesc: 'Improve accuracy when marking by seeing how object recognition works',
      showEventLog: 'Show event log',
      crashReports: 'Anonymous crash reports',
      crashReportsDesc: 'Error reports are sent to our development team for analysis. We will only use these reports to improve the app.',
      licenseAgreement: 'End user license agreement',
      privacyPolicy: 'Privacy policy',
      thirdPartyLicenses: 'Third party licenses',
      version: 'Version',
      id: 'ID',
    },
  },
  de: {
    app: {
      title: 'Pii AR',
      ready: 'Bereit zum Verbinden (sichere Verbindung)',
      lightRequired: 'Mehr Licht erforderlich',
    },
    buttons: {
      scanQR: 'QR-Code erfassen',
      createTutorial: 'Erstellen Sie eine Videoanleitung',
      startNow: 'Jetzt loslegen',
      rateUs: 'Bewerten Sie uns',
      giveFeedback: 'Feedback geben',
    },
    settings: {
      title: 'Einstellungen',
      general: 'Allgemein',
      configuration: 'Konfiguration',
      logs: 'Logs',
      about: 'Über TeamViewer',
      microphone: 'Mikrofon',
      microphoneDesc: 'Starten Sie Sessions mit aktiviertem Mikrofon.',
      showARSurfaces: 'Flächen und markante Punkte einblenden',
      showARSurfacesDesc: 'Verbessern Sie die Genauigkeit beim Markieren, indem Sie sehen wie die Objekterkennung funktioniert.',
      showEventLog: 'Ereignisprotokoll anzeigen',
      crashReports: 'Anonyme Absturzberichte',
      crashReportsDesc: 'Fehlerberichte werden zur Analyse an unser Entwicklungsteam gesendet. Wir werden diese Berichte nur zur Verbesserung der App verwenden.',
      licenseAgreement: 'Endbenutzer-Lizenzvereinbarung',
      privacyPolicy: 'Datenschutzrichtlinie',
      thirdPartyLicenses: 'Urheberrechte Dritter',
      version: 'Pii AR Version',
      id: 'Pii AR ID',
    },
  },
};

export function useLocalization() {
  // Get browser language or use English as fallback
  const getBrowserLanguage = (): AvailableLanguage => {
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'de') ? 'de' : 'en';
  };

  // Current language
  const currentLanguage = ref<AvailableLanguage>(getBrowserLanguage());

  // Set language
  const setLanguage = (lang: AvailableLanguage) => {
    currentLanguage.value = lang;
    // Persist language preference
    localStorage.setItem('language', lang);
  };

  // Get current translations
  const t = computed(() => {
    return translations[currentLanguage.value];
  });

  // Initialize from stored preference if available
  const init = () => {
    const storedLang = localStorage.getItem('language') as AvailableLanguage | null;
    if (storedLang && (storedLang === 'en' || storedLang === 'de')) {
      currentLanguage.value = storedLang;
    }
  };

  // Helper function to get nested translation values
  const translate = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[currentLanguage.value];
    
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  // Initialize
  init();

  return {
    currentLanguage,
    setLanguage,
    t,
    translate,
    availableLanguages: ['en', 'de'] as AvailableLanguage[],
  };
}
