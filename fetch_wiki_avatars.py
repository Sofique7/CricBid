import os
import json
import urllib.request
import time
import io
from urllib.parse import quote_plus
from PIL import Image, ImageDraw, ImageFilter
from rembg import remove

OUTPUT_DIR = r"E:\ipl auction\public\assets\player-avatars"
MAP_FILE = r"E:\ipl auction\premium_player_map.json"
MISSING_FILE = r"E:\ipl auction\missing_players.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load missing player names
with open(MISSING_FILE, 'r') as f:
    missing = json.load(f)

# Load existing map if any
if os.path.exists(MAP_FILE):
    with open(MAP_FILE) as f:
        img_map = json.load(f)
else:
    img_map = {}

def fetch_wikipedia_image(name):
    """Return raw image bytes from Wikipedia for a given player name, or None."""
    query = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={quote_plus(name)}"
    try:
        req = urllib.request.Request(query, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.load(resp)
        pages = data.get('query', {}).get('pages', {})
        for page in pages.values():
            if 'original' in page:
                url = page['original']['source']
                # download image
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=20) as r:
                    return r.read()
    except Exception as e:
        print(f"  Wiki fetch failed for {name}: {e}")
    return None

def process_avatar(image_data, out_path, size=400):
    try:
        no_bg_bytes = remove(image_data)
        img = Image.open(io.BytesIO(no_bg_bytes)).convert('RGBA')
        # Centered square crop (biased to top for face)
        w, h = img.size
        side = min(w, h)
        top = int(max(0, (h - side) * 0.2))
        left = int((w - side) / 2)
        crop = img.crop((left, top, left + side, top + side))
        avatar_sz = size - 40
        crop = crop.resize((avatar_sz, avatar_sz), Image.Resampling.LANCZOS)
        # circular mask
        mask = Image.new('L', (avatar_sz, avatar_sz), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, avatar_sz, avatar_sz), fill=255)
        circ = Image.new('RGBA', (avatar_sz, avatar_sz), (0,0,0,0))
        circ.paste(crop, (0,0), mask=mask)
        # gold border
        draw = ImageDraw.Draw(circ)
        gold = (212,175,55,255)
        draw.ellipse((1,1,avatar_sz-2,avatar_sz-2), outline=gold, width=3)
        # final canvas with shadow & glow
        final = Image.new('RGBA', (size, size), (0,0,0,0))
        # shadow
        shadow = Image.new('RGBA', (size, size), (0,0,0,0))
        d = ImageDraw.Draw(shadow)
        offset = 20
        d.ellipse((offset, offset, offset+avatar_sz, offset+avatar_sz), fill=(0,0,0,160))
        d.ellipse((offset, offset, offset+avatar_sz, offset+avatar_sz), outline=(56,189,248,100), width=8)
        shadow = shadow.filter(ImageFilter.GaussianBlur(10))
        final.paste(shadow, (0,0), shadow)
        final.paste(circ, (20,20), circ)
        final.save(out_path, 'PNG')
        return True
    except Exception as e:
        print(f"  Avatar processing error for {out_path}: {e}")
        return False

success = 0
failed = []
for idx, name in enumerate(missing, 1):
    fname = name.replace(' ', '_') + '.png'
    out_path = os.path.join(OUTPUT_DIR, fname)
    if os.path.exists(out_path):
        print(f"[{idx}/{len(missing)}] {name} already exists, skipping")
        img_map[name.lower()] = f"/assets/player-avatars/{fname}"
        success += 1
        continue
    print(f"[{idx}/{len(missing)}] Fetching {name} from Wikipedia...")
    data = fetch_wikipedia_image(name)
    if not data:
        print(f"  No image found for {name}")
        failed.append(name)
        continue
    if process_avatar(data, out_path):
        img_map[name.lower()] = f"/assets/player-avatars/{fname}"
        success += 1
        print(f"  Saved {fname}")
    else:
        failed.append(name)
    time.sleep(1)  # polite rate limit

with open(MAP_FILE, 'w') as f:
    json.dump(img_map, f, indent=2)

print('\n=== Summary ===')
print(f'Success: {success}/{len(missing)}')
print('Failed:', ', '.join(failed))
