#!/usr/bin/env python3
"""Generate ssl-element-reference.json from ssl-docs reference content.

Reads ../ssl-docs/content/reference/{keywords,operators,literals,types,classes,
special-forms,functions} and emits a single structured JSON document at
ssl-style-guide/ssl-element-reference.json suitable for programmatic lookup
by agent skills, LSPs, and other tooling.

Run from repo root:
    python3 tools/generate_element_reference.py [--ssl-docs ../ssl-docs]

JSON schema (top level):
    {
      "version": "1",
      "source": "<rel path>",
      "totals": {"keywords": 38, ...},
      "keywords":      { "<name>": {title, summary, syntax}, ... },
      "operators":     { "<name>": {title, summary, syntax, type_behavior[]}, ... },
      "literals":      { "<name>": {title, summary, syntax}, ... },
      "types":         { "<name>": {title, summary, runtime_type, operators[], members[]}, ... },
      "classes":       { "<name>": {title, summary, constructors[], properties[], methods[]}, ... },
      "special_forms": { "<name>": {title, summary, syntax}, ... },
      "functions":     { "<name>": {title, summary, signature, returns}, ... }
    }
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path

CATEGORIES = [
    ("keywords", "keywords"),
    ("operators", "operators"),
    ("literals", "literals"),
    ("types", "types"),
    ("classes", "classes"),
    ("special_forms", "special-forms"),
    ("functions", "functions"),
]


@dataclass
class Element:
    name: str
    title: str
    summary: str
    body: str


# ---------- frontmatter / section parsing ----------

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}, text
    fm: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip().strip('"').strip("'")
    return fm, text[m.end():]


def split_sections(body: str) -> dict[str, str]:
    """Split body by '## Heading' into {heading: section_text}."""
    parts = re.split(r"^## (.+)$", body, flags=re.MULTILINE)
    sections: dict[str, str] = {"_intro": parts[0].strip()}
    for i in range(1, len(parts), 2):
        sections[parts[i].strip()] = parts[i + 1].strip()
    return sections


def split_h3(text: str) -> list[tuple[str, str]]:
    parts = re.split(r"^### (.+)$", text, flags=re.MULTILINE)
    if len(parts) == 1:
        return [("", parts[0])]
    out: list[tuple[str, str]] = []
    if parts[0].strip():
        out.append(("", parts[0]))
    for i in range(1, len(parts), 2):
        out.append((parts[i].strip(), parts[i + 1]))
    return out


def first_ssl_block(text: str) -> str | None:
    m = re.search(r"```ssl\n(.*?)\n```", text, re.DOTALL)
    return m.group(1).strip() if m else None


def first_code_block(text: str) -> str | None:
    m = re.search(r"```(?:\w+)?\n(.*?)\n```", text, re.DOTALL)
    return m.group(1).strip() if m else None


def strip_md_links(text: str) -> str:
    return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)


def first_paragraph(text: str) -> str:
    text = text.strip()
    if not text:
        return ""
    para = text.split("\n\n", 1)[0]
    return strip_md_links(" ".join(para.split())).strip()


def parse_md_table(text: str) -> list[dict[str, str]]:
    """Parse the first markdown table found in `text` into a list of dicts.

    Stops at the first H3 boundary so detail subsections don't bleed in.
    """
    lines: list[str] = []
    for line in text.splitlines():
        if line.startswith("### "):
            break
        lines.append(line)

    table_lines = [ln for ln in lines if ln.strip().startswith("|")]
    if len(table_lines) < 2:
        return []

    def split_cells(row: str) -> list[str]:
        cells = [c.strip() for c in row.strip().strip("|").split("|")]
        cleaned: list[str] = []
        for c in cells:
            c = strip_md_links(c)
            # Strip surrounding/inline backticks for clean programmatic values.
            c = c.replace("`", "")
            cleaned.append(c.strip())
        return cleaned

    headers = [h.lower().replace(" ", "_") for h in split_cells(table_lines[0])]
    rows: list[dict[str, str]] = []
    for raw in table_lines[2:]:  # skip separator row
        cells = split_cells(raw)
        if len(cells) != len(headers):
            continue
        if all(set(c) <= {"-", " "} for c in cells):
            continue
        rows.append(dict(zip(headers, cells)))
    return rows


# ---------- per-category extractors ----------

def extract_keyword(el: Element) -> dict:
    sections = split_sections(el.body)
    syntax = first_ssl_block(sections.get("Syntax", ""))
    out = {"title": el.title, "summary": strip_md_links(el.summary)}
    if syntax:
        out["syntax"] = syntax
    return out


def extract_operator(el: Element) -> dict:
    sections = split_sections(el.body)
    syntax = first_ssl_block(sections.get("Syntax", "")) or first_code_block(sections.get("Syntax", ""))
    out = {"title": el.title, "summary": strip_md_links(el.summary)}
    if syntax:
        out["syntax"] = syntax
    tb = parse_md_table(sections.get("Type behavior", ""))
    if tb:
        out["type_behavior"] = tb
    return out


def extract_literal(el: Element) -> dict:
    sections = split_sections(el.body)
    out = {"title": el.title, "summary": strip_md_links(el.summary)}
    syntax_text = sections.get("Syntax", "").strip()
    if syntax_text:
        intro = first_paragraph(syntax_text)
        if intro:
            out["syntax"] = intro
    return out


def extract_special_form(el: Element) -> dict:
    sections = split_sections(el.body)
    syntax = first_ssl_block(sections.get("Syntax", ""))
    out = {"title": el.title, "summary": strip_md_links(el.summary)}
    if syntax:
        out["syntax"] = syntax
    return out


def extract_type(el: Element) -> dict:
    sections = split_sections(el.body)
    out = {"title": el.title, "summary": strip_md_links(el.summary)}

    # Runtime type can appear as prose ("**Runtime type:** ARRAY") or as a
    # table cell ("| Runtime type | `ARRAY` |").
    rt = re.search(r"Runtime type[:\s|*`]+([A-Z]+)", el.body)
    if rt:
        out["runtime_type"] = rt.group(1)

    if "Operators" in sections:
        ops = parse_md_table(sections["Operators"])
        if ops:
            out["operators"] = ops

    members_text = sections.get("Members", "")
    if members_text:
        # If the Members section has H3 subsections (e.g. "Properties", "Methods"),
        # parse each subsection table separately and tag rows with their group.
        subs = split_h3(members_text)
        if len(subs) > 1 or (subs and subs[0][0]):
            members: list[dict] = []
            for heading, body in subs:
                rows = parse_md_table(body)
                for row in rows:
                    if heading:
                        row["group"] = heading.lower()
                    members.append(row)
            if members:
                out["members"] = members
        else:
            rows = parse_md_table(members_text)
            if rows:
                out["members"] = rows

    return out


def extract_class(el: Element) -> dict:
    sections = split_sections(el.body)
    out = {"title": el.title, "summary": strip_md_links(el.summary)}

    constructors_text = sections.get("Constructors", "")
    if constructors_text:
        ctors: list[dict] = []
        for sig, body in split_h3(constructors_text):
            if not sig:
                continue
            desc = first_paragraph(body)
            entry = {"signature": sig.replace("`", "").strip()}
            if desc:
                entry["description"] = desc
            params = parse_md_table(body)
            if params:
                entry["parameters"] = params
            ctors.append(entry)
        if ctors:
            out["constructors"] = ctors

    if "Properties" in sections:
        props = parse_md_table(sections["Properties"])
        if props:
            out["properties"] = props

    methods_section = sections.get("Methods Summary") or sections.get("Methods", "")
    methods = parse_md_table(methods_section)
    if methods:
        out["methods"] = methods

    if "Inheritance" in sections:
        m = re.search(r"Base class:\*?\*?\s*`?([\w\.]+)`?", sections["Inheritance"])
        if m:
            out["base_class"] = m.group(1)

    return out


def extract_function(el: Element) -> dict:
    sections = split_sections(el.body)
    out = {"title": el.title, "summary": strip_md_links(el.summary)}

    syntax = first_ssl_block(sections.get("Syntax", ""))
    if syntax:
        out["signature"] = syntax.split("\n", 1)[0].strip()

    returns_section = sections.get("Returns", "")
    if returns_section:
        m = re.match(r"\*\*([^*]+)\*\*\s*(?:—\s*(.*))?", returns_section, re.DOTALL)
        if m:
            ret_type = strip_md_links(m.group(1)).strip()
            out["returns"] = {"type": ret_type}
            if m.group(2):
                desc = first_paragraph(m.group(2))
                if desc:
                    out["returns"]["description"] = desc

    params_section = sections.get("Parameters", "")
    params = parse_md_table(params_section)
    if params:
        out["parameters"] = params

    return out


EXTRACTORS = {
    "keywords": extract_keyword,
    "operators": extract_operator,
    "literals": extract_literal,
    "types": extract_type,
    "classes": extract_class,
    "special_forms": extract_special_form,
    "functions": extract_function,
}


# ---------- main ----------

def load_category(reference_dir: Path, slug: str) -> list[Element]:
    elements: list[Element] = []
    for path in sorted((reference_dir / slug).glob("*.md")):
        if path.name == "index.md":
            continue
        text = path.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(text)
        elements.append(
            Element(
                name=path.stem,
                title=fm.get("title", path.stem),
                summary=fm.get("summary", ""),
                body=body,
            )
        )
    return elements


def build_data(reference_dir: Path) -> dict:
    data: dict = {
        "version": "1",
        "source": str(reference_dir.relative_to(reference_dir.parent.parent.parent.parent))
        if reference_dir.is_absolute()
        else str(reference_dir),
        "totals": {},
    }
    for json_key, slug in CATEGORIES:
        elements = load_category(reference_dir, slug)
        extractor = EXTRACTORS[json_key]
        data[json_key] = {el.name: extractor(el) for el in elements}
        data["totals"][json_key] = len(elements)
    data["totals"]["all"] = sum(data["totals"].values())
    return data


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--ssl-docs",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "ssl-docs",
        help="Path to the ssl-docs repo root (default: sibling ../ssl-docs)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "ssl-style-guide" / "ssl-element-reference.json",
        help="Output JSON file (default: ssl-style-guide/ssl-element-reference.json)",
    )
    args = parser.parse_args()

    reference_dir = args.ssl_docs / "content" / "reference"
    if not reference_dir.is_dir():
        parser.error(f"reference directory not found: {reference_dir}")

    data = build_data(reference_dir)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    args.out.write_text(text, encoding="utf-8")
    print(f"Wrote {args.out} ({len(text):,} bytes, totals: {data['totals']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
