declare module 'crypto-js' {
  export const SHA256: (message: string) => string;
  export const enc: {
    Utf8: {
      stringify: (wordArray: any) => string;
      parse: (str: string) => any;
    };
  };
  // Add other exports as needed
} 