'use client';

import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import TeamMemberCard, { TeamMember } from "./TeamMemberCard";

interface TeamMembersListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  title?: string;
  description?: string;
  onMemberClick?: (member: TeamMember) => void;
}

const TeamMembersListModal = memo(function TeamMembersListModal({
  open,
  onOpenChange,
  members,
  title = "Membres de l'équipe",
  description = "Liste complète des membres de votre équipe",
  onMemberClick,
}: TeamMembersListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {title} ({members.length})
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucun membre trouvé
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                La liste des membres est vide
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {members.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onClick={onMemberClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4 bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {members.length} membre{members.length > 1 ? 's' : ''}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default TeamMembersListModal;
