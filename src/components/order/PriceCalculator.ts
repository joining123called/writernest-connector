
import { useState, useEffect } from 'react';

// Define types for our calculator
export type DeadlineOption = {
  value: string;
  label: string;
  multiplier: number;
  isUrgent: boolean;
};

export type OrderSummaryData = {
  basePrice: number;
  pages: number;
  words: number;
  deadline: string;
  deadlineText: string;
  pricePerPage: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
};

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

export const deadlines = [
  { value: "6h", label: "6 hours", multiplier: 2.0, isUrgent: true },
  { value: "12h", label: "12 hours", multiplier: 1.8, isUrgent: true },
  { value: "24h", label: "24 hours", multiplier: 1.6, isUrgent: true },
  { value: "48h", label: "2 days", multiplier: 1.4, isUrgent: false },
  { value: "72h", label: "3 days", multiplier: 1.2, isUrgent: false },
  { value: "7d", label: "7 days", multiplier: 1.0, isUrgent: false },
  { value: "14d", label: "14 days", multiplier: 0.9, isUrgent: false },
];

export const citationStyles = [
  { value: "apa", label: "APA" },
  { value: "mla", label: "MLA" },
  { value: "chicago", label: "Chicago/Turabian" },
  { value: "harvard", label: "Harvard" },
  { value: "other", label: "Other" },
  { value: "none", label: "Not required" },
];

export const usePriceCalculator = (pages: string, deadline: string) => {
  const [orderSummary, setOrderSummary] = useState<OrderSummaryData>({
    basePrice: 15.99,
    pages: 1,
    words: 275,
    deadline: '7d',
    deadlineText: '7 days',
    pricePerPage: 15.99,
    totalPrice: 15.99,
    discount: 0,
    finalPrice: 15.99,
  });
  
  useEffect(() => {
    const numPages = parseInt(pages || "1");
    const deadlineOption = deadlines.find(d => d.value === deadline) || deadlines[5];
    
    const basePrice = 15.99;
    const pricePerPage = basePrice * deadlineOption.multiplier;
    const totalPrice = pricePerPage * numPages;
    
    let discount = 0;
    if (numPages >= 3) {
      discount = totalPrice * 0.15;
    }
    
    const finalPrice = totalPrice - discount;
    
    setOrderSummary({
      basePrice,
      pages: numPages,
      words: numPages * 275,
      deadline: deadlineOption.value,
      deadlineText: deadlineOption.label,
      pricePerPage,
      totalPrice,
      discount,
      finalPrice
    });
  }, [pages, deadline]);
  
  return orderSummary;
};
