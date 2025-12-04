/**
 * User Override Form Component
 *
 * Form to add user-specific feature flag overrides
 */

'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addFeatureFlagOverride } from '@/src/actions/admin/feature-flags/add-override'

interface UserOverrideFormProps {
  flagName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserOverrideForm({
  flagName,
  open,
  onOpenChange,
  onSuccess,
}: UserOverrideFormProps) {
  const [isPending, startTransition] = useTransition()
  const [userId, setUserId] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [reason, setReason] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId.trim()) {
      toast.error('User ID is required')
      return
    }

    startTransition(async () => {
      const result = await addFeatureFlagOverride({
        userId: userId.trim(),
        flagName,
        enabled,
        reason: reason.trim() || undefined,
      })

      if (result.success) {
        toast.success('Override added successfully')
        setUserId('')
        setReason('')
        setEnabled(true)
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User Override</DialogTitle>
          <DialogDescription>
            Override the feature flag for a specific user
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              placeholder="Enter user UUID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              The UUID of the user to override
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable for this user</Label>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="Why is this override needed?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Override'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
