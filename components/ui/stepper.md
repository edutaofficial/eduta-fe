# Stepper Component

A modern, accessible, and customizable stepper component for multi-step forms and workflows.

## Features

- ✅ Fully typed with TypeScript
- ✅ Accessible (ARIA attributes, keyboard navigation)
- ✅ Customizable with Tailwind CSS
- ✅ Built with React Context for easy state management
- ✅ Supports optional steps
- ✅ Step descriptions and labels
- ✅ Complete/Active/Pending state visualization
- ✅ Smooth transitions and animations
- ✅ Click to navigate between steps

## Installation

The stepper consists of two main parts:

1. **Hook**: `hooks/use-stepper.ts` - Manages stepper state
2. **Components**: `components/ui/stepper.tsx` - UI components

## Usage

### 1. Import the hook and components

```tsx
import { useStepper } from '@/hooks/use-stepper';
import {
  Stepper,
  StepperItems,
  StepperItem,
  StepperContent,
  StepperPanel,
  StepperActions,
  StepperPreviousButton,
  StepperNextButton,
  StepperCompleteButton,
} from '@/components/ui/stepper';
```

### 2. Define your steps

```tsx
const stepper = useStepper({
  initialStep: 0,
  steps: [
    {
      id: 'step-1',
      label: 'Personal Info',
      description: 'Enter your details',
    },
    {
      id: 'step-2',
      label: 'Address',
      description: 'Where do you live?',
    },
    {
      id: 'step-3',
      label: 'Preferences',
      description: 'Customize settings',
      optional: true, // Mark as optional
    },
    {
      id: 'step-4',
      label: 'Review',
      description: 'Confirm information',
    },
  ],
  onStepChange: (step) => {
    console.log('Current step:', step);
  },
});
```

### 3. Build your stepper UI

```tsx
<Stepper stepper={stepper}>
  {/* Step indicators */}
  <StepperItems>
    {stepper.steps.map((_, index) => (
      <StepperItem key={index} index={index} />
    ))}
  </StepperItems>

  {/* Step content */}
  <StepperContent>
    <StepperPanel index={0}>
      {/* Your step 1 content */}
    </StepperPanel>
    
    <StepperPanel index={1}>
      {/* Your step 2 content */}
    </StepperPanel>
    
    <StepperPanel index={2}>
      {/* Your step 3 content */}
    </StepperPanel>
    
    <StepperPanel index={3}>
      {/* Your step 4 content */}
    </StepperPanel>
  </StepperContent>

  {/* Navigation buttons */}
  <StepperActions>
    <StepperPreviousButton />
    <div className="flex gap-2">
      <StepperNextButton />
      <StepperCompleteButton onClick={handleComplete}>
        Submit
      </StepperCompleteButton>
    </div>
  </StepperActions>
</Stepper>
```

## API Reference

### useStepper Hook

#### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `initialStep` | `number` | `0` | Starting step index |
| `steps` | `Step[]` | **required** | Array of step definitions |
| `onStepChange` | `(step: number) => void` | `undefined` | Callback when step changes |

#### Step Object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `label` | `string` | Yes | Step label |
| `description` | `string` | No | Step description |
| `optional` | `boolean` | No | Mark step as optional |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `currentStep` | `number` | Current step index |
| `steps` | `Step[]` | Array of steps |
| `isFirstStep` | `boolean` | Is on first step |
| `isLastStep` | `boolean` | Is on last step |
| `canGoNext` | `boolean` | Can navigate to next step |
| `canGoPrevious` | `boolean` | Can navigate to previous step |
| `nextStep` | `() => void` | Move to next step |
| `previousStep` | `() => void` | Move to previous step |
| `goToStep` | `(step: number) => void` | Jump to specific step |
| `reset` | `() => void` | Reset to initial step |
| `isStepComplete` | `(stepIndex: number) => boolean` | Check if step is complete |
| `isStepActive` | `(stepIndex: number) => boolean` | Check if step is active |

### Components

#### Stepper (Container)
Main wrapper component that provides context.

**Props:**
- `stepper`: `UseStepperReturn` - The stepper hook return value
- `className`: `string` - Optional CSS classes
- `orientation`: `'horizontal' | 'vertical'` - Layout orientation (default: `'horizontal'`)

#### StepperItems
Container for step indicators.

**Props:**
- `className`: `string` - Optional CSS classes

#### StepperItem
Individual step indicator (circle with number/checkmark).

**Props:**
- `index`: `number` - Step index
- `className`: `string` - Optional CSS classes

#### StepperContent
Container for step panels.

**Props:**
- `className`: `string` - Optional CSS classes

#### StepperPanel
Content panel for a specific step (only active step is visible).

**Props:**
- `index`: `number` - Step index
- `className`: `string` - Optional CSS classes

#### StepperActions
Container for navigation buttons.

**Props:**
- `className`: `string` - Optional CSS classes

#### StepperPreviousButton
Button to go to previous step.

**Props:**
- `children`: `React.ReactNode` - Button content (default: "Previous")
- All standard button HTML attributes

#### StepperNextButton
Button to go to next step.

**Props:**
- `children`: `React.ReactNode` - Button content (default: "Next")
- All standard button HTML attributes

#### StepperCompleteButton
Button shown only on last step for completion.

**Props:**
- `children`: `React.ReactNode` - Button content (default: "Complete")
- All standard button HTML attributes

## Example

See `components/ui/test/StepperTest.tsx` for a complete working example with a 4-step registration form.

## Styling

The stepper uses your project's design tokens:
- `primary` - Active and completed steps
- `muted` - Inactive steps
- `border` - Step connectors
- `foreground` / `muted-foreground` - Text colors

All components accept `className` prop for custom styling.

## Best Practices

1. **Step Count**: Keep steps between 3-7 for optimal UX
2. **Validation**: Validate each step before allowing navigation
3. **Progress**: Show clear visual feedback for completed steps
4. **Mobile**: Component is responsive, but test on mobile devices
5. **Accessibility**: Maintain keyboard navigation and screen reader support

## License

Part of the Eduta Frontend project.

