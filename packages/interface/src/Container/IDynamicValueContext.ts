import { Constructor } from '../types'
import { IContainer } from './IContainer'

export type IDynamicValueContext = IContainer & {
	get<T>(accessor: string | Constructor): T
}
