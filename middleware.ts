// Copyright 2021 Kitson P. Kelly. All rights reserved. MIT License.

import type {
  Context,
  Middleware,
  State,
} from "https://deno.land/x/oak@v7.7.0/mod.ts";

import { getLocalStorageManager } from "./mod.ts";

export interface VirtualStorageMiddlewareOptions {
  /** When storing the keys of the `localStorage` the cookie name to use.
   * Defaults to `VS_KEYS`. */
  keysName?: string;
  /** The prefix to prepend any key names that are serialized.  Defaults to
   * `VS_`. */
  prefix?: string;
}

/** Create a middleware that will use the virtual storage `localStorage`
 * instance to serialize values as cookies and restore any values to the store
 * on a request. */
export function virtualStorage<
  S extends AS = State,
  AS extends State = Record<string, string>,
>(
  options: VirtualStorageMiddlewareOptions = {},
): Middleware<S, Context<S, AS>> {
  const {
    keysName = "VS_KEYS",
    prefix = "VS_",
  } = options;
  const localStore = getLocalStorageManager();
  return async function (ctx, next) {
    const localStorageKeysStr = ctx.cookies.get(keysName);
    if (localStorageKeysStr) {
      try {
        const keys: string[] = JSON.parse(localStorageKeysStr);
        const entries: [string, string][] = [];
        for (const key of keys) {
          const value = ctx.cookies.get(`${prefix}${key}`);
          if (value) {
            entries.push([key, atob(value)]);
          }
          localStore.hydrate(entries);
        }
      } catch {
        // we just swallow errors here
      }
    }
    await next();
    const keys = [...localStore.keys()];
    if (keys.length) {
      const value = JSON.stringify(keys);
      if (value !== localStorageKeysStr) {
        ctx.cookies.set(keysName, JSON.stringify(keys), {
          overwrite: true,
        });
      }
      for (const key of localStore.set()) {
        ctx.cookies.set(
          `${prefix}${key}`,
          btoa(globalThis.localStorage.getItem(key) ?? ""),
          {
            overwrite: true,
          },
        );
      }
    }
    for (const key of localStore.deleted()) {
      ctx.cookies.delete(`${prefix}${key}`, { overwrite: true });
    }
  };
}
