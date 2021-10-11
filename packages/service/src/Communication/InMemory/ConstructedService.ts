/**
 * A self-contained, executable service that can publish itself to Darcon.
 */
export interface ConstructedService {
	/**
	 * Starts the service, which consists of the following steps:
	 *   1. the service will wait for its dependencies to show up,
	 *   1. optional delayed start,
	 *   1. appropriate lifecycle methods (module and service init methods),
	 *   1. publishing on Darcon.
	 */
	start(): Promise<void>

	/**
	 * Closes the service, which consists of the following steps:
	 *   1. appropriate lifecycle methods (module and service destroy methods),
	 *   1. closing Darcon.
	 */
	close(): Promise<void>
}
