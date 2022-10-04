# LaTeK

LaTeK is an IDE to write simple LaTeX equations.

### What is LaTeX ?

LaTeX is a markup language (very similar to MathML) used to write mathematics. LaTeX can be compiled to PDF, PNG, GIF or other image format, even MathML.

### What is it for ?

It's simply used to write maths quickly and without having to do any layout. Useful when you want to take notes of your algebra or propositional logic course.

---

## Example :

code LaTeX like this one :

```LaTeX
\sum_{k=1}^n k = \frac{n(n+1)}{2}
```

will be converted to MathML :

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

or as an image :

$$
\sum_{k=1}^n k = \frac{n(n+1)}{2}
$$

---

## Specifications

| technology          |                tool |
|:--------------------|--------------------:|
| Languages           |      JS / HTML / CSS |
| Compiler            |              Node.js |
|                     |       electron-forge |
| Packages            |                  npm |
| Environment         | macOS / Windows 7/10 |
| Libraries           |             electron |
|                     |              console |
|                     |                 path |
|                     |                   fs |

## Installation

To run : `npm run start`.

To compile : `npm run make`.

---

## To do list

 - [x] Manage the position of the IDE and the result (top bottom, left right, etc...). With a table for example

- [ ] Create a preferences manager
  - [ ] Create CSS variables

- [ ] Find a better way to choose LaTeX parameters
  - [ ] Image format during saving
  - [ ] Don't reopen a dialog box when `ctrl+s` and `ctrl+e`

- [ ] Finish the menu management

- [ ] Create a new image for each line (\\)

- [ ] Use another compiler than codecogs, optimal: local

- [ ] Create an artistic version :
  - [ ] IDE in a PC screen
  - [ ] Keyboard whose keys light up when you type them (potentially clickable)
  - [ ] Printer with the compiled image
  - [ ] Book of documentation with LaTeX tools (potentially a small library)

- [ ] All in 3D