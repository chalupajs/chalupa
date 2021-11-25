import { Constructor } from '../types'
import { IPluginContainer } from '../Container/IPluginContainer'
import { IDynamicValueContext } from '../Container/IDynamicValueContext'

export interface IPlugin {
	// Lifecycles
	preCreation(container: IPluginContainer): Promise<void>

	preStart(container: IPluginContainer): Promise<boolean>
	postStart(container: IPluginContainer): Promise<boolean>
	preClose(container: IPluginContainer): Promise<void>
	postClose(container: IPluginContainer): Promise<void>

	// NetworkEvents
	onServiceAppeared(serviceName: string): Promise<void>
	onServiceDisappeared(serviceName: string): Promise<void>

	// Binding listeners
	onBindClass<T>(constructor: Constructor<T>): Constructor<T>
	onBindInterface<T>(accessor: string, constructor: Constructor<T>): Constructor<T>
	onBindConstant<T>(accessor: string | Constructor<T>, constant: T): T
	onBindDynamicValue<T>(accessor: string | Constructor<T>, func: (context: IDynamicValueContext) => T): (context: IDynamicValueContext) => T
	onRebindClass<T>(constructor: Constructor<T>): Constructor<T>
	onRebindInterface<T>(accessor: string, constructor: Constructor<T>): Constructor<T>
	onRebindConstant<T>(accessor: string | Constructor<T>, constant: T): T
	onRebindDynamicValue<T>(accessor: string | Constructor<T>, func: (context: IDynamicValueContext) => T): (context: IDynamicValueContext) => T
	onUnbind(accessor: string | Constructor): boolean
	onBindModule(moduleConstructor: Constructor): Constructor
	onGet<T>(accessor: Constructor<T> | string, instance: T): T
}
