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
export { LogProvider } from './Plugins/LogProvider'
export { ConfigSources } from './Plugins/ConfigSources'
export { EnvPrefix } from './Plugins/EnvPrefix'
