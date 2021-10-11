// eslint-disable-next-line import/no-unassigned-import
import 'reflect-metadata'

// ----------- Main -----------//
export { Catamaran } from './Interpretation/Catamaran'

// ----------- BuilderStrategies -----------//
export { IntegrationTestBuilderStrategy } from './Interpretation/Strategy/IntegrationTest/IntegrationTestBuilderStrategy'
export {
	IntegrationTestArrangement,
	SystemUnderTest,
} from './Interpretation/Strategy/IntegrationTest/IntegrationTestArrangement'

export {InMemoryStrategy} from './Communication/InMemory/InMemoryStrategy'

// ----------- Logging -----------//
export {ConsoleLoggerProvider} from './Log/console-logger/ConsoleLoggerProvider'
export {ConsoleLogger} from './Log/console-logger/ConsoleLogger'
export {IConsoleLog, ConsoleLog} from './Log/console-logger/ConsoleLog'

// ----------- Container -----------//
export { ContextContainer } from './Container/ContextContainer'
