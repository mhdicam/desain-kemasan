# AGENT INSTRUCTION — Master Dieline V6 → Mesh Assembly V7

Role: Senior CAD Engineer + Computational Geometry Engineer + Blender Cloth Technical Artist + Three.js / React Three Fiber Engineer.

## Inputs
1. The existing application repository.
2. Extracted `Master Dieline Library V6` (original SVG, DXF, apparel `.pattern.json`).
3. This V7 package: `MASTER-MESH-ASSEMBLY-MANIFEST.json`, `models/**`, `qa/**`, and `schemas/ASSEMBLY-MODEL.schema.json`.

## Non-negotiable requirements
- Identify each model by the composite `identity.modelKey`, NOT by duplicate display codes (e.g., `CUP`, `LBL`, `TBL` appear in different categories).
- Load V6 source SVG using exact relative paths and preserve real millimetre coordinates.
- Combine V6 measured polygons with the proposed `panels` and `creaseSemanticRegistry` from V7; **do not treat rectangular `svg_region_mm` bounding boxes as accurate panel cut polygons**. Trace true panel regions by splitting actual CUT path along matching CREASE boundaries, including narrow relief cuts, holes and curved edges.
- `hinges[*].creaseRef` gives an exact line ID in that model's source SVG. This only verifies the line exists, not whether the semantic parent, rotation sign, or target belongs to it.
- `proposedFoldDeg` and `foldStyle` are review candidates, not official manufacturing folds. Configure a print-side-aware signed axis and recalculate angles if 3D closure demands it. Never silently invert direction; record change with reason.
- Require approval of parent/child hinge assignment, panel printable outside, glue/tab target, collision clearance, final pose, and assembly order before moving from `PROPOSED` to `GEOMETRY_QA_PASSED`.
- Handle rolled/formed bodies (tube, tapered cup), flexible film (pouch), and cloth (apparel) with different deformation solvers. Do not animate these as hard 90° cartons.
- Model independent pieces as separate mesh nodes. Use physically distinct lid/base/disc/tray. Do not create fake connecting hinges for detached components.
- Apply artwork using 2D sheet-to-3D UV correspondence and separate inside/outside material with realistic thickness. No mirroring of front hero surface.
- Generate named mesh nodes and optional animation states: flat/exploded/half-open/assembled, when appropriate. Open-top food trays and cups must remain open by default.
- Export GLB/GLTF in metres. Reimport the exported GLB and verify bounding volume, normals, UVs and geometry.
- Preserve all `manufacturerApproved: false` and `physicalPrototypeTested: false` statuses. Software QA alone cannot promote these.

## Exact engineering work stages

### Wave 0 — Source and topology audit (mandatory)
1. Verify 92 catalog IDs and 27 structural + 9 apparel breakdown.
2. Produce an interactive inspector overlaying actual source CUT, CREASE, SEAL/GLUE polygons, proposed semantic panel boundaries, and line indexes.
3. For every structural model, show every `creaseSemanticRegistry` entry with one of `MAPPED_CANDIDATE`, `NONFOLD_CANDIDATE`, `NEEDS_ROLE_REVIEW`.
4. Allow manual editing of panel polygon, adjacent hinges, `parentPanel`, `childPanel`, hinge axis **direction**, mountain/valley, target angle, and glue/seal mating region.
5. Persist operator corrections in separate versioned `*.assembly.approved.json` so future V6 refresh does not overwrite them.

### Wave 1 — Complete reference prototypes
Implement three representative models, with actual source-geometry-based algorithms:
- `packaging:rte` reverse tuck end: 4 longitudinal walls, glue seam, top/bottom tongue and dust flaps. Expose flat, tube, half-closed, closed states.
- `packaging:shipping-box` regular slotted corrugated shipping box: 4 walls, major/minor flaps, seam, closure.
- `packaging:paper-cup-packaging`: annular sector rolled to frustum, independent circular base insert; rim remains a preview unless vendor tooling specified.

Each prototype must have traceable 2D panel polygons, signed hinge axes (where applicable), editable dimensions, UV/artwork projection, GLB output, collision report, topology report, import/export round trip test.

### Wave 2 — Structural special mechanisms
Extend model-by-model according to assemblyMechanism in JSON:
- Auto-lock bottom: staged pre-glue of crash wings; solve interlocking kinematics and reject incorrect bottom tuck substitution.
- Mailer/Pizza: parallel crease folded double walls, internal lip/lock tabs, exact tab and slot path, collision tests.
- Burger clamshell: independent lid and tray surfaces linked by rear hinge bridge; front latch; lid curvature.
- Rigid boxes: multiple components with independent transforms and sliding/magnetic closures.
- Circular cup/tub/sleeve: frustum/cylindrical rolling, real radius top/bottom. Never rotate radial seam line at 90°.
- Flexible pouches: W-gusset is material deformation; heat sealed edges, zipper/spout/valve require vendor geometry.

### Wave 3 — Apparel (V6)
For 9 apparel `models/apparel/*.assembly.json`, build garment sewing pattern renderer and cloth pipeline. Use `cutContourLocalMm`, `sewLineContourLocalMm`, `sheetOffsetMm`, `cutCount`, `seamAllowanceMm`, sewing-graph edges, texture print zones. Graph edges indicate candidate sewing relationships but **do not yet specify edge-vertex intervals or confirm matching lengths**. Provide a seam-edge annotation UI and reject auto-sewing until edge mapping is approved. Generate hoodie prototype with genuine hood/pocket/cuff meshes and fabric drape; then extend to other apparel.

### Wave 4 — 56 remaining nonstructural entries
- Flat prints: exact planar substrate, sensible thickness, print side and trim/kiss cut; no fake folded volume.
- Gadget + merchandise: require precise vendor reference GLB/OBJ/STEP or detailed parametric dimension specifications; no generic cube fallback.
- Display structures: require frame/support hardware and panel dimensions; reference artwork rectangles are **not** structural engineering files.
- Custom uploads: validate and transform source assets, no assumption of availability.

## QA/acceptance gates
- No visual collision, reversed exterior face, misaligned UVs, detached intended folds, or unclosed major seam.
- Every hinge `creaseRef` exists and is actually geometrically adjacent to both parent and child polygon boundaries.
- Each independent component is tagged as such; no fake hinge to unattached pieces.
- All scored lines either have an approved semantic action or an explicit non-fold annotation; never drop unmatched lines without warning.
- Accurate measured physical sizes, accounting for board caliper and vendor fold compensation.
- Export GLB can be reopened and keeps correct meter scale, all named nodes, UVs/materials.
- Mark candidate preview `PROTOTYPE_ONLY` until mechanical physical sample and sign-off.

## Completion rule
Do not stop after a UI mock or planning document. Provide functioning editor, mesh generator, GLB exporter, unit/integration tests, QA output, one fully tested mesh per Wave 1 model. If ambiguity prevents a credible mesh, return an explicit actionable failure (`NEEDS_SEMANTIC_REVIEW`) and show the problematic panel or crease.
