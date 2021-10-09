<h1 align="center">
  Catamaran
</h1>

<h3 align="center">
  :sailboat: Service Architecture Integration Layer :sailboat:
</h3>

```
He that is once at sea, must either sail or sink.
             ____
              ---|
  \/            /|     \/
               / |\
              /  | \        \/
             /   || \
            /    | | \
           /     | |  \
          /      | |   \
         /       ||     \
        /        /       \
       /________/         \
       ________/__________--/
 ~~~   \___________________/
         ~~~~~~~~~~       ~~~~~~~~
~~~~~~~~~~~~~     ~~~~~~~~~
                               ~~~~~~~~~
```

Catamaran is a high-level framework for microservices, with the goal of making it easier to write better software faster. Software that is easy to write, test and maintain.

## Features

* **TypeScript from the ground up.** Catamaran is written in TypeScript and facilitates the use of TypeScript throughout.
* **IoC container inside.** By wrapping [Inversify](https://inversify.io/), Catamaran provides an IoC container for your service, making things like Dependency Injection as easy as ever.
* **Configuration support.** Building on [konvenient](https://github.com/battila7/konvenient), SAIL lets you create services which are easily and transparently configurable via environment variables and configuration files.
* **Decorator-based.** Just write simple TypeScript classes, interfaces and methods, and then decorate them with the appropriate Catamaran decorators. No manual wiring needed, everything is taken care of by the framework.
* **External service calls made visible.** Make external service dependencies visible, typable and mockable using Catamaran's `@ExternalService()` decorator. Say goodbye to messy, impossible-to-test remote calls!
* **Code reuse and modularity.** Want to create reusable components across services? Want to split a service into smaller units? Code reuse and modularity is explicitly supported and facilitated by Catamaran via so-called modules.

## Quickstart

**TODO:**
~~~~
npm init @catamaran/app
~~~~

## Learn More

If you want to write your own Catamaran services, then make sure to check out

TODO:
* [the documentation aka The Handbook](docs/README.md),
* [the examples](packages/examples).
