# Rubik's cube colour dataset

This is a hand-labelled image dataset for evaluating sticker colour recognition (RGB, HSV, CIELAB) on a 3x3 Rubik's cube (the original one) under different lighting.

The dataset contains: 

- 6 scrambles (s1–s6)
- 6 face photos per scramble (f1–f6) - one per side of the cube
- 3 lighting conditions - daylight, warm and cool / neutral white light
- 108 photos in total (6 × 6 × 3) and 324 labelled stickers per lighting condition (972 in total)

## Scrambles

Each scramble was generated with [scramble.cubing.net](https://scramble.cubing.net)

The move sequences generated from the website were applied to a solved cube held with **white on top and green in front**.

| Scramble | Moves |
|---|---|
| s1 | `D2 L' U' L2 D R' B R' U2 F2 U2 R' U2 R' U2 L F2 U2 F2 D` |
| s2 | `R F U2 D' F2 U L F B U D' R2 U R2 F2 U L2 U' R2 U R2` |
| s3 | `U' F2 U2 F U' F R L F U F2 B2 D' B2 U' D2 L2 D B2 U F2` |
| s4 | `R' B' R D2 R2 B2 L2 B' D2 F2 D2 B' R D' U F U B R'` |
| s5 | `B D' L2 F' D2 R2 B2 R' F2 U F2 U2 R2 L2 U L2 D B2 R2 B2` |
| s6 | `B2 D B2 R' U R L' F' D B2 D' B2 R2 B2 R2 D R2 U F2 L2 B` |

The same physical cube state was photographed once per lighting condition. Every scramble/face has exactly one set of true colours that applies to the daylight, warm and cool versions of that photo.

## Photos

File name pattern: `s<scramble>_f<face>_<lighting>.jpg`, e.g. `s3_f2_warm.jpg` is face `f2` of scramble `s3` under warm light.

Lighting conditions:

| Name | Description |
|---|---|
| daylight | Natural daylight |
| warm | Warm, yellowish light - 3000K |
| cool | Cool / neutral white light - aproximatelly 5000-6000 K |

The photos were taken using Samsung Galaxy S22 Ultra phone. PRO mode was used to negate the automatic color correction when taking the photos. No additional filters or color correction was applied. 

## Labels (labels.csv)

The file contains one row per face photo (36 rows), which includes the true sticker colours. This is the ground truth for the evaluation. Because the cube state is identical in all three lighting conditions, the same row applies to all three photos.

| Column | Meaning |
|---|---|
| scramble | s1–s6 |
| face | f1–f6 |
| p1...p9 | Colour of each sticker - read left to right, top to bottom in the photo |
| colors | p1-p9 joined into one string |

Sticker positions in a photo:

```
p1 p2 p3
p4 p5 p6
p7 p8 p9
```

Colour codes: `W` white, `Y` yellow, `R` red, `O` orange, `G` green, `B` blue.