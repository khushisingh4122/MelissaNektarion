import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const CropHealthHeatmap = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cellWidth = canvas.width / data[0].length;
    const cellHeight = canvas.height / data.length;

    data.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const color = getHealthColor(value);
        ctx.fillStyle = color;
        ctx.fillRect(
          colIndex * cellWidth,
          rowIndex * cellHeight,
          cellWidth,
          cellHeight
        );
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeRect(
          colIndex * cellWidth,
          rowIndex * cellHeight,
          cellWidth,
          cellHeight
        );
      });
    });
  }, [data]);

  const getHealthColor = (value) => {
    if (value >= 85) return '#22c55e';
    if (value >= 75) return '#84cc16';
    if (value >= 65) return '#eab308';
    if (value >= 50) return '#f97316';
    return '#ef4444';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-lg">Crop Health Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-auto rounded-xl border"
          />
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-muted-foreground">Excellent (85-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }} />
              <span className="text-muted-foreground">Good (75-84%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
              <span className="text-muted-foreground">Fair (65-74%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
              <span className="text-muted-foreground">Poor (50-64%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-muted-foreground">Critical (&lt;50%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CropHealthHeatmap;