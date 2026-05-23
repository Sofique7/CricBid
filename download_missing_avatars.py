import os
import json
import re
import io
import time
import urllib.request
import urllib.error
from PIL import Image, ImageDraw, ImageFilter
from rembg import remove

MISSING_FILE = r"E:\ipl auction\missing_players.json"
OUTPUT_DIR = r"E:\ipl auction\public\assets\player-avatars"
MAP_FILE = r"E:\ipl auction\premium_player_map.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load existing map
existing_map = {}
if os.path.exists(MAP_FILE):
    with open(MAP_FILE) as f:
        existing_map = json.load(f)

# Load missing players
with open(MISSING_FILE) as f:
    missing = json.load(f)

def safe_filename(name):
    parts = re.split(r'[\s\-]+', name.strip())
    return '_'.join([p.capitalize() for p in parts if p]) + '.png'

def search_and_download(player_name):
    """Search for a player image using DuckDuckGo and download it."""
    from duckduckgo_search import DDGS
    
    query = f"{player_name} IPL cricket player face portrait"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=5))
        
        for r in results:
            url = r.get('image', '')
            if not url:
                continue
            try:
                req = urllib.request.Request(url, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = resp.read()
                    # Verify it's a valid image
                    img = Image.open(io.BytesIO(data))
                    if img.size[0] >= 50 and img.size[1] >= 50:
                        return data
            except Exception:
                continue
    except Exception as e:
        print(f"  Search failed for {player_name}: {e}", flush=True)
    
    return None

def process_premium_avatar(image_data, output_path, size=400):
    """Remove background, crop to circle, add gold border and glow."""
    try:
        no_bg_bytes = remove(image_data)
        img = Image.open(io.BytesIO(no_bg_bytes)).convert("RGBA")

        bbox = img.getbbox()
        if not bbox:
            return False
            
        left, upper, right, lower = bbox
        width = right - left
        height = lower - upper

        # Square crop focusing on face/upper body
        side = max(width, height)
        center_x = left + width / 2
        center_y = upper + height * 0.35  # bias toward top for face
        
        crop_left = max(0, center_x - side / 2)
        crop_upper = max(0, center_y - side / 2)
        crop_right = min(img.width, crop_left + side)
        crop_lower = min(img.height, crop_upper + side)
        
        # Ensure square
        actual_w = crop_right - crop_left
        actual_h = crop_lower - crop_upper
        side = min(actual_w, actual_h)
        crop_right = crop_left + side
        crop_lower = crop_upper + side

        cropped = img.crop((int(crop_left), int(crop_upper), int(crop_right), int(crop_lower)))
        
        avatar_size = size - 40
        cropped = cropped.resize((avatar_size, avatar_size), Image.Resampling.LANCZOS)

        # Circular mask
        mask = Image.new("L", (avatar_size, avatar_size), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse((0, 0, avatar_size, avatar_size), fill=255)

        avatar_circle = Image.new("RGBA", (avatar_size, avatar_size), (0, 0, 0, 0))
        avatar_circle.paste(cropped, (0, 0), mask=mask)

        # Gold border
        gold_color = (212, 175, 55, 255)
        draw_avatar = ImageDraw.Draw(avatar_circle)
        draw_avatar.ellipse((1, 1, avatar_size-2, avatar_size-2), outline=gold_color, width=3)

        # Final canvas with glow
        final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        
        effect_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw_effect = ImageDraw.Draw(effect_layer)
        offset = 20
        shadow_rect = (offset, offset, offset + avatar_size, offset + avatar_size)
        draw_effect.ellipse(shadow_rect, fill=(0, 0, 0, 160))
        draw_effect.ellipse(shadow_rect, outline=(56, 189, 248, 100), width=8)
        effect_layer = effect_layer.filter(ImageFilter.GaussianBlur(10))

        final_img.paste(effect_layer, (0, 0), mask=effect_layer)
        final_img.paste(avatar_circle, (20, 20), mask=avatar_circle)

        final_img.save(output_path, "PNG")
        return True
    except Exception as e:
        print(f"  Processing error: {e}", flush=True)
        return False

def main():
    success = 0
    failed = []
    
    for i, name in enumerate(missing):
        fname = safe_filename(name)
        out_path = os.path.join(OUTPUT_DIR, fname)
        
        # Skip if already exists
        if os.path.exists(out_path):
            print(f"[{i+1}/{len(missing)}] {name} -> ALREADY EXISTS, skipping", flush=True)
            existing_map[name.lower()] = f"/assets/player-avatars/{fname}"
            success += 1
            continue
        
        print(f"[{i+1}/{len(missing)}] Downloading {name}...", flush=True)
        image_data = search_and_download(name)
        
        if not image_data:
            print(f"  FAILED to download {name}", flush=True)
            failed.append(name)
            continue
        
        print(f"  Processing avatar...", flush=True)
        ok = process_premium_avatar(image_data, out_path)
        
        if ok:
            existing_map[name.lower()] = f"/assets/player-avatars/{fname}"
            success += 1
            print(f"  SUCCESS: {fname}", flush=True)
        else:
            failed.append(name)
            print(f"  FAILED to process {name}", flush=True)
        
        # Small delay to avoid rate limiting
        time.sleep(0.5)
    
    # Save updated map
    with open(MAP_FILE, 'w') as f:
        json.dump(existing_map, f, indent=2)
    
    print(f"\n{'='*50}", flush=True)
    print(f"DONE! Success: {success}/{len(missing)}", flush=True)
    if failed:
        print(f"Failed ({len(failed)}): {', '.join(failed)}", flush=True)
    print(f"Map saved to {MAP_FILE}", flush=True)

if __name__ == "__main__":
    main()
