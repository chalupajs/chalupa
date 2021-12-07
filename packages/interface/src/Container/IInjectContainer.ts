import { Constructor } from '../types'
import { IContainer } from './IContainer'

export type IInjectContainer = IContainer & {
	bindModule<T>(moduleConstructor: Constructor<T>): Promise<IInjectContainer>
}
