import { Constructor } from '../types'
import { IPluginContainer } from '../Container/IPluginContainer'

export interface IPlugin {
	// Lifecycles
	preCreation(container: IPluginContainer): Promise<void>

	preStart(container: IPluginContainer): Promise<void>
	postStart(container: IPluginContainer): Promise<void>
	preClose(container: IPluginContainer): Promise<void>
	postClose(container: IPluginContainer): Promise<void>

	// NetworkEvents
	onServiceAppeared(serviceName: string): Promise<void>
	onServiceDisappeared(serviceName: string): Promise<void>

	// Binding listeners
	onBindClass<T>(constructor: Constructor<T>): Constructor<T>
	onBindInterface<T>(accessor: string, constructor: Constructor<T>): Constructor<T>
	onBindConstant<T>(accessor: string, constant: T): T
	onRebindClass<T>(constructor: Constructor<T>): Constructor<T>
	onRebindInterface<T>(accessor: string, constructor: Constructor<T>): Constructor<T>
	onRebindConstant<T>(accessor: string, constant: T): T
	onUnbind(accessor: string | Constructor): boolean
	onBindModule(moduleConstructor: Constructor): Constructor
	onGet<T>(accessor: Constructor<T> | string, instance: T): T
}
