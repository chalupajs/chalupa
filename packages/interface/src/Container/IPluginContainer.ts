import { Constructor } from '../types'
import { IContainer } from './IContainer'

export type IPluginContainer = IContainer & {
	get<T>(accessor: string | Constructor): T
}
