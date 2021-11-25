import { Constructor } from '../types'
import { IPluginContainer } from '../Container/IPluginContainer'
import { IPlugin } from './IPlugin'
import { IDynamicValueContext } from '../Container/IDynamicValueContext'

export abstract class AbstractPlugin implements IPlugin {
	preCreation(_container: IPluginContainer): Promise<void> {
		return Promise.resolve()
	}

	preStart(_container: IPluginContainer): Promise<boolean> {
		return Promise.resolve(true)
	}

	postClose(_container: IPluginContainer): Promise<void> {
		return Promise.resolve(undefined)
	}

	postStart(_container: IPluginContainer): Promise<boolean> {
		return Promise.resolve(true)
	}

	preClose(_container: IPluginContainer): Promise<void> {
		return Promise.resolve(undefined)
	}

	onServiceAppeared(_serviceName: string): Promise<void> {
		return Promise.resolve(undefined)
	}

	onServiceDisappeared(_serviceName: string): Promise<void> {
		return Promise.resolve(undefined)
	}

	onBindClass<T>(_constructor: Constructor<T>): Constructor<T> {
		return _constructor
	}

	onBindInterface<T>(_accessor: string, _constructor: Constructor<T>): Constructor<T> {
		return _constructor
	}

	onBindConstant<T>(_accessor: string | Constructor<T>, _constant: T): T {
		return _constant
	}

	onBindDynamicValue<T>(_accessor: string | Constructor<T>, func: (context: IDynamicValueContext) => T): (context: IDynamicValueContext) => T {
		return func
	}

	onRebindClass<T>(_constructor: Constructor<T>): Constructor<T> {
		return _constructor
	}

	onRebindInterface<T>(_accessor: string, _constructor: Constructor<T>): Constructor<T> {
		return _constructor
	}

	onRebindConstant<T>(_accessor: string | Constructor<T>, _constant: T): T {
		return _constant
	}

	onRebindDynamicValue<T>(_accessor: string | Constructor<T>, func: (context: IDynamicValueContext) => T): (context: IDynamicValueContext) => T {
		return func
	}

	onUnbind(_accessor: string | Constructor): boolean {
		return true
	}

	onBindModule(_moduleConstructor: Constructor): Constructor {
		return _moduleConstructor
	}

	onGet<T>(_accessor: Constructor<T> | string, _instance: T): T {
		return _instance
	}
}
