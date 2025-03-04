
import { useState } from 'react';

export type PlatformSettings = {
  general: {
    siteName: string;
    siteDescription: string;
    logo: string;
    contactEmail: string;
    supportPhone: string;
    logoUrl: string;
    faviconUrl: string;
    platformName: string;
    defaultLanguage: string;
    timezone: string;
    metaDescription: string;
  };
  orderForm: {
    serviceName: string;
    serviceDescription: string;
    showSubjectFields: boolean;
    showPageCount: boolean;
    showWordCount: boolean;
    showDeadlineOptions: boolean;
    showCitationStyles: boolean;
    showInstructions: boolean;
    basePricePerPage: string;
    urgentDeliveryMultiplier: string;
    minimumHours: string;
    standardDeliveryDays: string;
    priceDisplayMode: "perPage" | "total";
    orderSummaryPosition: "right" | "bottom";
    enabledPaperTypes: string[];
    enabledSubjects: string[];
    wordsPerPage: string;
    pricing: {
      basePricePerPage: number;
      urgentDeliveryMultiplier: number;
      wordsPerPage: number;
      minimumHours: number;
      standardDeliveryDays: number;
    };
    display: {
      orderSummaryPosition: "right" | "bottom";
      priceDisplayMode: "perPage" | "total";
    };
    fields: {
      showSubjectFields: boolean;
      showPageCount: boolean;
      showWordCount: boolean;
      showDeadlineOptions: boolean;
      showCitationStyles: boolean;
      showInstructions: boolean;
      enabledPaperTypes: string[];
      enabledSubjects: string[];
    };
  };
};

// This is a hook that manages the platform settings
// In a real application, this would connect to a backend API
export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      siteName: 'EssayPro',
      siteDescription: 'Professional academic writing assistance',
      logo: '/logo.svg',
      contactEmail: 'support@essaypro.com',
      supportPhone: '+1 (800) 123-4567',
      logoUrl: '/logo.svg',
      faviconUrl: '/favicon.ico',
      platformName: 'EssayPro',
      defaultLanguage: 'en',
      timezone: 'UTC',
      metaDescription: 'Professional academic writing assistance for students of all levels',
    },
    orderForm: {
      serviceName: "Essay Writing Service",
      serviceDescription: "Professional academic writing assistance for students of all levels",
      showSubjectFields: true,
      showPageCount: true,
      showWordCount: true,
      showDeadlineOptions: true,
      showCitationStyles: true,
      showInstructions: true,
      basePricePerPage: "15.99",
      urgentDeliveryMultiplier: "1.5",
      minimumHours: "6",
      standardDeliveryDays: "7",
      priceDisplayMode: "total",
      orderSummaryPosition: "right",
      enabledPaperTypes: [],
      enabledSubjects: [],
      wordsPerPage: "275",
      pricing: {
        basePricePerPage: 15.99,
        urgentDeliveryMultiplier: 1.5,
        wordsPerPage: 275,
        minimumHours: 6,
        standardDeliveryDays: 7,
      },
      display: {
        orderSummaryPosition: "right",
        priceDisplayMode: "total",
      },
      fields: {
        showSubjectFields: true,
        showPageCount: true,
        showWordCount: true,
        showDeadlineOptions: true,
        showCitationStyles: true,
        showInstructions: true,
        enabledPaperTypes: [],
        enabledSubjects: [],
      },
    }
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const isAdmin = true; // Placeholder for actual admin check

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const uploadFile = (file: File): Promise<string> => {
    // Placeholder for file upload functionality
    console.log("File upload placeholder:", file);
    return Promise.resolve("/placeholder.svg");
  };

  return { 
    settings, 
    updateSettings, 
    isLoadingSettings, 
    uploadFile, 
    isAdmin, 
    initialLoad 
  };
};
