# Button Component

A versatile button component with multiple variants, sizes, and states. Built on Radix UI primitives with full accessibility support.

## Import

```typescript
import { Button } from '@/components/ui/button'
```

## Basic Usage

```tsx
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <Button onClick={() => console.log('Clicked!')}>
      Click me
    </Button>
  )
}
```

## Variants

The Button component supports multiple visual variants:

### Default

```tsx
<Button variant="default">Default Button</Button>
```

### Destructive

```tsx
<Button variant="destructive">Delete</Button>
```

### Outline

```tsx
<Button variant="outline">Outline Button</Button>
```

### Secondary

```tsx
<Button variant="secondary">Secondary</Button>
```

### Ghost

```tsx
<Button variant="ghost">Ghost Button</Button>
```

### Link

```tsx
<Button variant="link">Link Button</Button>
```

## Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Icon />
</Button>
```

## States

### Disabled

```tsx
<Button disabled>Disabled Button</Button>
```

### Loading

```tsx
<Button disabled>
  <Loader className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

## As Child (Polymorphic)

Use `asChild` to render the button as a different element:

```tsx
import { Link } from 'next/link'

<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` | Button visual variant |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` | Button size |
| `asChild` | `boolean` | `false` | Render as child element |
| `disabled` | `boolean` | `false` | Disable the button |
| `onClick` | `() => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `className` | `string` | - | Additional CSS classes |

### Accessibility

- **Role**: `button`
- **ARIA Support**: Full ARIA attribute support
- **Keyboard Navigation**:
  - `Enter` - Activate button
  - `Space` - Activate button
- **Focus Management**: Proper focus indicators
- **Screen Reader**: Announces button state and content

## Examples

### Form Submit Button

```tsx
<form onSubmit={handleSubmit}>
  <Button type="submit">
    Submit Form
  </Button>
</form>
```

### With Icon

```tsx
import { Plus } from 'lucide-react'

<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

### Full Width

```tsx
<Button className="w-full">
  Full Width Button
</Button>
```

### Button Group

```tsx
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button>Confirm</Button>
</div>
```

## Best Practices

1. **Use Semantic Types**: Always specify `type="button"` for non-submit buttons in forms
2. **Provide Clear Labels**: Button text should clearly indicate the action
3. **Loading States**: Show loading indicators for async operations
4. **Consistent Sizing**: Use consistent sizes across your application
5. **Destructive Actions**: Use `variant="destructive"` for dangerous actions with confirmation

## Common Patterns

### Server Action with Loading

```tsx
'use client'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { createGoal } from '@/src/actions/goals/create-goal'
import { toast } from 'sonner'

export function CreateGoalButton() {
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createGoal(data)
      if (result.success) {
        toast.success('Goal created')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <Button onClick={handleCreate} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Goal'}
    </Button>
  )
}
```

### Confirmation Dialog

```tsx
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function DeleteButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## Related Components

- [Form](./form.md) - Form wrapper component
- [Dialog](./dialog.md) - Modal dialogs with buttons
- [Input](./input.md) - Form inputs

## Dependencies

- `@radix-ui/react-slot` - Polymorphic component support
- `class-variance-authority` - Variant styling
- `clsx` - Conditional class names
- `tailwind-merge` - Merge Tailwind classes

## Version History

- **1.0.0** - Initial release with all variants and sizes

---

**Component Path**: `components/ui/button.tsx`
**Last Updated**: January 9, 2025
