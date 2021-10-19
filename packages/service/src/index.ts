// eslint-disable-next-line import/no-unassigned-import
import 'reflect-metadata'

// ----------- Main -----------//
export { Catamaran, ICatamaranBuilder } from './Interpretation/Catamaran'

// ----------- BuilderStrategies -----------//
export { InMemoryStrategy } from './Communication/InMemory/InMemoryStrategy'

// ----------- Logging -----------//
export { ConsoleLoggerProvider } from './Log/Console/ConsoleLoggerProvider'
export { ConsoleLogger } from './Log/Console/ConsoleLogger'
export { IConsoleLog, ConsoleLog } from './Log/Console/ConsoleLog'

// ----------- Plugin -----------//
export { IPlugin } from './Plugin/IPlugin'
// Configurators
export { LogProvider } from './Log/Provider/LogProvider'
export { ConfigSources } from './Configuration/ConfigSources'
