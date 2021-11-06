/*
 * 15. Unbinding
 *
 * 
 * The bind family of methods allows us to create and extend bindings. With the
 * rebind family, we can replace pre-existing bindings with new ones. Now, using
 * unbind(), we can remove bindings without immediately specifying a new bound
 * value (as in the case of rebindings).
 * 
 * Topic: Dependency Injection
 * Showcased features:
 *   * bindInterface.
 *   * isBound.
 *   * unbind.
 *   * MultiInject.
 *   * Injecting dependencies.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Injectable, MultiInject } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

interface DailyOffering {
	restaurant: string,
	items: string[]
}

interface IDailyOfferingScraper {
	scrapeOffering(): DailyOffering
}

@Injectable()
class KingPadliDailyOfferingScraper implements IDailyOfferingScraper {
	scrapeOffering(): DailyOffering {
        return {
            restaurant: 'King Padli',
            items: ['Pulled Carrot Burger']
        }
    }
}

@Injectable()
class SaladBoxDailyOfferingScraper implements IDailyOfferingScraper {
	scrapeOffering(): DailyOffering { 
        return {
            restaurant: 'Salad Box',
            items: ['King Wrap']
        }
    }
}

const Types = {
    IDailyOfferingScraper: 'IDailyOfferingScraper'
}

@Service({
    // Our daily offering scraper solution makes another appearance here.
    // Unfortunately, it will not work out that well this time: we bind two
    // implementations to the same type key, Types.IDailyOfferingScraper. Thus,
    // we are creating a multibinding.
    // Then, we make a call to isBound(Types.IDailyOfferingScraper), which, of course,
    // will return true (we just wanted to double check). Then, we use unbind() to
    // remove the multibinding we created with the two bindInterface() calls.
    // Therefore, once we leave the if branch, there will be no binding for the
    // Types.IDailyOfferingScraper key.
	inject(context) {
		context
			.bindInterface(Types.IDailyOfferingScraper, KingPadliDailyOfferingScraper)
			.bindInterface(Types.IDailyOfferingScraper, SaladBoxDailyOfferingScraper)

        if (context.isBound(Types.IDailyOfferingScraper)) {
            context.unbind(Types.IDailyOfferingScraper)
        }
	}
})
class DailyOfferingService {
    // As a consequence to our unbind() call, the @MultiInject in this constructor
    // will fail at runtime: there is no binding for the type key, hence, Chalupa
    // is unable to inject anything.
	constructor(
        loggerFactory: LoggerFactory,
        @MultiInject(Types.IDailyOfferingScraper) scrapers: IDailyOfferingScraper[]
    ) {
        const logger = loggerFactory.getLogger(DailyOfferingService)

		scrapers.forEach(scraper => logger.info('Offering available', scraper.scrapeOffering()))
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(DailyOfferingService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
