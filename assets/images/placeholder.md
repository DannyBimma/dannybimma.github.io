# Assets/Images Directory

This directory is for storing image assets used throughout the blog.

## Recommended Image Formats

- **WebP**: For modern browsers (best compression)
- **JPEG**: For photos and complex images
- **PNG**: For images with transparency
- **SVG**: For logos and simple graphics

## Recommended Dimensions

- **Hero Images**: 1200x600px or 1920x1080px
- **Article Images**: 800x400px or 1200x600px
- **Thumbnails**: 300x200px
- **Author Photos**: 200x200px (square)

## Image Optimization Tips

1. Compress images before uploading
2. Use appropriate formats for content type
3. Include `alt` attributes for accessibility
4. Consider using `loading="lazy"` for performance

## Example Usage

```html
<img
  src="assets/images/article-hero.jpg"
  alt="Description of the image"
  loading="lazy"
/>
```

Place your image files directly in this directory and reference them with the path:
`assets/images/your-image-name.ext`
