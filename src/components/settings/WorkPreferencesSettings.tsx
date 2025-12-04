'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { getUserSettings, updateWorkPreferences, updateOutOfOffice } from '@/src/actions/settings';
import { updateWorkPreferencesSchema, type UpdateWorkPreferences } from '@/src/lib/validations/settings.schemas';

const weekDays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export function WorkPreferencesSettings() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [oooEnabled, setOooEnabled] = useState(false);
  const [oooMessage, setOooMessage] = useState('');
  const [oooStartDate, setOooStartDate] = useState('');
  const [oooEndDate, setOooEndDate] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateWorkPreferences>({
    resolver: zodResolver(updateWorkPreferencesSchema),
    defaultValues: {
      working_hours_start: '09:00:00',
      working_hours_end: '17:00:00',
      working_days: [1, 2, 3, 4, 5],
    },
  });

  const workingDays = watch('working_days');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const result = await getUserSettings();

        if (result.success && result.data) {
          setValue('working_hours_start', result.data.working_hours_start || '09:00:00');
          setValue('working_hours_end', result.data.working_hours_end || '17:00:00');
          setValue('working_days', result.data.working_days || [1, 2, 3, 4, 5]);
          setOooEnabled(result.data.out_of_office_enabled || false);
          setOooMessage(result.data.out_of_office_message || '');
          setOooStartDate(result.data.out_of_office_start_date || '');
          setOooEndDate(result.data.out_of_office_end_date || '');
        }
      } catch (error) {
        toast.error('Failed to load work preferences');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [setValue]);

  const onSubmit = async (data: UpdateWorkPreferences) => {
    startTransition(async () => {
      const result = await updateWorkPreferences(data);

      if (result.success) {
        toast.success('Work preferences updated successfully');
      } else {
        toast.error(result.error?.message || 'Failed to update work preferences');
      }
    });
  };

  const handleOOOUpdate = async () => {
    startTransition(async () => {
      const result = await updateOutOfOffice({
        enabled: oooEnabled,
        message: oooMessage,
        start_date: oooStartDate,
        end_date: oooEndDate,
      });

      if (result.success) {
        toast.success('Out of office settings updated');
      } else {
        toast.error(result.error?.message || 'Failed to update out of office settings');
      }
    });
  };

  const toggleWorkingDay = (day: number) => {
    const currentDays = workingDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    setValue('working_days', newDays);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Work Preferences
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Set your working hours and schedule
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Working Hours</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="working_hours_start">Start Time</Label>
              <Input
                id="working_hours_start"
                type="time"
                {...register('working_hours_start')}
              />
              {errors.working_hours_start && (
                <p className="text-sm text-destructive">{errors.working_hours_start.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="working_hours_end">End Time</Label>
              <Input
                id="working_hours_end"
                type="time"
                {...register('working_hours_end')}
              />
              {errors.working_hours_end && (
                <p className="text-sm text-destructive">{errors.working_hours_end.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Working Days</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {weekDays.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={workingDays?.includes(day.value)}
                  onCheckedChange={() => toggleWorkingDay(day.value)}
                />
                <Label htmlFor={`day-${day.value}`} className="cursor-pointer">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.working_days && (
            <p className="text-sm text-destructive">{errors.working_days.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Working Hours
          </Button>
        </div>
      </form>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Out of Office
            </h4>
            <p className="text-sm text-muted-foreground">
              Set automatic replies when you're away
            </p>
          </div>
          <Switch
            checked={oooEnabled}
            onCheckedChange={setOooEnabled}
          />
        </div>

        {oooEnabled && (
          <div className="space-y-4 pl-6 border-l-2">
            <div className="space-y-2">
              <Label htmlFor="ooo_message">Out of Office Message</Label>
              <textarea
                id="ooo_message"
                value={oooMessage}
                onChange={(e) => setOooMessage(e.target.value)}
                placeholder="I'm currently out of office and will respond when I return..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ooo_start">Start Date</Label>
                <Input
                  id="ooo_start"
                  type="date"
                  value={oooStartDate}
                  onChange={(e) => setOooStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ooo_end">End Date</Label>
                <Input
                  id="ooo_end"
                  type="date"
                  value={oooEndDate}
                  onChange={(e) => setOooEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleOOOUpdate} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Out of Office
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
