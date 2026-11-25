# Store: notion

Keeps each record as one page of the product's **`Descubrimiento de producto`** database in
Notion, written as the PM. One record per deliverable, never a subpage. Notion property names
and values stay in Spanish, exactly as written below.

**For the PM:** "en Notion", in the base *Descubrimiento de producto* of the product's map.

## Capabilities

Use whichever Notion toolset is **authenticated** in this session: a claude.ai Notion connector,
or a Notion MCP server the PM added. The tool names in brackets are examples only. You need:

- **who-am-I** (`notion-get-self`), or a minimal search;
- **fetch**;
- **search** by title;
- **query a data source**, always in **rows** mode, never SQL, which uses a shared quota;
- **create pages**;
- **update a page**, its properties or its whole content;
- **create a database**;
- **update a data source**.

Before the first write in a session, read the Notion enhanced-Markdown spec resource the Notion
tools point to, as they require.

## Detect

Call who-am-I. It answers → usable. No Notion tools, or not authenticated → not usable.

## Login message

Tell the PM, for example: *"Para guardar en Notion necesito que lo conectes (solo esta vez). En
Claude Code: escribe `/mcp` y conecta Notion; si no aparece, activa el conector de Notion de
claude.ai. En Cowork: activa Notion en el menú de conectores. Avísame cuando termines, o dime
que prefieres otro sitio."*

## Resolve the destination

### Old destination file

A folder used with the 0.2.0 plugin has `<workdir>/discovery/notion.json` and no `store.json`.
Recognise it: read it as `"store": "notion"` with its `product`, `map_url`, `database_url` and
`data_source`, and write `store.json` with those fields on the next successful upsert. Never
delete `notion.json`.

### Destination fields

`{ "store": "notion", "product", "map_url", "database_url", "data_source" }`, with `data_source`
the `collection://…` URL.

### Steps

1. Ask once: *"¿De qué producto es esta discovery? Dime el nombre (por ejemplo «Portal
   Cliente») o pega el enlace de su mapa de producto en Notion."*
2. **Find the map page.**
   - **Link** → fetch it.
   - **Name** → search Notion for `<name> — Mapa de producto` (title search, at most 5
     results).
     - One match → confirm it with the PM.
     - Several matches → list their titles and let the PM pick.
     - No match → run *Create a minimal product map* below. It ends with a map page (carry on
       at step 3) or with no access (step 4).
3. **Find the database.** Among the map page's child databases, take the one titled
   **`Descubrimiento de producto`** and fetch it to read its data source and schema.
   - **Found** → it must have these properties: `"Título"` title, `"Tipo"` select, `"Estado"`
     select, `"Actualizado"` date, `"Resumen"` text, `"Palabras clave"` multi_select,
     `"Funcionalidad"` text.
     - Add any missing property with *update data source*, using the column definitions from
       the DDL below.
     - Never drop or rename a property.
   - **Not found** → *create database* under the map page, titled `Descubrimiento de
     producto`, with this schema:

     ```text
     CREATE TABLE ("Título" TITLE, "Tipo" SELECT('Brief':blue, 'Stress test':orange, 'Retro':purple), "Estado" SELECT('Borrador':yellow, 'Vigente':green, 'Obsoleto':gray), "Actualizado" DATE, "Resumen" RICH_TEXT COMMENT 'Qué resuelve y para quién, ≤200 caracteres', "Palabras clave" MULTI_SELECT('discovery':gray) COMMENT 'Sinónimos, siglas y término en inglés', "Funcionalidad" RICH_TEXT COMMENT 'Slug de la discovery: une Brief, Stress test y Retro')
     ```

4. **No access** (the page can't be opened, or a write is refused) → the no-access line in
   *Failure messages*. Stop **without** writing `store.json`.
5. **Success** → write `<workdir>/discovery/store.json` with the destination fields, and tell
   the PM where the records will go.

Never ask for IDs.

### Create a minimal product map

Run only when the search in step 2 finds no map. A map that isn't found is not a map without
access: it may not exist yet, and then nobody can grant access to it.

A product map belongs to one **product**, never to a **feature** (the idea being discovered).
When the idea is a whole new product, the product and the idea are the same.

**Write nothing to Notion before step 6.** Step 6 runs only after the PM has confirmed steps 2,
3 and 5. One question per message.

1. **Look-alikes.** Search Notion titles for `Mapa de producto` (at most 5 results) and keep the
   maps whose title looks like the product. If there are any, list their titles and ask whether
   the product is one of them.
   - The PM picks one → use that map and carry on at *Steps*, step 3.
   - None, or the PM says no → step 2.
2. **New, or not visible?** Ask one plain question, for example: *"No encuentro un mapa de
   «<producto>» en Notion. ¿Es un producto que todavía no tiene mapa, o el mapa existe y tú no
   lo ves?"*
   - The map exists and the PM can't see it → no access (*Steps*, step 4). Stop, with nothing
     written.
   - The product has no map → step 3.
3. **Official name.** Propose the product's official name — the product's, not the idea's — and
   have the PM confirm or correct it. Use the confirmed name for the map's title and for
   `product` in `store.json`.
4. **Parent page.** The map goes under a page that already exists and that the PM can see.
   - Search for the product's team page, titled `<Product> TECH` → use it.
   - No team page → list the client pages the PM can see (titled `<Client> TECH`, in the
     accounts area) and let the PM pick one.
   - The PM can see no client page → no access (*Steps*, step 4). Stop, with nothing written.

   Never create a client page or a product team page. Never create the map as a private page or
   a draft: always create it with the chosen page as its parent.
5. **Description.** Draft one or two sentences about the **product**, not about the idea, using
   only what the PM said. Show them and have the PM confirm or correct them. If it isn't clear
   whether the product is already in use or is brand new, ask in the same message.
6. **Create.** Create the map page under the parent from step 4:
   - title `<Product> — Mapa de producto` (with an em dash), icon 📚;
   - first paragraph: the confirmed description, with its first sentence in bold;
   - second paragraph: the status note, verbatim in Spanish. For a brand-new product:

     ```text
     Producto en definición: de momento este mapa solo contiene la base **Descubrimiento de producto**, con los entregables del plugin `orbitant-product` (un registro por Brief, Stress test y Retro, unidos por `Funcionalidad`). **Lo que se puede construir es `Tipo = Brief` con `Estado = Vigente`.**
     ```

     For a product that already exists and had no map, the same note starting with
     `Mapa por completar: de momento solo contiene la base` instead of
     `Producto en definición: de momento este mapa solo contiene la base`.

   Then carry on at *Steps*, step 3, with the new page: it creates the `Descubrimiento de
   producto` database under it. If Notion refuses either write → no access (step 4).

The minimal map holds the description, the status note and that database, and nothing else.
Never create any other database (glossary, modules and screens, integrations, business rules,
automations, documentation, discovery findings), empty or filled, and never write a fact about
the product beyond the confirmed description: a map without provenance is worse than no map.
Completing the map is a separate, manual job that starts from this one.

## Accept

Every record. A body Notion refuses for size is still written, in chunks (see *Find and
upsert*).

## Find and upsert

### Record to properties

| Record field | Property | Value |
|---|---|---|
| `title` | `"Título"` | as is, e.g. `Brief — Exportar facturas a Excel` |
| `type` | `"Tipo"` | `brief` → `Brief`, `stress_test` → `Stress test`, `retro` → `Retro` |
| `status` | `"Estado"` | `draft` → `Borrador`, `current` → `Vigente`, `obsolete` → `Obsoleto` |
| `updated` | `"Actualizado"` | as is |
| `summary` | `"Resumen"` | as is |
| `keywords` | `"Palabras clave"` | first read the property's existing options and reuse any that mean the same; never add a near-duplicate |
| `feature` | `"Funcionalidad"` | as is |

### Record to body

1. **Answer first.** Three lines with the conclusion:
   - **Brief** — the problem statement and the `Estado`.
   - **Stress test** — the `VERDICT` line and the blocking gaps in one sentence.
   - **Retro** — the headline finding and the counts per tag.
2. For a stress test or a retro with a known `brief`, the next line is
   `Brief: <mention-page url="<brief>">`. Use `<mention-page>`, **never** `<page>`: a `<page>`
   block moves the page it points to.
3. Then the record's `body`, kept to flat blocks: `##` headings, bullets and code blocks.
   - **No tables:** rewrite each table row as `- <first cell>: <cell 2> · <cell 3>…`.
   - **No** callouts, columns, tabs, toggles or colours.

### Steps

1. **Find.** Use the known reference if there is one. Otherwise query the data source in rows
   mode with filters `"Funcionalidad"` is `<feature>` and `"Tipo"` is `<Tipo>`; for a retro,
   also `"Título"` is the record's `title`.
2. **Upsert.**
   - **Found** → update its properties, then replace its content with the body.
   - **Not found** → create one page **with the data source as parent**, never the map page,
     with the properties and the body.
   - If the content is refused for size, create or update with the properties first, then add
     the body in consecutive chunks.
3. **Check.** Fetch the record once. If the response says `truncated`, tell the PM in one line
   that the record is too long for agents to read whole. It still counts as kept.
4. **Return** the page URL as the reference, and the line *"Guardado en Notion: <Título>."*

To update only a brief's `status` (the stress test side effect), find the brief's page and update
its `"Estado"`.

## Failure messages

| Failure | Line for the PM |
|---|---|
| No access to the map or the database | *"No tienes acceso al mapa de «<producto>» en Notion. Pide acceso al equipo técnico y vuelve a lanzar la discovery."* |
| Anything else | *"No he podido guardarlo en Notion ahora; lo reintentaré más tarde."* |
