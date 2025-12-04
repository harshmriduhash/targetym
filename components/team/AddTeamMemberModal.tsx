'use client';

import React, { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { UserPlus } from 'lucide-react';
import { teamMemberSchema, type TeamMemberInput } from '@/lib/validations/team.schemas';
import { DEPARTMENTS, DEPARTMENT_LABELS, ROLE_LABELS } from '@/lib/constants/departments';
import { TEAM_MEMBER_STATUS } from '@/lib/constants/team-status';

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: any) => void;
}

const DEPARTMENT_OPTIONS = [
  { value: DEPARTMENTS.TECH, label: DEPARTMENT_LABELS[DEPARTMENTS.TECH] },
  { value: DEPARTMENTS.HR, label: DEPARTMENT_LABELS[DEPARTMENTS.HR] },
  { value: DEPARTMENTS.SALES, label: DEPARTMENT_LABELS[DEPARTMENTS.SALES] },
  { value: DEPARTMENTS.MARKETING, label: DEPARTMENT_LABELS[DEPARTMENTS.MARKETING] },
  { value: DEPARTMENTS.FINANCE, label: DEPARTMENT_LABELS[DEPARTMENTS.FINANCE] },
  { value: DEPARTMENTS.OPERATIONS, label: DEPARTMENT_LABELS[DEPARTMENTS.OPERATIONS] },
  { value: DEPARTMENTS.SUPPORT, label: DEPARTMENT_LABELS[DEPARTMENTS.SUPPORT] },
];

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function AddTeamMemberModal({ open, onOpenChange, onSave }: AddTeamMemberModalProps) {
  const form = useForm<TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      role: undefined,
      department: undefined,
      position: '',
      phone: '',
      location: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: TEAM_MEMBER_STATUS.ACTIVE,
    },
  });

  const onSubmit = useCallback(
    (data: TeamMemberInput) => {
      const newMember = {
        ...data,
        id: `member_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      const existingMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      const updatedMembers = [...existingMembers, newMember];
      localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));

      // Reset form and close
      form.reset();
      onSave(newMember);
      onOpenChange(false);
    },
    [form, onSave, onOpenChange]
  );

  const handleCancel = useCallback(() => {
    form.reset();
    onOpenChange(false);
  }, [form, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="mr-2" /> Ajouter un membre
          </DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau membre à votre équipe
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Nom complet *</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        placeholder="Ex: Jean Dupont"
                        {...field}
                        autoComplete="name"
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Email *</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@entreprise.fr"
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Poste *</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        placeholder="Ex: Développeur Full Stack"
                        {...field}
                        autoComplete="organization-title"
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Département *</FormLabel>
                  <div className="col-span-3">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un département" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENT_OPTIONS.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Rôle *</FormLabel>
                  <div className="col-span-3">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Téléphone</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+33 6 12 34 56 78, +221 77 287 27 33..."
                        {...field}
                        value={field.value || ''}
                        autoComplete="tel"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Format international accepté (8-15 chiffres)
                    </FormDescription>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Localisation</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        placeholder="Ex: Paris, France"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Date d&apos;arrivée *</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Ajout...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(AddTeamMemberModal);
