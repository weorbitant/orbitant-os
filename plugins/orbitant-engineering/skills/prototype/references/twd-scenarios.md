# TWD scenarios in a prototype

<!--
  Curated for prototypes from the twd skill in BRIKEV/twd-ai
  (skills/twd/references/test-writing.md and test-api.md, read 2026-11-17).
  That skill is for an app's dev server: Vite, test files, mocked requests,
  twd-cli in CI. A prototype is one file with no server and no
  network, so most of it does not apply; what follows is the part that does.
-->

The scenarios are the design's **acceptance criteria**, run by people in the TWD sidebar at a slow pace so they can watch each one. They are also what a development agent turns into the real tests, so write them as the user would do the task.

## Setup (already in the template, keep it)

- The import map pins `twd-js` from esm.sh; the scenarios live in one `<script type="module">` at the end of the body, inside an async function passed to `initTWD`, which imports `twd-js` and `twd-js/runner` dynamically.
- `initTWD({ escenarios: fn }, { open: true, position: 'left', serviceWorker: false, pace: true, rootSelector: '#app' })`, preceded by `sessionStorage.setItem('twd-pace', '600')` when the key is unset: the sidebar reads its starting pace from that key (600ms is "Slower"), so the scenarios run slowly by default.
- **No request mocking**: `serviceWorker: false`, data is hardcoded in the page, so never use `twd.mockRequest`, `twd.waitForRequest` or `twd.visit`.

## Writing a scenario

- One `describe` per screen; one `it` per criterion, named in the thread's language as an outcome ("filtra por nombre", "avisa cuando no hay resultados").
- Cover the main path, the empty state, an error or validation state when the design has one, and every state the thread discussed. Usually three to six scenarios.
- **Reset state in `beforeEach`**: nothing reloads the page between scenarios, so whatever one scenario typed, opened or toggled is still there for the next. Clear inputs, close what was opened, or call the page's own `render()`/reset function.

## Finding elements, in this order

1. `await screenDom.findByRole('button', { name: 'Guardar' })`: by role and accessible name. Preferred, and it doubles as an accessibility check: if a control cannot be found by role and name, fix the markup, not the test.
2. `await screenDom.findByLabelText('Filtrar por nombre')`: form inputs.
3. `await screenDom.findByText('Nadie coincide con el filtro.')`: visible text.
4. `await twd.get('#count')`: CSS selector, last resort.

Use `findBy*` (it waits) for every lookup; `screenDom.queryBy*` only to assert something is absent. For a dialog or anything outside `#app`, use `screenDomGlobal`.

Find into a variable, then act and assert on it.

## Acting

```js
const filtro = await screenDom.findByLabelText('Filtrar por nombre');
await userEvent.type(filtro, 'mar');
await userEvent.click(await screenDom.findByRole('button', { name: 'Guardar' }));
await userEvent.clear(filtro);
await userEvent.selectOptions(select, 'activos');
await userEvent.keyboard('{Enter}');
await userEvent.tab();
```

Date, range and colour inputs: `twd.setInputValue(input, '2026-12-01')`.

## Asserting

```js
twd.should(el, 'be.visible');           // also 'be.hidden', 'not.be.visible'
twd.should(el, 'have.text', '1 persona');
twd.should(el, 'contain.text', 'Ana');
twd.should(el, 'have.value', 'mar');
twd.should(el, 'be.disabled');          // 'be.enabled', 'be.checked', 'be.focused'
twd.should(el, 'have.attr', 'aria-expanded', 'true');
expect(items).to.have.length(3);        // Chai, not Jest: no toBe/toEqual
```

`twd.should` checks once. When the result appears after the action, query for the result itself (`await screenDom.findByText('Guardado')`) instead of asserting on an old element. Never wrap actions inside `twd.waitFor`.
