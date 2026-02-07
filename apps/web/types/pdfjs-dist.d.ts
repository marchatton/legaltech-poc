declare module "pdfjs-dist/build/pdf.mjs" {
  // pdfjs-dist doesn't currently ship TS types for the ESM entrypoint path.
  // We treat it as `any` and cast at the import site where needed.
  const mod: any;
  export = mod;
}

declare module "pdfjs-dist/build/pdf.worker.mjs" {
  const workerSrc: string;
  export default workerSrc;
}

