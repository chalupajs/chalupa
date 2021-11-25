/*
 * 14. Multibinding
 *
 * 
 * So far, given a constant or type key, we've only bound a single value
 * or implementation to it. In this example, we introduce multibindings:
 * binding multiple implementations of the same interface to the same type
 * key. Then, we can inject all of these implementation at once, when
 * using the appropriate type key.  
 * 
 * Topic: Dependency Injection
 * Showcased features:
 *   * @MultiInject.
 *   * bindInterface.
 *   * Injecting dependencies.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Injectable, MultiInject } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

interface DailyOffering {
	restaurant: string,
	items: string[]
}

// The interface for which we will create multiple implementations.
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

// We will bind both of the above implementations to the
// same type key. Thus, it is a good idea to extract the key
// into a named constant.
const Types = {
    IDailyOfferingScraper: 'IDailyOfferingScraper'
}

@Service({
	inject(context) {
		// With two calls to bindInterface, we bind the both the KingPadli and
		// the SaladBox implementation to the same type key, Types.IDailyOfferingScraper.
		// Such bindings will not overwrite, but actually extend each other.
		// If we wanted to overwrite our previous Types.IDailyOfferingScraper binding(s),
		// then we had to use rebinding or unbinding.
		context
			.bindInterface(Types.IDailyOfferingScraper, KingPadliDailyOfferingScraper)
			.bindInterface(Types.IDailyOfferingScraper, SaladBoxDailyOfferingScraper)
	}
})
class DailyOfferingService {
	// Instead of @Inject(Types.IDailyOfferingScraper), here you can see
	// @MultiInject(Types.IDailyOfferingScraper) and an array type for the parameter.
	// This decorator tells Chalupa to inject everything that is bound to the specified
	// type key.
	//
	// In fact, @Inject() would not even work here, since Chalupa would not know which
	// implementation to select and inject.
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
