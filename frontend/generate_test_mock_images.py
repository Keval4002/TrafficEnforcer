import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance

base_dir = os.path.dirname(os.path.abspath(__file__))

# Define helper to draw boxes
def draw_box(draw, x, y, w, h, color, text):
    draw.rectangle([x, y, x + w, y + h], outline=color, width=3)
    text_w = len(text) * 6 + 10
    text_h = 16
    draw.rectangle([x, y - text_h - 4, x + text_w, y], fill=color)
    draw.text((x + 5, y - text_h), text, fill="white" if color != "yellow" else "black")

def generate_set(input_filename, output_subdir, entities, violator_index, lpr_info, violation_label, evidence_details, font_color="white"):
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
        draw_box(draw, rx, ry, rw, rh, "green", f"Vehicle: {ent['conf']}")
    img_det.save(os.path.join(output_dir, "detection.jpg"), "JPEG", quality=85)

    # 3. Violation Detection (Red bounding box only on violators, green on rest)
    img_viol = original.copy()
    draw = ImageDraw.Draw(img_viol)
    for i, ent in enumerate(entities):
        rx, ry, rw, rh = ent["rect"]
        if i == violator_index:
            draw_box(draw, rx, ry, rw, rh, "red", f"{violation_label}: {ent['conf']}")
        else:
            draw_box(draw, rx, ry, rw, rh, "green", f"Vehicle: {ent['conf']}")
    img_viol.save(os.path.join(output_dir, "violation_detection.jpg"), "JPEG", quality=85)

    # 4. Classification
    img_class = original.copy()
    draw = ImageDraw.Draw(img_class)
    for ent in entities:
        rx, ry, rw, rh = ent["rect"]
        color = "red" if ent == entities[violator_index] else "blue"
        draw_box(draw, rx, ry, rw, rh, color, f"{ent['class']}: {ent['conf']}")
    img_class.save(os.path.join(output_dir, "classification.jpg"), "JPEG", quality=85)

    # 5. LPR
    img_lpr = original.copy()
    draw = ImageDraw.Draw(img_lpr)
    lpr_x, lpr_y, lpr_w, lpr_h = lpr_info["rect"]
    draw_box(draw, lpr_x, lpr_y, lpr_w, lpr_h, "orange", lpr_info["plate"])
    draw.rectangle([lpr_x, lpr_y, lpr_x + lpr_w, lpr_y + lpr_h], fill="orange", outline="white", width=2)
    draw.text((lpr_x + 5, lpr_y + 5), lpr_info["plate"].replace(" ", ""), fill="black")
    img_lpr.save(os.path.join(output_dir, "lpr.jpg"), "JPEG", quality=85)

    # 6. Evidence
    img_evid = original.copy()
    draw = ImageDraw.Draw(img_evid)
    draw.rectangle([10, 10, 420, 90], fill="black")
    draw.text((20, 20), "AI EVIDENCE", fill="white")
    draw.text((20, 40), f"Violation Class: {evidence_details['class']}", fill="white")
    draw.text((20, 60), f"Confidence: {evidence_details['conf']}", fill="white")
    rx, ry, rw, rh = entities[violator_index]["rect"]
    draw_box(draw, rx, ry, rw, rh, "red", f"Violation: {evidence_details['class']}")
    img_evid.save(os.path.join(output_dir, "evidence.jpg"), "JPEG", quality=85)

    # 7. Analytics
    img_analytics = original.copy()
    draw = ImageDraw.Draw(img_analytics, "RGBA")
    for i in range(0, width, 100):
        draw.line([(i, 0), (i, height)], fill=(0, 255, 0, 50), width=1)
    for i in range(0, height, 100):
        draw.line([(0, i), (width, i)], fill=(0, 255, 0, 50), width=1)
    draw.rectangle([0, height - 50, width, height], fill=(0, 0, 0, 150))
    draw.text((10, height - 40), f"Zone A Density: {evidence_details['density']}% | Flow Rate: {evidence_details['flow']} veh/min", fill="white")
    img_analytics.save(os.path.join(output_dir, "analytics.jpg"), "JPEG", quality=85)

    print(f"Mock images generated for {input_filename} in {output_subdir}")


# --- Configurations for all 3 images ---

# Test 1 (Motorcycle Helmet Violation)
entities1 = [
    {"rect": [200, 200, 400, 250], "class": "Motorcycle", "conf": "0.96"},
    {"rect": [650, 250, 150, 100], "class": "Motorcycle", "conf": "0.89"},
    {"rect": [10, 350, 120, 80], "class": "Motorcycle", "conf": "0.82"},
]
lpr1 = {"rect": [370, 360, 90, 25], "plate": "AP 28R 6104"}
evid1 = {"class": "Helmet Non-Compliance", "conf": "96.1%", "density": "84", "flow": "42"}

# Test 2 (Stop-Line Violation)
entities2 = [
    {"rect": [300, 150, 200, 180], "class": "Car", "conf": "0.94"},
    {"rect": [100, 180, 150, 120], "class": "Auto Rickshaw", "conf": "0.88"},
    {"rect": [550, 130, 180, 170], "class": "Truck", "conf": "0.91"},
]
lpr2 = {"rect": [380, 270, 85, 22], "plate": "MH 12 PQ 7890"}
evid2 = {"class": "Stop-Line Violation", "conf": "88.7%", "density": "62", "flow": "28"}

# Test 3 (Wrong-Side Driving)
entities3 = [
    {"rect": [200, 280, 120, 110], "class": "Motorcycle", "conf": "0.95"},
    {"rect": [400, 180, 250, 250], "class": "Bus", "conf": "0.97"},
    {"rect": [700, 290, 100, 90], "class": "Bicycle", "conf": "0.85"},
]
lpr3 = {"rect": [230, 340, 75, 18], "plate": "DL 3C AY 4567"}
evid3 = {"class": "Wrong-Side Driving", "conf": "95.2%", "density": "45", "flow": "15"}

# Generate all
generate_set("testImage1.png", "test1", entities1, 0, lpr1, "No Helmet", evid1)
generate_set("testImage2.jpeg", "test2", entities2, 0, lpr2, "Stop-Line Viol.", evid2)
generate_set("testImage3.avif", "test3", entities3, 0, lpr3, "Wrong-Way Driving", evid3)
