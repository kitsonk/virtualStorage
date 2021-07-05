// Copyright 2021 Kitson P. Kelly. All rights reserved. MIT License.

import { _storage, StorageManager } from "./virtualStorage.ts";

const localManager = new StorageManager();
const sessionManager = new StorageManager();

/** Return the local storage manager. */
export function getLocalStorageManager(): StorageManager {
  return localManager;
}

/** Return the session storage manager. */
export function getSessionStorageManager(): StorageManager {
  return sessionManager;
}

export interface InstallGlobalsOptions {
  /** Install virtual storage as `localStorage`. Defaults to `true`. */
  local?: boolean;
  /** If `true` it will overwrite any existing globals. Defaults to `false`. */
  overwrite?: boolean;
  /** Install virtual storage as `sessionStorage`. Defaults to `true`. */
  session?: boolean;
}

/** Install virtual storage globally. By default this will install a global
 * `localStorage` and `sessionStorage` if they don't already exist in the global
 * scope. This can be changed by passing options. */
export function installGlobals(options: InstallGlobalsOptions = {}): void {
  const { local = true, overwrite = false, session = true } = options;
  if (local) {
    if (!("localStorage" in globalThis) || overwrite) {
      Object.defineProperty(globalThis, "localStorage", {
        value: localManager[_storage],
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
  }
  if (session) {
    if (!("sessionStorage" in globalThis) || overwrite) {
      Object.defineProperty(globalThis, "sessionStorage", {
        value: sessionManager[_storage],
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
  }
}

/** Create a new instance of virtual storage and associated manager, which are
 * returned as a tuple, with the first element being the DOM API storage
 * instance and the second being the API for managing the virtual storage. */
export function createVirtualStorage(): [Storage, StorageManager] {
  const manager = new StorageManager();
  return [manager[_storage], manager];
}
