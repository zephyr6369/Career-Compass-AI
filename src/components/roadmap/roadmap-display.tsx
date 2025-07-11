'use client';

import { useRef } from 'react';
import { GraduationCap, Wrench, TrendingUp, Map, Bot, Download, Copy } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MarkdownContent } from './markdown-content';
import { useToast } from '@/hooks/use-toast';

interface RoadmapDisplayProps {
  content: string;
}

const iconMap: Record<string, React.ReactElement> = {
  'Qualifications Needed': <GraduationCap className="h-6 w-6" />,
  'Qualifications': <GraduationCap className="h-6 w-6" />,
  'In-Demand Skills': <Wrench className="h-6 w-6" />,
  'Skills': <Wrench className="h-6 w-6" />,
  'Future Trends': <TrendingUp className="h-6 w-6" />,
  'Step-by-step journey': <Map className="h-6 w-6" />,
  'Career Journey': <Map className="h-6 w-6" />,
  'Generated Roadmap': <Bot className="h-6 w-6" />,
};

const parseRoadmap = (content: string) => {
  const sections: { title: string; body: string }[] = [];
  const keywords = [
    "Qualifications Needed",
    "In-Demand Skills",
    "Future Trends",
    "Step-by-step journey",
    "Career Journey",
    "Qualifications",
    "Skills",
  ];

  const regex = new RegExp(`(^(?:##|###)\\s*(?:${keywords.join('|')}))`, 'gim');
  const parts = content.split(regex).filter(part => part.trim() !== '');

  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] && parts[i + 1]) {
      const title = parts[i].replace(/^(?:##|###)\s*/, '').trim();
      const body = parts[i + 1].trim();
      sections.push({ title, body });
    }
  }

  if (sections.length === 0 && content) {
    sections.push({ title: 'Generated Roadmap', body: content });
  }
  return sections;
};

export function RoadmapDisplay({ content }: RoadmapDisplayProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const sections = parseRoadmap(content);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    toast({ title: 'Preparing PDF...', description: 'Please wait while we generate your document.' });

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: 'hsl(var(--background))',
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
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard!', description: 'Your roadmap is ready to be pasted.' });
  };

  return (
    <Card className="shadow-2xl shadow-primary/10 overflow-hidden">
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
        {sections.map((section, index) => (
          <div key={index}>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-2">
                {iconMap[section.title] || <Bot className="h-6 w-6" />}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{section.title}</h2>
            </div>
            <div className="pl-4 border-l-2 border-primary/20 ml-5 mb-8">
                <div className="text-card-foreground/90 leading-relaxed pl-6">
                  <MarkdownContent content={section.body} />
                </div>
            </div>
            {index < sections.length - 1 && <Separator className="my-8" />}
          </div>
        ))}
      </div>
    </Card>
  );
}
