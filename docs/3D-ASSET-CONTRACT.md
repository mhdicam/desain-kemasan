# 3D Asset Contract

Native procedural models: rte, ste, mailer, lidbase, drawer, cyl, hex. They continue to use OpenBox3D folding trees and parametric dieline geometry. Additional models require offline assembled GLB assets registered in `public/model-assets/manifest.json`. No SVG pieces are interpreted as 3D sewing/assembly. GLB print surfaces must match manifest `nodeName`, `surfaceId`, `panelId` and calibrated UV. Do not mark prototype or production approved merely because the GLB loads. Dimensions for imported static SVG assets are not parametric. Manufacturing acceptance requires independent QA.

## Live atlas mapping, Phase 2
Artwork surfaces only support `uvMode: "atlas"`. GLB authoring must precompute UVs over the full dieline texture atlas including bleed. Mapping requires `panelId` in the active dieline and `nodeName` in the actual GLB. A missing match is an error, not a fallback. Diffuse artwork and foil-colored appearance use the shared canvas atlas; independent physical PBR finishing masks on GLB are a future step. The runtime performs no automatic UV unwrapping or cloth folding. Validate orientation and seams visually.

## Can Label reference (first GLB)

`can-label` is a **preview-only** assembled aluminum can with its printed label, metal cylindrical body, rims, and caps as separate named meshes. Source dieline `CAN_can-label.svg` has cut rectangle x=18..228 and y=37..152, hence 210 × 115 mm. The label perimeter is assumed to be exactly 210 mm, giving radius ≈33.4225 mm; this is a **preview-derived reference**, not a manufacturer-approved can specification. The printed surface UV uses the current 2D atlas bounds including bleed: [12,31,234,158] mm. Printed surface `label-wrap` maps to dieline panel `front`. Do not mark production ready before visual art register/seam checks.
