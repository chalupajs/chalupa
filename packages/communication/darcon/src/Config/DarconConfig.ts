import { Configurable, Configuration } from '@chalupajs/interface'

/**
 * Configuration for the underlying Darcon instance of the service.
 */
@Configuration()
export class DarconConfig {
	@Configurable({
		doc: 'The division in which the service operates.',
		format: String,
	})
	division = 'Catamaran'

	@Configurable({
		doc: 'The length of the various identifiers used throughout the Darcon communication flows.',
		format: Number,
		result: r => Number(r),
	})
	idLength = 16

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	responseTolerance = 30_000

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	reporterInterval = 2000

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	keeperInterval = 10_000

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	maxReconnectAttempts = -1

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	reconnectTimeWait = 250

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	connectTimeWait = 2500

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	connectionPatience = -1

	@Configurable({
		format: Boolean,
		result: r => Boolean(r),
	})
	strict = false

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	commSize = 1_000_000 / 2

	@Configurable({
		format: Number,
		result: r => Number(r),
	})
	maxCommSize = 5_000_000 / 2

	@Configurable({
		format: String,
	})
	natsUrl = 'nats://localhost:4222'
}
