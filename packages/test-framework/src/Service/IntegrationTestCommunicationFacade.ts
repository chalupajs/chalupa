import {
	AbstractCommunicationFacade,
	ContainerConstant,
	ICommunicationChannel,
	IFacadeContainer,
	ServiceAppearedCallback,
	ServiceDisappearedCallback,
} from '@chalupajs/interface'
import IntegrationTestCallbackHandler from './IntegrationTestCallbackHandler'
import { IntegrationTestCommunicationChannel } from './IntegrationTestCommunicationChannel'

export class IntegrationTestCommunicationFacade extends AbstractCommunicationFacade {
	// @ts-ignore
	private _facadeContainer: IFacadeContainer

	constructor(facadeContainer: IFacadeContainer) {
		super()
		this._facadeContainer = facadeContainer
	}

	onServiceAppeared(cb: ServiceAppearedCallback) {
		IntegrationTestCallbackHandler.onServiceAppeared = cb
	}

	async init() {
		if (!this._facadeContainer.isBound(ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE)) {
			this._facadeContainer.bindInterface<ICommunicationChannel>(
				ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE,
				IntegrationTestCommunicationChannel
			)
		}

		return Promise.resolve()
	}

	onServiceDisappeared(cb: ServiceDisappearedCallback) {
		IntegrationTestCallbackHandler.onServiceDisappeared = cb
	}
}
