import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance

base_dir = os.path.dirname(os.path.abspath(__file__))

# Load system font for high visibility
try:
    font = ImageFont.truetype("arial.ttf", 15)
    large_font = ImageFont.truetype("arial.ttf", 18)
except IOError:
    font = ImageFont.load_default()
    large_font = ImageFont.load_default()

# Helper to draw a box with dynamic text background
def draw_box(draw, x, y, w, h, color, text, custom_font=font):
    # Thicker border (4px) for high visibility
    draw.rectangle([x, y, x + w, y + h], outline=color, width=4)
    
    # Calculate exact text dimensions dynamically
    left, top, right, bottom = draw.textbbox((0, 0), text, font=custom_font)
    text_w = right - left
    text_h = bottom - top
    
    # Draw background box for text flag above the box (with padding)
    pad_x = 8
    pad_y = 4
    
    flag_y1 = y - text_h - (pad_y * 2)
    flag_y2 = y
    
    # If the box is at the very top of the image, draw flag inside the box
    if flag_y1 < 0:
        flag_y1 = y
        flag_y2 = y + text_h + (pad_y * 2)
        
    draw.rectangle([x, flag_y1, x + text_w + (pad_x * 2), flag_y2], fill=color)
    draw.text((x + pad_x, flag_y1 + pad_y), text, font=custom_font, fill="white" if color != "yellow" else "black")

def generate_set(input_filename, output_subdir, entities, lpr_plates, evidence_details):
    input_path = os.path.join(base_dir, "public", input_filename)
    output_dir = os.path.join(base_dir, "public", "mock-images", output_subdir)
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(input_path):
        print(f"Input image not found: {input_path}")
        return

    # Load original
    original = Image.open(input_path).convert("RGB")
    width, height = original.size

    # 1. Preprocessing (Grayscale + Contrast)
    img_pre = original.copy().convert("L").convert("RGB")
    enhancer = ImageEnhance.Contrast(img_pre)
    img_pre = enhancer.enhance(1.5)
    img_pre.save(os.path.join(output_dir, "preprocessing.jpg"), "JPEG", quality=85)

    # 2. Detection (Green bounding boxes for all vehicles)
    img_det = original.copy()
    draw = ImageDraw.Draw(img_det)
    for ent in entities:
        rx, ry, rw, rh = ent["rect"]
        draw_box(draw, rx, ry, rw, rh, "green", f"{ent['class']}: {ent['conf']}")
    img_det.save(os.path.join(output_dir, "detection.jpg"), "JPEG", quality=85)

    # 3. Violation Detection (Red bounding box for violators, green on rest)
    img_viol = original.copy()
    draw = ImageDraw.Draw(img_viol)
    for ent in entities:
        rx, ry, rw, rh = ent["rect"]
        if ent.get("is_violator"):
            draw_box(draw, rx, ry, rw, rh, "red", ent["violation_label"])
        else:
            draw_box(draw, rx, ry, rw, rh, "green", f"{ent['class']}: {ent['conf']}")
    img_viol.save(os.path.join(output_dir, "violation_detection.jpg"), "JPEG", quality=85)

    # 4. Classification (Red on violators, blue on rest)
    img_class = original.copy()
    draw = ImageDraw.Draw(img_class)
    for ent in entities:
        rx, ry, rw, rh = ent["rect"]
        color = "red" if ent.get("is_violator") else "blue"
        draw_box(draw, rx, ry, rw, rh, color, f"{ent['class']}: {ent['conf']}")
    img_class.save(os.path.join(output_dir, "classification.jpg"), "JPEG", quality=85)

    # 5. LPR (Orange boxes for detected plates, text centered)
    img_lpr = original.copy()
    draw = ImageDraw.Draw(img_lpr)
    for plate_info in lpr_plates:
        lpr_x, lpr_y, lpr_w, lpr_h = plate_info["rect"]
        draw_box(draw, lpr_x, lpr_y, lpr_w, lpr_h, "orange", plate_info["plate"])
        draw.rectangle([lpr_x, lpr_y, lpr_x + lpr_w, lpr_y + lpr_h], fill="orange", outline="white", width=2)
        
        # Center the plate text
        left, top, right, bottom = draw.textbbox((0, 0), plate_info["plate"], font=large_font)
        text_w = right - left
        text_h = bottom - top
        draw.text((lpr_x + (lpr_w - text_w)//2, lpr_y + (lpr_h - text_h)//2 - 1), plate_info["plate"], font=large_font, fill="black")
    img_lpr.save(os.path.join(output_dir, "lpr.jpg"), "JPEG", quality=85)

    # 6. Evidence (Draw citation metadata box, red boxes around violators)
    img_evid = original.copy()
    draw = ImageDraw.Draw(img_evid)
    draw.rectangle([10, 10, 520, 110], fill="black")
    draw.text((20, 20), "AI EVIDENCE CITATION", font=large_font, fill="white")
    draw.text((20, 45), f"Primary Case: {evidence_details['class']}", font=font, fill="white")
    draw.text((20, 68), f"Plates Tracked: {', '.join([p['plate'] for p in lpr_plates])}", font=font, fill="white")
    
    for ent in entities:
        if ent.get("is_violator"):
            rx, ry, rw, rh = ent["rect"]
            draw_box(draw, rx, ry, rw, rh, "red", ent["violation_label"])
    img_evid.save(os.path.join(output_dir, "evidence.jpg"), "JPEG", quality=85)

    # 7. Analytics
    img_analytics = original.copy()
    draw = ImageDraw.Draw(img_analytics, "RGBA")
    for i in range(0, width, 100):
        draw.line([(i, 0), (i, height)], fill=(0, 255, 0, 50), width=1)
    for i in range(0, height, 100):
        draw.line([(0, i), (width, i)], fill=(0, 255, 0, 50), width=1)
    draw.rectangle([0, height - 50, width, height], fill=(0, 0, 0, 150))
    draw.text((20, height - 38), f"Zone A Density: {evidence_details['density']}% | Flow Rate: {evidence_details['flow']} veh/min", font=font, fill="white")
    img_analytics.save(os.path.join(output_dir, "analytics.jpg"), "JPEG", quality=85)

    print(f"Mock images generated for {input_filename} in {output_subdir}")


# --- Configurations for all 3 images ---

# Test 1 (Motorcycle Helmet Violation) - Dimensions 800x600
entities1 = [
    {"rect": [200, 200, 400, 250], "class": "Motorcycle", "conf": "0.96", "is_violator": True, "violation_label": "No Helmet: AP 28R 6104"},
    {"rect": [650, 250, 150, 100], "class": "Motorcycle", "conf": "0.89"},
    {"rect": [10, 350, 120, 80], "class": "Motorcycle", "conf": "0.82"},
]
lpr1 = [{"rect": [355, 360, 120, 30], "plate": "AP 28R 6104"}]
evid1 = {"class": "Helmet Non-Compliance", "conf": "96.1%", "density": "84", "flow": "42"}

# Test 2 (Tamil Nadu: Two Helmet Violations) - Dimensions 800x448
entities2 = [
    {"rect": [120, 160, 160, 200], "class": "Motorcycle", "conf": "0.92", "is_violator": True, "violation_label": "No Helmet: TN 09BL 0196"},
    {"rect": [500, 150, 170, 210], "class": "Motorcycle", "conf": "0.95", "is_violator": True, "violation_label": "No Helmet: TN 09BJ 4054"},
    {"rect": [330, 170, 130, 90], "class": "Car", "conf": "0.91"},
]
lpr2 = [
    {"rect": [140, 310, 120, 30], "plate": "TN 09BL 0196"},
    {"rect": [525, 310, 120, 30], "plate": "TN 09BJ 4054"}
]
evid2 = {"class": "Double Helmet Violation", "conf": "95.0%", "density": "62", "flow": "28"}

# Test 3 (Maharashtra: Wrong Side + Helmet Violators) - Dimensions 960x540
entities3 = [
    {"rect": [250, 220, 150, 180], "class": "Motorcycle", "conf": "0.97", "is_violator": True, "violation_label": "Wrong Side + No Helmet: MH 12HA 5097"},
    {"rect": [550, 210, 160, 190], "class": "Motorcycle", "conf": "0.94", "is_violator": True, "violation_label": "No Helmet: MH 12 HK 8561"},
    {"rect": [750, 290, 100, 90], "class": "Bicycle", "conf": "0.85"},
]
lpr3 = [
    {"rect": [265, 350, 120, 30], "plate": "MH 12HA 5097"},
    {"rect": [570, 350, 120, 30], "plate": "MH 12 HK 8561"}
]
evid3 = {"class": "Wrong-Side Driving + No Helmet", "conf": "97.0%", "density": "45", "flow": "15"}

# Generate all
generate_set("testImage1.png", "test1", entities1, lpr1, evid1)
generate_set("testImage2.jpeg", "test2", entities2, lpr2, evid2)
generate_set("testImage3.avif", "test3", entities3, lpr3, evid3)
