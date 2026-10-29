/**
 * PostCSS plugin: expands every `inset` declaration into `top`, `right`,
 * `bottom` and `left`, because iOS Safari before 14.1 ignores the shorthand
 * and esbuild's CSS target leaves `inset: auto` as it is.
 * Implements FR12 of support-legacy-ios-12-safari (D7).
 */
const INSET_PROPERTY = "inset";
const SIDE_PROPERTIES = ["top", "right", "bottom", "left"];
// Index of the value for [top, right, bottom, left], by number of values given.
const SIDE_VALUE_INDEXES = {
  1: [0, 0, 0, 0],
  2: [0, 1, 0, 1],
  3: [0, 1, 2, 1],
  4: [0, 1, 2, 3],
};

/** Splits a value on spaces outside parentheses, so `calc(1px + 2px)` stays whole. */
export function splitTopLevelValues(value) {
  const values = [];
  let depth = 0;
  let current = "";
  for (const character of value.trim()) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (/\s/.test(character) && depth === 0) {
      if (current !== "") values.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  if (current !== "") values.push(current);
  return values;
}

export function expandInsetShorthand() {
  return {
    postcssPlugin: "time-zones-expand-inset-shorthand",
    Declaration(declaration) {
      if (declaration.prop !== INSET_PROPERTY) return;
      const values = splitTopLevelValues(declaration.value);
      const valueIndexes = SIDE_VALUE_INDEXES[values.length];
      if (valueIndexes === undefined) return;
      SIDE_PROPERTIES.forEach((sideProperty, sideIndex) => {
        declaration.cloneBefore({
          prop: sideProperty,
          value: values[valueIndexes[sideIndex]],
        });
      });
      declaration.remove();
    },
  };
}
expandInsetShorthand.postcss = true;
