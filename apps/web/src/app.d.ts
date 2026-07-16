import type { Config } from '@sveltejs/kit';

declare global {
  namespace App {
    interface Locals {}
    interface PageData {}
    interface Error {}
    interface Platform {}
  }
  const config: Config;
}

export {};
