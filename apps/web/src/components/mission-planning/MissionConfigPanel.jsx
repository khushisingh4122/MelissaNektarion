import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import { SlidersHorizontal } from 'lucide-react';

export const CROP_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'mango', label: 'Mango' },
  { value: 'sunflower', label: 'Sunflower' },
];

export const FIELD_OPTIONS = [
  { value: 'field-a', label: 'Field A' },
  { value: 'field-b', label: 'Field B' },
  { value: 'field-c', label: 'Field C' },
];

export const PATTERN_OPTIONS = [
  { value: 'grid', label: 'Grid' },
  { value: 'linear', label: 'Linear' },
  { value: 'custom', label: 'Custom Waypoints' },
];

export const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

/**
 * Left-hand mission configuration panel.
 *
 * All state is controlled by the parent MissionPlanning page.
 * This component is responsible only for displaying and updating
 * mission configuration values.
 */
const MissionConfigPanel = ({
  formData,
  errors,
  onFieldChange,
  disabled = false,
}) => {
  const handleNumberChange = (key) => (event) => {
    const raw = event.target.value;

    onFieldChange(
      key,
      raw === '' ? '' : Number(raw)
    );
  };

  return (
    <Card className="relative z-20 hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />

          <CardTitle className="text-lg">
            Mission Configuration
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Mission Name */}
        <div className="space-y-1.5">
          <Label htmlFor="mission-name">
            Mission Name
          </Label>

          <Input
            id="mission-name"
            placeholder="Pollination Mission 01"
            value={formData.missionName}
            onChange={(e) =>
              onFieldChange(
                'missionName',
                e.target.value
              )
            }
            disabled={disabled}
            aria-invalid={Boolean(errors.missionName)}
          />

          {errors.missionName && (
            <p className="text-xs text-destructive">
              {errors.missionName}
            </p>
          )}
        </div>

        {/* Crop Type */}
        <div className="space-y-1.5 relative z-50">
          <Label htmlFor="mission-crop">
            Crop Type
          </Label>

          <Select
            value={formData.crop}
            onValueChange={(value) =>
              onFieldChange('crop', value)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="mission-crop"
              aria-invalid={Boolean(errors.crop)}
              className="relative z-50 bg-background text-foreground"
            >
              <SelectValue placeholder="Select a crop" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={5}
              className="z-[9999] min-w-[var(--radix-select-trigger-width)] border border-border bg-background text-foreground shadow-xl"
            >
              {CROP_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.crop && (
            <p className="text-xs text-destructive">
              {errors.crop}
            </p>
          )}
        </div>

        {/* Field */}
        <div className="space-y-1.5 relative z-40">
          <Label htmlFor="mission-field">
            Field
          </Label>

          <Select
            value={formData.field}
            onValueChange={(value) =>
              onFieldChange('field', value)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="mission-field"
              aria-invalid={Boolean(errors.field)}
              className="relative z-40 bg-background text-foreground"
            >
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={5}
              className="z-[9999] min-w-[var(--radix-select-trigger-width)] border border-border bg-background text-foreground shadow-xl"
            >
              {FIELD_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.field && (
            <p className="text-xs text-destructive">
              {errors.field}
            </p>
          )}
        </div>

        {/* Altitude + Speed */}
        <div className="grid grid-cols-2 gap-4">

          {/* Altitude */}
          <div className="space-y-1.5">
            <Label htmlFor="mission-altitude">
              Altitude (m)
            </Label>

            <Input
              id="mission-altitude"
              type="number"
              min="0"
              step="1"
              value={formData.altitude}
              onChange={handleNumberChange('altitude')}
              disabled={disabled}
              aria-invalid={Boolean(errors.altitude)}
            />

            {errors.altitude && (
              <p className="text-xs text-destructive">
                {errors.altitude}
              </p>
            )}
          </div>

          {/* Speed */}
          <div className="space-y-1.5">
            <Label htmlFor="mission-speed">
              Speed (m/s)
            </Label>

            <Input
              id="mission-speed"
              type="number"
              min="0"
              step="0.5"
              value={formData.speed}
              onChange={handleNumberChange('speed')}
              disabled={disabled}
              aria-invalid={Boolean(errors.speed)}
            />

            {errors.speed && (
              <p className="text-xs text-destructive">
                {errors.speed}
              </p>
            )}
          </div>

        </div>

        {/* Flight Pattern */}
        <div className="space-y-1.5 relative z-30">
          <Label htmlFor="mission-pattern">
            Flight Pattern
          </Label>

          <Select
            value={formData.pattern}
            onValueChange={(value) =>
              onFieldChange('pattern', value)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="mission-pattern"
              className="relative z-30 bg-background text-foreground"
            >
              <SelectValue placeholder="Select a pattern" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={5}
              className="z-[9999] min-w-[var(--radix-select-trigger-width)] border border-border bg-background text-foreground shadow-xl"
            >
              {PATTERN_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mission Priority */}
        <div className="space-y-1.5 relative z-20">
          <Label htmlFor="mission-priority">
            Mission Priority
          </Label>

          <Select
            value={formData.priority}
            onValueChange={(value) =>
              onFieldChange('priority', value)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="mission-priority"
              className="relative z-20 bg-background text-foreground"
            >
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={5}
              className="z-[9999] min-w-[var(--radix-select-trigger-width)] border border-border bg-background text-foreground shadow-xl"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </CardContent>
    </Card>
  );
};

export default MissionConfigPanel;