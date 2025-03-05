
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
  minimumHours: number;
  standardDeliveryDays: number;
  
  // Display settings
  priceDisplayMode: "perPage" | "total";
  orderSummaryPosition: "right" | "bottom";
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
  minimumHours: 6,
  standardDeliveryDays: 7,
  priceDisplayMode: "total",
  orderSummaryPosition: "right"
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
