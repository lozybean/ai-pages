# Download Status

Checked on: 2026-06-01

Full text status: not obtained.

Reason:

- The SAE landing page is publicly indexed and exposes abstract-level metadata.
- Crossref metadata includes a `Full Text PDF` URL for the version of record: `https://saemobilus.sae.org/downloads/papers/2026-99-0750/Full%20Text%20PDF`.
- Direct access to the SAE landing page and PDF URL from the local command line returned CloudFront/WAF challenge responses.
- OpenAlex marks the work as non-open-access: `is_oa: false`, `oa_status: closed`, `pdf_url: null`, `has_fulltext: false`, and `any_repository_has_fulltext: false`.

Files saved in this directory:

- `crossref-10.4271-2026-99-0750.json`: DOI metadata, abstract, references, and SAE PDF link from Crossref.
- `openalex-W7161132709.json`: OpenAlex metadata and open-access status.
- `public-record.md`: human-readable public metadata and abstract-level summary.
- `download-status.md`: this access and download record.

Next action if full-text access becomes available:

1. Download the PDF into this `download/` directory.
2. Add any supplementary data or code into this `download/` directory.
3. Update `../index.html` to replace abstract-level analysis with full-text-supported notes.

