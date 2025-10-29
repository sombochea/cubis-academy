# Form Standards - TanStack Form with ShadCN UI

## Overview

We use **TanStack Form** (React Form) for all form management due to its:

- ⚡ High performance (minimal re-renders)
- 🎯 Type-safe with TypeScript
- 🔄 Flexible validation (Zod integration)
- 📦 Small bundle size
- 🎨 Framework agnostic

## Installation

```bash
pnpm add @tanstack/react-form
pnpm add @tanstack/zod-form-adapter
```

## Basic Form Structure

```typescript
"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

// Define Zod schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      // Handle form submission
      console.log(value);
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: formSchema.shape.email,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && (
              <span className="text-red-600">{field.state.meta.errors[0]}</span>
            )}
          </div>
        )}
      </form.Field>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Integration with ShadCN UI

### Using ShadCN Input Component

```typescript
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

<form.Field
  name="email"
  validators={{
    onChange: z.string().email("Invalid email"),
  }}
>
  {(field) => (
    <div className="space-y-2">
      <Label htmlFor={field.name}>Email</Label>
      <Input
        id={field.name}
        type="email"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
      />
      {field.state.meta.errors.length > 0 && (
        <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
      )}
    </div>
  )}
</form.Field>;
```

## Best Practices

### 1. Always Use Zod Validation

```typescript
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
});

const form = useForm({
  validatorAdapter: zodValidator(),
  validators: {
    onChange: schema,
  },
  // ...
});
```

### 2. Handle Loading States

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const form = useForm({
  onSubmit: async ({ value }) => {
    setIsSubmitting(true);
    try {
      await submitData(value);
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  },
});

<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Submitting..." : "Submit"}
</Button>;
```

### 3. Show Field-Level Errors

```typescript
<form.Field name="email">
  {(field) => (
    <>
      <Input {...field} />
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
      )}
    </>
  )}
</form.Field>
```

### 4. Use Async Validation

```typescript
<form.Field
  name="username"
  validators={{
    onChangeAsync: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const exists = await checkUsernameExists(value);
      return exists ? "Username already taken" : undefined;
    },
  }}
>
  {(field) => (
    <div>
      <Input {...field} />
      {field.state.meta.isValidating && <span>Checking...</span>}
    </div>
  )}
</form.Field>
```

### 5. Create Reusable Form Fields

```typescript
// components/form-field.tsx
import { FieldApi } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  field: FieldApi<any, any, any, any>;
  label: string;
  type?: string;
  placeholder?: string;
}

export function FormField({
  field,
  label,
  type = "text",
  placeholder,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
      />
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
      )}
    </div>
  );
}
```

## Form Patterns

### Registration Form

```typescript
const registrationSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const form = useForm({
  defaultValues: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
  validatorAdapter: zodValidator(),
  validators: {
    onChange: registrationSchema,
  },
  onSubmit: async ({ value }) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    // Handle response
  },
});
```

### Multi-Step Form

```typescript
const [step, setStep] = useState(1);

const form = useForm({
  onSubmit: async ({ value }) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final submission
      await submitData(value);
    }
  },
});

// Render different fields based on step
{
  step === 1 && <Step1Fields form={form} />;
}
{
  step === 2 && <Step2Fields form={form} />;
}
{
  step === 3 && <Step3Fields form={form} />;
}
```

## Performance Tips

1. **Use `onChange` validation sparingly** - Validate on blur for better UX
2. **Debounce async validation** - Prevent excessive API calls
3. **Memoize expensive computations** - Use `useMemo` for derived values
4. **Split large forms** - Break into smaller components
5. **Use field-level subscriptions** - Only re-render what changes

## Accessibility

- Always use `<label>` with `htmlFor` matching input `id`
- Provide clear error messages
- Use `aria-invalid` on invalid fields
- Use `aria-describedby` for error messages
- Ensure keyboard navigation works
- Test with screen readers

## Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";

test("validates email field", async () => {
  render(<LoginForm />);

  const emailInput = screen.getByLabelText("Email");
  fireEvent.change(emailInput, { target: { value: "invalid" } });
  fireEvent.blur(emailInput);

  expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
});
```

## Resources

- [TanStack Form Docs](https://tanstack.com/form/latest)
- [ShadCN UI Forms](https://ui.shadcn.com/docs/forms/tanstack-form)
- [Zod Documentation](https://zod.dev/)

## Migration from Other Libraries

### From React Hook Form

```typescript
// Before (React Hook Form)
const { register, handleSubmit } = useForm();

// After (TanStack Form)
const form = useForm({
  onSubmit: async ({ value }) => {
    /* ... */
  },
});
```

### From Formik

```typescript
// Before (Formik)
<Formik initialValues={{}} onSubmit={}>

// After (TanStack Form)
const form = useForm({
  defaultValues: {},
  onSubmit: async ({ value }) => { /* ... */ }
});
```

## Common Patterns

### File Upload

```typescript
<form.Field name="file">
  {(field) => (
    <Input
      type="file"
      onChange={(e) => field.handleChange(e.target.files?.[0])}
    />
  )}
</form.Field>
```

### Select/Dropdown

```typescript
<form.Field name="country">
  {(field) => (
    <Select value={field.state.value} onValueChange={field.handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="uk">United Kingdom</SelectItem>
      </SelectContent>
    </Select>
  )}
</form.Field>
```

### Checkbox

```typescript
<form.Field name="terms">
  {(field) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field.name}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
      <label htmlFor={field.name}>Accept terms and conditions</label>
    </div>
  )}
</form.Field>
```

---

**Remember**: Always prioritize user experience, performance, and accessibility when building forms!
