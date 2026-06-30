# Project Standards Guide

A comprehensive guide for building projects with the same high coding standards as the doctoory-website. This document serves as a reference template for new projects.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Supabase Configuration](#2-supabase-configuration)
3. [Project Structure](#3-project-structure)
4. [Internationalization and RTL](#4-internationalization-i18n-and-rtl)
5. [Authentication Architecture](#5-authentication-architecture)
6. [UI/UX Standards](#6-uiux-standards)
7. [API Route Patterns](#7-api-route-patterns)
8. [State Management](#8-state-management)
9. [TypeScript Conventions](#9-typescript-conventions)
10. [Environment Configuration](#10-environment-configuration)
11. [Development Workflow](#11-development-workflow)

---

## 1. Tech Stack

### Core Framework

| Package     | Version | Purpose                     |
| ----------- | ------- | --------------------------- |
| Next.js     | 15.x    | App Router, SSR, API Routes |
| React       | 19      | UI Library                  |
| TypeScript  | 5.x     | Type Safety (strict mode)   |
| TailwindCSS | 3.4.x   | Utility-first CSS           |

### Backend & Database

| Package               | Version | Purpose                          |
| --------------------- | ------- | -------------------------------- |
| @supabase/supabase-js | ^2.58.0 | Supabase client                  |
| @supabase/ssr         | ^0.7.0  | Server-side Supabase integration |

### Internationalization

| Package    | Version | Purpose                      |
| ---------- | ------- | ---------------------------- |
| next-intl  | ^4.1.0  | i18n with App Router support |
| rtl-detect | ^1.1.2  | RTL language detection       |

### UI Components

| Package                  | Version  | Purpose                  |
| ------------------------ | -------- | ------------------------ |
| @radix-ui/\*             | Various  | Accessible UI primitives |
| shadcn/ui                | ^2.6.3   | Component library        |
| class-variance-authority | ^0.7.1   | Component variants       |
| clsx + tailwind-merge    | Latest   | Class name utilities     |
| lucide-react             | ^0.454.0 | Icon library             |
| @tabler/icons-react      | ^3.34.0  | Additional icons         |

### Animation & Interactions

| Package              | Version  | Purpose                |
| -------------------- | -------- | ---------------------- |
| framer-motion        | ^12.18.1 | Declarative animations |
| embla-carousel-react | ^8.6.0   | Carousel component     |
| tailwindcss-animate  | ^1.0.7   | CSS animations         |

### Forms & Validation

| Package             | Version | Purpose               |
| ------------------- | ------- | --------------------- |
| react-hook-form     | ^7.54.1 | Form state management |
| @hookform/resolvers | ^3.9.1  | Validation resolvers  |
| zod                 | ^3.24.1 | Schema validation     |

### Additional Libraries

| Package           | Version | Purpose             |
| ----------------- | ------- | ------------------- |
| date-fns          | 4.1.0   | Date manipulation   |
| recharts          | 2.15.0  | Charts and graphs   |
| sonner            | ^1.7.1  | Toast notifications |
| next-themes       | ^0.4.4  | Theme management    |
| @vercel/analytics | ^1.5.0  | Analytics           |

---

## 2. Supabase Configuration

### Organization Structure

**Required: Two Supabase projects per organization:**

1. **Staging Project** - For development and testing
2. **Production Project** - For live application

### Environment Variables

```env
# .env.local (Development/Staging)
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key  # Server-side only!

# .env.production (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key  # Server-side only!
```

### Four Supabase Client Patterns

#### 1. Browser Client (`lib/supabase/client.ts`)

For client-side components:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
	createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
	);
```

#### 2. Server Client (`lib/supabase/server.ts`)

For Server Components and Server Actions:

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch {
						// Called from Server Component - handled by middleware
					}
				},
			},
		}
	);
};
```

#### 3. Admin Client (`lib/supabase/admin.ts`)

For privileged operations (bypasses RLS):

```typescript
import { createClient } from "@supabase/supabase-js";

/**
 * SECURITY: Never expose this client to client-side code.
 * Only use in API routes and server-side functions.
 */
export const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);
```

#### 4. Middleware Client (`lib/supabase/middleware.ts`)

For session management in middleware:

```typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value)
					);
					supabaseResponse = NextResponse.next({ request });
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					);
				},
			},
		}
	);

	// IMPORTANT: Call getUser() immediately after createServerClient
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Handle protected routes and redirects...

	return supabaseResponse;
};
```

### Service Role Key Usage Rules

**When to Use:**

- Bypassing Row Level Security (RLS)
- Admin operations (creating users, managing data)
- System operations (migrations, cleanup tasks)
- API routes requiring full database access

**Security Best Practices:**

- NEVER expose service role key to client-side code
- ONLY use in API routes or server-side functions
- Always validate and sanitize inputs
- Implement proper error handling with cleanup
- Log operations for audit trails (never log sensitive data)
- Use principle of least privilege

**Error Handling Pattern:**

```typescript
try {
  // Step 1: Create auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({...});

  if (authError) {
    return NextResponse.json({ success: false, error: authError.message });
  }

  // Step 2: Create related records
  const { error: dbError } = await supabaseAdmin.rpc('some_function', {...});

  if (dbError) {
    // Cleanup: Remove auth user if database operation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ success: false, error: "Operation failed" });
  }

  return NextResponse.json({ success: true });
} catch (error) {
  console.error("Operation failed:", error);
  return NextResponse.json({ success: false, error: "Unexpected error" });
}
```

---

## 3. Project Structure

### Directory Layout

```
project-root/
├── app/
│   ├── [locale]/              # Locale-based routing
│   │   ├── (auth)/            # Auth pages group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── about/
│   │   ├── profile/
│   │   ├── services/
│   │   ├── layout.tsx         # Locale layout with providers
│   │   ├── page.tsx           # Home page
│   │   └── not-found.tsx
│   ├── api/                   # API routes
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── products/
│   │   └── ...
│   ├── globals.css            # Global styles + CSS variables
│   ├── layout.tsx             # Root layout
│   └── not-found.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── sections/              # Page sections
│   ├── layout/                # Layout components
│   ├── store/                 # E-commerce components
│   └── profile/               # Profile components
├── contexts/                  # React Context providers
│   ├── auth-context.tsx
│   ├── cart-context.tsx
│   └── tracking-context.tsx
├── hooks/                     # Custom React hooks
├── i18n/                      # Internationalization config
│   ├── navigation.ts          # Locale-aware navigation
│   ├── request.ts             # Request config
│   └── routing.ts             # Routing config
├── lib/                       # Utility functions & services
│   ├── supabase/              # Supabase clients
│   ├── auth/                  # Auth utilities
│   ├── tracking/              # Analytics services
│   └── utils.ts               # General utilities
├── messages/                  # Translation files
│   ├── en.json
│   └── ar.json
├── public/                    # Static assets
├── types/                     # TypeScript type definitions
├── docs/                      # Documentation
├── database/                  # Database migrations & SQL
├── middleware.ts              # Next.js middleware
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── components.json            # shadcn/ui config
```

### Component Organization

**ui/** - Reusable UI primitives from shadcn/ui:

- button.tsx, input.tsx, card.tsx, dialog.tsx, etc.

**sections/** - Page-level content sections:

- hero-section.tsx, services-section.tsx, testimonials-section.tsx

**layout/** - Layout components:

- navbar.tsx, footer.tsx, user-nav.tsx

### Service Layer Architecture

```
lib/
├── supabase/           # Database clients
├── auth/               # Authentication actions
│   └── actions.ts      # Server actions (login, signup, signOut)
├── addresses/          # Address service
├── cart/               # Cart service
├── orders/             # Order service
├── tracking/           # Event tracking
│   ├── event-service.ts
│   └── session-service.ts
└── utils.ts            # Shared utilities
```

---

## 4. Internationalization (i18n) and RTL

### next-intl Configuration

**Routing Configuration (`i18n/routing.ts`):**

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "ar"],
	defaultLocale: "en",
	localePrefix: "as-needed", // Default locale has no prefix
	localeDetection: true,
});
```

**Request Configuration (`i18n/request.ts`):**

```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "next-intl";

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;

	return {
		locale,
		messages: (await import(`../messages/${locale}.json`)).default,
		timeZone: "Africa/Cairo",
		now: new Date(),
	};
});
```

### Message File Structure

Use nested JSON with namespaced keys:

```json
{
	"layout": {
		"meta": {
			"title": "App Title",
			"description": "App description"
		},
		"footer": {
			"text": {
				"copyright": "© 2026 Company. All rights reserved.",
				"privacy_policy": "Privacy Policy"
			}
		}
	},
	"login": {
		"text": {
			"welcome_back": "Welcome Back",
			"email_address": "Email Address"
		},
		"attr": {
			"placeholder": {
				"enter_your_email": "Enter your email address"
			}
		}
	}
}
```

### Translation Hooks

```typescript
import { useTranslations } from 'next-intl';

// In component
const t = useTranslations('login.text');
const tPlaceholder = useTranslations('login.attr.placeholder');

// Usage
<h1>{t('welcome_back')}</h1>
<input placeholder={tPlaceholder('enter_your_email')} />
```

### RTL Support

**Locale Layout (`app/[locale]/layout.tsx`):**

```typescript
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**RTL CSS Utilities (`globals.css`):**

```css
@layer utilities {
	/* RTL-specific utilities */
	.rtl\:rotate-y-180 {
		transform: scaleX(-1);
	}

	/* Direction-aware text alignment */
	[dir="rtl"] {
		text-align: right;
	}

	[dir="ltr"] {
		text-align: left;
	}

	/* RTL-aware transforms */
	[dir="rtl"] .rtl-mirror {
		transform: scaleX(-1);
	}

	/* Logical properties */
	.ms-auto {
		margin-inline-start: auto;
	}

	.me-auto {
		margin-inline-end: auto;
	}

	.ps-4 {
		padding-inline-start: 1rem;
	}

	.pe-4 {
		padding-inline-end: 1rem;
	}
}
```

**RTL-Aware Component Styling:**

```tsx
// Use ltr: and rtl: prefixes
<div className="ltr:pl-4 rtl:pr-4">
  <ArrowRight className="ltr:rotate-0 rtl:rotate-180" />
</div>

// Use logical properties
<div className="ps-4 pe-4 ms-auto">
  Content
</div>
```

### Locale-Aware Navigation

**Use the custom Link from i18n:**

```typescript
import { Link } from '@/i18n/navigation';

// Automatically handles locale prefixes
<Link href="/about">About</Link>
```

---

## 5. Authentication Architecture

### Auth Context Pattern

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  // ... other fields
}

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        setProfileLoading(true);
        // Fetch user profile from database
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("supabase_id", user.id)
          .single();
        setUserProfile(data);
        setProfileLoading(false);
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        // Handle profile fetch on auth change...
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, profileLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

### Server Actions for Auth

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const login = async (formData: FormData) => {
	const supabase = await createClient();

	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email?.trim() || !password?.trim()) {
		redirect(
			`/login?error=${encodeURIComponent("Email and password are required")}`
		);
	}

	const { error } = await supabase.auth.signInWithPassword({
		email: email.trim(),
		password,
	});

	if (error) {
		redirect(`/login?error=${encodeURIComponent(error.message)}`);
	}

	revalidatePath("/", "layout");
	redirect("/");
};

export const signOut = async () => {
	const supabase = await createClient();
	await supabase.auth.signOut();
	revalidatePath("/", "layout");
	redirect("/login");
};
```

### Protected Routes (Middleware)

```typescript
// In lib/supabase/middleware.ts

// Define public routes
const isPublicRoute =
	pathname === "/" ||
	pathname.startsWith("/login") ||
	pathname.startsWith("/register") ||
	pathname.startsWith("/auth") ||
	pathname.startsWith("/api") ||
	pathname.startsWith("/services") ||
	pathname.startsWith("/about");

// Redirect unauthenticated users
if (!user && !isPublicRoute) {
	const url = request.nextUrl.clone();
	url.pathname = "/login";
	return NextResponse.redirect(url);
}

// Redirect authenticated users away from auth pages
if (user && (pathname === "/login" || pathname === "/register")) {
	const url = request.nextUrl.clone();
	url.pathname = "/";
	return NextResponse.redirect(url);
}
```

---

## 6. UI/UX Standards

### shadcn/ui Configuration

**components.json:**

```json
{
	"$schema": "https://ui.shadcn.com/schema.json",
	"style": "default",
	"rsc": true,
	"tsx": true,
	"tailwind": {
		"config": "tailwind.config.ts",
		"css": "app/globals.css",
		"baseColor": "neutral",
		"cssVariables": true,
		"prefix": ""
	},
	"aliases": {
		"components": "@/components",
		"utils": "@/lib/utils",
		"ui": "@/components/ui",
		"lib": "@/lib",
		"hooks": "@/hooks"
	},
	"iconLibrary": "lucide"
}
```

### Class Variance Authority (CVA) Pattern

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline: "border border-input bg-background hover:bg-accent",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}
```

### CSS Variables Theming

```css
@layer base {
	:root {
		--background: 0 0% 100%;
		--foreground: 0 0% 3.9%;
		--card: 0 0% 100%;
		--card-foreground: 0 0% 3.9%;
		--popover: 0 0% 100%;
		--popover-foreground: 0 0% 3.9%;
		--primary: 210 100% 50%;
		--primary-foreground: 0 0% 100%;
		--secondary: 199 100% 74%;
		--secondary-foreground: 210 100% 20%;
		--muted: 0 0% 96.1%;
		--muted-foreground: 0 0% 45.1%;
		--accent: 210 100% 35%;
		--accent-foreground: 0 0% 100%;
		--destructive: 0 84.2% 60.2%;
		--destructive-foreground: 0 0% 98%;
		--border: 0 0% 89.8%;
		--input: 0 0% 89.8%;
		--ring: 210 100% 50%;
		--radius: 0.5rem;
	}

	.dark {
		--background: 0 0% 3.9%;
		--foreground: 0 0% 98%;
		/* ... dark mode values */
	}
}
```

### Animation with Framer Motion

```typescript
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, x: -100 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7 }}
  viewport={{ once: true, amount: 0.5 }}
>
  Content
</motion.div>
```

### Toast Notifications

```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Success
toast({
	title: "Success",
	description: "Operation completed successfully.",
});

// Error
toast({
	title: "Error",
	description: "Something went wrong.",
	variant: "destructive",
});
```

### Responsive Design Patterns

```tsx
// Mobile-first responsive classes
<div className="px-4 sm:px-6 lg:px-8">
  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
    Heading
  </h1>
</div>

// Grid layouts
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## 7. API Route Patterns

### Standard API Response Structure

```typescript
// Success response
return NextResponse.json({
	success: true,
	data: result,
	count: total, // For paginated results
});

// Error response
return NextResponse.json(
	{ success: false, error: "Error message" },
	{ status: 400 }
);
```

### API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		// Validate required params
		if (!id) {
			return NextResponse.json(
				{ success: false, error: "ID is required" },
				{ status: 400 }
			);
		}

		// Fetch data
		const { data, error } = await supabaseAdmin
			.from("table")
			.select("*")
			.eq("id", id);

		if (error) {
			console.error("[API] Error:", error);
			return NextResponse.json(
				{ success: false, error: "Failed to fetch data" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("[API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.name || !body.email) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Create record
		const { data, error } = await supabaseAdmin
			.from("table")
			.insert({
				name: body.name.trim(),
				email: body.email.trim(),
			})
			.select()
			.single();

		if (error) {
			console.error("[API] Error creating record:", {
				error: error.message,
				code: error.code,
				details: error.details,
			});
			return NextResponse.json(
				{ success: false, error: "Failed to create record" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data }, { status: 201 });
	} catch (error) {
		console.error("[API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
```

### Logging Best Practices

```typescript
// Use prefixed logging
console.log("[Orders API] Creating order with payload:", {
	patient_id: body.patient_id,
	items_count: body.items?.length,
	// Don't log sensitive data
});

// Error logging with context
console.error("[Orders API] Error creating order:", {
	error: error.message,
	code: error.code,
	details: error.details,
	hint: error.hint,
	context: {
		patient_id: body.patient_id,
		// Relevant debugging info
	},
});
```

---

## 8. State Management

### Context Provider Pattern

```typescript
// Provider hierarchy in app/[locale]/layout.tsx
<NextIntlClientProvider>
  <AuthProvider>
    <TrackingProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </TrackingProvider>
  </AuthProvider>
</NextIntlClientProvider>
```

### Context Best Practices

1. **Keep contexts focused** - One responsibility per context
2. **Provide loading states** - Always expose loading/error states
3. **Use proper TypeScript types** - Define interfaces for context values
4. **Throw meaningful errors** - When hook is used outside provider

```typescript
export const useCart = () => {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};
```

### Form State with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

const {
	register,
	handleSubmit,
	formState: { errors, isSubmitting },
} = useForm<FormData>({
	resolver: zodResolver(schema),
});
```

---

## 9. TypeScript Conventions

### TSConfig Settings

```json
{
	"compilerOptions": {
		"lib": ["dom", "dom.iterable", "esnext"],
		"allowJs": true,
		"target": "ES6",
		"skipLibCheck": true,
		"strict": true,
		"noEmit": true,
		"esModuleInterop": true,
		"module": "esnext",
		"moduleResolution": "bundler",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"jsx": "preserve",
		"incremental": true,
		"plugins": [{ "name": "next" }],
		"paths": {
			"@/*": ["./*"]
		}
	}
}
```

### Type Organization

```
types/
├── i18n.ts           # i18n-related types
├── body-map-types.ts # Feature-specific types
└── index.ts          # Re-exports
```

### Interface vs Type

```typescript
// Use interface for object shapes that may be extended
interface UserProfile {
	id: number;
	email: string;
	first_name: string | null;
}

// Use type for unions, intersections, and computed types
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";
type CreateOrderRequest = Omit<Order, "id" | "created_at">;
```

### Utility Function Typing

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

---

## 10. Environment Configuration

### Required Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payment Integration (if applicable)
PAYMOB_API_KEY=
PAYMOB_SECRET_KEY=
PAYMOB_INTEGRATION_ID=

# Analytics (optional)
VERCEL_ANALYTICS_ID=
```

### Environment-Specific Configs

- `.env.local` - Local development (git ignored)
- `.env.development` - Development defaults
- `.env.production` - Production values
- `.env.example` - Template for required variables

---

## 11. Development Workflow

### Scripts

```json
{
	"scripts": {
		"dev": "next dev",
		"build": "next build",
		"start": "next start",
		"lint": "next lint"
	}
}
```

### Middleware Configuration

```typescript
// middleware.ts
export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
```

### Pre-commit Checklist

1. Run `npm run lint` - Fix any linting errors
2. Run `npm run build` - Ensure build succeeds
3. Test both locales (en/ar) including RTL layout
4. Test responsive design on multiple breakpoints
5. Verify protected routes work correctly
6. Check console for any errors

### Code Review Standards

1. All components must support RTL
2. All user-facing text must be translated
3. API routes must have proper error handling
4. Sensitive operations must use service role appropriately
5. Loading and error states must be implemented
6. TypeScript strict mode compliance
7. Accessible (a11y) components using Radix primitives

---

## Quick Reference Checklist for New Projects

- [ ] Set up two Supabase projects (staging + production)
- [ ] Configure all four Supabase clients
- [ ] Set up next-intl with locale routing
- [ ] Add RTL support in CSS
- [ ] Create AuthProvider with proper cleanup
- [ ] Configure middleware for auth + i18n
- [ ] Set up shadcn/ui with CSS variables
- [ ] Add toast notifications
- [ ] Configure TypeScript strict mode
- [ ] Set up environment variables
- [ ] Create translation files structure
- [ ] Add Cursor rules for Supabase patterns
