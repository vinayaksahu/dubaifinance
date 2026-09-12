import pymupdf
import os

doc = pymupdf.open('INDIA FINANCE USDT 5_ 10_ & 15_ Daily_260813_204143.pdf')
os.makedirs('pdf_assets', exist_ok=True)
count = 0
for i, page in enumerate(doc):
    for img_index, img in enumerate(page.get_images()):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image['image']
        image_ext = base_image['ext']
        w = base_image['width']
        h = base_image['height']
        image_filename = f'pdf_assets/p{i+1}_img{img_index}_{xref}.{image_ext}'
        with open(image_filename, 'wb') as f:
            f.write(image_bytes)
        count += 1
        print(f'Page {i+1}: {image_filename} ({w}x{h})')
print('Total extracted images:', count)
