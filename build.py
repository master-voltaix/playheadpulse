"""Builds one self-contained index.html from src/ and design-kit/ (all CSS, JS, icons and logo inlined)."""
import base64, pathlib, re
root = pathlib.Path(__file__).parent
kit = root / "design-kit"
b64 = lambda p: "data:image/webp;base64," + base64.b64encode((kit / p).read_bytes()).decode()

sprite = (kit / "icons/sprite-inline.html").read_text(encoding="utf-8")
theme = (kit / "css/theme.css").read_text(encoding="utf-8")
base_js = (kit / "js/base.js").read_text(encoding="utf-8")
page_css = (root / "src/page.css").read_text(encoding="utf-8")
page_js = (root / "src/page.js").read_text(encoding="utf-8")
body = (root / "src/body.html").read_text(encoding="utf-8").replace("{{LOGO}}", b64("img/logo.webp"))

html = f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>50 Free Premium SFX | Playhead Pulse</title>
<meta name="description" content="Get 50 free premium SFX sound effects from Playhead Pulse. Enter your email and we send you the download link.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&family=Geist+Mono:wght@400;500&display=swap">
<style>
:root {{ color-scheme: light; }}
{theme}
{page_css}
</style>
{sprite}
{body}
<script>{base_js}</script>
<script>{page_js}</script>
"""
(root / "index.html").write_text(html, encoding="utf-8")
print("index.html", len(html) // 1024, "KB")
