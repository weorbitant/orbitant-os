# Store: local-markdown

Keeps each record as one Markdown file in a folder of the PM's working folder, so the result can
be committed and reviewed with the rest of the repository. The default store.

**For the PM:** "en una carpeta de este repo".

The store's folder is not the run's working copy. It receives records, like any other store, and
never reads the deliverables in `discovery/<slug>/`.

## Detect

Usable whenever the session can write files in the working folder.

## Login message

None: there is nothing to log in to. If the session cannot write files, say so in one line and
offer the other stores.

## Resolve the destination

### Destination fields

`{ "store": "local-markdown", "folder": "<folder>" }`, with `folder` relative to the working
folder.

### Steps

1. Propose `docs/discovery` in one line and let the PM accept it or name another folder inside
   the working folder.
2. Write `<workdir>/discovery/store.json` with the destination fields, and tell the PM where the
   records will go.

This store recognises no old destination file.

## Accept

Every record.

## Find and upsert

1. **Path.** `<workdir>/<folder>/<feature>/<file>`, with `<file>` `brief.md`, `stress_test.md`, or
   for a retro `retro-<YYYY-MM-DD>.md`, the date taken from the end of its `title`.
2. **Find.** A record is found when that file exists. There is nothing else to search.
3. **Upsert.** Write the whole file, replacing any previous one:
   - a frontmatter block with `type`, `feature`, `title`, `status`, `updated`, `summary`,
     `keywords` (a list) and, when known, `brief`;
   - then the record's `body`, unchanged.
4. **Return** the path relative to the working folder as the reference, and the line
   *"Guardado en `<path>`."*

To update only a brief's `status` (the stress test side effect), rewrite the `status` line of the
brief's file.

## Failure messages

| Failure | Line for the PM |
|---|---|
| No access to the destination | *"No puedo escribir en la carpeta «<folder>». Dime otra carpeta o elige otro sitio."* |
| Anything else | *"No he podido guardarlo ahora; lo reintentaré más tarde."* |
