#!/usr/bin/env python3
"""Tiny i18n helper so the plugin needs no gettext or WP-CLI install.

    python bin/i18n.py pot   # languages/semera-tabs.pot from PHP, JS and block.json
    python bin/i18n.py mo    # languages/*.po -> languages/*.mo and the JS translation JSON

Only plain strings (no plural forms) are supported, which is all this plugin
uses. Strings in block.json get the contexts WordPress looks them up with.

The editor script's strings are written to
languages/semera-tabs-<locale>-semera-tabs-tabs-editor-script.json, the file
name wp_set_script_translations() looks for (handle of the block's editorScript).
"""
import ast
import json
import re
import struct
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANG = ROOT / "languages"
DOMAIN = "semera-tabs"
SCRIPT_HANDLE = "semera-tabs-tabs-editor-script"

CALL = re.compile(
    r"(?:esc_html__|esc_attr__|esc_html_e|esc_attr_e|__|_e)\(\s*('(?:[^'\\]|\\.)*')\s*,\s*'" + DOMAIN + r"'\s*\)"
)


def php_string(literal: str) -> str:
    inner = literal[1:-1]
    return inner.replace("\\'", "'").replace("\\\\", "\\")


def po_quote(text: str) -> str:
    return '"' + text.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + '"'


def key(context: str, msgid: str) -> str:
    return f"{context}\x04{msgid}" if context else msgid


def extract() -> dict:
    """(context, msgid) -> {"refs": [...], "js": bool}"""
    found = {}

    def add(context, msgid, ref, js):
        entry = found.setdefault((context, msgid), {"refs": [], "js": False})
        entry["refs"].append(ref)
        entry["js"] = entry["js"] or js

    sources = [(p, False) for p in sorted((ROOT / "includes").glob("*.php"))]
    sources += [(p, True) for p in sorted((ROOT / "src").rglob("*.js"))]
    for path, js in sources:
        source = path.read_text(encoding="utf-8")
        for match in CALL.finditer(source):
            line = source.count("\n", 0, match.start()) + 1
            add("", php_string(match.group(1)), f"{path.relative_to(ROOT).as_posix()}:{line}", js)

    header = (ROOT / f"{DOMAIN}.php").read_text(encoding="utf-8")
    for field in ("Plugin Name", "Description"):
        match = re.search(rf"^\s*\*\s*{field}:\s*(.+?)\s*$", header, re.M)
        if match:
            add("", match.group(1), f"{DOMAIN}.php", False)

    for path in sorted((ROOT / "src").rglob("block.json")):
        ref = path.relative_to(ROOT).as_posix()
        data = json.loads(path.read_text(encoding="utf-8"))
        add("block title", data["title"], ref, False)
        add("block description", data["description"], ref, False)
        for keyword in data.get("keywords", []):
            add("block keyword", keyword, ref, False)
        for style in data.get("styles", []):
            add("block style label", style["label"], ref, False)
    return found


def write_pot() -> None:
    LANG.mkdir(exist_ok=True)
    lines = [
        "# Semera Tabs translation template.",
        'msgid ""',
        'msgstr ""',
        '"Project-Id-Version: Semera Tabs\\n"',
        '"MIME-Version: 1.0\\n"',
        '"Content-Type: text/plain; charset=UTF-8\\n"',
        '"Content-Transfer-Encoding: 8bit\\n"',
        '"X-Domain: ' + DOMAIN + '\\n"',
        "",
    ]
    for (context, msgid), entry in extract().items():
        lines.append("#: " + " ".join(entry["refs"]))
        if context:
            lines.append("msgctxt " + po_quote(context))
        lines.append("msgid " + po_quote(msgid))
        lines.append('msgstr ""')
        lines.append("")
    (LANG / f"{DOMAIN}.pot").write_text("\n".join(lines), encoding="utf-8")
    print("wrote", LANG / f"{DOMAIN}.pot")


def parse_po(path: Path) -> dict:
    """Returns {key(context, msgid): msgstr}."""
    messages, context, msgid, msgstr, target = {}, "", None, None, None

    def flush():
        if msgid is not None and msgstr is not None:
            messages[key(context, msgid)] = msgstr

    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("msgctxt "):
            flush()
            context, msgid, msgstr, target = ast.literal_eval(line[8:]), None, None, "ctx"
        elif line.startswith("msgid "):
            if target != "ctx":
                flush()
                context = ""
            msgid, msgstr, target = ast.literal_eval(line[6:]), None, "id"
        elif line.startswith("msgstr "):
            msgstr, target = ast.literal_eval(line[7:]), "str"
        elif line.startswith('"') and target:
            value = ast.literal_eval(line)
            if target == "ctx":
                context += value
            elif target == "id":
                msgid += value
            else:
                msgstr += value
    flush()
    return messages


def write_mo(messages: dict, path: Path) -> None:
    entries = sorted((k, v) for k, v in messages.items() if v or k == "")
    ids = b""
    strs = b""
    offsets = []
    for k, v in entries:
        kb, vb = k.encode("utf-8"), v.encode("utf-8")
        offsets.append((len(ids), len(kb), len(strs), len(vb)))
        ids += kb + b"\0"
        strs += vb + b"\0"

    count = len(entries)
    keystart = 7 * 4 + 16 * count
    valuestart = keystart + len(ids)
    # Empty hash table placed right after the two index tables (WordPress insists on that offset).
    out = struct.pack("Iiiiiii", 0x950412DE, 0, count, 7 * 4, 7 * 4 + count * 8, 0, keystart)
    out += b"".join(struct.pack("ii", length, keystart + off) for off, length, _, _ in offsets)
    out += b"".join(struct.pack("ii", length, valuestart + off) for _, _, off, length in offsets)
    path.write_bytes(out + ids + strs)


def write_script_json(messages: dict, locale: str) -> None:
    """JED file with the translations of the strings used in JavaScript."""
    used = {key(context, msgid) for (context, msgid), entry in extract().items() if entry["js"]}
    data = {"": {"domain": "messages", "lang": locale, "plural-forms": "nplurals=2; plural=n != 1;"}}
    for k in sorted(used):
        if messages.get(k):
            data[k] = [messages[k]]
    document = {
        "translation-revision-date": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M+0000"),
        "generator": "semera-tabs i18n.py",
        "domain": "messages",
        "locale_data": {"messages": data},
    }
    target = LANG / f"{DOMAIN}-{locale}-{SCRIPT_HANDLE}.json"
    target.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{target.name}: {len(data) - 1} strings")


def compile_mo() -> None:
    for po in sorted(LANG.glob("*.po")):
        messages = parse_po(po)
        write_mo(messages, po.with_suffix(".mo"))
        print(f"{po.name}: {len([v for v in messages.values() if v])} strings")
        write_script_json(messages, po.stem.removeprefix(f"{DOMAIN}-"))


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else ""
    if command == "pot":
        write_pot()
    elif command == "mo":
        compile_mo()
    else:
        sys.exit(__doc__)
