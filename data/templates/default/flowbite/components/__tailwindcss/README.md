# Class definitions

## Why do you need to add the class definitions

If you use the class dynamically in the project, the TailwindCSS compiler will not be able to detect it. So you need to add the class definitions

Exmple:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div class="col-span-1 md:col-span-2 lg:col-span-{{ width }}">
    <!-- Content -->
  </div>
</div>
```

the `col-span-{{ width }}` class is dynamic, so you need to add the class definition, just for the TailwindCSS compiler.

```html
<div>
  <div
    class="col-span-1 col-span-2  col-span-3 col-span-4 col-span-5 col-span-6 col-span-7 col-span-8 col-span-9 col-span-10 col-span-11 col-span-12"
  ></div>
  <div
    class="md:col-span-1 md:col-span-2 md:col-span-3 md:col-span-4 md:col-span-5 md:col-span-6 md:col-span-7 md:col-span-8 md:col-span-9 md:col-span-10 md:col-span-11 md:col-span-12"
  ></div>
  <div
    class="lg:col-span-1 lg:col-span-2 lg:col-span-3 lg:col-span-4 lg:col-span-5 lg:col-span-6 lg:col-span-7 lg:col-span-8 lg:col-span-9 lg:col-span-10 lg:col-span-11 lg:col-span-12"
  ></div>
</div>
```
