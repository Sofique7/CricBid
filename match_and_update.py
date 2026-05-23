import os
import re
import difflib

players_ts_path = r"e:\ipl auction\src\data\players.ts"
avatar_dir = r"e:\ipl auction\public\assets\player-avatars"

# Helper to normalize names for matching
def normalize_name(name):
    name = name.lower().strip()
    name = re.sub(r'[\s\._-]', '', name)
    return name

# Scan the processed avatars
avatars = []
if os.path.exists(avatar_dir):
    for f in os.listdir(avatar_dir):
        if f.lower().endswith('.png'):
            avatars.append(f)

print(f"Found {len(avatars)} processed avatars in {avatar_dir}")

# Load players.ts
with open(players_ts_path, "r", encoding="utf-8") as f:
    ts_content = f.read()

# Normalize avatar list for matching
avatar_map = {}
for av in avatars:
    name_part, _ = os.path.splitext(av)
    norm = normalize_name(name_part)
    avatar_map[norm] = av

# Custom manual overrides if needed
overrides = {
    "yusifpathan": "Yusuf_Pathan.png",
    "wanindhuhasranga": "Wanindu_Hasaranga.png",
    "yusufpathan": "Yusuf_Pathan.png",
    "klrahul": "Kl_Rahul.png",
    "krahul": "Kl_Rahul.png",
    "msdhoni": "Ms_Dhoni.png",
    "abdevilliers": "Ab_De_Villiers.png",
    "fafduplessis": "Faf_Du_Plessis.png",
    "hardikpandya": "Hardik_Pandya.png",
}

# Match and replace
matches_found = 0
unmatched_players = []

def replacement_func(match):
    global matches_found, unmatched_players
    prefix = match.group(1) # up to "name": "Player Name"
    name = match.group(2)   # Player Name
    middle = match.group(3) # between name and image
    old_img = match.group(4) # old image URL
    suffix = match.group(5) # after image URL
    
    norm_name = normalize_name(name)
    
    # Try exact match or overrides first
    best_avatar = None
    if norm_name in overrides:
        best_avatar = overrides[norm_name]
    elif norm_name in avatar_map:
        best_avatar = avatar_map[norm_name]
    else:
        # Check if the player name ends with the avatar name, or if the avatar name is a significant part of the player name
        # e.g., "ravichandranashwin" ends with "ashwin", "glennmaxwell" ends with "maxwell"
        found_partial = False
        for av_norm, av_file in avatar_map.items():
            if len(av_norm) >= 4 and (norm_name.endswith(av_norm) or av_norm.endswith(norm_name) or av_norm in norm_name or norm_name in av_norm):
                best_avatar = av_file
                print(f"Partial/EndsWith match: '{name}' -> '{best_avatar}'")
                found_partial = True
                break
        
        if not found_partial:
            # Fuzzy match
            best_ratio = 0.0
            best_norm = None
            for av_norm in avatar_map.keys():
                ratio = difflib.SequenceMatcher(None, norm_name, av_norm).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_norm = av_norm
            
            if best_ratio >= 0.8:
                best_avatar = avatar_map[best_norm]
                print(f"Fuzzy match: '{name}' -> '{best_avatar}' (ratio: {best_ratio:.2f})")
            else:
                # Let's try word containment
                # e.g. "Virat kohli" -> "viratkohli", is there any avatar starting or ending with kohli?
                # Or if name has parts, check if both parts exist in the avatar name
                words = [w for w in re.split(r'[\s_-]+', name.lower()) if len(w) > 2]
                found = False
                if words:
                    for av_norm, av_file in avatar_map.items():
                        if all(w in av_norm for w in words):
                            best_avatar = av_file
                            print(f"Substring match: '{name}' -> '{best_avatar}'")
                            found = True
                            break
                
                if not found:
                    unmatched_players.append(name)
    
    if best_avatar:
        matches_found += 1
        new_img = f"/assets/player-avatars/{best_avatar}"
        return f'{prefix}"name": "{name}",{middle}"image": "{new_img}"{suffix}'
    else:
        # Keep old image
        return match.group(0)

# Regex to find a player object and extract name and image
pattern = re.compile(
    r'(\{\s*"id":\s*"[^"]+",\s*)'            # Group 1: start of player object
    r'"name":\s*"([^"]+)",'                  # Group 2: name
    r'([\s\S]*?)'                            # Group 3: key-values in between
    r'"image":\s*"([^"]*)"'                  # Group 4: image url
    r'([\s\S]*?\})'                          # Group 5: rest of player object
)

new_ts_content = pattern.sub(replacement_func, ts_content)

with open(players_ts_path, "w", encoding="utf-8") as f:
    f.write(new_ts_content)

print(f"\nUpdated players.ts! Matched: {matches_found}. Unmatched players: {len(unmatched_players)}")
if unmatched_players:
    print("Unmatched player names:")
    for up in unmatched_players:
        print(f"  - {up}")
