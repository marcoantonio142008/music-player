declare module "jsmediatags" {
  interface Tag {
    title?: string;
    artist?: string;
    album?: string;
    picture?: {
      format: string;
      data: number[];
    };
    [key: string]: any;
  }

  interface TagReader {
    read(file: File, callbacks: {
      onSuccess: (tag: { tags: Tag }) => void;
      onError: (error: any) => void;
    }): void;
  }

  const jsmediatags: TagReader;
  export default jsmediatags;
}

declare module "jsmediatags/build2/jsmediatags" {
  const jsmediatags: any;
  export default jsmediatags;
}

declare module "jsmediatags/build2/BlobFileReader" {
  const BlobFileReader: any;
  export default BlobFileReader;
}

declare module "jsmediatags/build2/XhrFileReader" {
  const XhrFileReader: any;
  export default XhrFileReader;
}
