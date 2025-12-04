"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle } from "lucide-react";

interface SuccessionPlansListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: any[];
}

export default function SuccessionPlansListModal({
  open,
  onOpenChange,
  plans,
}: SuccessionPlansListModalProps) {
  const getReadinessBadge = (readiness: string) => {
    switch (readiness) {
      case "ready":
        return <Badge className="bg-green-600">Prêt</Badge>;
      case "developing":
        return <Badge className="bg-yellow-600">En développement</Badge>;
      case "emerging":
        return <Badge className="bg-blue-600">Émergent</Badge>;
      case "not-ready":
        return <Badge variant="destructive">Non prêt</Badge>;
      default:
        return <Badge variant="outline">{readiness}</Badge>;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Faible
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Moyen
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            Élevé
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Critique
          </Badge>
        );
      default:
        return <Badge variant="outline">{riskLevel}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tous les plans de succession</DialogTitle>
          <DialogDescription>
            {plans.length} plans de succession enregistrés
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {plans.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun plan de succession créé
            </p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-purple-600" />
                      <h3 className="font-semibold">{plan.criticalRole}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Titulaire actuel: {plan.currentHolder}
                    </p>
                  </div>
                  <div className="flex gap-2 items-start">
                    {getRiskBadge(plan.riskLevel)}
                    {plan.riskLevel === "high" ||
                    plan.riskLevel === "critical" ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : null}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Successeur identifié</p>
                    {getReadinessBadge(plan.readiness)}
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">{plan.successorName}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      - {plan.successorCurrentRole}
                    </span>
                  </p>
                  {plan.timeline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Délai de préparation: {plan.timeline}
                    </p>
                  )}
                </div>

                {plan.gapsToAddress && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Écarts à combler
                    </p>
                    <p className="text-sm line-clamp-2">{plan.gapsToAddress}</p>
                  </div>
                )}

                {plan.developmentPlan && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Plan de développement
                    </p>
                    <p className="text-sm line-clamp-2">
                      {plan.developmentPlan}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Créé le{" "}
                    {new Date(plan.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
