const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "awadini";

interface CloudinaryLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

// Default export required by next.config.js loaderFile
export default function cloudinaryLoader({ src, width, quality }: CloudinaryLoaderParams): string {
  const params = ["f_auto", `q_${quality || "auto"}`, `w_${width}`];
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${params.join(",")}/${src}`;
}

export function getProductImageUrl(cloudinaryId: string, width: number = 800): string {
  return cloudinaryLoader({ src: cloudinaryId, width });
}

export function getBlurDataUrl(cloudinaryId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_10,w_20,e_blur:1000/${cloudinaryId}`;
}
