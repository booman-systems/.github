declare module 'heic-convert' {
  interface HeicConvertOptions {
    buffer: ArrayBuffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  }
  export default function heicConvert(options: HeicConvertOptions): Promise<Buffer>;
}
