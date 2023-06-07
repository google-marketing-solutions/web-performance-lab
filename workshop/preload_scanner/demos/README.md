# Preload Scanner Examples

## Reference Example

[reference.html](reference.html) showcases the usage of the preload scanner to efficiently load multiple resources in parallel.
It demonstrates the benefits of using preload and prefetch techniques to optimize page performance.

## Lazy Loading Image Example

[lazy_loading_image.html](lazy_loading_image.html) demonstrates the behavior of lazy loading images in relation to the preload scanner.
It shows that lazy-loaded images are not pre-loaded in parallel and highlights the trade-off between lazy loading and pre-loading techniques.

## Injecting Image Example

[inject_image.html](inject_image.html) illustrates the impact of dynamically injecting elements, like images via JavaScript, on the preload scanner.
It reveals that dynamically injected images are not detected by the preload scanner and are not pre-loaded in parallel with other resources.

## Further Reading

- [Preload Scanner Documentation](https://web.dev/preload-scanner/)
