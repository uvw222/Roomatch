HLD link: https://docs.google.com/document/d/17opU-PeqcK6qrXWxq6f6JlfyYivyUZ4-9UZshwWLKm0/edit?usp=sharing

roomatch mockup video: https://drive.google.com/file/d/1tlv0Wvq_vWpP03P5tN3zxpgP3Y6kdt4c/view

roomatch presentation: [https://www.canva.com/design/DAGmmFYZkjg/P47IYrnv6dUV8NeUnkY71Q/edit?utm_content=DAGmmFYZkjg&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton](https://www.canva.com/design/DAGmmFYZkjg/6PFFHoaDQe_G1FcefcxKcw/view?utm_content=DAGmmFYZkjg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf1607a9d1e)

rommatch product idea: https://docs.google.com/document/d/1ggGqMwrGXvvEENVtSDoktNP6qaGw0DBvYm2H80-APtM/edit?usp=sharing

## Testing

This project uses Vitest + React Testing Library (jsdom).

Commands
- Install: pnpm install
- Run all tests: pnpm test
- Watch mode: pnpm vitest

Notes
- Config: vitest.config.ts uses @vitejs/plugin-react, environment: "jsdom", and alias "@" to the repo root.
- Setup: vitest.setup.ts loads @testing-library/jest-dom and polyfills scrollIntoView.
- Integration tests mock Next.js navigation, custom hooks, sockets, and network calls.
