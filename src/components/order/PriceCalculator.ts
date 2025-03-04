
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
  { value: "thesis", label: "Thesis" },
  { value: "article", label: "Article/Review" },
  { value: "assignment", label: "Assignment" },
  { value: "coursework", label: "Coursework" },
  { value: "term-paper", label: "Term Paper" },
  { value: "book-report", label: "Book Report" },
  { value: "movie-review", label: "Movie Review" },
  { value: "annotated-bibliography", label: "Annotated Bibliography" },
  { value: "presentation", label: "Presentation" },
  { value: "speech", label: "Speech/Presentation" },
  { value: "lab-report", label: "Lab Report" },
  { value: "capstone-project", label: "Capstone Project" },
  { value: "personal-statement", label: "Personal Statement" },
  { value: "admission-essay", label: "Admission Essay" },
  { value: "scholarship-essay", label: "Scholarship Essay" },
  { value: "editing", label: "Editing/Proofreading" },
  { value: "rewriting", label: "Rewriting" },
  { value: "powerpoint", label: "PowerPoint Presentation" },
  { value: "math-problem", label: "Math Problem" },
  { value: "statistics-project", label: "Statistics Project" },
  { value: "business-plan", label: "Business Plan" },
  { value: "marketing-plan", label: "Marketing Plan" },
  { value: "reflection-paper", label: "Reflection Paper" },
  { value: "literature-review", label: "Literature Review" },
  { value: "multiple-choice", label: "Multiple Choice Questions" },
  { value: "other", label: "Other" },
];

export const subjects = [
  { value: "business", label: "Business" },
  { value: "business-management", label: "Business Management" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "accounting", label: "Accounting" },
  { value: "economics", label: "Economics" },
  { value: "psychology", label: "Psychology" },
  { value: "nursing", label: "Nursing & Healthcare" },
  { value: "health-sciences", label: "Health Sciences" },
  { value: "medicine", label: "Medicine" },
  { value: "sociology", label: "Sociology" },
  { value: "political-science", label: "Political Science" },
  { value: "history", label: "History" },
  { value: "art-history", label: "Art History" },
  { value: "philosophy", label: "Philosophy" },
  { value: "religion", label: "Religion & Theology" },
  { value: "literature", label: "Literature" },
  { value: "english", label: "English" },
  { value: "linguistics", label: "Linguistics" },
  { value: "education", label: "Education" },
  { value: "biology", label: "Biology" },
  { value: "chemistry", label: "Chemistry" },
  { value: "physics", label: "Physics" },
  { value: "environmental-science", label: "Environmental Science" },
  { value: "geography", label: "Geography" },
  { value: "computer-science", label: "Computer Science" },
  { value: "it", label: "Information Technology" },
  { value: "engineering", label: "Engineering" },
  { value: "mechanical-engineering", label: "Mechanical Engineering" },
  { value: "electrical-engineering", label: "Electrical Engineering" },
  { value: "civil-engineering", label: "Civil Engineering" },
  { value: "law", label: "Law" },
  { value: "criminal-justice", label: "Criminal Justice" },
  { value: "anthropology", label: "Anthropology" },
  { value: "communications", label: "Communications" },
  { value: "journalism", label: "Journalism" },
  { value: "social-work", label: "Social Work" },
  { value: "architecture", label: "Architecture" },
  { value: "human-resources", label: "Human Resources" },
  { value: "international-relations", label: "International Relations" },
  { value: "public-administration", label: "Public Administration" },
  { value: "ethics", label: "Ethics" },
  { value: "gender-studies", label: "Gender Studies" },
  { value: "mathematics", label: "Mathematics" },
  { value: "statistics", label: "Statistics" },
  { value: "music", label: "Music" },
  { value: "film-studies", label: "Film Studies" },
  { value: "other", label: "Other" },
];

export const deadlines = [
  { value: "6h", label: "6 hours", multiplier: 2.0, isUrgent: true },
  { value: "12h", label: "12 hours", multiplier: 1.8, isUrgent: true },
  { value: "24h", label: "24 hours", multiplier: 1.6, isUrgent: true },
  { value: "48h", label: "2 days", multiplier: 1.4, isUrgent: false },
  { value: "72h", label: "3 days", multiplier: 1.2, isUrgent: false },
  { value: "5d", label: "5 days", multiplier: 1.1, isUrgent: false },
  { value: "7d", label: "7 days", multiplier: 1.0, isUrgent: false },
  { value: "10d", label: "10 days", multiplier: 0.95, isUrgent: false },
  { value: "14d", label: "14 days", multiplier: 0.9, isUrgent: false },
  { value: "20d", label: "20 days", multiplier: 0.85, isUrgent: false },
  { value: "30d", label: "30 days", multiplier: 0.8, isUrgent: false },
];

export const citationStyles = [
  { value: "apa", label: "APA (7th edition)" },
  { value: "apa6", label: "APA (6th edition)" },
  { value: "mla", label: "MLA (9th edition)" },
  { value: "mla8", label: "MLA (8th edition)" },
  { value: "chicago-author-date", label: "Chicago/Turabian (Author-Date)" },
  { value: "chicago-notes-bibliography", label: "Chicago/Turabian (Notes-Bibliography)" },
  { value: "harvard", label: "Harvard" },
  { value: "vancouver", label: "Vancouver" },
  { value: "ieee", label: "IEEE" },
  { value: "ama", label: "AMA" },
  { value: "acs", label: "ACS" },
  { value: "asce", label: "ASCE" },
  { value: "aaa", label: "AAA" },
  { value: "bluebook", label: "Bluebook" },
  { value: "oscola", label: "OSCOLA" },
  { value: "asa", label: "ASA" },
  { value: "cse", label: "CSE" },
  { value: "apa-psychology", label: "APA (Psychology)" },
  { value: "turabian", label: "Turabian" },
  { value: "oxford", label: "Oxford" },
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
