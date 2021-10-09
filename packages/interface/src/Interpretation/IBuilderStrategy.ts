import { IIntermediateService } from './IIntermediateService'

/**
 * Interface for strategies, converting a setup service graphs into
 * some other structure, for example, a testing-focused executable
 * or event just a text documentation.
 * @template T The type of the strategy output.
 */
export interface IBuilderStrategy<T = any> {
	build(intermediateService: IIntermediateService): Promise<T>
}
