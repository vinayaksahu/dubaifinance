import shutil
import os

os.makedirs('assets', exist_ok=True)

brain_dir = r'C:\Users\user\.gemini\antigravity\brain\82f961c4-3ba1-47f9-86a4-ba23646b742b'

# find the latest generated images
files = os.listdir(brain_dir)
for f in files:
    if f.startswith('dubai_finance_hero') and f.endswith('.jpg'):
        shutil.copy(os.path.join(brain_dir, f), 'assets/hero_skyline.jpg')
        print('Copied hero_skyline.jpg')
    elif f.startswith('dubai_office_building') and f.endswith('.jpg'):
        shutil.copy(os.path.join(brain_dir, f), 'assets/office_building.jpg')
        print('Copied office_building.jpg')
    elif f.startswith('dubai_crypto_trading') and f.endswith('.jpg'):
        shutil.copy(os.path.join(brain_dir, f), 'assets/crypto_trading.jpg')
        print('Copied crypto_trading.jpg')

print('Assets ready.')
