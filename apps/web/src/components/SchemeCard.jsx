import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

const SchemeCard = ({ scheme }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl leading-tight">{scheme.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">{scheme.type}</Badge>
        </div>
        <CardDescription className="leading-relaxed">{scheme.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Eligibility</h4>
            <ul className="space-y-1">
              {scheme.eligibility.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Benefits</h4>
            <ul className="space-y-1">
              {scheme.benefits.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild className="w-full transition-all duration-200 active:scale-[0.98]">
          <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            Visit Official Website
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SchemeCard;