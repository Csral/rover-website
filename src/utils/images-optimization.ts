import { getImage } from 'astro:assets';
import { transformUrl, parseUrl } from 'unpic';

import type { ImageMetadata } from 'astro';
import type { HTMLAttributes } from 'astro/types';

type Layout = 'fixed' | 'constrained' | 'fullWidth' | 'cover' | 'responsive' | 'contained';

export interface ImageProps extends Omit<HTMLAttributes<'img'>, 'src'> {
  src?: string | ImageMetadata | null;
  width?: string | number | null;
  height?: string | number | null;
  alt?: string | null;
  loading?: 'eager' | 'lazy' | null;
  decoding?: 'sync' | 'async' | 'auto' | null;
  style?: string;
  srcset?: string | null;
  sizes?: string | null;
  fetchpriority?: 'high' | 'low' | 'auto' | null;

  layout?: Layout;
  widths?: number[] | null;
  aspectRatio?: string | number | null;
  objectPosition?: string;

  format?: string;
}

export type ImagesOptimizer = (
  image: ImageMetadata | string,
  breakpoints: number[],
  width?: number,
  height?: number,
  format?: string
) => Promise<Array<{ src: string; width: number; height?: number }>>;

/* ******* */
const config = {
  deviceSizes: [320, 480, 640, 960, 1280, 1600, 1920],
};

const computeHeight = (width: number, aspectRatio: number) => {
  return Math.max(1, Math.round(width / aspectRatio));
};

const parseAspectRatio = (aspectRatio: number | string | null | undefined): number | undefined => {
  if (typeof aspectRatio === 'number') return Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : undefined;

  if (typeof aspectRatio === 'string') {
    const match = aspectRatio.match(/^\s*(\d*\.?\d+)\s*[/:]\s*(\d*\.?\d+)\s*$/);

    if (match) {
      const [, num, den] = match.map(Number);
      if (den > 0 && num > 0) return num / den;
    } else {
      const numericValue = Number(aspectRatio);
      if (Number.isFinite(numericValue) && numericValue > 0) return numericValue;
    }
  }

  return undefined;
};

/**
 * Gets the `sizes` attribute for an image, based on the layout and width
 */
export const getSizes = (width?: number, layout?: Layout): string | undefined => {
  if (!width || !layout) {
    return undefined;
  }
  switch (layout) {
    // If screen is wider than the max size, image width is the max size,
    // otherwise it's the width of the screen
    case `constrained`:
      return `(min-width: ${width}px) ${width}px, 100vw`;

    // Image is always the same width, whatever the size of the screen
    case `fixed`:
      return `${width}px`;

    // Image is always the width of the screen
    case `fullWidth`:
      return `100vw`;

    default:
      return undefined;
  }
};

const pixelate = (value?: number) => (value || value === 0 ? `${value}px` : undefined);

const getStyle = ({
  width,
  height,
  aspectRatio,
  layout,
  objectFit = 'cover',
  objectPosition = 'center',
  background,
}: {
  width?: number;
  height?: number;
  aspectRatio?: number;
  objectFit?: string;
  objectPosition?: string;
  layout?: string;
  background?: string;
}) => {
  const styleEntries: Array<[prop: string, value: string | undefined]> = [
    ['object-fit', objectFit],
    ['object-position', objectPosition],
  ];

  // If background is a URL, set it to cover the image and not repeat
  if (background?.startsWith('https:') || background?.startsWith('http:') || background?.startsWith('data:')) {
    styleEntries.push(['background-image', `url(${background})`]);
    styleEntries.push(['background-size', 'cover']);
    styleEntries.push(['background-repeat', 'no-repeat']);
  } else {
    styleEntries.push(['background', background]);
  }
  if (layout === 'fixed') {
    styleEntries.push(['width', pixelate(width)]);
    styleEntries.push(['height', pixelate(height)]);
    styleEntries.push(['object-position', 'top left']);
  }
  if (layout === 'constrained') {
    styleEntries.push(['max-width', pixelate(width)]);
    styleEntries.push(['max-height', pixelate(height)]);
    styleEntries.push(['aspect-ratio', aspectRatio ? `${aspectRatio}` : undefined]);
    styleEntries.push(['width', '100%']);
  }
  if (layout === 'fullWidth') {
    styleEntries.push(['width', '100%']);
    styleEntries.push(['aspect-ratio', aspectRatio ? `${aspectRatio}` : undefined]);
    styleEntries.push(['height', pixelate(height)]);
  }
  if (layout === 'responsive') {
    styleEntries.push(['width', '100%']);
    styleEntries.push(['height', 'auto']);
    styleEntries.push(['aspect-ratio', aspectRatio ? `${aspectRatio}` : undefined]);
  }
  if (layout === 'contained') {
    styleEntries.push(['max-width', '100%']);
    styleEntries.push(['max-height', '100%']);
    styleEntries.push(['object-fit', 'contain']);
    styleEntries.push(['aspect-ratio', aspectRatio ? `${aspectRatio}` : undefined]);
  }
  if (layout === 'cover') {
    styleEntries.push(['max-width', '100%']);
    styleEntries.push(['max-height', '100%']);
  }

  const styles = Object.fromEntries(styleEntries.filter(([, value]) => value));

  return Object.entries(styles)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
};

const getBreakpoints = ({
  width,
  breakpoints,
  layout,
}: {
  width?: number;
  breakpoints?: number[];
  layout: Layout;
}): number[] => {
  if (layout === 'fullWidth' || layout === 'cover' || layout === 'responsive' || layout === 'contained') {
    return breakpoints || config.deviceSizes;
  }
  if (!width) {
    return [];
  }
  const doubleWidth = width * 2;
  if (layout === 'fixed') {
    return [width, doubleWidth];
  }
  if (layout === 'constrained') {
    return [
      // Always include the image at 1x and 2x the specified width
      width,
      doubleWidth,
      // Filter out any resolutions that are larger than the double-res image
      ...(breakpoints || config.deviceSizes).filter((w) => w < doubleWidth),
    ];
  }

  return [];
};

/* ** */
export const astroAssetsOptimizer: ImagesOptimizer = async (
  image,
  breakpoints,
  _width,
  _height,
  format = undefined
) => {
  if (!image) {
    return [];
  }

  return Promise.all(
    breakpoints.map(async (w: number) => {
      const height = _width && _height ? Math.max(1, Math.round((w * _height) / _width)) : undefined;
      if (typeof image === 'string' && !/^https?:\/\//.test(image)) return { src: image, width: w, height };
      const result = await getImage({
        src: image,
        width: w,
        ...(height ? { height, fit: 'cover' as const } : {}),
        inferSize: true,
        ...(format ? { format } : {}),
      });

      return {
        src: result?.src,
        width: result?.attributes?.width ?? w,
        height: result?.attributes?.height,
      };
    })
  );
};

export const isUnpicCompatible = (image: string) => {
  return typeof parseUrl(image) !== 'undefined';
};

/* ** */
export const unpicOptimizer: ImagesOptimizer = async (image, breakpoints, width, height, format = undefined) => {
  if (!image || typeof image !== 'string') {
    return [];
  }

  const urlParsed = parseUrl(image);
  if (!urlParsed) {
    return [];
  }

  return Promise.all(
    breakpoints.map(async (w: number) => {
      const _height = width && height ? computeHeight(w, width / height) : height;
      const url =
        transformUrl({
          url: image,
          width: w,
          height: _height,
          cdn: urlParsed.cdn,
          ...(format ? { format: format } : {}),
        }) || image;
      return {
        src: String(url),
        width: w,
        height: _height,
      };
    })
  );
};

/* ** */
export async function getImagesOptimized(
  image: ImageMetadata | string,
  {
    src: _,
    width,
    height,
    sizes,
    aspectRatio,
    objectPosition,
    widths,
    layout = 'constrained',
    style = '',
    format,
    ...rest
  }: ImageProps,
  transform: ImagesOptimizer = () => Promise.resolve([])
): Promise<{ src: string; attributes: HTMLAttributes<'img'> }> {
  width = Number(width) > 0 && Number.isFinite(Number(width)) ? Number(width) : undefined;
  height = Number(height) > 0 && Number.isFinite(Number(height)) ? Number(height) : undefined;
  aspectRatio = parseAspectRatio(aspectRatio);
  if (typeof image !== 'string') {
    width ||= image.width;
    if (!height && !aspectRatio) height = width ? computeHeight(width, image.width / image.height) : undefined;
  }

  widths ||= config.deviceSizes;
  sizes ||= getSizes(Number(width) || undefined, layout);

  // Calculate dimensions from aspect ratio
  if (aspectRatio) {
    if (width) {
      if (height) {
        /* empty */
      } else {
        height = width / aspectRatio;
      }
    } else if (height) {
      width = Number(height * aspectRatio);
    } else if (layout !== 'fullWidth') {
      // Fullwidth images have 100% width, so aspectRatio is applicable
      console.error('When aspectRatio is set, either width or height must also be set');
      console.error('Image', image);
    }
  } else if (width && height) {
    aspectRatio = width / height;
  } else if (layout !== 'fullWidth') {
    // Fullwidth images don't need dimensions
    console.error('Either aspectRatio or both width and height must be set');
    console.error('Image', image);
  }

  let breakpoints = getBreakpoints({ width: width, breakpoints: widths, layout: layout });
  breakpoints = [
    ...new Set(
      breakpoints
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) =>
          Math.max(
            1,
            Math.round(
              typeof image === 'string'
                ? value
                : Math.min(value, image.width, height && width ? (image.height * width) / height : image.width)
            )
          )
        )
    ),
  ].sort((a, b) => a - b);

  const transformed = await transform(
    image,
    breakpoints,
    Number(width) || undefined,
    Number(height) || undefined,
    format
  );
  const srcset = transformed.map(({ src, width }) => `${src} ${width}w`).join(', ');

  return {
    src:
      (transformed.find((entry) => entry.width >= Number(width || 0)) || transformed.at(-1))?.src ||
      (typeof image === 'string' ? image : image.src),
    attributes: {
      width: width,
      height: height,
      srcset: srcset || undefined,
      sizes: sizes,
      style: `${getStyle({
        width: width,
        height: height,
        aspectRatio: aspectRatio,
        objectPosition: objectPosition,
        layout: layout,
      })}${style ?? ''}`,
      ...rest,
    },
  };
}
