HLD link: https://docs.google.com/document/d/17opU-PeqcK6qrXWxq6f6JlfyYivyUZ4-9UZshwWLKm0/edit?usp=sharing

roomatch mockup video: https://drive.google.com/file/d/1tlv0Wvq_vWpP03P5tN3zxpgP3Y6kdt4c/view

roomatch presentation: [https://www.canva.com/design/DAGmmFYZkjg/P47IYrnv6dUV8NeUnkY71Q/edit?utm_content=DAGmmFYZkjg&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton](https://www.canva.com/design/DAGmmFYZkjg/6PFFHoaDQe_G1FcefcxKcw/view?utm_content=DAGmmFYZkjg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf1607a9d1e)

rommatch product idea: https://docs.google.com/document/d/1ggGqMwrGXvvEENVtSDoktNP6qaGw0DBvYm2H80-APtM/edit?usp=sharing

## Testing

This project uses Vitest and React Testing Library with a jsdom environment.

- Install deps: pnpm install
- Run tests once: pnpm test
- Watch mode (optional): pnpm vitest

Notes:
- The test runner is configured in itest.config.ts with @vitejs/plugin-react, environment: "jsdom", and an alias of @ to the repo root.
- itest.setup.ts includes jest-dom matchers and a small scrollIntoView polyfill for jsdom.
- Integration tests mock Next.js navigation, custom hooks, sockets, and network calls.

If you see JSX/React transform issues in tests, ensure @vitejs/plugin-react is installed and enabled in itest.config.ts.

## Testing

This project uses Vitest and React Testing Library with a jsdom environment.

- Install deps: pnpm install
- Run tests once: pnpm test
- Watch mode (optional): pnpm vitest

Notes:
- The test runner is configured in `vitest.config.ts` with `@vitejs/plugin-react`, `environment: "jsdom"`, and an alias of `@` to the repo root.
- `vitest.setup.ts` includes jest-dom matchers and a small `scrollIntoView` polyfill for jsdom.
- Integration tests mock Next.js navigation, custom hooks, sockets, and network calls.

If you see JSX/React transform issues in tests, ensure `@vitejs/plugin-react` is installed and enabled in `vitest.config.ts`.


## Testing

This project uses Vitest and React Testing Library with a jsdom environment.

- Install deps: pnpm install
- Run tests once: pnpm test
- Watch mode (optional): pnpm vitest

Notes:
- The test runner is configured in itest.config.ts with @vitejs/plugin-react, environment: jsdom, and an alias of @ to the repo root.
- itest.setup.ts includes jest-dom matchers and a small scrollIntoView polyfill for jsdom.
- Integration tests mock Next.js navigation, custom hooks, sockets, and network calls.

If you see JSX/React transform issues in tests, ensure @vitejs/plugin-react is installed and enabled in vitest.config.ts.


## Testing

This project uses Vitest and React Testing Library with a jsdom environment.

- Install deps: pnpm install
- Run tests once: pnpm test
- Watch mode (optional): pnpm vitest

Notes:
- Config: `vitest.config.ts` uses `@vitejs/plugin-react`, jsdom, and alias `@` to the repo root.
- Setup: `vitest.setup.ts` loads jest-dom and polyfills `scrollIntoView` for jsdom.
- Integration tests mock Next.js navigation, custom hooks, sockets, and fetch calls.
