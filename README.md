# LaTeK

LaTeK est un IDE pour écrire de simples équations en LaTeX.

### Qu'est-ce que c'est quoi dis donc LaTeX ?

LaTeX est un langage de formatage (très semblable à un langage de balisage comme MathML) qui sert à écrire des mathématiques. LaTeX peut se compiler en PDF, PNG, GIF ou autre format d'image, voir même en MathML.

### Et à quoi ça sert ?

Ça sert simplement à écrire des maths de manière rapide et sans avoir à faire de mise en page. Pratique quand l'on veut prendre en note son cours d'algèbre ou de logique propositionnelle.

---

## Exemple :

Du code LaTeX comme celui ci :

```LaTeX
\sum_{k=1}^n k = \frac{n(n+1)}{2}
```

Sera converti en MathML :

```xml
<math display="block">
  <mrow>
    <mrow>
      <munderover>
        <mo movablelimits="false">∑</mo>
        <mrow>
          <mi>k</mi>
          <mo>=</mo>
          <mn>1</mn>
        </mrow>
        <mi>n</mi>
      </munderover>
    </mrow>
    <mi>k</mi>
    <mo>=</mo>
    <mfrac>
      <mrow>
        <mi>n</mi>
        <mo form="prefix" stretchy="false">(</mo>
        <mi>n</mi>
        <mo>+</mo>
        <mn>1</mn>
        <mo form="postfix" stretchy="false">)</mo>
      </mrow>
      <mn>2</mn>
    </mfrac>
  </mrow>
</math>
```

ou en image :

$$
\sum_{k=1}^n k = \frac{n(n+1)}{2}
$$

---

## Spécifications

| technologie        |                outil |
|:-------------------|---------------------:|
| Langages           |      JS / HTML / CSS |
| Compilateur        |              Node.js |
|                    |       electron-forge |
| Packages           |                  npm |
| Environnement      | macOS / Windows 7/10 |
| Librairies         |             electron |
|                    |              console |
|                    |                 path |
|                    |                   fs |
|                    |             latex.js |

---

## Installation

Pour lancer : `npm start`.

Pour compiler : `npm make`.

---

## To do list

- [ ] Gérer la position de l'IDE et du résultat (haut bas, gauche droite, etc...). Avec une table par exemple

- [ ] Créer un gestionnaire de préférences
  - [ ] Créer des variables CSS

- [ ] Trouver un meilleur moyen de choisir les paramètres LaTeX
  - [ ] Format de l'image pendant l'enregistrement
  - [ ] Ne pas rouvrir de boite de dialog quand `ctrl+s` et `ctrl+e`

- [ ] Terminer la gestion du menu

- [ ] Créer une nouvelle image pour chaque ligne (\\)

- [ ] Utiliser un autre compilateur que codecogs, optimal : local

- [ ] Créer une version artistique :
  - [ ] IDE dans un écran de PC
  - [ ] Clavier dont les touches s'allument quand on les tape (potentiellement clickable)
  - [ ] Imprimante avec l'image compilée
  - [ ] Livre de documentation avec des outils LaTeX (potentiellement une petite bibliothèque)

- [ ] Le tout en 3D