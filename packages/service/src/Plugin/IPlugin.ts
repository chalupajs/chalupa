import { InversifyContainer } from '@catamaranjs/interface'

export interface IPlugin {
	configure(container: InversifyContainer): void
}
