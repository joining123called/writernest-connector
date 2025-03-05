
import React from 'react';
import { citationStyles } from './PriceCalculator';
import { FormField, FormControl, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlignLeft, Book, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';

type PaperContentSectionProps = {
  form: UseFormReturn<any>;
};

export function PaperContentSection({ form }: PaperContentSectionProps) {
  return (
    <Card className="border border-border/10 shadow-sm overflow-hidden bg-gradient-to-br from-background to-background/90 dark:from-background/90 dark:to-background/70">
      <CardHeader className="pb-2 border-b border-border/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-primary/10 p-2.5 rounded-full">
            <AlignLeft className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Paper Content</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground/80">
          Provide specific details about your paper
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground/90">Topic / Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your paper topic or title" className="h-11 bg-background border-input/40" {...field} />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground/80">
                  Enter a specific topic or leave blank if you want the writer to choose
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground/90">Paper Instructions</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter detailed instructions for your paper..." 
                    className="min-h-[120px] resize-none bg-background border-input/40"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground/80">
                  Include any specific requirements, grading rubric, or sample material
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormField
            control={form.control}
            name="citationStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-sm font-medium text-foreground/90">
                  <Book className="h-4 w-4 mr-2 text-primary/70" />
                  Citation Style
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-background border-input/40">
                      <SelectValue placeholder="Select citation style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {citationStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sources"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground/90">Number of Sources</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-background border-input/40">
                      <SelectValue placeholder="Select number of sources" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[...Array(21)].map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i === 0 ? "No sources required" : `${i} source${i > 1 ? 's' : ''}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="border-t border-border/10 pt-6 mt-6">
          <Button type="button" variant="outline" className="flex gap-2 h-11 bg-background/80 hover:bg-background shadow-sm">
            <Upload size={16} />
            Upload Additional Files
          </Button>
          <FormDescription className="mt-2 text-xs text-muted-foreground/80">
            Upload any reference materials or assignment guidelines
          </FormDescription>
        </div>
      </CardContent>
    </Card>
  );
}
