### tona → tone + a

[![Live Preview](https://img.shields.io/badge/live-preview-black?style=flat&logo=vercel)](https://tona-nine.vercel.app/)

a minimal prototype of figma slides' tone adjuster, with local-storage persistence and in-memory cache

📚 stack

- next.js (typescript)
- mistral ai
- framer-motion
- react-query
- tailwind css (v4)

🔌 set-up

```bash
$ git clone https://github.com/SanyamPunia/tona.git
$ cd tona
$ pnpm install
$ pnpm dev
```

make sure to add mistral's ai api key to your `.env` file

> MISTRAL_API_KEY=...

### cache

we use a straightforward key scheme to decide whether a request should be cached.

the payload includes three core attributes: `formality`, `emotion`, and `style`.

for example, given the text “let’s schedule a meeting.”, the payload would be:

```ts
{
  "formality": "professional:39% casual:0%",
  "emotion": "expanded:0% concise:57%",
  "style": "blend:69%"
}
```

the key format is:

```bash
"text:toneKey"
```

so in this case:

```bash
"let's schedule a meeting.:professional:39% casual:0%:expanded:0% concise:57%:blend:69%"
```

a drawback of the current scheme is that small percentage differences prevent cache hits. to improve cache effectiveness, we may round attribute percentages to the nearest bucket (e.g., 10% or 25%).

one-line change example (round to nearest 10%):

```ts
const formality = `professional:${Math.round(top / 10) * 10}% casual:${
  Math.round(bottom / 10) * 10
}%`;
```

this way, values like (39, 57) and (42, 58) both normalize to (40, 60), increasing cache hit rates.
