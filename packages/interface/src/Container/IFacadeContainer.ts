import { Constructor } from '../types'
import { IContainer } from './IContainer'

export type IFacadeContainer = IContainer & {
	get<T>(accessor: string | Constructor): T
}
