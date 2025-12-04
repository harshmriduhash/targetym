/**
 * Assignments Timeline Component
 *
 * Displays experiment assignments over time
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface AssignmentsByDay {
  date: string;
  count: number;
}

interface AssignmentsTimelineProps {
  data: AssignmentsByDay[];
}

export function AssignmentsTimeline({ data }: AssignmentsTimelineProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No assignment data available
          </p>
        ) : (
          <div className="space-y-2">
            {data.map((day) => {
              const barWidth = (day.count / maxCount) * 100;

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {format(parseISO(day.date), "MMM dd")}
                    </span>
                    <span className="font-medium">{day.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
