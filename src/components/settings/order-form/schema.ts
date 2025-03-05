
import * as z from 'zod';

export const formSettingsSchema = z.object({
  // General settings
  serviceName: z.string().min(2, { message: "Service name must be at least 2 characters" }),
  serviceDescription: z.string().min(10, { message: "Description must be at least 10 characters" }),
  
  // Fields settings
  showSubjectFields: z.boolean().default(true),
  showPageCount: z.boolean().default(true),
  showWordCount: z.boolean().default(true),
  showDeadlineOptions: z.boolean().default(true),
  showCitationStyles: z.boolean().default(true),
  showInstructions: z.boolean().default(true),
  showPaperType: z.boolean().default(true),
  showSources: z.boolean().default(true),
  
  // Pricing settings
  basePricePerPage: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Must be a valid price" }),
  urgentDeliveryMultiplier: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Must be a valid multiplier" }),
  urgent12HoursMultiplier: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Must be a valid multiplier" }),
  urgent24HoursMultiplier: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Must be a valid multiplier" }),
  urgent48HoursMultiplier: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Must be a valid multiplier" }),
  
  // Deadline options
  minimumHours: z.string().min(1, { message: "Required" }),
  standardDeliveryDays: z.string().min(1, { message: "Required" }),
  
  // Display settings
  priceDisplayMode: z.enum(["perPage", "total"]),
  orderSummaryPosition: z.enum(["right", "bottom"]),
});

export type OrderFormSettingsSchema = z.infer<typeof formSettingsSchema>;
