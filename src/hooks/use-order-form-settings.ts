
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface OrderFormSettingsType {
  // General settings
  serviceName: string;
  serviceDescription: string;
  
  // Fields settings
  showSubjectFields: boolean;
  showPageCount: boolean;
  showWordCount: boolean;
  showDeadlineOptions: boolean;
  showCitationStyles: boolean;
  showInstructions: boolean;
  showPaperType: boolean;  // Setting for Paper Type field
  showSources: boolean;    // Setting for Number of Sources field
  
  // Pricing settings
  basePricePerPage: number;
  urgentDeliveryMultiplier: number;
  urgent12HoursMultiplier: number; // New multiplier for 12 hours
  urgent24HoursMultiplier: number; // New multiplier for 24 hours
  urgent48HoursMultiplier: number; // New multiplier for 48 hours
  minimumHours: number;
  standardDeliveryDays: number;
  
  // Display settings
  priceDisplayMode: "perPage" | "total";
  orderSummaryPosition: "right" | "bottom";
  
  // Currency settings
  defaultCurrency: string;
  showCurrencySelector: boolean;
}

// Default settings
const defaultSettings: OrderFormSettingsType = {
  serviceName: "Essay Writing Service",
  serviceDescription: "Professional academic writing assistance for students of all levels",
  showSubjectFields: true,
  showPageCount: true,
  showWordCount: true,
  showDeadlineOptions: true,
  showCitationStyles: true,
  showInstructions: true,
  showPaperType: true,     // Default to show Paper Type
  showSources: true,       // Default to show Number of Sources
  basePricePerPage: 15.99,
  urgentDeliveryMultiplier: 1.5,
  urgent12HoursMultiplier: 2.0, // Default 2.0x for 12 hours
  urgent24HoursMultiplier: 1.8, // Default 1.8x for 24 hours
  urgent48HoursMultiplier: 1.5, // Default 1.5x for 48 hours
  minimumHours: 6,
  standardDeliveryDays: 7,
  priceDisplayMode: "total",
  orderSummaryPosition: "right",
  defaultCurrency: "USD",
  showCurrencySelector: true
};

export function useOrderFormSettings() {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['order-form-settings'],
    queryFn: async (): Promise<OrderFormSettingsType> => {
      // Try to get settings from the platform_settings table where key starts with "orderForm"
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'orderFormSettings');

      if (error) {
        console.error("Error fetching order form settings:", error);
        return defaultSettings;
      }

      // If no settings found, return defaults
      if (!data || data.length === 0) {
        return defaultSettings;
      }

      try {
        // Parse the saved settings - handle type casting safely
        const rawValue = data[0].value;
        
        // Ensure boolean values are properly cast - important for toggle settings
        const savedSettings = rawValue as unknown as Partial<OrderFormSettingsType>;
        
        // Convert all boolean strings to actual booleans (this fixes the toggling issue)
        const parsedSettings: Partial<OrderFormSettingsType> = {
          ...savedSettings,
          // Convert all possible string booleans to actual booleans
          showSubjectFields: typeof savedSettings.showSubjectFields === 'string' 
            ? savedSettings.showSubjectFields === 'true' 
            : Boolean(savedSettings.showSubjectFields),
          showPageCount: typeof savedSettings.showPageCount === 'string' 
            ? savedSettings.showPageCount === 'true' 
            : Boolean(savedSettings.showPageCount),
          showWordCount: typeof savedSettings.showWordCount === 'string' 
            ? savedSettings.showWordCount === 'true' 
            : Boolean(savedSettings.showWordCount),
          showDeadlineOptions: typeof savedSettings.showDeadlineOptions === 'string' 
            ? savedSettings.showDeadlineOptions === 'true' 
            : Boolean(savedSettings.showDeadlineOptions),
          showCitationStyles: typeof savedSettings.showCitationStyles === 'string' 
            ? savedSettings.showCitationStyles === 'true' 
            : Boolean(savedSettings.showCitationStyles),
          showInstructions: typeof savedSettings.showInstructions === 'string' 
            ? savedSettings.showInstructions === 'true' 
            : Boolean(savedSettings.showInstructions),
          showPaperType: typeof savedSettings.showPaperType === 'string' 
            ? savedSettings.showPaperType === 'true' 
            : Boolean(savedSettings.showPaperType),
          showSources: typeof savedSettings.showSources === 'string' 
            ? savedSettings.showSources === 'true' 
            : Boolean(savedSettings.showSources),
          
          // Ensure all numeric values are actually numbers
          basePricePerPage: typeof savedSettings.basePricePerPage === 'string' 
            ? parseFloat(savedSettings.basePricePerPage) 
            : savedSettings.basePricePerPage || defaultSettings.basePricePerPage,
          urgentDeliveryMultiplier: typeof savedSettings.urgentDeliveryMultiplier === 'string' 
            ? parseFloat(savedSettings.urgentDeliveryMultiplier) 
            : savedSettings.urgentDeliveryMultiplier || defaultSettings.urgentDeliveryMultiplier,
          urgent12HoursMultiplier: typeof savedSettings.urgent12HoursMultiplier === 'string'
            ? parseFloat(savedSettings.urgent12HoursMultiplier)
            : savedSettings.urgent12HoursMultiplier || defaultSettings.urgent12HoursMultiplier,
          urgent24HoursMultiplier: typeof savedSettings.urgent24HoursMultiplier === 'string'
            ? parseFloat(savedSettings.urgent24HoursMultiplier)
            : savedSettings.urgent24HoursMultiplier || defaultSettings.urgent24HoursMultiplier,
          urgent48HoursMultiplier: typeof savedSettings.urgent48HoursMultiplier === 'string'
            ? parseFloat(savedSettings.urgent48HoursMultiplier)
            : savedSettings.urgent48HoursMultiplier || defaultSettings.urgent48HoursMultiplier,
          minimumHours: typeof savedSettings.minimumHours === 'string' 
            ? parseInt(savedSettings.minimumHours) 
            : savedSettings.minimumHours || defaultSettings.minimumHours,
          standardDeliveryDays: typeof savedSettings.standardDeliveryDays === 'string' 
            ? parseInt(savedSettings.standardDeliveryDays) 
            : savedSettings.standardDeliveryDays || defaultSettings.standardDeliveryDays,
        };
        
        // Merge with defaults to ensure all fields exist
        console.log("Processed settings:", {...defaultSettings, ...parsedSettings});
        return { ...defaultSettings, ...parsedSettings };
      } catch (e) {
        console.error("Error parsing order form settings:", e);
        return defaultSettings;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    settings: settings || defaultSettings,
    isLoading,
    error
  };
}
