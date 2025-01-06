// src/@types/crypto-js.d.ts を更新
declare module 'crypto-js' {
  interface WordArray {
    words: number[];
    sigBytes: number;
    toString(encoder?: unknown): string;
  }
  
  interface HashStatic {
    (message: string | WordArray): WordArray;
  }

  export const SHA256: HashStatic;
}