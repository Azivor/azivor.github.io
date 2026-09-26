from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parents[1]
source = root / 'src/assets/earth-clouds.jpg'
target = root / 'src/assets/earth-clouds-detail.webp'
size = (6144, 3072)
original = Image.open(source).convert('L')
base = original.resize(size, Image.Resampling.LANCZOS)
base = base.filter(ImageFilter.UnsharpMask(radius=2.0, percent=85, threshold=2))
pixels = np.asarray(base, dtype=np.float32)
rng = np.random.default_rng(28471)
detail = np.zeros((size[1], size[0]), dtype=np.float32)
for width, weight in [(384, 28.0), (1024, 19.0), (2048, 11.0), (4096, 5.0)]:
    height = width // 2
    seed = rng.integers(0, 256, (height, width), dtype=np.uint8)
    layer = Image.fromarray(seed, 'L').resize(size, Image.Resampling.BICUBIC)
    detail += (np.asarray(layer, dtype=np.float32) - 127.5) * (weight / 74.0)
    del layer, seed
edge = np.clip((pixels - 13.0) / 65.0, 0.0, 1.0)
detail *= edge
result = np.uint8(np.clip(pixels + detail, 0.0, 255.0))
Image.fromarray(result, 'L').save(target, 'WEBP', quality=87, method=5)
print(f'{target}: {target.stat().st_size / 1024 / 1024:.2f} MiB')
