---
inclusion: fileMatch
fileMatchPattern: ["**/*.tsx", "**/forms/**/*", "**/components/**/*"]
---

# Form Standards - TanStack Form with Zod

## Critical Rules

- Use TanStack Form for ALL forms (never use plain HTML forms or other libraries)
- Zod v4+ works directly with TanStack Form - NO adapter needed
- NEVER import `zodValidator` from `@tanstack/zod-form-adapter` (deprecated)
- Pass Zod schemas directly to `validators.onChange`
- Always use 'use client' directive for form components
- Validate on both client (TanStack Form + Zod) and server (Zod schemas in API routes)

## Basic Pattern

```typescript
"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";

// Define schema
const formSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

export default function MyForm() {
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onChange: formSchema, // Direct Zod integration
    },
    onSubmit: async ({ value }) => {
      // Handle submission
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
```

## ShadCN UI Integration

```typescript
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

<form.Field name="email">
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

## Reusable Field Error Component

```typescript
function FieldInfo({ field }: { field: any }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
      )}
      {field.state.meta.isValidating && (
        <p className="text-sm">Validating...</p>
      )}
    </>
  );
}
```

## Cross-Field Validation

```typescript
const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

## Accessibility Requirements

- Always pair `<Label>` with `htmlFor` matching input `id`
- Show clear error messages below fields
- Use `aria-invalid` on invalid fields
- Use `aria-describedby` for error messages
- Ensure keyboard navigation works
- Disable submit button when form is invalid or submitting
