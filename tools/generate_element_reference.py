#!/usr/bin/env python3
"""Generate ssl-element-reference.md from ssl-docs reference content.

Reads ../ssl-docs/content/reference/{keywords,operators,literals,types,classes,
special-forms,functions} and emits a single consolidated reference document at
ssl-style-guide/ssl-element-reference.md.

Run from repo root:
    python3 tools/generate_element_reference.py [--ssl-docs ../ssl-docs]
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path

CATEGORIES = [
    ("Keywords", "keywords"),
    ("Operators", "operators"),
    ("Literals", "literals"),
    ("Types", "types"),
    ("Classes", "classes"),
    ("Special Forms", "special-forms"),
    ("Functions", "functions"),
]


@dataclass
class Element:
    name: str
    title: str
    summary: str
    body: str  # full markdown body (after frontmatter)


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


def first_ssl_block(text: str) -> str | None:
    m = re.search(r"```ssl\n(.*?)\n```", text, re.DOTALL)
    return m.group(1).strip() if m else None


def first_code_block(text: str) -> str | None:
    m = re.search(r"```(?:\w+)?\n(.*?)\n```", text, re.DOTALL)
    return m.group(1).strip() if m else None


def strip_md_links(text: str) -> str:
    """Convert [text](url) → text and `[code](url)` → `code`."""
    return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)


def first_paragraph(text: str) -> str:
    text = text.strip()
    if not text:
        return ""
    para = text.split("\n\n", 1)[0]
    return strip_md_links(" ".join(para.split())).strip()


# ---------- per-category formatters ----------

def fmt_keyword(el: Element) -> str:
    sections = split_sections(el.body)
    syntax = first_ssl_block(sections.get("Syntax", ""))
    out = [f"### `:{el.name}`", "", f"> {strip_md_links(el.summary)}"]
    if syntax:
        out.extend(["", "```ssl", syntax, "```"])
    return "\n".join(out)


def fmt_operator(el: Element) -> str:
    sections = split_sections(el.body)
    syntax = first_ssl_block(sections.get("Syntax", "")) or first_code_block(sections.get("Syntax", ""))
    type_table = sections.get("Type behavior", "")
    out = [f"### `{el.title}`", "", f"> {strip_md_links(el.summary)}"]
    if syntax:
        out.extend(["", "```ssl", syntax, "```"])
    if type_table:
        # Keep only the markdown table
        table_lines = [ln for ln in type_table.splitlines() if ln.strip().startswith("|")]
        if table_lines:
            out.append("")
            out.append("**Type behavior:**")
            out.append("")
            out.extend(strip_md_links(ln) for ln in table_lines)
    return "\n".join(out)


def fmt_literal(el: Element) -> str:
    sections = split_sections(el.body)
    syntax = sections.get("Syntax", "").strip()
    out = [f"### `{el.title}`", "", f"> {strip_md_links(el.summary)}"]
    if syntax:
        # literals tend to use descriptive prose under Syntax, not code blocks
        intro_para = first_paragraph(syntax)
        if intro_para:
            out.extend(["", f"**Syntax:** {intro_para}"])
    return "\n".join(out)


def fmt_special_form(el: Element) -> str:
    sections = split_sections(el.body)
    syntax = first_ssl_block(sections.get("Syntax", ""))
    out = [f"### {el.title}", "", f"> {strip_md_links(el.summary)}"]
    if syntax:
        out.extend(["", "```ssl", syntax, "```"])
    return "\n".join(out)


def split_h3_subsections(text: str) -> list[tuple[str, str]]:
    """Split a section body by H3 headings → [(heading, body), ...].

    If there are no H3 headings, returns [("", text)].
    """
    parts = re.split(r"^### (.+)$", text, flags=re.MULTILINE)
    if len(parts) == 1:
        return [("", parts[0])]
    result: list[tuple[str, str]] = []
    if parts[0].strip():
        result.append(("", parts[0]))
    for i in range(1, len(parts), 2):
        result.append((parts[i].strip(), parts[i + 1]))
    return result


def emit_table_block(lines: list[str], heading: str, section_text: str) -> None:
    """Emit '**Heading:**' followed by tables, preserving any H3 subsections."""
    subs = split_h3_subsections(section_text)
    has_any_table = any(
        any(ln.strip().startswith("|") for ln in body.splitlines()) for _, body in subs
    )
    if not has_any_table:
        return
    lines.extend(["", f"**{heading}:**"])
    for sub_heading, body in subs:
        table_lines = [ln for ln in body.splitlines() if ln.strip().startswith("|")]
        if not table_lines:
            continue
        lines.append("")
        if sub_heading:
            lines.append(f"*{sub_heading}*")
            lines.append("")
        lines.extend(strip_md_links(ln) for ln in table_lines)


def fmt_type(el: Element) -> str:
    sections = split_sections(el.body)
    out = [f"### `{el.name}`", "", f"> {strip_md_links(el.summary)}"]

    rt = re.search(r"Runtime type:\*?\*?\s*`?([A-Z]+)`?", el.body)
    if rt:
        out.append("")
        out.append(f"**Runtime type:** `{rt.group(1)}`")

    if "Operators" in sections:
        emit_table_block(out, "Operators", sections["Operators"])
    if "Members" in sections:
        emit_table_block(out, "Members", sections["Members"])

    return "\n".join(out)


def section_top_table(text: str) -> list[str]:
    """Extract the first markdown table from text, stopping at the first H3.

    Many class sections contain a top-level summary table followed by H3
    detail subsections; we only want the summary table.
    """
    lines: list[str] = []
    for line in text.splitlines():
        if line.startswith("### "):
            break
        lines.append(line)
    return [ln for ln in lines if ln.strip().startswith("|")]


def fmt_class(el: Element) -> str:
    sections = split_sections(el.body)
    out = [f"### `{el.name}`", "", f"> {strip_md_links(el.summary)}"]

    # Constructors — H3 subsections inside ## Constructors
    constructors_text = sections.get("Constructors", "")
    if constructors_text:
        ctor_sigs = re.findall(r"^### `([^`]+)`", constructors_text, re.MULTILINE)
        if ctor_sigs:
            out.extend(["", "**Constructors:**", ""])
            for sig in ctor_sigs:
                pat = re.compile(
                    re.escape(f"### `{sig}`") + r"\s*\n\s*(.+?)(?=\n\n|\n###|\n\| |\Z)",
                    re.DOTALL,
                )
                m = pat.search(constructors_text)
                desc = first_paragraph(m.group(1)) if m else ""
                out.append(f"- `{sig}`" + (f" — {desc}" if desc else ""))

    # Properties (if present at top level)
    props_text = sections.get("Properties", "")
    prop_lines = section_top_table(props_text) if props_text else []
    if prop_lines:
        out.extend(["", "**Properties:**", ""])
        out.extend(strip_md_links(ln) for ln in prop_lines)

    # Methods — prefer 'Methods Summary'; fall back to top-of-'Methods' table.
    if "Methods Summary" in sections:
        method_lines = section_top_table(sections["Methods Summary"])
    else:
        method_lines = section_top_table(sections.get("Methods", ""))
    if method_lines:
        out.extend(["", "**Methods:**", ""])
        out.extend(strip_md_links(ln) for ln in method_lines)

    return "\n".join(out)


def fmt_function(el: Element) -> str:
    sections = split_sections(el.body)
    syntax = first_ssl_block(sections.get("Syntax", "")) or ""
    returns_section = sections.get("Returns", "")
    returns_line = ""
    if returns_section:
        # Often: "**any** — appended value." Pull the type token at the start.
        m = re.match(r"\*\*([^*]+)\*\*", returns_section)
        if m:
            returns_line = strip_md_links(m.group(1)).strip()

    sig = syntax.split("\n", 1)[0].strip() if syntax else el.name
    header = f"### `{el.name}`"
    parts = [header, "", f"`{sig}`" + (f" → {returns_line}" if returns_line else ""), "", f"> {strip_md_links(el.summary)}"]
    return "\n".join(parts)


FORMATTERS = {
    "keywords": fmt_keyword,
    "operators": fmt_operator,
    "literals": fmt_literal,
    "types": fmt_type,
    "classes": fmt_class,
    "special-forms": fmt_special_form,
    "functions": fmt_function,
}


# ---------- main ----------

def load_category(reference_dir: Path, slug: str) -> list[Element]:
    cat_dir = reference_dir / slug
    elements: list[Element] = []
    for path in sorted(cat_dir.glob("*.md")):
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


def build_reference(reference_dir: Path) -> str:
    out: list[str] = []
    out.append("# SSL Element Reference")
    out.append("")
    out.append(
        "Generated from the published `ssl-docs` reference. To regenerate, run "
        "`tools/generate_element_reference.py` from the repository root."
    )
    out.append("")
    out.append(
        "This document is the consolidated, agent-loadable summary of the SSL "
        "language surface. Each element entry includes its canonical syntax (or "
        "signature) and a one-line summary; classes and types additionally list "
        "constructors, methods, and members. For full prose, examples, and edge "
        "cases, consult `ssl-docs/content/reference/<category>/<element>.md`."
    )
    out.append("")

    counts: dict[str, int] = {}
    sections: dict[str, list[str]] = {}
    for header, slug in CATEGORIES:
        elements = load_category(reference_dir, slug)
        counts[slug] = len(elements)
        formatter = FORMATTERS[slug]
        body_parts = [formatter(el) for el in elements]
        sections[slug] = body_parts

    total = sum(counts.values())
    out.append(
        f"**Totals:** {counts['keywords']} keywords, {counts['operators']} "
        f"operators, {counts['literals']} literals, {counts['types']} types, "
        f"{counts['classes']} classes, {counts['special-forms']} special forms, "
        f"{counts['functions']} functions ({total} total)."
    )
    out.append("")

    for header, slug in CATEGORIES:
        out.append("---")
        out.append("")
        out.append(f"## {header} ({counts[slug]})")
        out.append("")
        out.append("\n\n".join(sections[slug]))
        out.append("")

    return "\n".join(out).rstrip() + "\n"


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
        default=Path(__file__).resolve().parent.parent / "ssl-style-guide" / "ssl-element-reference.md",
        help="Output markdown file (default: ssl-style-guide/ssl-element-reference.md)",
    )
    args = parser.parse_args()

    reference_dir = args.ssl_docs / "content" / "reference"
    if not reference_dir.is_dir():
        parser.error(f"reference directory not found: {reference_dir}")

    text = build_reference(reference_dir)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(text, encoding="utf-8")
    print(f"Wrote {args.out} ({len(text):,} bytes, {text.count(chr(10))} lines)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
