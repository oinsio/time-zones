import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { expandInsetShorthand } from "./scripts/legacyCss/expandInsetShorthand.mjs";

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    // Safari before 14.1 ignores `inset` (FR12 of support-legacy-ios-12-safari).
    expandInsetShorthand(),
  ],
};
