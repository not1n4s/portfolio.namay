#!/usr/bin/env python3
from __future__ import annotations

import math
import os
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
WORLD = PUBLIC / "assets" / "world"
BRAND = PUBLIC / "assets" / "brand"
PLATES = PUBLIC / "assets" / "plates"
ICONS = PUBLIC / "assets" / "icons"
THUMBNAILS = PUBLIC / "assets" / "thumbnails"
for folder in (WORLD, BRAND, PLATES, ICONS, THUMBNAILS):
    folder.mkdir(parents=True, exist_ok=True)

INK = (16, 19, 26)
PANEL = (23, 27, 36)
MINERAL = (243, 240, 234)
SLATE = (154, 160, 171)
CORAL = (224, 93, 82)
HERO_FILES = [
    THUMBNAILS / "hero-01-thailand.jpg",
    THUMBNAILS / "hero-02-action.jpg",
    THUMBNAILS / "hero-03-vaccine.jpg",
    THUMBNAILS / "hero-04-heritage.jpg",
    THUMBNAILS / "hero-05-astana.jpg",
]
HERO_IMAGES: list[Image.Image] | None = None


def clamp(v: float) -> float:
    return max(0.0, min(1.0, v))


def ease(v: float) -> float:
    v = clamp(v)
    return v * v * (3 - 2 * v)


def font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf" if bold else "/usr/share/fonts/truetype/montserrat/Montserrat-Medium.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def hero_thumbnail(size: tuple[int, int], t: float) -> Image.Image:
    global HERO_IMAGES
    if HERO_IMAGES is None:
        HERO_IMAGES = [Image.open(path).convert("RGB") for path in HERO_FILES]

    headline_points = (0.13, 0.35, 0.57, 0.78)
    transition_length = 0.08
    current = 0
    following = 0
    mix = 0.0
    for index, point in enumerate(headline_points):
        transition_start = point - transition_length
        if t < transition_start:
            break
        if t <= point:
            current = index
            following = index + 1
            mix = ease((t - transition_start) / transition_length)
            break
        current = index + 1
        following = current

    def fitted(index: int, drift: float) -> Image.Image:
        tw, th = size
        zoom = 1.025 + 0.018 * drift
        larger = (max(tw, int(tw * zoom)), max(th, int(th * zoom)))
        art = ImageOps.fit(HERO_IMAGES[index], larger, method=Image.Resampling.LANCZOS)
        left = max(0, (larger[0] - tw) // 2)
        top = max(0, (larger[1] - th) // 2)
        return art.crop((left, top, left + tw, top + th))

    first = fitted(current, t)
    if following == current or mix <= 0:
        return first
    return Image.blend(first, fitted(following, t), mix)


def render_frame(width: int, height: int, t: float) -> Image.Image:
    img = Image.new("RGB", (width, height), INK)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        n = y / max(height - 1, 1)
        glow = 9 * (1 - abs(n - 0.46) * 1.5)
        draw.line((0, y, width, y), fill=(16 + int(glow * 0.35), 19 + int(glow * 0.4), 26 + int(glow * 0.65)))

    haze = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    hd = ImageDraw.Draw(haze)
    center_x = width * (0.54 + 0.035 * math.sin(t * math.tau))
    center_y = height * (0.50 + 0.025 * math.cos(t * math.tau * 0.7))
    for i in range(8):
        phase = t * math.tau * (0.35 + i * 0.025) + i * 0.82
        rx = width * (0.11 + i * 0.016)
        ry = height * (0.16 + i * 0.012)
        x = center_x + math.sin(phase) * width * (0.17 + i * 0.009)
        y = center_y + math.cos(phase * 0.83) * height * (0.18 + i * 0.006)
        color = (38 + i * 4, 43 + i * 3, 58 + i * 5, 40)
        hd.ellipse((x-rx, y-ry, x+rx, y+ry), fill=color)
    haze = haze.filter(ImageFilter.GaussianBlur(max(30, int(width * 0.045))))
    img = Image.alpha_composite(img.convert("RGBA"), haze)

    current = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    cd = ImageDraw.Draw(current)
    points = []
    for i in range(160):
        x = -width * 0.08 + (i / 159) * width * 1.16
        y = center_y + math.sin((i / 159) * math.tau * 1.35 + t * math.tau * 1.1) * height * 0.13
        y += math.sin((i / 159) * math.tau * 3.2 - t * math.tau * 0.5) * height * 0.028
        points.append((x, y))
    width_main = max(8, int(width * (0.010 + 0.006 * math.sin(math.pi * t))))
    cd.line(points, fill=(*CORAL, 125), width=width_main, joint="curve")
    cd.line(points, fill=(255, 177, 164, 190), width=max(2, width_main // 5), joint="curve")
    glow = current.filter(ImageFilter.GaussianBlur(max(12, int(width * 0.012))))
    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, current)

    planes = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pd = ImageDraw.Draw(planes)
    reveal = ease((t - 0.34) / 0.25)
    if reveal > 0:
        for i, offset in enumerate((-1, 0, 1)):
            angle = t * math.tau * 0.25 + i * 2.1
            px = center_x + math.cos(angle) * width * (0.17 + 0.02 * i)
            py = center_y + math.sin(angle) * height * 0.15
            pw = width * 0.15
            ph = pw * 9 / 16
            alpha = int(24 * reveal)
            pd.rounded_rectangle((px-pw/2, py-ph/2, px+pw/2, py+ph/2), radius=max(8, int(width*0.008)), fill=(243,240,234,alpha), outline=(243,240,234,int(70*reveal)), width=max(1,int(width*0.0015)))
    img = Image.alpha_composite(img, planes)

    growth = 0.24 + 0.26 * ease(t)
    fw = width * growth
    fh = fw * 9 / 16
    cx = center_x + math.sin(t * math.pi * 1.2) * width * 0.035
    cy = center_y
    radius = max(12, int(width * 0.018))
    box = (cx-fw/2, cy-fh/2, cx+fw/2, cy+fh/2)

    inset = max(12, int(width * 0.011))
    inner_w = max(2, int(fw - inset * 2))
    inner_h = max(2, int(fh - inset * 2))
    thumb = hero_thumbnail((inner_w, inner_h), t).convert("RGBA")
    mask = Image.new("L", (inner_w, inner_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, inner_w - 1, inner_h - 1),
        radius=max(8, radius - inset // 2),
        fill=255,
    )
    thumb.putalpha(mask)
    paste_x = int(cx - inner_w / 2)
    paste_y = int(cy - inner_h / 2)
    shadow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    shadow_mask = Image.new("L", (inner_w, inner_h), 0)
    ImageDraw.Draw(shadow_mask).rounded_rectangle(
        (0, 0, inner_w - 1, inner_h - 1),
        radius=max(8, radius - inset // 2),
        fill=170,
    )
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(max(6, int(width * 0.008))))
    shadow.paste((0, 0, 0, 190), (paste_x, paste_y + max(4, int(height * 0.008))), shadow_mask)
    img = Image.alpha_composite(img, shadow)
    img.alpha_composite(thumb, (paste_x, paste_y))

    frame = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    for stroke, color in [
        (max(16, int(width*0.018)), (7, 9, 13, 180)),
        (max(9, int(width*0.010)), (108, 116, 132, 225)),
        (max(3, int(width*0.003)), (243, 240, 234, 230)),
    ]:
        fd.rounded_rectangle(box, radius=radius, outline=color, width=stroke)
    sheen_x = cx - fw/2 + fw * ((t * 1.15) % 1)
    fd.line((sheen_x, cy-fh/2+10, sheen_x+fw*0.12, cy+fh/2-10), fill=(255,255,255,95), width=max(3,int(width*0.004)))
    for sx, sy in ((-1,-1),(1,-1),(-1,1),(1,1)):
        x = cx + sx * fw/2
        y = cy + sy * fh/2
        leg = width * 0.035
        fd.line((x, y, x - sx*leg, y), fill=(*CORAL, 240), width=max(3,int(width*0.004)))
        fd.line((x, y, x, y - sy*leg), fill=(*CORAL, 240), width=max(3,int(width*0.004)))
    frame = frame.filter(ImageFilter.GaussianBlur(0.35))
    img = Image.alpha_composite(img, frame)

    vignette = Image.new("L", (width, height), 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse((-width*0.12, -height*0.30, width*1.12, height*1.28), fill=220)
    vignette = vignette.filter(ImageFilter.GaussianBlur(max(35, int(width*0.06))))
    shade = Image.new("RGBA", (width, height), (0,0,0,0))
    shade.putalpha(ImageChops.invert(vignette))
    img = Image.alpha_composite(img, shade)
    return img.convert("RGB")


def render_film():
    desktop = WORLD / "frame-current.mp4"
    mobile = WORLD / "frame-current-mobile.mp4"
    fps = 12
    frames = 180
    width, height = 1280, 720
    cmd = [
        "ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{width}x{height}", "-r", str(fps), "-i", "-",
        "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-g", "8", "-keyint_min", "8", "-sc_threshold", "0",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(desktop)
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None
    for i in range(frames):
        frame_img = render_frame(width, height, i / (frames - 1))
        proc.stdin.write(frame_img.tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("desktop film encode failed")

    subprocess.run([
        "ffmpeg", "-y", "-i", str(desktop),
        "-vf", "crop=404:720:438:0,scale=720:1280:flags=lanczos",
        "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "23",
        "-g", "4", "-keyint_min", "4", "-sc_threshold", "0",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mobile)
    ], check=True)
    subprocess.run(["ffmpeg", "-y", "-i", str(desktop), "-frames:v", "1", str(WORLD / "frame-current-poster.png")], check=True)
    subprocess.run(["ffmpeg", "-y", "-i", str(mobile), "-frames:v", "1", str(WORLD / "frame-current-mobile-poster.png")], check=True)


def draw_monogram(size: int, background=INK) -> Image.Image:
    img = Image.new("RGB", (size, size), background)
    d = ImageDraw.Draw(img)
    pad = int(size * 0.18)
    width = max(2, int(size * 0.075))
    d.line((pad, size-pad, pad, pad), fill=MINERAL, width=width)
    d.line((pad, pad, size//2, size-pad), fill=MINERAL, width=width)
    d.line((size//2, size-pad, size//2, pad), fill=MINERAL, width=width)
    d.line((size//2, pad, size-pad, size*0.58), fill=CORAL, width=width)
    d.line((size-pad, size*0.58, size-pad, pad), fill=CORAL, width=width)
    return img


def cover_image(size: tuple[int,int], wide=False) -> Image.Image:
    w, h = size
    art = render_frame(w, h, 0.67).filter(ImageFilter.GaussianBlur(0.3))
    overlay = Image.new("RGBA", size, (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    od.rectangle((0,0,w,h), fill=(16,19,26,72))
    od.rectangle((0,0,int(w*0.52),h), fill=(16,19,26,112))
    art = Image.alpha_composite(art.convert("RGBA"), overlay)
    d = ImageDraw.Draw(art)
    margin = int(w*0.065)
    logo = draw_monogram(max(70,int(w*0.075))).resize((max(70,int(w*0.075)),)*2)
    art.paste(logo, (margin, margin))
    title_font = font(max(74, int(w*0.082)), True)
    body_font = font(max(24, int(w*0.022)))
    line1 = "NAMAY"
    line2 = "PRAKASH"
    y = int(h*0.44)
    d.text((margin,y), line1, font=title_font, fill=MINERAL, stroke_width=0)
    d.text((margin,y+int(w*0.074)), line2, font=title_font, fill=MINERAL, stroke_width=0)
    d.line((margin, y+int(w*0.165), margin+int(w*0.23), y+int(w*0.165)), fill=CORAL, width=max(5,int(w*0.006)))
    d.text((margin, y+int(w*0.185)), "YouTube thumbnail design portfolio", font=body_font, fill=SLATE)
    return art.convert("RGB")


def write_brand_assets():
    monogram_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#10131A"/><path d="M22 78V22l28 56V22" fill="none" stroke="#F3F0EA" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 78V22h14a18 18 0 0 1 0 36H50" fill="none" stroke="#E05D52" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>"""
    (BRAND / "frame-current-mark.svg").write_text(monogram_svg)
    (BRAND / "namay-prakash-mark.svg").write_text(monogram_svg)
    (PUBLIC / "favicon.svg").write_text(monogram_svg)
    for size, name in [(16,"favicon-16.png"),(32,"favicon-32.png"),(180,"apple-touch-icon.png"),(192,"icon-192.png"),(512,"icon-512.png"),(512,"icon-maskable-512.png")]:
        image = draw_monogram(size)
        if "maskable" in name:
            canvas = Image.new("RGB", (size,size), INK)
            reduced = image.resize((int(size*.8),int(size*.8)))
            canvas.paste(reduced,(int(size*.1),int(size*.1)))
            image = canvas
        image.save(PUBLIC / name)
    draw_monogram(64).save(PUBLIC / "favicon.ico", sizes=[(16,16),(32,32),(64,64)])

    icon_svgs = {
        "concept.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="9" y="13" width="46" height="34" rx="8" fill="none" stroke="#F3F0EA" stroke-width="3"/><path d="M17 23h30M17 31h19" stroke="#E05D52" stroke-width="3" stroke-linecap="round"/></svg>',
        "composition.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 22V10h12M42 10h12v12M54 42v12H42M22 54H10V42" fill="none" stroke="#F3F0EA" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="8" fill="none" stroke="#E05D52" stroke-width="3"/></svg>',
        "iteration.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M48 22a19 19 0 0 0-31-4l-5 5M16 42a19 19 0 0 0 31 4l5-5" fill="none" stroke="#F3F0EA" stroke-width="3" stroke-linecap="round"/><path d="M12 12v11h11M52 52V41H41" fill="none" stroke="#E05D52" stroke-width="3" stroke-linecap="round"/></svg>',
    }
    for name, svg in icon_svgs.items():
        (ICONS / name).write_text(svg)

    manifest = """{
  "name": "Namay Prakash",
  "short_name": "Namay",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#10131A",
  "theme_color": "#10131A",
  "icons": [
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
"""
    (PUBLIC / "site.webmanifest").write_text(manifest)

    render_frame(1600,900,0.56).save(PLATES / "liquid-field.png", quality=92)
    grid = Image.new("RGB",(1600,900),INK)
    gd = ImageDraw.Draw(grid)
    for x in range(0,1600,80):
        gd.line((x,0,x,900),fill=(38,43,54),width=1)
    for y in range(0,900,80):
        gd.line((0,y,1600,y),fill=(38,43,54),width=1)
    gd.line((0,450,1600,450),fill=CORAL,width=2)
    grid.save(PLATES / "precision-grid.png", quality=92)

    cover_image((1500,1000)).save(BRAND / "frame-current-cover.png", quality=94)
    cover_image((1200,630), True).save(BRAND / "frame-current-og.png", quality=94)
    cover_image((1200,630), True).save(BRAND / "frame-current-og-wide.png", quality=94)


if __name__ == "__main__":
    render_film()
    write_brand_assets()
    print("Namay Prakash assets generated.")
