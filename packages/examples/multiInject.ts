import {
	Injectable,
	MultiInject,
	Service,
} from '@catamaranjs/interface'
import {PinoLogProvider} from '@catamaranjs/logger-pino'
import {Catamaran, LogProvider} from "@catamaranjs/service";
import {IntegrationTestBuilderStrategy} from "@catamaranjs/test-framework";

interface DailyOffering {
	restaurant: string
	items: string[]
}

interface IDailyOfferingScraper {
	scrapeOffering(): Promise<DailyOffering>
}

@Injectable()
class KingPadliDailyOfferingScraper implements IDailyOfferingScraper {
	async scrapeOffering() {
		return {
			restaurant: 'King Padli',
			items: ['kirántott nemhús basmati rizsavú'],
		}
	}
}

@Injectable()
class BlahaneDailyOfferingScraper implements IDailyOfferingScraper {
	async scrapeOffering() {
		return {
			restaurant: 'Blaháné',
			items: ['káposztás kocka'],
		}
	}
}

@Service({
	inject(contextContainer) {
		contextContainer
			.bindInterface('IDailyOfferingScraper', KingPadliDailyOfferingScraper)
			.bindInterface('IDailyOfferingScraper', BlahaneDailyOfferingScraper)
	},
})
class DailyOfferingService {
	constructor(@MultiInject('IDailyOfferingScraper') scrapers: IDailyOfferingScraper[]) {
		console.log(scrapers)
	}
}

async function start() {
	const service = await Catamaran
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(
			DailyOfferingService,
			IntegrationTestBuilderStrategy
		)
	const systemUnderTest = await service.start()

	systemUnderTest.getServiceOrModule(DailyOfferingService)

	await systemUnderTest.close()
}

start().catch(console.error)
