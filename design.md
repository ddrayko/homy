# Homy — Design System

> Style: **Minimalist Dark / Terminal-Inspired / Monospace UI**
> Fond noir véritable, typographie monospace, accents néon, zéro ombre, zéro arrondi.

---

## Palette Couleurs

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#000000` | Fond page |
| `--surface` | `#000000` | Surfaces (modal, cards) |
| `--border` | `#1e1e1e` | Bordures subtiles |
| `--border-bright` | `#2e2e2e` | Bordures visibles (cards, inputs, boutons) |
| `--text` | `#e0e0e0` | Texte principal |
| `--text-dim` | `#555555` | Texte secondaire, labels, placeholders |
| `--text-muted` | `#333333` | Texte très atténué, hint |
| `--green` | `#4cff72` | Succès / OK / vert néon |
| `--red` | `#ff3a3a` | Erreur / Down / rouge néon |
| `--yellow` | `#ffcc00` | Dégradé / jaune néon |
| `--overlay` | `rgba(0,0,0,0.85)` | Overlay modal |

**Philosophie** : Fond noir pur (`#000`), gris très foncés pour les bordures, texte quasi-blanc, et couleurs néon vives réservées aux indicateurs de statut.

---

## Typographie

```css
--font: 'JetBrains Mono', 'Fira Mono', monospace;
```

Uniquement du **monospace**, pas de fallback sans-serif.

| Élément | Size | Weight | Letter-spacing | Transform |
|---|---|---|---|---|
| Body | 13px | 400 | — | — |
| Status label | 12px | **700** | 0.06em | UPPERCASE |
| Status desc | 10px | 400 | 0.03em | — |
| Empty state h1 | 22px | 400 | 0.06em | UPPERCASE |
| Empty state p | 12px | 400 | 0.04em | — |
| Hint text | 11px | 400 | 0.08em | — |
| Service name | 12px | 400 | — | — |
| Field label | 10px | 400 | 0.1em | UPPERCASE |
| Field input | 13px | 400 | — | — |
| Modal header | 11px | 400 | 0.1em | UPPERCASE |
| Buttons | 12px | 400 | 0.05em | — |

---

## Espacements

Pas de scale formelle. Les valeurs suivent un pas de 2px :

`2px` `4px` `6px` `8px` `10px` `12px` `14px` `16px` `20px` `24px`

Patterns récurrents :
- Padding cards : `16px`
- Gaps grille : `12px`
- Padding inputs : `8px 10px`
- Padding boutons : `7px 16px` ou `8px 20px`
- Padding modal : `16px 20px` (header/footer), `20px` (body)

---

## Bordures & Coins

- **Aucun border-radius** (sauf bouton edit : `4px`)
- **Aucune ombre** (flat design intégral)
- Bordures : `1px solid` — jamais `2px` ou plus

---

## Transitions

| Durée | Usage |
|---|---|
| `0.15s ease` | Hover par défaut (boutons, inputs, cards, delete) |
| `0.2s ease` | Ping bars |
| `0.4s ease` | Statut global (label, dot) |

Toutes les transitions sont sur `border-color`, `color`, `opacity`, `fill`, `stroke`. Pas de `transform`.

---

## Breakpoints & Responsive

- Grille : `grid-template-columns: repeat(auto-fit, 240px)` avec `justify-content: center`
- Modal : `max-width: 95vw` sur petits écrans
- **Aucune media query** — le layout est intrinsèquement responsive

---

## Composants

### Status Banner
- Barre pleine largeur en haut, `border-bottom: 1px solid var(--border)`
- Flex row, gap 12px
- SVG dot (36x36) + label (12px bold uppercase) + desc (10px dim)
- 3 classes : `.all-up` (green), `.some-down` (yellow), `.many-down` (red)
- Bouton edit (pencil SVG) caché par défaut, `margin-left: auto`

### Service Card
- 240px wide, `border: 1px solid var(--border)`
- Padding 16px, flex column, gap 10px
- Icon (20x20, forcé monochrome via `filter: invert(1) grayscale(1); opacity: 0.7`)
- Nom tronqué avec ellipsis
- 10 ping bars en bas (24px height, gap 2px)
- Hover : border → `--border-bright`
- Drag state : `.dragging` (opacity 0.4), `.drag-over` (border → `--text`)

### Ping Bars
- 10 barres verticales, `align-items: flex-end`, `height: 24px`
- `.ok` → vert, hauteur proportionnelle à la latence
- `.down` → rouge, `height: 100%`
- `.empty` → gris, `height: 40%`
- `border-radius: 0`

### Boutons
- Outline : `background: none`, `border: 1px solid var(--border-bright)`
- `.btn-primary` → `border-color: var(--text-dim)`
- Hover → `border-color: var(--text)`

### Formulaires
- Labels : 10px uppercase, letter-spacing 0.1em, `--text-dim`
- Inputs : fond `#000`, `border: 1px solid var(--border-bright)`, 13px
- Focus : `border-color: var(--text-dim)`
- Error (validation) : `border-color: var(--red)`

### Modal
- Overlay fixed, `rgba(0,0,0,0.85)`, flex center
- 420px wide, `max-width: 95vw`, `max-height: 90vh`
- Header/Footer : padding 16px 20px, `border-bottom/top: 1px solid var(--border)`
- Body : padding 20px, overflow-y auto

### Scrollbar
- Width: 4px, track: transparent, thumb: `var(--border-bright)`

### Icon Picker
- Grille 5 colonnes, gap 6px, `max-height: 200px`
- Icônes 24x24 en monochrome (invert + grayscale)
- Nom en 8px sous chaque icône
- `.selected` → `border-color: var(--text)`

---

## Règles Générales

1. **Toujours du monospace** pour tout le texte UI
2. **Fond noir (#000)** — jamais de gris foncé
3. **Zéro ombre portée** — design plat
4. **Zéro border-radius** (sauf exceptions explicites 4px)
5. **Bordures fines (1px)** — jamais épaisses
6. **Icônes toujours en monochrome** — utiliser `filter: invert(1) grayscale(1); opacity: 0.7`
7. **Labels en uppercase** avec letter-spacing large
8. **Couleurs néon réservées au statut** — pas de vert/rouge/jaune pour les CTA
9. **Transitions rapides** (0.15s par défaut)
10. **Pas de dégradés, pas de glassmorphism, pas de neumorphism**
