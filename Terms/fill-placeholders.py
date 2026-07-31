#!/usr/bin/env python3
"""
Fills placeholder tokens in the uscasestatus legal pages.

Usage:
    1. Edit placeholder-values.json — replace every null with a real value.
    2. python3 fill-placeholders.py
       (add --in-place to overwrite the originals instead of writing to ./filled/)

Filled values lose the amber highlight. Anything still null stays highlighted
so you can see at a glance what remains outstanding.
"""
import json, re, os, sys, glob, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = ["privacy.html", "terms.html", "cookies.html",
         "accessibility.html", "do-not-sell.html"]

def flatten(d, out=None):
    out = {} if out is None else out
    for k, v in d.items():
        if k.startswith("_") and isinstance(v, dict):
            flatten(v, out)
        elif not k.startswith("_"):
            out[k] = v
    return out

def main():
    in_place = "--in-place" in sys.argv
    with open(os.path.join(HERE, "placeholder-values.json")) as f:
        values = flatten(json.load(f))

    outdir = HERE if in_place else os.path.join(HERE, "filled")
    if not in_place:
        os.makedirs(outdir, exist_ok=True)
        for extra in ("index.html", "case.html"):
            src = os.path.join(HERE, extra)
            if os.path.exists(src):
                shutil.copy(src, outdir)

    filled_total, remaining_total = 0, set()

    for page in PAGES:
        path = os.path.join(HERE, page)
        if not os.path.exists(path):
            print(f"  skip {page} (not found)")
            continue
        s = open(path).read()

        def repl(m):
            nonlocal filled_total
            key = m.group(1)
            val = values.get(key)
            if val is None or val == "":
                remaining_total.add(key)
                return m.group(0)                      # keep token + highlight
            filled_total += 1
            return str(val)                            # highlight span removed

        # replace the whole highlighted span when we have a value
        s = re.sub(r'<span class="placeholder">\{\{([A-Z0-9_]+)\}\}</span>', repl, s)

        open(os.path.join(outdir, page), "w").write(s)
        left = len(re.findall(r'\{\{[A-Z0-9_]+\}\}', s))
        print(f"  {page:<22} {left} token(s) still unfilled")

    print(f"\nFilled {filled_total} occurrence(s).")
    if remaining_total:
        print(f"Still needed ({len(remaining_total)}): {', '.join(sorted(remaining_total))}")
    else:
        print("All tokens filled.")

    # prose blocks that need writing rather than substituting
    prose = []
    for page in PAGES:
        p = os.path.join(outdir, page)
        if not os.path.exists(p):
            continue
        for m in re.finditer(r'<span class="placeholder">((?!\{\{).*?)</span>', open(p).read(), re.S):
            txt = re.sub(r"\s+", " ", m.group(1)).strip()
            if txt != "like this":
                prose.append((page, txt))
    if prose:
        print(f"\n{len(prose)} passage(s) need drafting rather than substitution:")
        for page, txt in prose:
            print(f"  - {page}: {txt[:100]}{'...' if len(txt) > 100 else ''}")

    print(f"\nOutput: {outdir}")

if __name__ == "__main__":
    main()
