# 📘 React Learning Guide — From Scratch to Advanced

> A concept-focused curriculum. No project building required — just learn, understand, and (optionally) try tiny snippets in your browser at [react.dev](https://react.dev/learn).

---

# 🟢 PHASE 1 — Foundations (Before React)

React is just JavaScript. Spend 20% of your time making these solid.

## 1.1 JavaScript you MUST know
| Topic | Why React needs it |
|---|---|
| `let` / `const` | Variables never use `var` in modern code |
| Arrow functions `() => {}` | Components are written as these |
| Template literals `` `Hi ${name}` `` | JSX interpolation works the same way |
| Arrays: `map`, `filter`, `find`, `reduce` | Rendering lists is just `map()` |
| Objects & destructuring `const {a, b} = obj` | Props and state are objects |
| Spread `...` | Copying state immutably: `{...old, name: "new"}` |
| Arrays immutable: `[...old, newItem]` | You never `push` into React state |
| `Array/Optional chaining` `user?.address?.city` | Safe data access |
| Ternary `cond ? a : b` | Conditional rendering |
| `async/await`, Promises, `fetch` | Talking to APIs |
| Modules `import / export` | Every component is a module |
| `setTimeout`, closures | Understanding stale-closure bugs in hooks |

**Chapters:** Arrays & Objects → Functions → Closures → Async JS → ES6 Modules.

## 1.2 HTML + CSS basics
- Semantic HTML tags
- Flexbox & Grid (React apps are usually styled with utility CSS like Tailwind)
- Media queries (responsive design)

---

# 🟢 PHASE 2 — React Fundamentals

## 2.1 What is React?
- A **UI library** (not a framework) that builds apps from **components**
- **Declarative**: you describe *"what the UI should look like given data"*, React updates the DOM for you
- The UI is a **function of state**: `UI = f(state)`
- React uses a **Virtual DOM** → diffs changes → updates only what changed (reconciliation)

## 2.2 JSX
- HTML-like syntax that compiles to JavaScript function calls
- Rules:
  - One parent element (use `<>...</>` fragment for zero extra DOM)
  - `class` → `className`, `for` → `htmlFor`
  - `{}` means "run JavaScript expression here"
  - Comments inside JSX: `{/* like this */}`
- Everything in JSX is just an object — you can store it in variables, return it from functions

## 2.3 Components
- A component = **a reusable function that returns JSX**
- Name **must start with a capital letter** (`<Profile />` not `<profile />`)
- Two styles: function components (modern, all you need) and class components (legacy, learn to *read* only)
- Components compose: small components build bigger ones (Button → Card → Page → App)

## 2.4 Props
- Props = **inputs** to a component, read-only (never mutate props!)
- `props.children` — whatever you nest between tags
- Passing functions as props (callbacks) — how children "talk back" to parents
- Prop drilling and why people complain about it (leads to Context, later)

```jsx
function Avatar({ src, size = 40 }) {   // destructured props + default value
  return <img src={src} width={size} />;
}
```

## 2.5 Conditional Rendering
- `{isLoggedIn && <LogoutButton />}`
- `{error ? <Error /> : <Content />}`
- Early `return` in the component body
- ⚠️ `{0 && <X />}` renders the number 0 — a classic gotcha

## 2.6 Rendering Lists
```jsx
{products.map(p => <ProductRow key={p.id} product={p} />)}
```
- `key` = stable unique ID (**not the array index** if the list can reorder)
- Why keys matter for React's diffing

## 2.7 Events
- `onClick`, `onChange`, `onSubmit`, camelCase handlers
- `e.preventDefault()` for forms
- Handler as a *function reference* vs calling it instantly (`onClick={fn}` not `onClick={fn()}`)

## 2.8 State with useState
- State = data that **changes over time**, owned by that component
- Calling the setter **schedules a re-render**; React compares, updates, re-runs your component
```jsx
const [count, setCount] = useState(0);
setCount(prev => prev + 1);   // updater form: safest with old value
```
- **Golden rules:**
  - State is a *snapshot* — it doesn't change mid-render
  - Never mutate state directly (`arr.push()` ✗ → `setArr([...arr, x])` ✓)
  - Batch updates: two `setState` calls = one re-render
  - Local state vs lifted state (move state up to closest common parent)

**✅ Checkpoint:** you can build forms, counters, show/hide lists, and pass props around — all from memory.

---

# 🟡 PHASE 3 — The Core Hook Set

## 3.1 Rules of Hooks
1. Only call hooks at the **top level** of a component (never inside ifs, loops, other functions)
2. Only call in **React components or custom hooks**
- Why: React tracks hooks by **call order**

## 3.2 useEffect — side effects
Runs *after* render. Used for: fetching data, subscriptions, timers, localStorage.
```jsx
useEffect(() => {
  // setup
  return () => { /* cleanup */ };   // runs before next run + on unmount
}, [dependencies]);                 // [] = once · [id] = when id changes · none = every render
```
- **Cleanup** prevents leaks (timers, event listeners, websockets)
- ⚠️ Common beginner traps:
  - Infinite loop from setting state *inside* an effect that depends on it
  - Forgetting dependencies → stale data
  - "You Might Not Need an Effect" — effects are NOT for transforming data for display (do it during render) or responding to events

## 3.3 useRef
- `useRef(initial)` returns a box `{ current }` that **survives re-renders and doesn't trigger one**
- Perfect for: DOM access (`inputRef.current.focus()`), storing interval IDs, previous values

## 3.4 Keyed state reset
- `key` isn't just for lists — putting `key={userId}` on a component resets its whole internal state

---

# 🟡 PHASE 4 — Thinking in React + Styling

## 4.1 The Thinking-in-React process (memorize this)
1. **Break the UI into components** based on hierarchy
2. Build a **static version** first (props only, no state)
3. Identify the **minimal set of state** (don't store what you can compute!)
4. Decide **where state lives** (lift to common parent)
5. Add **inverse data flow** (callbacks so children update parent state)

## 4.2 DRY principle
- Redundant state? Compute instead: `fullName = firstName + lastName` (never store both + the full name)
- Extract repeated JSX into components

## 4.3 Styling options (know the landscape)
- Plain CSS / CSS Modules (scoped class names — build-in support)
- **Tailwind CSS** (utility classes — industry favorite)
- CSS-in-JS (styled-components, Emotion — legacy-ish now)
- Component libraries: shadcn/ui, MUI, Ant Design, Chakra

**✅ Checkpoint:** given any screenshot of a UI, you can name every component, the data flow, and where each piece of state should live.

---

# 🟠 PHASE 5 — Intermediate Patterns

## 5.1 Forms the right way
- Controlled inputs: `value` + `onChange` (single source of truth = state)
- Uncontrolled inputs: only `defaultValue` + ref (rare)
- Useful sugar: `useState({ name: "", email: "" })` object state, spread on update
- Form libraries to know exist: React Hook Form, Formik

## 5.2 Data fetching
- Plain `fetch` + `useEffect` + loading / error / data states — implement it once manually to understand it
- Then use a proper library: **TanStack Query (React Query)** — caching, retries, refetching, mutations (this is *the* industry standard)
- AbortController to cancel in-flight requests on unmount/change

## 5.3 Custom Hooks — ⭐ React's superpower
- Any function starting with `use` that calls other hooks
- Extracts *logic* (state + effects) so components stay clean
- Classic ones to write yourself:
  - `useLocalStorage(key, initial)` — sync state ↔ localStorage
  - `useDebounce(value, delay)` — search inputs
  - `useFetch` → then understand why libraries beat it
  - `usePrevious(value)`
- Rule: hooks compose — a custom hook can call custom hooks

## 5.4 Necessary optimization hooks (use sparingly, measure first!)
- `useMemo` — cache **expensive calculations**
- `useCallback` — keep function identities stable (matters when passing to memoized children)
- `React.memo(Comp)` — skip re-render if props unchanged
- `useDeferredValue` / `useTransition` — keep typing smooth during heavy updates
- ⚠️ Premature optimization is real. Profile (React DevTools Profiler) before reaching for these.

## 5.5 Context API
- Solves prop drilling for **global-ish data** (theme, auth user, language)
```jsx
const ThemeContext = createContext(null);
<ThemeContext.Provider value="dark">...</ThemeContext.Provider>
const theme = useContext(ThemeContext);
```
- ⚠️ Not a state manager: every consumer re-renders when the context *value* changes → keep it small/expensive-to-acquire, or split contexts
- Combine: `Context` (access) + `useReducer` (logic)

## 5.6 useReducer
- `useState` for complex, multi-field, transition-y state
- One reducer function: `(state, action) => nextState`
- Predictable, testable, great for forms/wizards/undo logic

## 5.7 Portals & Error Boundaries
- `createPortal` — render into a different DOM node (modals, tooltips)
- Error boundaries catch render crashes (class-based or use `react-error-boundary` lib) — define role: error events, not control flow

**✅ Checkpoint:** you can fetch data with caching, debounce a search, split logic into custom hooks, and avoid prop drilling with context.

---

# 🔴 PHASE 6 — Routing & App Architecture

## 6.1 React Router (or TanStack Router)
- Setup, `<Link>` vs `<a>`, `NavLink` active styling
- Dynamic routes `/products/:id` + `useParams`
- Query strings `useSearchParams` (filters, pagination)
- **Nested routes** + `<Outlet>` (overall page layout stays, inner content swaps)
- Programmatic navigation `useNavigate`, redirects, "not found" routes, `loader`s
- Route-based **lazy loading + code splitting**

## 6.2 Global state management — the landscape
| Tool | When it shines |
|---|---|
| Context + useReducer | Small apps, theme/auth |
| **Redux Toolkit** | Big apps, time-travel dev tools, most legacy jobs |
| **Zustand** | Tiny API, modern favorite |
| TanStack Query | Server data (cache/retry/sync) — usually the *bulk* of "state" |
| Jotai / Recoil | Atomic, fine-grained state |

- Key mental model: **server-state ≠ client-state** and should be managed differently.

---

# 🔴 PHASE 7 — Advanced React Internals & Performance

## 7.1 Rendering, memoization, and concurrent rendering
- **Render phases:** trigger → render (compute JSX, must be pure) → commit (DOM updates)
- Re-renders happen when: state changes, parent re-renders, context changes
- Deep dive module: [useMemo, useCallback, memo — deep dive](https://react.dev/reference/react/useMemo)

## 7.2 Concurrent React
- `Suspense` — declare loading boundaries (`fallback`) around async components
- `useTransition` — mark updates as non-urgent (tabs/filters don't block typing)
- `useDeferredValue` — render a "stale" copy while an expensive update catches up
- Streaming SSR basics

## 7.3 Server-Side Rendering era — know the taxonomy
- **SSR** — server renders HTML per request; hydration makes it interactive
- **SSG** — build-time HTML (fast static)
- **ISR** — periodic regeneration
- **Streaming SSR + RSC** — this is Next.js/App Router territory
- **React Server Components (RSC):** components that run ONLY on the server → direct DB access, zero JS shipped. Mark client interactivity with `"use client"`. Know the client/server boundary rules.

## 7.4 Frameworks (you'll meet these at jobs)
- **Next.js** — file-based routing, server components, API routes. Industry default.
- Also: Remix/React Router v7, Expo (React Native — same React concepts on mobile!).

## 7.5 Testing
- **Vitest** (runner) + **Testing Library** (query by what users see: role, text)
- Test behavior, not implementation
- `userEvent` for interactions; mock network with **MSW** (Mock Service Worker)
- E2E: Playwright

## 7.6 TypeScript with React (learn after you're fluent)
- `type Props = { title: string; onSave?: () => void }`
- Typing `useState<T>`, events, generics for reusable components, `children: React.ReactNode`

## 7.7 Performance engineering
- React DevTools Profiler → find real jank
- Fixes by cause: too big bundle → code split; too many re-renders → memo/lists virtualization (`react-window`); slow images → lazy loading, `srcset`; layout thrash → transform/opacity animations
- Understand keys, list virtualization for 1000+ rows

---

# 🔴 PHASE 8 — Ecosystem & Career-Grade Practices

- **Folder structure:** feature-based (`features/checkout/components/...`) beats type-based (`all components in one folder`) as apps grow
- **Design patterns:** container/presentational (legacy-ish), compound components (`<Tabs>`, `<Select>`), render props (know the idea), controlled vs uncontrolled component APIs
- **Accessibility (a11y):** semantic tags, labels, keyboard focus, `alt` text — Testing Library's queries force good a11y by design
- **Security basics:** never trust client-side validation, XSS and why JSX escapes by default, `dangerouslySetInnerHTML` exists for a reason, don't hide secrets in frontend code (env vars starting with `VITE_` are **public**)
- **Deployment:** Vercel / Netlify (frontend), environment variables, CI builds
- ** seasoning:** read the official docs — they are genuinely the best in the industry:
  - [Learn React](https://react.dev/learn) (read top to bottom)
  - [API Reference](https://react.dev/reference/react)
  - Widely praised companion: Kent C. Dodds' Epic React mindset articles, Josh Comeau's articles on CSS/JS

---

# 📅 Suggested Pace (adjust freely)

| Weeks | Focus |
|---|---|
| 1–2 | Phase 1 (JS essentials) + Phase 2.1–2.6 (JSX, components, props) |
| 3 | Phase 2.7–2.8 (events, useState) + tiny snippets in react.dev sandbox |
| 4 | Phase 3 (effects, refs) — data fetching by hand |
| 5–6 | Phase 4–5 (thinking, forms, custom hooks, context, reducer) |
| 7–8 | Phase 6 (routing, state managers) |
| 9–10 | Phase 7–8 (internals, SSR concepts, testing, TypeScript intro) |

~1–2 focused hours/day beats 8 hours once a week.

---

# 🧠 Mastery Self-Check (you're "advanced" when you can answer these)

1. Why must state updates be immutable? What breaks otherwise?
2. What exactly triggers a re-render, and how do you stop an unnecessary one?
3. When is `useEffect` the *wrong* tool? How do you know?
4. Why do list keys exist and why is array index a smell?
5. Explain "stale closure" (e.g., in a `setInterval` inside an effect) and two fixes.
6. `useMemo` vs `useCallback` vs `React.memo` — which problem does each solve?
7. When would Context hurt performance, and what do you do instead?
8. Controlled vs uncontrolled component — how do you design a component supporting both?
9. Why "server state ≠ client state"?
10. What is an RSC, and which of the code you'd write today is compatible with one?

---

*Keep this file as your tracker — tick phases off as you finish them. Ask me any concept from any phase and I'll teach it using code from this very workspace (SneakLab) as illustration, in read-only mode.*
