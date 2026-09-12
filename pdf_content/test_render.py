import subprocess
import os
import pymupdf

html_content = """<!DOCTYPE html>
<html>
<head>
<style>
@page {
    size: 1920px 1080px;
    margin: 0;
}
* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #000; }
.slide {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    break-after: page;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}
.s1 { background: linear-gradient(135deg, #0a0f1d 0%, #1e1b4b 100%); color: #f59e0b; }
.s2 { background: linear-gradient(135deg, #18181b 0%, #27272a 100%); color: #10b981; }
h1 { font-size: 80px; margin: 0; }
</style>
</head>
<body>
<div class="slide s1"><h1>SLIDE 1</h1></div>
<div class="slide s2"><h1>SLIDE 2</h1></div>
</body>
</html>"""

with open('test_multi.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
html_path = os.path.abspath('test_multi.html')
pdf_path = os.path.abspath('test_multi.pdf')

cmd = [
    chrome_path,
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    f'--print-to-pdf={pdf_path}',
    f'file:///{html_path}'
]
subprocess.run(cmd, capture_output=True, text=True)
doc = pymupdf.open(pdf_path)
print('Pages in multi-page PDF:', len(doc))
for i, p in enumerate(doc):
    print(f'Page {i+1} rect:', p.rect)
