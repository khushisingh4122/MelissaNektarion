import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '../ui/empty';
import { MapPin, Trash2 } from 'lucide-react';

/**
 * Displays the ordered list of waypoints (WP1, WP2, ...) with their
 * coordinates, and lets the user remove any individual waypoint. Shows a
 * professional empty state when no waypoints have been added yet.
 */
const WaypointTable = ({ waypoints, onRemove, disabled = false }) => {
  const orderedWaypoints = [...waypoints].sort((a, b) => a.order - b.order);

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-lg">Waypoints</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">{orderedWaypoints.length} total</span>
        </div>
      </CardHeader>
      <CardContent>
        {orderedWaypoints.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MapPin />
              </EmptyMedia>
              <EmptyTitle>No waypoints added</EmptyTitle>
              <EmptyDescription>
                Click on the map to create your first waypoint.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waypoint</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                  {onRemove && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedWaypoints.map((wp) => (
                  <TableRow key={wp.id}>
                    <TableCell className="font-medium">WP{wp.order}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {wp.latitude.toFixed(6)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {wp.longitude.toFixed(6)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{wp.order}</TableCell>
                    {onRemove && (
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onRemove(wp.id)}
                          disabled={disabled}
                          aria-label={`Remove waypoint ${wp.order}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaypointTable;
