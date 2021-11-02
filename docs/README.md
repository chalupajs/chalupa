# The Cruising Catamaranor's Handbook

<div align="center">
  <img height="420" src="./CatamaranHandbookCover.png">
</div>

> Note: We aimed to keep the code snippets in this handbook short and slim. Therefore, they may not contain every detail needed to be compiled and run. Nevertheless, we believe that they are easier to read and comprehend this way.

  * [What is Catamaran?](#what-is-Catamaran)
  * [My First Service](#my-first-service)
  * [Catamaran Packages](#catamaran-packages)
  * [Configuration](#configuration)
    * [Environment Variable Prefix](#environment-variable-prefix)
    * [Loading Configuration Files](#loading-configuration-files)
  * [Logging](#logging)
    * [Switching the Provider](#switching-the-provider)
    * [Configuring Logging](#configuring-logging)
  * [Dependency Injection](#dependency-injection)
    * [Class Binding](#class-binding)
    * [Interface Binding](#interface-binding)
    * [Constant Binding](#constant-binding)
    * [Configuration-dependent Binding](#configuration-dependent-binding)
    * [Injecting Multiple Values of the Same Type](#injecting-multiple-values-of-the-same-type)
    * [Rebinding](#rebinding)
    * [Unbinding](#unbinding)
    * [Wiring Things Up](#wiring-things-up)
    * [Shorthand Notations](#shorthand-notations)
  * [Modules](#modules)
  * [Service Communication](#service-communication)
    * [Inbound Communication](#inbound-communication)
    * [Outbound Communication](#outbound-communication)
    * [Appeared and Disappeared Events](#appeared-and-disappeared-events)
  * [Communication Strategies](#communication-strategies)
    * [Darcon](#darcon)
    * [In-Memory](#in-memory)
    * [Inter-process Communication](#inter-process-communication)
  * [Service Lifecycle](#service-lifecycle)
    * [Timing and Order](#timing-and-order)
  * [Error Handling](#error-handling)
  * [Testing](#testing)
  * [Extending Catamaran](#extending-catamaran)

## What is Catamaran?

Catamaran was written to help developers write better software faster.

> Like the idea of "better software faster"?  Check out Dave Farley's (the co-author of the classic Continuous Delivery book) YouTube channel where he talks about various software engineering topics: [Continuous Delivery on YouTube](https://www.youtube.com/c/ContinuousDelivery/featured).

Concretely, Catamaran is a thin layer of abstraction over a communication machinery with dependency injection, configuration handling and external service management baked in. There is more to this than meets the eye, however, since the greatest benefit of even such a thin layer is a clear guidance regarding the organization of services, enabling:

  * the separation of concerns,
  * modularity and reusability,
  * test-first design.

Thus, how your services work stays the same, but the way you write them is going to be much more fun.

## My First Service

> Here we only show a barebones service for the sake of introduction. If you want to generate a service repository with all the bells and whistles, then use `npm init @catamaranjs/service` or `npx @catamaranjs/create-service`.

Without further ado, let's jump straight into some code, shall we?

~~~~TypeScript
import { Catamaran, InMemoryStrategy } from '@catamaranjs/service'
import { Service } from '@catamaranjs/interface'

/* 1. */
@Service()
class PizzaService {
  /* 2. */
  @ServiceMethod()
  async hello(): string {
    return 'Hello, world!'
  }
}

async function start() {
  /* 3. */
	const service = await Catamaran
    .builder()
    .createServiceWithStrategy(PizzaService, InMemoryStrategy)

  /* 4. */
	await service.start()
}

start().catch(console.error)
~~~~

Above, we have a fully functional Catamaran service, which, while doing nothing useful, when started, will publish itself to an in-memory event bus.

  1. The entrypoint of the service is the `PizzaService` class, decorated with the `@Service` decorator.
  1. Services can expose methods to other services using the `ServiceMethod` decorator. In our case, other services can call the `hello` method on `PizzaService`.
  1. In the `start` function, we create a new Catamaran builder using the `Catamaran.builder()` call. Then, we pass our service class to the `createServiceWithStrategy` function, along with the `InMemoryStrategy`. These two then produce an executable service from our class, that is able to publish itself to the in-memory event buss.
  1. Finally, calling `start` on the produced service actually fires up event handling.

> Catamaran makes heavy use of TypeScript decorators. You can use these resources to learn more about them:
>
>   * [A Practical Guide to TypeScript Decorators](https://blog.logrocket.com/a-practical-guide-to-typescript-decorators/),
>   * [TypeScript Documentation - Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).

So, now we know how to create a service, but what is a service exactly? It is an independent component, communicating with other services via a selected [communication strategy](#communication-strategies), in the above case, the built-in [In-Memory Strategy](#in-memory-strategy). The interface of a service (that is made available to other services) is then comprised by its `ServiceMethods` and `ServiceEvents` (see [Service Communication](#service-communication)).

In our current case, the name of the published service is going to be the name of the class, `PizzaService`. This can be overridden by setting the `name` option of the `@Service` decorator, as follows.

~~~~TypeScript
@Service({
  name: 'Pizza'
})
class PizzaService {}
~~~~

## Configuration

In most cases, our service has some configurable knobs and toggles to alter its behavior. The widely adopted solution to configure these properties is to load their values from environment variables or configuration files. Catamaran supports this by using [konvenient](https://github.com/dwmt/konvenient) as its configuration solution. However, you don't have to install and import konvenient directly, as Catamaran re-exports the declarations of konvenient for your convenience (haha, got 'em!).

> In what follows, we will only scratch the surface of konvenient's capabilities, hence, make sure to check out [its documentation](https://github.com/dwmt/konvenient#--konvenient) for more involved examples and recipes.

Now, let us assume, that we want to save some files into a configurable directory. We can expose this setting via a configuration class as follows.

~~~~TypeScript
import { Configuration, Configurable } from '@catamaranjs/interface'

@Configuration()
class PizzaConfig {
  @Configurable({
    doc: 'The data directory to save files into.',
    format: 'string',
  })
  dataDirectory = '/data/pizza'
}
~~~~

As you can see, this is also done via decorators, in this case, `@Configuration`, which is used to mark a class a configuration class, and `@Configurable` which marks configurable properties.

The `dataDirectory` property has a short documentation string, a format (set to `string`) which is used for validation and a default value if nothing is provided. How to provide a value, then? konvenient automatically computes an environment variable name for configurable properties. The env var for `dataDirectory`, in this case, is `PIZZA_DATA_DIRECTORY`. The `PIZZA_` prefix comes from the name of the configuration class, preceding the `Config` suffix. If we had another property, `timeToBakePizza`, then its env var would be `PIZZA_TIME_TO_BAKE_PIZZA`.

Using configuration values is now a breeze.

~~~~TypeScript
@Service({
  inject: [PizzaConfig]
})
class PizzaService {
  private readonly config: PizzaConfig

  constructor(@Inject(PizzaConfig) config: PizzaConfig) {
    this.config = config
    console.log(this.config.dataDirectory)
  }
}
~~~~

By listing `PizzaConfig` in the `inject` array (see [Dependency Injection](#dependency-injection)), Catamaran knows that it has to manage a configuration class.

> Here we showed how to use configuration values inside so-called injectable classes (such as the one decorated with `@Service`). If you want to configure how dependency injection works using configuration values, please refer to the [Configuration-dependent Binding](#configuration-dependent-binding) section.

### Environment Variable Prefix

In what follows, you'll see that several parts of Catamaran can be configured via environment variables, and even so-called [Modules](#modules) can expose configurable values as well. If multiple services were deployed on the same instance and they used configurable properties of the same name (for example, `level` inside tthe `LogConfiguration` class), we were unable to individually configure these values because of the colliding environment variable names (since each one of them would use `LOG_LEVEL`). To remedy such situations, you should always set an environment variable prefix for your service as follows.

~~~~TypeScript
import { EnvPrefix } from '@catamaranjs/service'

async function start() {
	const service = await Catamaran
    .builder()
    .use(EnvPrefix.from('PEPPERONI'))
    .createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
~~~~

What previously was `PIZZA_DATA_DIRECTORY` is now `PEPPERONI_PIZZA_DATA_DIRECTORY` because of the additional `PEPPERONI` env prefix. Looks pretty dumb, but read on and trust us, as env prefixing will come in handy!

Note, that env prefixing applies to module configs as well (see the [Modules](#modules) section).

Also, what you've just seen is an example of using a plugin. `EnvPrefix.from()` constructs a new plugin instance, which is then passed to the `use()` method on the Catamaran builder. Catamaran will invoke the "used" plugins at various events and lifecycle phases. You can find more information regarding the inner workings of plugins in the [Extending Catamaran](#extending-catamaran) section.

### Loading Configuration Files

While environment variables constitute the preferred source of configuration values (refer to [The Twelve-Factor App: Config](https://12factor.net/config)), there are instances when loading values from files is a better option. For this end, Catamaran comes with support for JSON and YAML configuration files.

Let's assume, that we have a configuration class as follows.

~~~~TypeScript
@Configuration()
class PizzaConfig {
	@Configuration({
		format: 'nat'
	})
	bakingTime = 180
}
~~~~

Now, let's create a YAML configuration file as  `local.yml`.

~~~~YAML
pizza:
	bakingTime: 269

# Let's configure logging as well.
log:
	level: info
	pretty: true
~~~~

As the last step, we have to declare this file as a configuration source. Just as in the case of the [Environment Variable Prefix](#environment-variable-prefix), we will use a plugin, namely, `ConfigSources`.

~~~~TypeScript
import { ConfigSources } from '@catamaranjs/service'

async function start() {
	const service = await Catamaran
    .builder()
    .use(ConfigSources.from(['local.yml']))
    .createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
~~~~

Environment-dependent configuration loading works exactly the way you'd think.

~~~~TypeScript
const service = await Catamaran
    .builder()
    .use(ConfigSources.from([`${process.env['NODE_ENV']}.yml`]))
    .createServiceWithStrategy(PizzaService, InMemoryStrategy)
~~~~

Configuration sources are loaded in the order they appear in the `configSources` array. Values are loaded on a *last-value-wins* basis, which means that later configuration values overwrite the earlier ones.

## Logging

A great way to achieve runtime traceability and observability is logging. Catamaran takes an SLF4J-like approach to logging by providing a unified logging facade with pluggable backends, such as [pino](https://github.com/pinojs/pino) and [TSLog](https://github.com/fullstack-build/tslog).

Just grab the `LoggerFactory`, get a logger, and use the log method with the desired log level.

~~~~TypeScript
import { LoggerFactory, ILogger } from '@catamaranjs/interface'

@Service()
class PizzaService {
  private readonly logger: ILogger

  // Since LoggerFactory is a concrete class, you don't have
  // to use the @Inject decorator.
  constructor(loggerFactory: LoggerFactory) { 
    this.logger = loggerFactory.getLogger(PizzaService)
    logger.info('Yay, I was constructed!')
  }
}
~~~~

Notably, when calling `getLogger`, you should pass the enclosing class or its name as the only argument to construct an appropriate scoped logger instance.

### Switching the Provider

Out of the box, Catamaran includes three logging backends:

  * `console`, which is the default,
  * [pino](https://github.com/pinojs/pino),
  * [TSLog](https://github.com/fullstack-build/tslog).
  
You can set the desired provider using the `LogProvider` plugin:

~~~~TypeScript
import { LogProvider } from '@catamaranjs/service'
import { TSLogProvider } from '@catamaranjs/logger-tslog'

async function start() {
	const service = await Catamaran
    .builder()
    .use(LogProvider.provider(TSLogProvider))
    .createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
~~~~

### Configuring Logging

The logging API provides two configurable properties on the `LogConfiguration` class (which is an ordinary konvenient configuration class, just like the ones you can create):

  * Level
    * Possible values: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
    * Default: `info`.
    * Env var: `LOG_LEVEL`.
    * Controls the minimum level of displayed log statements.
  * Pretty
    * Boolean.
    * Default: `false`.
    * Env var: `LOG_PRETTY`.
    * Controls whether the output is optimized for human or machine consumption.

Now, if no [Environment Variable Prefix](#environment-variable-prefix) was set, then these two can be modified via the above environment variables, `LOG_LEVEL` and `LOG_PRETTY`. However, if, for example, you use `EnvPrefix.from('PIZZA')`, then the respective environment variable names become `PIZZA_LOG_LEVEL` and `PIZZA_LOG_PRETTY`. Thus, you can safely run two services in the same scope and set different log settings for them. Neat, huh?

## Dependency Injection

In the previous sections, we've already shown examples of dependency injection (think of the `@Inject` decorator and the `inject` property). In what follows, we give a detailed description of the DI support of Catamaran.

> If you're new to Dependency Injection, then these SO answers (and, most importantly, the links within them) can help to get a quick grasp on the topic:
>
>  * [What is Dependency Injection?](https://stackoverflow.com/a/140655),
>  * [Inversion of Control vs Dependency Injection](https://stackoverflow.com/a/6551303).

Before diving in, we would like to start with a quick note. In Catamaran, most of the DI heavy-lifting is done by the excellent [Inversify](https://inversify.io/) library. You can get by perfectly fine without knowing Inversify, since Catamaran provides its own decorators for DI, which are a subset of the Inversify decorators. Nevertheless, if you're limited by Catamaran's decorators, then feel free to use Inversify decorators directly.

With all of that out of the way, let's focus on DI now!

Regardless of the exact DI library in question, all implementations revolve around two key concepts: bindings and dependencies. A *dependency* is something that needs to be resolved or fulfilled, while a *binding* is something that can be used to fulfill dependencies. In Catamaran, you're expected to declare dependencies in constructors (and thus, enable *constructor injection*) and declare bindings in appropriate decorators. Let's see how!

### Class Binding

A class binding is a binding of a concrete type to itself. Which means, that whenever a dependency is found on a *concrete class*, then an instance of the class itself will be used to resolve that dependency. Instantiation is handled by Catamaran.

Let's declare a class binding!

~~~~TypeScript
import { Injectable } from '@catamaranjs/interface'

/* 1. */
@Injectable()
class PizzaAggregator {}

@Service({
  inject(context) {
    /* 2. */
    context.bindClass(PizzaAggregator)
  }
})
class PizzaService {}
~~~~

  1. First, we created a new class, `PizzaAggregator` and decorated it with `@Injectable`. This decorator marks a class as both an injection-target (something that can be injected into) and an injection-source (something that other injectables can inject into themselves).
  1. Then, in the `inject` function of the `@Service` options, we can access the context, which represents the DI container of our service. Using the context we simply bind the `PizzaAggregator` class, effectively saying that "whenever you find a dependency on `PizzaAggregator`, simply inject an instance".

Making use of this binding is then super easy, just look at the constructor:

~~~~TypeScript
import { Inject } from '@catamaranjs/interface'

@Service({
  inject(context) {
    context.bindClass(PizzaAggregator)
  }
})
class PizzaService {
  constructor(@Inject(PizzaAggregator) pizzaAgg: PizzaAggregator) {
    console.log('Look, ma, pizza aggregator', pizzaAgg)
  }
}
~~~~

In the case of class bindings, you may also omit the `@Inject` decorator:

~~~TypeScript
class PizzaService {
  constructor(pizzaAgg: PizzaAggregator) {
    console.log('Look, ma, pizza aggregator', pizzaAgg)
  }
}
~~~

See [Shorthand Notations](#shorthand-notations) for a shorter way to declare class bindings.

### Interface Binding

Binding classes is great, but generally, we want to depend on abstractions rather than concrete implementations. So, let us assume, that we have an interface and a corresponding implementing class as follows.

~~~~TypeScript
interface IPizzaRepository {
  loadPizzas(): Pizza[]
}

@Injectable()
class MongoPizzaRepository implements IPizzaRepository {
  loadPizzas() {
    return []
  }
}
~~~~

Now, you may know, that TypeScript interfaces are like Java generics: they only exist in compile time and vanish in execution time. Since TypeScript is compiled down to JavaScript, and JavaScript has no notion of interfaces, TypeScript generates no code for interfaces. They are used for type checking only.

Therefore, when we want to declare dependency on an interface, we cannot write

~~~~TypeScript
@Inject(IPizzaRepository)
~~~~

just as we did in the case of the `PizzaAggregator` class (see [Class Binding](#class-binding)). This is so, because `IPizzaRepository` is not a value and has no representation in JavaScript.

Long story short, if we want to depend on an interface, we have to use a type key in both the binding and the dependency. This type key then can be either a string or a Symbol. Check!

~~~~TypeScript
@Service({
  inject(context) {
    /* 1. */
    context.bindInterface('IPizzaRepository', MongoPizzaRepository)
  }
})
class PizzaService {
  constructor(/* 2. */ @Inject('IPizzaRepository') pizzas: IPizzaRepository /* 3. */) {
    console.log('Yay, pizzas', pizzas)
  }
}
~~~~

  1. As you can see, in this case, we used the `bindInterface` method of the context. This allows us to define the type key along with the concrete implementation that should be used to resolve dependencies with that very key. Here we essentially said the following to Catamaran: "whenever you find an `@Inject` with the `IPizzaRepository` key, resolve that dependency with a `MongoPizzaRepository` instance".
  1. Afterward, in the constructor, we can declare that we depend on the `IPizzaRepository` abstraction by using the same key in the `@Inject` decorator as in the binding.
  1. Then, the type of the parameter is what you'd expect: the `IPizzaRepository` interface.

To prevent typos, it's best to extract the injection key into a constant.

~~~~TypeScript
const TYPES = {
  IPizzaRepository: 'IPizzaRepository'
}
~~~~

### Constant Binding

So far, we've left the task of instantiation to the DI container by always binding class constructors (both in the case of [Class Bindings](#class-binding) and [Interface Bindings](#interface-binding)). In numerous situations, however, for example, when we want bind primitive values like a simple string or a number, we want to bind an exact, already available value or instance. This is the problem solved by *constant bindings*.

Similarly to the already known binding techniques, we can use the `inject` function and the context again. Assuming that we want to inject a simple string value into the container, we can write something like below.

~~~~TypeScript
@Service({
	inject(context) {
		/* 1. */
		context.bindConstant('TODAYS_PIZZA_CHEF', 'Giovanni')
	}
})
class PizzaService {
	constructor(/* 2. */ @Inject('TODAYS_PIZZA_CHEF') chef: string) {
		/* 3. */
		console.log(chef)
	}
}
~~~~

  1. Using the `bindConstant` method of the context, we bind the primitive value `Giovanni` to the `TODAYS_PIZZA_CHEF` key. This is equivalent to saying the following to Catamaran: "wherever you see a dependency on the `TODAYS_PIZZA_CHEF` key, inject the value `Giovanni`".
	1. We express our dependency on the constant value using the well-known `Inject` decorator and the `TODAYS_PIZZA_CHEF` key.
	1. `Giovanni` gets injected and printed, just as expected.

Again, to prevent hours of DI debugging, it is a good idea to extract the key into a named constant:

~~~~TypeScript
const CONSTANTS = {
	TODAYS_PIZZA_CHEF: 'TODAYS_PIZZA_CHEF'
}
~~~~

See [Shorthand Notations](#shorthand-notations) for a shorter way to declare constant bindings.

### Configuration-dependent Binding

Even when developing simpler services, the situation may arise when you want to conditionally bind a concrete implementation to some abstraction. For example, let's imagine that we're developing a service that needs to store files somewhere. In staging and production, we would like to use S3. However, locally, we don't want to mess around with S3, thus, we decided to write a simple file system-based implementation. Now, how can we select the appropriate implementation based on the current environment?

That's where configuration-dependent binding comes into the picture. First, we set the scene by creating the `FileStore` interface and the two implementations, S3 and file system-based.

~~~~TypeScript
interface IFileStore {}

@Injectable() class S3FileStore implements IFileStore {}

@Injectable() class FsFileStore implements IFileStore {}
~~~~

Then, we follow this up by creating a konvenient configuration class with a configurable `env` property. We will use this property to choose the actual runtime store implementation.

~~~~TypeScript
@Configuration()
class FileStoreConfig {
  @Configurable({
    doc: 'The environment the application is executing in.',
    format: ['local', 'staging', 'production'],
  })
  env = 'production'

  isLocalEnv() {
    return this.env === 'local'
  }
}
~~~~

By default, the value of this property will be read from the `FILE_STORE_ENV` environment variable (which can be altered by, for example, with an [Environment Variable Prefix](#environment-variable-prefix)).

We reached our last and most important step, the actual binding.

~~~~TypeScript
@Service({
  inject(context) {
    /* 1. */
    const fileStoreConfig = context.immediate(FileStoreConfig)

    /* 2. */
    const fileStoreImpl = fileStoreConfig.isLocalEnv() ? FsFileStore : S3FileStore

    /* 3. */
    context.bindInterface('IFileStore', fileStoreImpl)
  }
})
class FileStoreService {}
~~~~

  1. The first step is immediately (haha, got 'em) the most important one. The `immediate` method of the context is a special form of `bindClass`: it creates a [Class Binding](#class-binding), instantiates the class and returns the instance immediately (hence the name).
  1. Thanks to the `immediate` call, we will have access to a populated instance of the `FileStoreConfig` configuration class. We can then use this instance to actually decide which implementation should be used. The decision will always be made in runtime, based on the value of `fileStoreConfig.isLocalEnv()`, which, in turn, uses `fileStoreConfig.env` (`FILE_STORE_ENV`).
  1. In the previous step, we selected which implementation should be used. In this step, we make the actual binding, by calling `bindInterface` with the appropriate type key and class.

Of course, classes bound using `immedate` can be injected just as if they were bound using `bindClass`.

~~~~TypeScript
@Service({
  inject(context) {
    context.immediate(FileStoreConfig)
  }
})
class FileStoreService {
  constructor(fileStoreConfig: FileStoreConfig) {
    console.log('Received FileStoreConfig', fileStoreConfig)
  }
}
~~~~

Since `immediate` calls perform binding and instantiation at the same time, they are best suited for classes with no or isolated dependencies. Great examples are configuration classes, which, in 99% of the time, have no dependencies. While you might find other uses for `immediate`, other than configuration, please keep in mind: wth great power comes great responsibility.

It might be tempting to use this technique for testing purposes: injecting a test double based on some configuration conditions. However, that would pollute our normal application code with testing related logic. Therefore, Catamaran provides a much more elegant solution, detailed in the [Testing](#testing) section.

### Injecting Multiple Values of the Same Type

In the previous sections, we always assumed singular bindings: that is, that we have a single value bound to a given key or type. Usually, this is exactly what we want. Nevertheless, there are situations in which we have an interface with multiple implementations that exist simultaneously, and we want to access every implementation together. Enter *multi-injection*!

As a concrete example, let's assume, that we're writing a service that collects the daily offerings of several local restaurants. Each restaurant distributes its daily offering in a different manner, thus, we have to write an implementation on a per-restaurant basis. To make our lives easier, we will extract a common interface for these implementations.

~~~~TypeScript
interface DailyOffering {
	restaurant: string,
	items: string[]
}

interface IDailyOfferingScraper {
	scrapeOffering(): Promise<DailyOffering>
}

@Injectable()
class KingPadliDailyOfferingScraper implements IDailyOfferingScraper {
	async scrapeOffering() { /*...*/ }
}

@Injectable()
class BlahaneDailyOfferingScraper implements IDailyOfferingScraper {
	async scrapeOffering() { /*...*/ }
}
~~~~

Clearly, if we want to check all the offerings together, then we have to somehow call the `scrapeOffering` method of each implementation. However, how can we access *each implementation*? That's exactly, where multi-injection comes into the picture.

~~~~TypeScript
import { MultiInject } from '@catamaranjs/Catamaran'

@Service({
	inject(context) {
		/* 1. */
		context
			.bindInterface('IDailyOfferingScraper', KingPadliDailyOfferingScraper)
			.bindInterface('IDailyOfferingScraper', BlahaneDailyOfferingScraper)
	}
})
class DailyOfferingService {
	constructor(/* 2. */ @MultiInject('IDailyOfferingScraper') scrapers: IDailyOfferingScraper[] /* 3. */) {
		console.log(scrapers)
	}
}
~~~~

  1. First, we bind all of our implementations to the same key, `IDailyOfferingScraper`.
	1. Instead of the usual `@Inject` decorator, we use `@MultiInject` to tell the framework that we are expecting multiple values here. By parameterizing the injection with the `IDailyOfferingScraper` key, we explicitly state what should be injected here.
	1. The type of the multi-injected parameter is not a singular value, but an array. The framework will populate this array with every instance bound to the `IDailyOfferingScraper` key.

### Rebinding

Given a pre-existing binding for some type or type key (created with a [Class Binding](#class-binding), an [Interface Binding](#interface-binding) or a [Constant Binding](#constant-binding)), it can be replaced by an appropriate `rebind` call: `rebindClass`, `rebindInterface` or `rebindConstant`.

Let's assume, that give some configuration, we want to replace an interface binding with some pre-created, instrumented object. In that case, we can use rebind as follows:

~~~~TypeScript
@Service({
	inject(context) {
		context.bindInterface('TYPE', NormalImplementation)

    if (context.immediate(RebindConfig).shouldReplaceImplementation()) {
      context.rebindConstant('TYPE', new InstrumentedImplementation())
    }
	}
})
class RebindService {}
~~~~

While the above example might seem a little contrived, rebind is a great tool when interfacing with or authoring [Modules](#modules) and plugins (see [Extending Catamaran](#extending-catamaran)).

When rebinding a type key with multiple bound implementations, each previous binding will be dropped:

~~~~TypeScript
@Service({
	inject(context) {
		context
      .bindInterface('TYPE', ImplOne)
      .bindInterface('TYPE', ImplTwo)

    context
      .rebindConstant('TYPE', new RebindImpl())
	}
})
class RebindService {}
~~~~

In the above case, both the `ImplOne` and `ImplTwo` binding will be dropped, and only the `RebindImpl` instance will be bound to `TYPE`.

### Unbinding

[Rebinding](#rebinding) corresponds to two operations in one: unbinding and binding. Unbinding removes a pre-existing binding for a given class or type key. The existence of an appropriate binding can be checked using the `isBound` method, as shown in the example below.

~~~~TypeScript
@Service({
	inject(context) {
		if (context.isBound('TYPE')) {
      context.unbind('TYPE')
    }
	}
})
class RebindService {}
~~~~

Again, unbinding shines the most when one has to deal with [Modules](#modules) and plugins (see [Extending Catamaran](#extending-catamaran)).

If multiple values are bound to the same type key, then unbinding that very type key will drop each binding (the same way as in the case of [Rebinding](#rebinding)).

### Wiring Things Up

Dependencies and bindings are all good, but one crucial step is still missing. How do all these things come to life? When and how do our classes get instantiated?

The underlying container of Catamaran is *lazy*. This means, that instances are created on-demand, only when requested. Thus, if we want the container to actually create an instance of some type, we have to request that very type from the container. Of course, instances can only be obtained if all of their dependencies are satisfied. Consequently, the container attempts to resolve the dependencies of the requested type first. For this end, it examines the available bindings. If no binding can resolve the dependency, then an error is thrown. However, if an appropriate binding is found, then the container instantiates it, if necessary. The bound type that we want to instantiate, in turn, can have its own dependencies and so on. The chain continues until the container finds a dependency which is already available or can be immediately constructed. Then, the container walks back the chain, instantiating and injecting everything, eventually finishing off with the type that was originally requested.

An important consequence of the lazy behavior is runtime errors: if a given dependency is not satisfied by any of the bindings, then it is only discovered at runtime when we want to resolve the dependency in question. Can we construct containers that perform dependency resolution at compile time? Sure, one example is the [Dagger](https://dagger.dev/) framework for the JVM.

In Catamaran, the class decorated with `@Service` can be thought of as some kind of a root or origin: generally, every other type in the container is reachable from this class through various dependency chains. Therefore, when we request an instance of the `@Service` class from the container, essentially everything gets instantiated and just like in a puzzle, falls into its place.

One question still lingers around. What happens if a class is a dependency of multiple classes? How many instances will the container create? In Catamaran, every binding is *singleton*, meaning, that a class is instantiated only once and that one instance is then reused to resolve each and every dependency on the type. This enables two important patterns:

  * *Exclusive ownership of resources*. For example, only a single instance will ever exist of your database connection class throughout the lifespan of your application.
  * *Stateless components*. As instances are shared among many dependents, if they are not guarding some resource then it's best to keep them stateless to prevent surprises, when one dependent class sees the effects of another, completely unrelated class.

### Shorthand Notations

If you only want to perform [Class Bindings](#class-binding) in the `inject` function, then you can use the shorthand array form, as follows.

~~~~TypeScript
@Injectable() class PizzaOven {}

@Injectable() class DeliveryGuy {}

@Service({
  inject: [PizzaOven, DeliveryGuy]
})
class PizzaShopService {}
~~~~

The above is the exact same as

~~~~TypeScript
@Service({
  inject(context) {
    context
      .bindClass(PizzaOven)
      .bindClass(DeliveryGuy)
  }
})
class PizzaShopService {}
~~~~

but it saves you a few keystrokes.

Additionally, constant bindings have their own shorthand notation, the `constants` option. This option can be used in conjunction with either form of the `inject` property.

~~~~TypeScript
@Service({
  inject: [PizzaOven],
	constants: [
		['TODAYS_PIZZA_CHEF', 'Giovanni'],
		['EXPECTED_DELIVERY_TIME', 69]
	]
})
class PizzaShopService {}
~~~~

`constants` should be assigned an array of two-element arrays: the first element is the key, while the second element is the value bound to the key. The above is the exact same as

~~~~TypeScript
@Service({
	inject(context) {
		context
			.bindConstant('TODAYS_PIZZA_CHEF', 'Giovanni')
			.bindConstant('EXPECTED_DELIVERY_TIME', 69)
	}
})
class PizzaShopService {}
~~~~

[Modules](#modules) also have their own shorthand form, which can be used in conjunction with the `inject` option:

~~~~TypeScript
@Service({
  inject: [PizzaOven],
  modules: [DeliveryModule, PaymentModule]
})
class PizzaShopService {}
~~~~

**Important**: If `inject` is a function, then it will be executed last. Therefore, the bindings created by `constants` and `modules` will be available by the time it runs.

## Modules

<!-- Frissíteni, tree -->

So far, we've seen the two opposite ends of the granularity spectrum. On one end, we find services that are self-contained and executable, offering facilities to other services via Darcon. Then, on the other end, we have individual classes and interfaces. This implies, that there must be something in between, right? Something, that is smaller than a service but larger than an individual class.

Enter the notion of *modules*! A module is similar to a service in the sense, that it has its own configuration and own bindings. However, in itself, it does not correspond to an executable, Darcon-ready entity. Before discussing their purpose, let's check out how to declare them.

~~~~TypeScript
import { Module } from '@catamaranjs/interface'

@Configuration()
class DeliveryConfig {}

/* 1. */
@Module({
  /* 2. */
  config: DeliveryConfig,
  /* 3. */
  inject(contextContainer, config: DeliveryConfig) {},
})
class DeliveryModule {}
~~~~

  1. The most important part is the `@Module` decorator which marks a class as a *module*.
  1. Modules can have their own konvenient configuration, just as services do. Simply use the `config` property to declare the module's configuration type.
  1. Modules can also declare their own bindings using the very same `inject` facility (yes, the shorthand version is also available).

Once we have a module, let's add it to a service!

~~~~TypeScript
@Service({
  modules: [DeliveryModule]
})
class PizzaService {}
~~~~

By listing a module in the `modules` array of the service options, we achieve the following. When creating and starting the service

  * the configuration properties of the module are prefixed by the service's `envPrefix` (see [envPrefix](#envPrefix)) and are loaded by Catamaran,
  * the bindings of the module are added to the context container of the service (see [Dependency Injection](#dependency-injection)),
  * the service methods and events of the module are added to the service's Darcon interface (see [Inbound Communication](#inbound-communication))
  * the lifecycle methods of the module will be called when appropriate (see [Lifecycle](#lifecycle)).

Overall, modules can be thought of as mini-services that need a host service to actually operate.

Now, let's look at the elephant in the room: why would you want to create modules? We have at least two great reasons:

  * *Splitting up service interfaces.* While you should strive to keep your services thin and focused with as few methods and events as possible, in some situations, a service may need to offer a variety of different methods. In such cases, you can extract each group of logically related methods into their own module. Since modules have their own configuration and bindings, you can even move the necessary configuration and dependencies to the module level. By using this technique, you can separate your service into cohesive subcomponents which can be easily extracted into their own service in the future, if necessary.
  * *Code reuse.* Modules can be published in npm packages, which allows for cross-service code reuse. Writing a database connector? Slap it into a module! Health check and metrics? Another module! Any Catamaran-specific code should reside in modules, as modules automatically provide configuration, logging, dependency injection, lifecycle and even service methods and events. Code that is independent from Catamaran services should still be placed in ordinary libraries, however, if you plan on integrating with Catamaran, then a module is a perfect choice.

## Service Communication

In what follows, we detail how to accept requests and events from other services, as well as, how to invoke them the Catamaran way.

### Inbound Communication

Communication via Darcon comes in two flavors: request-reply and event-based. Handlers for the former are called *service methods*, while listeners for the latter are *service events* (surprisingly).

~~~~TypeScript
import { Catamaran } from '@catamaranjs/service'
import { Service, ServiceMethod, ServiceEvent } from '@catamaranjs/interface'

@Service()
class PizzaService {
  @ServiceMethod()
  async getNumberOfOrdersSince(since: number): number {
    // Do the thing.
  }

  @ServiceEvent()
  async pizzaOrdered(flavor: string) {
    // Do the thing.
  }
}
~~~~

As Catamaran is decorator-driven, service methods and events can be registered using the appropriate decorators: `@ServiceMethod` and `@ServiceEvent`. The external name (visible to other Darcon services) of the method/event is going to be the name of the decorated method, unless otherwise specified. In the case of the above example, other services can call the `PizzaService.getNumberOfOrdersSince` method or emit to the `PizzaService.pizzaOrdered` event.

~~~~TypeScript
@Service()
class PizzaService {
  @ServiceMethod({
    name: 'ordersSince'
  })
  async getNumberOfOrdersSince(since: number): number {
    // Do the thing.
  }
}
~~~~

In the above example, the method visible to other services will be `ordersSince` instead of `getNumberOfOrdersSince`. `@ServiceEvent` also supports name overriding.

[Modules](#modules) also support methods and services, using the same decorators.

~~~~TypeScript
@Module()
class DeliveryModule {
  @ServiceMethod()
  async deliverPizza(pizza: Pizza): Delivery {
    // Do the thing.
  }
}
~~~~

When the `DeliveryModule` is declared on a service (in the `modules` array), the above `deliverPizza` method will automatically be available as part of the service's published interface.

### Outbound Communication

Being called is great, but being able to *call* is even more fun! Calling other Darcon services is done through so-called *external services*.

For each external service, you have to create a corresponding class as follows.

~~~~TypeScript
import {ExternalService, ExternalServiceTemplate} from '@catamaranjs/Catamaran'

/* 1. */
@ExternalService()
class Cache extends ExternalServiceTemplate /* 2. */ {}
~~~~

The two requirements for external services are

  1. the `@ExternalService` annotation (which offers a `name` option, similar to that of `@ServiceMethod`)
  1. and the `ExternalServiceTemplate` base class.

Now you're ready to make calls to the `Cache` service!

<!-- Frissíteni -->

~~~~TypeScript
@Service({
  /* 1. */
  externalServices: [Cache]
})
class PizzaService {
  private readonly cache: Cache

  constructor(/* 2. */ @Inject(Cache) cache: Cache) {
    this.cache = cache
  }

  @ServiceMethod()
  async getNumberOfOrdersSince(since: number): number {
    /* 3. */
    await this.cache.request('getItem', 'pizza-orders')
  }
}
~~~~

Whoa, now, that's a lot, so let's break it down!

  1. First, we have to register the `Cache` external service in the `externalServices` array. This tells Catamaran that you depend on the this service (so that your service will wait for `Cache` to show up when started), and it can load and instrument the external service class.
  1. Then, we have to inject an instance of this external service into our service. This instance will be created by Catamaran and will be automatically injected into our constructor when necessary.
  1. Finally, we can make a Darcon request to `Cache.getItem` using the `request` method.

Our dependency on the `Cache` service is now completely apparent. However, the `getItem` call still feels a bit unsafe.

<!-- Frissíteni -->

~~~~TypeScript
import { ExternalServiceMethod, IExternalServiceCall, serviceMethodPlaceholder } from '@catamaranjs/Catamaran'

@ExternalService()
class Cache extends ExternalServiceTemplate {
  @ExternalServiceMethod()
  getItem: (key: string) => IExternalServiceCall<any> = serviceMethodPlaceholder
}
~~~~

By utilizing the `@ExternalServiceMethod`, and placing it on an appropriately typed property, we can instruct Catamaran to automatically generate typed request calls for us. The anatomy of an *external service method* is as follows:

~~~~
@ExternalServiceMethod()
<name of the method>: (parameters) => IExternalServiceCall<result type> = serviceMethodPlaceholder
~~~~

> Note: The `serviceMethodPlaceholder` value is necessary only to make the TypeScript compiler happy.

Now we can call this method as follows.

~~~~TypeScript
@Service({
  externalServices: [Cache]
})
class PizzaService {
  private readonly cache: Cache

  constructor(@Inject(Cache) cache: Cache) {
    this.cache = cache
  }

  @ServiceMethod()
  async getNumberOfOrdersSince(since: number): number {
    await this.cache.getItem('pizza-orders').send()
  }
}
~~~~

Be aware of the `send()` call at the end, which actually performs the request and waits for the reply. This is necessary, since the return type of an external service method is always `IExternalServiceCall<T>`. This is essentially a command object, making it possible to customize how the request is made, and to pass around the request before it's fired.

Of course, we can also declare events in a fashion similar to requests. Just use the `@ExternalServiceEvent` decorator and its friends, `IExternalServiceEmit` and `serviceEventPlaceholder`.

~~~~TypeScript
import { ExternalServiceEvent, IExternalServiceEmit, serviceEventPlaceholder } from '@catamaranjs/Catamaran'

@ExternalService()
class PizzaAggregator extends ExternalServiceTemplate {
  @ExternalServiceEvent()
  pizzaServed: (flavor: string, customer: string) => IExternalServiceEmit = serviceEventPlaceholder
}
~~~~

Therefore, the anatomy of an *external service event* is as follows:

~~~~
@ExternalServiceEvent()
<name of the event>: (parameters) => IExternalServiceEmit = serviceEventPlaceholder
~~~~

Just as in the case of [Inbound Communication](#inbound-communication), outbound communication via external services is also supported by [Modules](#modules). Assuming, that we want to use the `Cache` service from a module, we can write the following code.

~~~~TypeScript
@Module({
  externalServices: [Cache]
})
class DeliveryModule {
  private readonly cache: Cache

  constructor(@Inject(Cache) cache: Cache) {
    this.cache = cache
    console.log('Ready to cache!', Cache)
  }
}
~~~~

<!-- Frissíteni + ez ne itt legyen -->

### Darcon Configuration

The configurable properties of the Darcon connection are as follows:

  * Division
    * `DARCON_DIVISION`
    * Default: `Catamaran`.
  * Identifier Length
    * `DARCON_ID_LENGTH`
    * Default: `16`
  * Response Tolerance
    * `DARCON_RESPONSE_TOLERANCE`
    * Default: `30000`
  * Reporter Interval
    * `DARCON_REPORTER_INTERVAL`
    * Default: `2000`
  * Keeper Interval
    * `DARCON_KEEPER_INTERVAL`
    * Default: `10000`
  * Maximum Reconnect Attempts
    * `DARCON_MAX_RECONNECT_ATTEMPTS`
    * Default: `-1`
  * Reconnect Time Wait
    * `DARCON_RECONNECT_TIME_WAIT`
    * Default: `250`
  * Connect Time Wait
    * `DARCON_CONNECT_TIME_WAIT`
    * Default: `2500`
  * Connection Patience
    * `DARCON_CONNECTION_PATIENVE`
    * Default: `-1`
  * Strict
    * `DARCON_STRICT`
    * Default: `false`
  * Communication Size
    * `DARCON_COMM_SIZE`
    * Default: `500000`
  * Maximum Communication Size
    * `DARCON_MAX_COMM_SIZE`
    * Default: `2500000`
  * NATS URL
    * `DARCON_NATS_URL`
    * Default: `'nats://localhost:4222'`

> If you use an [envPrefix](#envPrefix) on your service, then the above environment variables will be prefixed with the chosen value. For example, if the env prefix is `NOTIFICATION`, then `DARCON_NATS_URL` becomes `NOTIFICATION_DARCON_NATS_URL`.

If you want to access the above values directly in your application (for whatever reason), then simply inject an instance of [`DarconConfig`](../src/Darcon/Configuration.ts).

<!-- Frissíteni -->

## Network Events

*Network events* are emitted by Darcon, and can be listened on by services. The following events are available:

  * `entityAppeared(name)`
    * Emitted when the `name` entity (service) publishes itself to Darcon.
  * `entityLinked(name)`
    * Laji, please help, I don't know :(
  * `entityUpdated(name, terms)`
    * Again, I don't know :(
  * `entityDisappeared(name)`
    * The pair of `entityAppeared`, emitted when the `name` entity (or service) closes itself.

Subscribing to these events can be done via the `@NetworkEvent` decorator.

~~~~TypeScript
import { NetworkEvent } from '@catamaranjs/Catamaran'

@Service()
class PizzaService {
  @NetworkEvent()
	entityAppeared(name: string) {}

	@NetworkEvent({
    name: 'entityLinked'
  })
	linkedWithSillyName(name: string) {}

	@NetworkEvent()
	entityDisappeared(name: string) {}

	@NetworkEvent({
    name: 'entityUpdated'
  })
	onEntityUpdated(name: string, terms: any) {}
}
~~~~

As you can see, the same decorator is used for each event listener. It is the name of the event listener method or the `name` option of the `@NetworkOption` decorator which decides which event the method is bound to.

When declaring event listeners, please be aware of the following limitations:

  * The `@NetworkEvent` decorator is not available on [Modules](#modules) yet.
  * On the same service, there can only be a single listener for the same event. For example, you cannot add multiple listeners for the `entityAppeared` event on the same service.

<!-- Nagy frissítés ide -->

## Service Lifecycle

When implementing more involved services, we regularly want to perform additional initialization logic before the service is published, and, conversely proper teardown before it stops. A great example is the handling of database connections: we want to open a connection before accepting requests and then want to close it once we're done.

Fortunately, Catamaran provides facilities for both services and [Modules](#modules) to perform both initialization and teardown. Let's first see the case of services.

~~~~TypeScript
import { PostInit, PreDestroy } from '@catamaranjs/Catamaran'

@Service()
class PizzaService {
  @PostInit()
  postInit() {}

  @PreDestroy()
  preDestroy() {}
}
~~~~

Then, the options for modules.

~~~~TypeScript
import { PreServiceInit, PostServiceInit, PreServiceDestroy, PostServiceDestroy } from '@catamaranjs/Catamaran'

@Module()
class DeliveryModule {
  @PreServiceInit()
  preServiceInit() {}

  @PostServiceInit()
  postServiceInit() {}

  @PreServiceDestroy()
  preServiceDestroy() {}

  @PostServiceDestroy()
  postServiceDestroy() {}
}
~~~~

### Timing and Order

All good, all fine, but when do these methods get called exactly?

  * Initialization methods (those with `init` in their name) are called *after* each external service dependency of the current service is available and the delayed start has elapsed, but *before* the service is published on Darcon.
  * Teardown methods (those with `destroy` in their name) are called *after* service closure has been requested, but *before* the service is removed from Darcon.

The order then is as follows:

  1. The `@PreServiceInit` method of every module declared on the service.
  1. The `@PostInit` method of the service.
  1. The `@PostServiceInit` method of every module declared on the service.
  1. The `@PreServiceDestroy` method of every module declared on the service.
  1. The `@PreDestroy` method of the service.
  1. The `@PostServiceDestroy` method of every module declared on the service.

Please be aware of the following limitations regarding lifecycle methods:

  * The order in which the same lifecycle method is called on the declared modules is *not* stable and should not be depended upon.
  * In a given module or service, each lifecycle method can only be used at most once.

## Testing

While unit testing is rather straightforward (just import the appropriate unit into the test and replace its dependencies with test doubles), higher level tests are not necessarily so. To increase our confidence in the correctness of our service, we may want to perform narrow integration tests against it: using its public API, but replacing its external dependencies with doubles.

> For more information or narrow integration tests, please refer to
>
>   * [Martin Fowler: IntegrationTest](https://martinfowler.com/bliki/IntegrationTest.html)
>   * [John Mikael Gundersen: Patterns of Narrow Integration Testing](https://www.jmgundersen.net/blog/patterns-of-narrow-integration-testing)

In this process, we want to make sure that our service behaves the same way as if it was deployed to Darcon by Catamaran:

  * modules are correctly attached,
  * configuration is loaded,
  * the container is setup,
  * lifecycle methods are called,
  * etc.

While, at the same time, we have a bit more control to ease testing:

  * we can modify configuration values (without having to touch the environment variables),
  * we can rebind types in the container to replace them with test doubles.

All of the above can be achieved with the `IntegrationTestBuilderStrategy`, offered by Catamaran. This is an alternative to the ordinarily used `ServiceBuilderStrategy`, which actually publishes a service to Darcon.

In what follows, we introduce the testing support through an example. Let's assume, that we're writing a greeting service that exposes a greeter method. This method returns a greeting, appropriate to the current time of day. The current time, in turn, is supplied by an external service, called `DateTime`. All of these can be implemented as shown below.

~~~~TypeScript
@ExternalService()
class DateTime extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	hours: () => IExternalServiceCall<number> = serviceMethodPlaceholder
}

@Service({
	externalServices: [DateTime],
})
class GreetingService {
	private readonly dateTime: DateTime

	constructor(@Inject(DateTime) dateTime: DateTime) {
		this.dateTime = dateTime
	}

	async greet(who: string): Promise<string> {
		const hours = await this.dateTime.hours().send()

		return hours < 12 ? `Good morning, ${who}!` : `Good evening, ${who}!`
	}
}
~~~~

Now, let's say, that we want to test if the `greet` method returns `Good morning` when called before noon. Then, we can write the skeleton of our test somehow like this:

~~~~TypeScript
describe('GreetingService.greet', () => {
  it('should return "Good morning" when called before noon.', async () => {
    // Given

    // When

    // Then

  })
})
~~~~

First, we need to arrange the scene, by

  * declaring the test's inputs and expected output,
  * setting up a known, testable state of the *system under test* (SUT).

~~~~TypeScript
// Given
/* 1. */
const HOUR = 9
const WHO = 'Jocky'
const expected = 'Good morning, Jocky!'

/* 2. */
const arrangement = await Catamaran.createServiceWithStrategy(
  GreetingService,
  IntegrationTestBuilderStrategy
)

const sut = await arrangement
  /* 3. */
  .rebind(DateTime, {
    hours() {
      /* 4. */
      return CallWithResult.of(HOUR)
    },
  })
  /* 5. */
  .start()
~~~~

Let's break this down, step by step!

  1. First, we declare the test data: the hour which will be returned by our `DateTime` double, the name passed to the `greet` method and the expected output.
  1. This is followed by the creation of our test arrangement. We use the `createServiceWithStrategy` function with the `IntegrationTestBuilderStrategy` to create a representation of the service, which is optimized for testing. This is called an arrangement, and allows us for reconfiguring environment variables (using the `reconfigure` method) and rebinding container types (through the `rebind` method).
  1. Using the `rebind` method of the arrangement, we bind a test double to the `DateTime` external service. Thus, when we start the service in step 5, the container will inject our double, instead of the original implementation.
  1. The double will respond with the same value to each `hours` call. Remember, that external service methods return `IExternalServiceCall<T>`-s, hence, we have to use the `CallWithResult` helper type.
  1. As the last step of our `Given` block, we call the `start` method of our arrangement, producing a testable *system under test*. The call to the `start` method will actually kick-off the service but will not publish it to Darcon.

We're now in place to make a test call!

~~~~TypeScript
// When
const actual = await sut
  /* 1. */
  .getServiceOrModule(GreetingService)
  /* 2. */
  .greet(WHO)
~~~~

  1. Using the `getServiceOrModule` method, we retrieve an instance of `GreetingService` from the context container. As the name of the method implies, you can also retrieve any module from the container.
  1. Then, we simply call the `greet` method as we would do in the case of an ordinary TypeScript method, and record its return value.

Finally, let's check if our expectation holds.

~~~~TypeScript
// Then
assert.strictEqual(actual, expected)

await sut.close()
~~~~

We simply assert, whether the actual answer is equal to the expected one. Then, we do not forget to close the system by calling the `close` method.
