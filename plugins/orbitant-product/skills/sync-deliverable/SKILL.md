---
name: sync-deliverable
description: Use when a hook asks to sync a discovery deliverable (PROBLEM_BRIEF.md, STRESS_TEST.md or RETRO-YYYY-MM-DD.md under the discovery folder of a feature), when SessionStart lists deliverables not yet synced, or as the preflight of /discover — mirrors each deliverable as one record of the product's "Descubrimiento de producto" database in Notion, written as the PM.
---

# Sync deliverable — mirror discovery deliverables to the discovery store

This skill is the **only** part of the plugin that knows the store. For this proof of
concept, the store is **Notion**. The files in `discovery/<slug>/` remain the source of
truth; Notion holds a mirror of them, one **record** per deliverable, never a subpage.

## Language

Talk to the PM in **their language**, in plain words and **one line per message**. Never
show IDs, tool names, JSON or error dumps. Notion property names and values stay in
Spanish, exactly as written below.

## Paths

- **Sync state:** `<home>/.discovery/<slug>/sync.json`
  (`~/.discovery/…` on macOS/Linux, `%USERPROFILE%\.discovery\…` on Windows). Shape:
  `{ "feature", "workdir", "artifacts": { "brief"|"stress_test"|"retro": { "path", "status", "ref", "synced_at" } } }`.
  Only this skill and the `on-artifact-written` hook write it. Never touch `state.json`
  from here, except to read `verdict`.
- **Destination:** `<workdir>/discovery/notion.json`:
  `{ "product", "map_url", "database_url", "data_source" }`.

## Notion tools

Use whichever Notion toolset is **authenticated** in this session. The plugin bundles
Notion's hosted MCP server; the PM may also have a claude.ai Notion connector. You need
these capabilities:

- **who-am-I** (`notion-get-self`), or a minimal search;
- **fetch**;
- **search**;
- **query data sources** — always in **rows** mode, never SQL, which uses a shared quota;
- **create pages**;
- **update page**, with update properties or replace content;
- **create database**;
- **update data source**.

Before the first write in a session, read the Notion enhanced-Markdown spec resource the
Notion tools point to, as they require.

## Mode: preflight

Run by `/discover` before the interview. Goal: the PM is logged in and this folder knows its
destination. The interview must not start until preflight reports ready.

1. **Login.** Call who-am-I.
   - Works → go to step 2.
   - Not authenticated, or no Notion tools → tell the PM, for example: *"Para guardar tu
     trabajo necesito que inicies sesión en Notion (solo esta vez): escribe `/mcp`, elige
     «notion» y sigue los pasos del navegador. Avísame cuando termines."* Wait for their
     reply, then retry step 1.
2. **Destination.** If `<workdir>/discovery/notion.json` exists and its `data_source` can be
   fetched → ready. Otherwise run *Resolve the destination* below.
3. Report ready in one line: *"Todo listo: guardaré esta discovery en «<product>»."*

### Resolve the destination

1. Ask once: *"¿De qué producto es esta discovery? Dime el nombre (por ejemplo «Portal
   Cliente») o pega el enlace de su mapa de producto en Notion."*
2. **Find the map page.**
   - **Link** → fetch it.
   - **Name** → search Notion for `<name> — Mapa de producto` (title search, at most 5
     results).
     - One match → confirm it with the PM.
     - Several matches → list their titles and let the PM pick.
     - No match → run *Create a minimal product map* below. It ends with a map page
       (carry on at step 3) or with no access (step 4).
3. **Find the database.** Among the map page's child databases, take the one titled
   **`Descubrimiento de producto`** and fetch it to read its data source and schema.
   - **Found** → it must have these properties: `"Título"` title, `"Tipo"` select,
     `"Estado"` select, `"Actualizado"` date, `"Resumen"` text, `"Palabras clave"`
     multi_select, `"Funcionalidad"` text.
     - Add any missing property with *update data source*, using the column definitions
       from the DDL below.
     - Never drop or rename a property.
   - **Not found** → *create database* under the map page, titled
     `Descubrimiento de producto`, with this schema:

     ```
     CREATE TABLE ("Título" TITLE, "Tipo" SELECT('Brief':blue, 'Stress test':orange, 'Retro':purple), "Estado" SELECT('Borrador':yellow, 'Vigente':green, 'Obsoleto':gray), "Actualizado" DATE, "Resumen" RICH_TEXT COMMENT 'Qué resuelve y para quién, ≤200 caracteres', "Palabras clave" MULTI_SELECT('discovery':gray) COMMENT 'Sinónimos, siglas y término en inglés', "Funcionalidad" RICH_TEXT COMMENT 'Slug de la discovery: une Brief, Stress test y Retro')
     ```
4. **No access** (the page can't be opened, or a write is refused) → tell the PM:
   *"No tienes acceso al mapa de «<producto>» en Notion. Pide acceso al equipo técnico y
   vuelve a lanzar /discover."* Stop **without** writing `notion.json`.
5. **Success** → write `<workdir>/discovery/notion.json` with `product`, `map_url`,
   `database_url` and `data_source` (the `collection://…` URL), and tell the PM where the
   records will go.

Never ask for IDs and never offer to work without Notion.

### Create a minimal product map

Run only when the search in *Resolve the destination* finds no map. A map that isn't found
is not a map without access: it may not exist yet, and then nobody can grant access to it.

A product map belongs to one **product**, never to a **feature** (the idea being
discovered). When the idea is a whole new product, the product and the idea are the same.

**Write nothing to Notion before step 6.** Step 6 runs only after the PM has confirmed
steps 2, 3 and 5. One question per message.

1. **Look-alikes.** Search Notion titles for `Mapa de producto` (at most 5 results) and
   keep the maps whose title looks like the product. If there are any, list their titles and
   ask whether the product is one of them.
   - The PM picks one → use that map and carry on at *Resolve the destination*, step 3.
   - None, or the PM says no → step 2.
2. **New, or not visible?** Ask one plain question, for example: *"No encuentro un mapa de
   «<producto>» en Notion. ¿Es un producto que todavía no tiene mapa, o el mapa existe y tú
   no lo ves?"*
   - The map exists and the PM can't see it → no access (*Resolve the destination*, step 4).
     Stop, with nothing written.
   - The product has no map → step 3.
3. **Official name.** Propose the product's official name — the product's, not the idea's —
   and have the PM confirm or correct it. Use the confirmed name for the map's title and for
   `product` in `notion.json`.
4. **Parent page.** The map goes under a page that already exists and that the PM can see.
   - Search for the product's team page, titled `<Product> TECH` → use it.
   - No team page → list the client pages the PM can see (titled `<Client> TECH`, in the
     accounts area) and let the PM pick one.
   - The PM can see no client page → no access (*Resolve the destination*, step 4). Stop,
     with nothing written.

   Never create a client page or a product team page. Never create the map as a private
   page or a draft: always create it with the chosen page as its parent.
5. **Description.** Draft one or two sentences about the **product**, not about the idea,
   using only what the PM said. Show them and have the PM confirm or correct them. If it
   isn't clear whether the product is already in use or is brand new, ask in the same
   message.
6. **Create.** Create the map page under the parent from step 4:
   - title `<Product> — Mapa de producto` (with an em dash), icon 📚;
   - first paragraph: the confirmed description, with its first sentence in bold;
   - second paragraph: the status note, verbatim in Spanish. For a brand-new product:

     ```
     Producto en definición: de momento este mapa solo contiene la base **Descubrimiento de producto**, con los entregables del plugin `product-discovery` (un registro por Brief, Stress test y Retro, unidos por `Funcionalidad`). **Lo que se puede construir es `Tipo = Brief` con `Estado = Vigente`.**
     ```

     For a product that already exists and had no map, the same note starting with
     `Mapa por completar: de momento solo contiene la base` instead of
     `Producto en definición: de momento este mapa solo contiene la base`.

   Then carry on at *Resolve the destination*, step 3, with the new page: it creates the
   `Descubrimiento de producto` database under it. If Notion refuses either write → no
   access (step 4).

The minimal map holds the description, the status note and that database, and nothing
else. Never create any other database (glossary, modules and screens, integrations, business
rules, automations, documentation, discovery findings), empty or filled, and never write a
fact about the product beyond the confirmed description: a map without provenance is worse
than no map. Completing the map is a separate, manual job that starts from this one.

## Mode: sync

Input: `<slug>` and `<type>` (`brief` | `stress_test` | `retro`), as given by the hook or by
SessionStart.

1. **Load.** Read `sync.json` and take `artifacts.<type>.path`. The deliverable's
   `<workdir>` is the folder that contains its `discovery/` folder (the parent of
   `discovery/`). It is **not** necessarily the current folder: SessionStart retries can run while the
   PM works elsewhere. If the file no longer exists at that path, look for
   `discovery/<slug>/<file>` in the current folder.
   - **Found** → use that path and update `artifacts.<type>.path` to it.
   - **Not found** → tell the PM in one line that the deliverable was moved or deleted, so it
     can't be saved until it's back; leave it `pending` and keep its `ref`; stop.
2. **Login.** If Notion is not authenticated → give the login message from preflight,
   leave the item `pending`, stop. Do not block the discovery flow.
3. **Destination.** Use `<workdir>/discovery/notion.json` — the deliverable's own folder from
   step 1, never the current folder's. If it is missing → run *Resolve the destination* for
   that `<workdir>`, including *Create a minimal product map* when the product has none. If
   that ends in no access → leave `pending`, stop.
4. **Build the properties** from the deliverable, ignoring its YAML frontmatter:
   - **Feature title** — from the brief's `# Problem brief — <title>` heading; for the
     stress test and the retro, read the brief in the same folder. If there is no brief,
     humanise the slug.
   - `"Título"` — `<Tipo> — <feature title>`; for a retro, append ` — <YYYY-MM-DD>` from
     its file name. Example: `Brief — Exportar facturas a Excel`.
   - `"Tipo"` — `Brief`, `Stress test` or `Retro`.
   - `"Estado"`
     - **Brief:** `Vigente` if the ledger `<home>/.discovery/<slug>/state.json` has
       `"verdict": "READY"`; otherwise, including when there is no ledger, `Borrador`.
     - **Stress test and Retro:** always `Vigente`.
   - `"Actualizado"` — the deliverable's `generated_at`.
   - `"Resumen"` — at most **200 characters**, in the PM's language: what it solves and for
     whom. Cut with `…` rather than exceed.
     - **Brief:** the *Problem to solve* statement plus who it affects.
     - **Stress test:** `VERDICT: <READY|NOT_READY|BLOCKED> · <n> bloqueantes, <m> no bloqueantes`
       plus the main gap if it fits.
     - **Retro:** counts per tag (`[SKILL]`, `[DOMAIN]`, `[UX]`) plus the headline finding.
   - `"Palabras clave"` — 4 to 10 options: domain synonyms, acronyms and the English term.
     First read the existing options of the property and **reuse** any that mean the same;
     never add a near-duplicate such as `factura` next to `facturas`.
   - `"Funcionalidad"` — the slug, verbatim.
5. **Build the body** (leaf-page rules; the file on disk is not changed):
   1. **Answer first.** Three lines with the conclusion:
      - **Brief** — the problem statement and the Estado.
      - **Stress test** — the `VERDICT` line and the blocking gaps in one sentence.
      - **Retro** — the headline finding and the counts per tag.
   2. For Stress test and Retro, the next line is `Brief: <mention-page url="<brief ref>">`
      when the brief's `ref` is known. Use `<mention-page>`, **never** `<page>`: a `<page>`
      block moves the page it points to.
   3. Then the deliverable content, kept to flat blocks: `##` headings, bullets and code
      blocks.
      - **No tables:** rewrite each table row as `- <first cell>: <cell 2> · <cell 3>…`.
      - **No** callouts, columns, tabs, toggles or colours.
6. **Find the record.**
   - Use `artifacts.<type>.ref` if set.
   - Otherwise query the data source in rows mode with filters `"Funcionalidad"` is
     `<slug>` and `"Tipo"` is `<Tipo>`. For a retro, also `"Título"` is the title from
     step 4.
7. **Upsert.**
   - **Found** → update its properties, then replace its content with the body.
   - **Not found** → create one page **with the data source as parent**, never the map
     page, with the properties and the body.
   - If the content is refused for size, create or update with the properties first, then
     add the body in consecutive chunks.
8. **Brief side effect** (Stress test only). Set the Brief record's `"Estado"`:
   - `Vigente` if the verdict is `READY`;
   - `Borrador` if it is `NOT_READY` or `BLOCKED`: neither can be built.

   Find the Brief record by its `ref` or by query.
9. **Check.** Fetch the record once. If the response says `truncated`, tell the PM in one
   line that the record is too long for agents to read whole. The sync still counts as
   done.
10. **Record.** In `sync.json`, set this item's `status: "synced"`, `ref` (the record URL)
    and `synced_at` (today, `YYYY-MM-DD`). Read-modify-write: keep every other field and
    item.
11. **Tell the PM** in one line, with the link: *"Guardado en Notion: <Título>."*

### When something fails

Any failure leaves the item `pending`. Say one plain line, then carry on with the discovery.
Never retry in a loop within the same turn.

| Failure | What to tell the PM |
|---|---|
| Not logged in | the login message from preflight |
| No access to the map or the database | the no-access message from *Resolve the destination* |
| Anything else | *"No he podido guardarlo en Notion ahora; lo reintentaré más tarde."* |

Running this mode twice for the same deliverable is harmless: the second run finds the same
record and rewrites it.
