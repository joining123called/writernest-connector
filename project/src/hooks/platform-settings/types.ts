export interface PlatformSetting {
  key: string;
  value: any;
}

export interface PlatformSettings {
  platformName: string;
  defaultLanguage: string;
  timezone: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  metaDescription: string;
  serviceName: string;
  serviceDescription: string;
  showSubjectFields: boolean;
  showPageCount: boolean;
  showWordCount: boolean;
  showDeadlineOptions: boolean;
  showCitationStyles: boolean;
  showInstructions: boolean;
  showPaperType: boolean;
  showSources: boolean;
  basePricePerPage: number;
  urgentDeliveryMultiplier: number;
  urgent12HoursMultiplier: number;
  urgent24HoursMultiplier: number;
  urgent48HoursMultiplier: number;
  minimumHours: number;
  standardDeliveryDays: number;
  priceDisplayMode: "perPage" | "total";
  orderSummaryPosition: "right" | "bottom";
  [key: string]: string | boolean | null | undefined | number;
}

export const defaultSettings: PlatformSettings = {
  platformName: "Essay Writing Service",
  defaultLanguage: "en",
  timezone: "UTC",
  logoUrl: null,
  faviconUrl: null,
  metaDescription: "Professional academic writing assistance",
  serviceName: "Essay Writing Service",
  serviceDescription: "Professional academic writing assistance for students of all levels",
  showSubjectFields: true,
  showPageCount: true,
  showWordCount: true,
  showDeadlineOptions: true,
  showCitationStyles: true,
  showInstructions: true,
  showPaperType: true,
  showSources: true,
  basePricePerPage: 15.99,
  urgentDeliveryMultiplier: 1.5,
  urgent12HoursMultiplier: 2.0,
  urgent24HoursMultiplier: 1.8,
  urgent48HoursMultiplier: 1.5,
  minimumHours: 6,
  standardDeliveryDays: 7,
  priceDisplayMode: "total",
  orderSummaryPosition: "right"
};