import os
import glob
import re
from PIL import Image, ImageDraw, ImageFilter
from rembg import remove
import io
import json

def process_premium_avatar(input_path, output_path, size=400):
    try:
        # Read raw image
        with open(input_path, 'rb') as f:
            input_data = f.read()

        # Remove background using rembg
        no_bg_bytes = remove(input_data)
        img = Image.open(io.BytesIO(no_bg_bytes)).convert("RGBA")

        # Get bounding box of non-transparent pixels
        bbox = img.getbbox()
        if not bbox:
            return False
            
        left, upper, right, lower = bbox
        width = right - left
        height = lower - upper

        # We want a square crop focusing on face/upper body.
        # Square size
        side = min(width, height * 0.8)
        if side <= 0: return False
        
        # Center horizontally
        center_x = left + width / 2
        # Start from top with a small padding
        crop_upper = max(0, upper - side * 0.05)
        crop_left = center_x - side / 2
        crop_right = crop_left + side
        crop_lower = crop_upper + side

        # Crop the image
        cropped = img.crop((int(crop_left), int(crop_upper), int(crop_right), int(crop_lower)))
        
        # Resize to standard size (leaving 40px for glow/shadow)
        avatar_size = size - 40
        cropped = cropped.resize((avatar_size, avatar_size), Image.Resampling.LANCZOS)

        # Create a circular mask for the avatar
        mask = Image.new("L", (avatar_size, avatar_size), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse((0, 0, avatar_size, avatar_size), fill=255)

        # Apply circular mask to the cropped image
        avatar_circle = Image.new("RGBA", (avatar_size, avatar_size), (0, 0, 0, 0))
        avatar_circle.paste(cropped, (0, 0), mask=mask)

        # Draw a thin luxury gold border (#D4AF37)
        gold_color = (212, 175, 55, 255) # #D4AF37
        draw_avatar = ImageDraw.Draw(avatar_circle)
        # 3px border
        draw_avatar.ellipse((1, 1, avatar_size-2, avatar_size-2), outline=gold_color, width=3)

        # Final canvas
        final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

        # Effect layer for glow and shadow
        effect_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw_effect = ImageDraw.Draw(effect_layer)
        
        offset = 20
        shadow_rect = (offset, offset, offset + avatar_size, offset + avatar_size)
        
        # Dark shadow
        draw_effect.ellipse(shadow_rect, fill=(0, 0, 0, 160))
        # Subtle blue glow
        glow_color = (56, 189, 248, 100)
        draw_effect.ellipse(shadow_rect, outline=glow_color, width=8)
        
        # Blur the effect layer
        effect_layer = effect_layer.filter(ImageFilter.GaussianBlur(10))

        # Paste the effect layer, then the avatar on top
        final_img.paste(effect_layer, (0, 0), mask=effect_layer)
        
        # Paste the avatar centered
        paste_pos = (20, 20)
        final_img.paste(avatar_circle, paste_pos, mask=avatar_circle)

        # Save the result
        final_img.save(output_path, "PNG")
        return True
    except Exception as e:
        print(f"Error processing {input_path}: {e}", flush=True)
        return False

def main():
    players_dir = r"E:\ipl auction\player images"
    public_players_dir = r"E:\ipl auction\public\assets\player-avatars"
    os.makedirs(public_players_dir, exist_ok=True)
    
    player_image_map = {}
    count = 0
    
    for root, dirs, files in os.walk(players_dir):
        for filename in files:
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.avif')):
                input_path = os.path.join(root, filename)
                
                # Format name: Virat_Kohli.png
                base_name = os.path.splitext(filename)[0].strip()
                # capitalize words and replace spaces/hyphens with underscore
                parts = re.split(r'[\s\-]+', base_name)
                safe_name = '_'.join([p.capitalize() for p in parts if p])
                safe_filename = safe_name + '.png'
                
                output_path = os.path.join(public_players_dir, safe_filename)
                
                print(f"[{count+1}] Processing {base_name} -> {safe_filename} ...", flush=True)
                success = process_premium_avatar(input_path, output_path)
                
                if success:
                    player_image_map[base_name.lower()] = f"/assets/player-avatars/{safe_filename}"
                count += 1
                
    with open(r"E:\ipl auction\premium_player_map.json", "w") as f:
        json.dump(player_image_map, f, indent=2)
        
    print("All player avatars processed!", flush=True)

if __name__ == "__main__":
    main()
