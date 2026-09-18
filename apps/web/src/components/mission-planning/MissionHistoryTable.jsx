import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '../ui/empty';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { History, Eye, Pencil, Trash2 } from 'lucide-react';
import { formatDistance } from '../../utils/geo.js';
import { CROP_OPTIONS, FIELD_OPTIONS } from './MissionConfigPanel.jsx';

const STATUS_BADGE = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-transparent' },
  planned: {
    label: 'Planned',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  ready: {
    label: 'Ready',
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  },
};

const labelFor = (options, value) => options.find((opt) => opt.value === value)?.label || value || '—';

/**
 * Table of previously saved missions loaded from localStorage, with View,
 * Edit and Delete actions. Delete requires an explicit confirmation dialog.
 */
const MissionHistoryTable = ({ missions, onView, onEdit, onDelete }) => {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const pendingMission = missions.find((m) => m.id === pendingDeleteId) || null;

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDelete(pendingDeleteId);
    }
    setPendingDeleteId(null);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-lg">Mission History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {missions.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>No missions created yet.</EmptyTitle>
              <EmptyDescription>
                Missions you save will appear here, stored locally in your browser.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mission</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead className="text-right">Waypoints</TableHead>
                  <TableHead className="text-right">Distance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.map((mission) => {
                  const statusMeta = STATUS_BADGE[mission.status] || STATUS_BADGE.draft;
                  return (
                    <TableRow key={mission.id}>
                      <TableCell className="font-medium">{mission.missionName}</TableCell>
                      <TableCell>{labelFor(CROP_OPTIONS, mission.crop)}</TableCell>
                      <TableCell>{labelFor(FIELD_OPTIONS, mission.field)}</TableCell>
                      <TableCell className="text-right">
                        {mission.waypoints?.length || 0}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDistance(mission.routeDistance)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusMeta.className} variant="outline">
                          {statusMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {mission.createdAt ? new Date(mission.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onView(mission)}
                            aria-label={`View ${mission.missionName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(mission)}
                            aria-label={`Edit ${mission.missionName}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setPendingDeleteId(mission.id)}
                            aria-label={`Delete ${mission.missionName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={Boolean(pendingDeleteId)} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this mission?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMission
                ? `"${pendingMission.missionName}" will be permanently removed from Mission History. This cannot be undone.`
                : 'This mission will be permanently removed. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default MissionHistoryTable;
