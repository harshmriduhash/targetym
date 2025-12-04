/**
 * Variant Distribution Chart Component
 *
 * Displays variant distribution using a simple bar chart
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VariantDistribution {
  variantId: string;
  variantName: string;
  count: number;
  percentage: number;
}

interface VariantDistributionChartProps {
  distribution: VariantDistribution[];
}

const COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export function VariantDistributionChart({
  distribution,
}: VariantDistributionChartProps) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {distribution.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No assignments yet
          </p>
        ) : (
          <>
            {/* Bar Chart */}
            <div className="space-y-4">
              {distribution.map((variant, index) => (
                <div key={variant.variantId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          COLORS[index % COLORS.length]
                        }`}
                      />
                      <span className="font-medium">{variant.variantName}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {variant.count} ({variant.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={variant.percentage} className="h-2" />
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Assignments</span>
                <span className="text-2xl font-bold">{total}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
