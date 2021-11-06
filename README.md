<h1 align="center">
  Chalupa
</h1>

<h3 align="center">
  :taco: :heart: Barriga llena, corazón contento. | Full belly, happy heart.
</h3>

Chalupa is a high-level framework for microservices, with the goal of making it easier to write better software faster. Software that is easy to write, test and maintain.

## Features

* **TypeScript from the ground up.** Chalupa is written in TypeScript and facilitates the use of TypeScript throughout.
* **Decorator-based.** Just write simple TypeScript classes, interfaces and methods, and then decorate them with the appropriate Chalupa decorators. No manual wiring needed, everything is taken care of by the framework.
* **IoC container inside.** By wrapping [Inversify](https://inversify.io/), Chalupa provides an IoC container for your service, making things like Dependency Injection as easy as ever.
* **External service calls made visible.** Make external service dependencies visible, typable and mockable using Chalupa's `@ExternalService()` decorator. Say goodbye to messy, impossible-to-test remote calls!
* **Code reuse and modularity.** Want to create reusable components across services? Want to split a service into smaller units? Code reuse and modularity is explicitly supported and facilitated by Chalupa via so-called modules.
* **Configuration support.** Building on [konvenient](https://github.com/dwmt/konvenient), Chalupa lets you create services which are easily and transparently configurable via environment variables and configuration files.

## Quickstart

**TODO:**

~~~~
npm init @chalupajs/app
~~~~

## Learn More

**TODO:**

If you want to write your own Chalupa services, then make sure to check out

* [the documentation aka The Chalupa Cookbook](docs/README.md),
* [the examples](packages/examples).
