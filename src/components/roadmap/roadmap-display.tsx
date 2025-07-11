'use client';

import { useRef } from 'react';
import { GraduationCap, Wrench, TrendingUp, Map, Download, Copy } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MarkdownContent } from './markdown-content';
import { useToast } from '@/hooks/use-toast';
import type { GenerateRoadmapOutput } from '@/ai/flows/generate-roadmap';

export type Roadmap = GenerateRoadmapOutput;

interface RoadmapDisplayProps {
  content: Roadmap;
}

const sectionsConfig = [
  { key: 'qualifications', title: 'Qualifications Needed', icon: <GraduationCap className="h-6 w-6" /> },
  { key: 'skills', title: 'In-Demand Skills', icon: <Wrench className="h-6 w-6" /> },
  { key: 'trends', title: 'Future Trends', icon: <TrendingUp className="h-6 w-6" /> },
  { key: 'journey', title: 'Step-by-Step Journey', icon: <Map className="h-6 w-6" /> },
] as const;


export function RoadmapDisplay({ content }: RoadmapDisplayProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    toast({ title: 'Preparing PDF...', description: 'Please wait while we generate your document.' });
    
    const originalBodyStyle = document.body.style.backgroundImage;
    const originalBodyBg = document.body.style.backgroundColor;
    
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'hsl(var(--background))';
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null, // Use transparent background for canvas
        logging: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('roadmap.ai.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
            variant: "destructive",
            title: "Failed to generate PDF",
            description: "An unexpected error occurred while creating the PDF.",
        });
    } finally {
        // Restore original body styles
        document.body.style.backgroundImage = originalBodyStyle;
        document.body.style.backgroundColor = originalBodyBg;
    }
  };

  const handleCopy = () => {
    const textToCopy = sectionsConfig.map(section => {
      const body = content[section.key as keyof Roadmap];
      return `## ${section.title}\n\n${body}`;
    }).join('\n\n');

    navigator.clipboard.writeText(textToCopy);
    toast({ title: 'Copied to clipboard!', description: 'Your roadmap is ready to be pasted.' });
  };

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-primary">Your Personalized Roadmap</CardTitle>
              <p className="text-muted-foreground mt-1">Here is the path to achieving your career goals.</p>
            </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy Text</Button>
            <Button size="sm" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
          </div>
        </div>
      </CardHeader>
      <div ref={printRef} className="p-4 sm:p-6 bg-card">
        {sectionsConfig.map((section, index) => {
          const body = content[section.key as keyof Roadmap];
          if (!body) return null;

          return (
            <div key={section.key}>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-2">
                  {section.icon}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground">{section.title}</h2>
              </div>
              <div className="pl-4 border-l-2 border-primary/20 ml-5 mb-8">
                  <div className="text-card-foreground/90 leading-relaxed pl-6">
                    <MarkdownContent content={body} />
                  </div>
              </div>
              {index < sectionsConfig.length - 1 && <Separator className="my-8" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
