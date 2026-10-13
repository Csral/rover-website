import { isUnpicCompatible, unpicOptimizer, astroAssetsOptimizer } from './images-optimization';
import type { ImageMetadata } from 'astro';
import type { OpenGraph } from '@astrolib/seo';
import type { ImagesOptimizer } from './images-optimization';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '~/assets/images/**/*.{jpeg,jpg,png,tiff,webp,gif,svg,JPEG,JPG,PNG,TIFF,WEBP,GIF,SVG}'
);
const imageCache = new Map<string, Promise<ImageMetadata>>();

/** */
export const findImage = async (
  imagePath?: string | ImageMetadata | null
): Promise<string | ImageMetadata | undefined | null> => {
  // Not string
  if (typeof imagePath !== 'string') {
    return imagePath;
  }

  // Absolute paths
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
    return imagePath;
  }

  // Relative paths or not "~/assets/"
  if (!imagePath.startsWith('~/assets/images')) {
    return imagePath;
  }

  const key = imagePath.replace('~/', '/src/');
  const load = images[key];
  if (!load) return null;
  if (!imageCache.has(key))
    imageCache.set(
      key,
      load().then((module) => module.default)
    );
  return imageCache.get(key)!;
};

/** */
export const adaptOpenGraphImages = async (openGraph: OpenGraph = {}, astroSite?: URL): Promise<OpenGraph> => {
  if (!openGraph?.images?.length) {
    return openGraph;
  }

  const images = openGraph.images;
  const defaultWidth = 1200;
  const defaultHeight = 626;

  const adaptedImages = await Promise.all(
    images.map(async (image) => {
      if (image?.url) {
        const resolvedImage = (await findImage(image.url)) as ImageMetadata | string | undefined;
        if (!resolvedImage) {
          return {
            url: '',
          };
        }

        if (
          typeof resolvedImage === 'string' &&
          /^https?:\/\//.test(resolvedImage) &&
          !isUnpicCompatible(resolvedImage)
        ) {
          return { ...image, url: resolvedImage };
        }
        let _image: Awaited<ReturnType<ImagesOptimizer>>[number] | undefined;

        if (
          typeof resolvedImage === 'string' &&
          (resolvedImage.startsWith('http://') || resolvedImage.startsWith('https://')) &&
          isUnpicCompatible(resolvedImage)
        ) {
          _image = (await unpicOptimizer(resolvedImage, [defaultWidth], defaultWidth, defaultHeight, 'jpg'))[0];
        } else if (resolvedImage) {
          const dimensions =
            typeof resolvedImage !== 'string' && resolvedImage?.width <= defaultWidth
              ? [resolvedImage?.width, resolvedImage?.height]
              : [defaultWidth, defaultHeight];
          _image = (await astroAssetsOptimizer(resolvedImage, [dimensions[0]], dimensions[0], dimensions[1], 'jpg'))[0];
        }

        if (typeof _image === 'object') {
          return {
            url: astroSite ? String(new URL(_image.src, astroSite)) : _image.src,
            width: 'width' in _image && typeof _image.width === 'number' ? _image.width : undefined,
            height: 'height' in _image && typeof _image.height === 'number' ? _image.height : undefined,
          };
        }
        return {
          url: '',
        };
      }

      return {
        url: '',
      };
    })
  );

  return { ...openGraph, images: adaptedImages.filter((image) => image.url) };
};
