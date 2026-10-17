/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_SUPPORT_URL?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __AYSED_ALLOW_PROD_WRITES__: boolean;
declare const __SENTRY_DSN__: string;
declare const __AYSED_NODE_ENV__: string;
declare const __AYSED_VERCEL__: string;

declare module 'arabic-persian-reshaper';
declare module 'bidi-js';
