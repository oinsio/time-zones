import { createBdd } from "playwright-bdd";
import { test } from "./view_contract_e2e.fixtures";

const { Given } = createBdd(test);

// Verifies D12 of add-locations-via-search: every contract scenario starts on
// the registered view under contract.
Given("the view under contract is shown", async ({ showContractView }) => {
  await showContractView();
});
