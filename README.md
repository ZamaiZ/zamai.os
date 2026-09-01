# Zamai.OS

Sistema pessoal construído com Next.js, Supabase Auth e shadcn/ui.

## Autenticação

O ambiente aceita uma única conta, usa sessão SSR em cookies, RLS e rate limit.
Consulte [docs/authentication.md](docs/authentication.md) antes do primeiro
deploy.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/primitives/button";
```
