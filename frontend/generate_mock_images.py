import os
import sys
try:
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance

base_dir = os.path.dirname(os.path.abspath(__file__))
input_path = os.path.join(base_dir, "public", "testImage.png")
output_dir = os.path.join(base_dir, "public", "mock-images", "stages")

os.makedirs(output_dir, exist_ok=True)

if not os.path.exists(input_path):
    print(f"Input image not found: {input_path}")
    sys.exit(1)

# Load the original image
original = Image.open(input_path).convert("RGB")
width, height = original.size

# Helper to draw a box with dynamic text background
def draw_box(draw, x, y, w, h, color, text):
    draw.rectangle([x, y, x + w, y + h], outline=color, width=3)
    # Estimate text size (Pillow default font is ~6x10 pixels per char)
    text_w = len(text) * 6 + 10
    text_h = 16
    draw.rectangle([x, y - text_h - 4, x + text_w, y], fill=color)
    draw.text((x + 5, y - text_h), text, fill="white" if color != "yellow" else "black")

cx, cy = width // 2, height // 2

# Simulated entities for "all vehicles"
entities = [
    {"rect": [cx - 200, cy - 100, 400, 250], "class": "Motorcycle", "conf": "0.94"},
    {"rect": [cx + 250, cy - 50, 150, 100], "class": "Motorcycle", "conf": "0.89"},
    {"rect": [cx - 400, cy + 50, 120, 80], "class": "Motorcycle", "conf": "0.82"},
]

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
    if i == 0:  # The main motorcycle
        draw_box(draw, rx, ry, rw, rh, "red", "No Helmet: 0.96")
    else:
        draw_box(draw, rx, ry, rw, rh, "green", f"Vehicle: {ent['conf']}")
img_viol.save(os.path.join(output_dir, "violation_detection.jpg"), "JPEG", quality=85)

# 4. Classification
img_class = original.copy()
draw = ImageDraw.Draw(img_class)
for ent in entities:
    rx, ry, rw, rh = ent["rect"]
    draw_box(draw, rx, ry, rw, rh, "blue", f"{ent['class']}: {ent['conf']}")
img_class.save(os.path.join(output_dir, "classification.jpg"), "JPEG", quality=85)

# 5. LPR
img_lpr = original.copy()
draw = ImageDraw.Draw(img_lpr)
# Tight box for LPR
lpr_x, lpr_y, lpr_w, lpr_h = cx - 30, cy + 60, 90, 25
draw_box(draw, lpr_x, lpr_y, lpr_w, lpr_h, "orange", "AP 28R 6104")
# Highlight plate area tighter
draw.rectangle([lpr_x, lpr_y, lpr_x + lpr_w, lpr_y + lpr_h], fill="orange", outline="white", width=2)
draw.text((lpr_x + 5, lpr_y + 5), "AP28R6104", fill="black")
img_lpr.save(os.path.join(output_dir, "lpr.jpg"), "JPEG", quality=85)

# 6. Evidence
img_evid = original.copy()
draw = ImageDraw.Draw(img_evid)
draw.rectangle([10, 10, 400, 90], fill="black")
draw.text((20, 20), "AI EVIDENCE", fill="white")
draw.text((20, 40), "Violation Class: Helmet Non-Compliance", fill="white")
draw.text((20, 60), "Confidence: 96.1%", fill="white")
# Show only the violating vehicle in red
draw_box(draw, cx - 200, cy - 100, 400, 250, "red", "Violation: No Helmet")
img_evid.save(os.path.join(output_dir, "evidence.jpg"), "JPEG", quality=85)

# 7. Analytics
img_analytics = original.copy()
draw = ImageDraw.Draw(img_analytics, "RGBA")
for i in range(0, width, 100):
    draw.line([(i, 0), (i, height)], fill=(0, 255, 0, 50), width=1)
for i in range(0, height, 100):
    draw.line([(0, i), (width, i)], fill=(0, 255, 0, 50), width=1)
draw.rectangle([0, height - 50, width, height], fill=(0, 0, 0, 150))
draw.text((10, height - 40), "Zone A Density: 84% | Flow Rate: 42 veh/min", fill="white")
img_analytics.save(os.path.join(output_dir, "analytics.jpg"), "JPEG", quality=85)

print("Mock images generated successfully.")
