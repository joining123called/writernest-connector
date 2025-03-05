
import * as z from 'zod';

export const orderFormSchema = z.object({
  paperType: z.string({
    required_error: "Please select a paper type",
  }),
  subject: z.string({
    required_error: "Please select a subject",
  }),
  pages: z.string({
    required_error: "Please select number of pages",
  }),
  deadline: z.date({
    required_error: "Please select a deadline",
  }),
  topic: z.string().optional(),
  instructions: z.string().optional(),
  citationStyle: z.string().optional(),
  sources: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

// Constants for the form
export const paperTypes = [
  { value: "essay", label: "Essay" },
  { value: "research", label: "Research Paper" },
  { value: "case-study", label: "Case Study" },
  { value: "dissertation", label: "Dissertation" },
  { value: "article", label: "Article/Review" },
  { value: "assignment", label: "Assignment" },
  { value: "presentation", label: "Presentation" },
  { value: "editing", label: "Editing/Proofreading" },
];

export const subjects = [
  { value: "business", label: "Business" },
  { value: "psychology", label: "Psychology" },
  { value: "nursing", label: "Nursing & Healthcare" },
  { value: "sociology", label: "Sociology" },
  { value: "economics", label: "Economics" },
  { value: "history", label: "History" },
  { value: "literature", label: "Literature" },
  { value: "science", label: "Science" },
  { value: "engineering", label: "Engineering" },
  { value: "other", label: "Other" },
];

export const citationStyles = [
  { value: "apa", label: "APA" },
  { value: "mla", label: "MLA" },
  { value: "chicago", label: "Chicago/Turabian" },
  { value: "harvard", label: "Harvard" },
  { value: "other", label: "Other" },
  { value: "none", label: "Not required" },
];

export const timeSlots = [
  { label: "9:00 AM", hours: 9, minutes: 0 },
  { label: "12:00 PM", hours: 12, minutes: 0 },
  { label: "3:00 PM", hours: 15, minutes: 0 },
  { label: "6:00 PM", hours: 18, minutes: 0 },
  { label: "9:00 PM", hours: 21, minutes: 0 },
  { label: "11:59 PM", hours: 23, minutes: 59 },
];
