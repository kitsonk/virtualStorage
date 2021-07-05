import { assert } from "https://deno.land/x/std@0.100.0/testing/asserts.ts";

import { getLocalStorageManager, getSessionStorageManager } from "./mod.ts";

Deno.test({
  name: "basic",
  fn() {
    assert(getLocalStorageManager());
    assert(getSessionStorageManager());
  },
});
