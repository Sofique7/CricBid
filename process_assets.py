import os
import glob
import re
import shutil
from PIL import Image
from rembg import remove

def process_image(input_path, output_path):
    print(f"Processing {input_path}")
    try:
        with open(input_path, 'rb') as i:
            input_data = i.read()
        
        output_data = remove(input_data)
        
        with open(output_path, 'wb') as o:
            o.write(output_data)
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        # fallback copy if rembg fails
        shutil.copy2(input_path, output_path)

def main():
    # Process team logos
    logos_dir = r"E:\ipl auction\ipl team logos"
    public_logos_dir = r"E:\ipl auction\public\logos"
    os.makedirs(public_logos_dir, exist_ok=True)
    
    if os.path.exists(logos_dir):
        for filename in os.listdir(logos_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                input_path = os.path.join(logos_dir, filename)
                output_filename = filename.lower().replace(' logo', '').replace(' (1)', '').replace(' ', '_')
                if not output_filename.endswith('.png'):
                    output_filename = os.path.splitext(output_filename)[0] + '.png'
                output_path = os.path.join(public_logos_dir, output_filename)
                process_image(input_path, output_path)

    # Process player images
    players_dir = r"E:\ipl auction\player images"
    public_players_dir = r"E:\ipl auction\public\players"
    os.makedirs(public_players_dir, exist_ok=True)
    
    player_image_map = {}
    
    if os.path.exists(players_dir):
        for root, dirs, files in os.walk(players_dir):
            for filename in files:
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.avif')):
                    input_path = os.path.join(root, filename)
                    
                    # Normalize player name
                    player_name = os.path.splitext(filename)[0]
                    # Create a safe filename
                    safe_filename = re.sub(r'[^a-z0-9]', '_', player_name.lower()) + '.png'
                    output_path = os.path.join(public_players_dir, safe_filename)
                    
                    process_image(input_path, output_path)
                    
                    # Add to map
                    player_image_map[player_name.lower()] = f"/players/{safe_filename}"
    
    # Generate JSON map for players
    import json
    with open(r"E:\ipl auction\player_image_map.json", "w") as f:
        json.dump(player_image_map, f, indent=2)
        
    print("Asset processing complete. Player image map saved to player_image_map.json")

if __name__ == "__main__":
    main()
