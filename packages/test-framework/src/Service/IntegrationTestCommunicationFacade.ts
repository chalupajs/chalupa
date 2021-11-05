import {
	AbstractCommunicationFacade,
	ServiceAppearedCallback,
	ServiceDisappearedCallback
} from "@chalupajs/interface";
import IntegrationTestCallbackHandler from "./IntegrationTestCallbackHandler";

export class IntegrationTestCommunicationFacade extends AbstractCommunicationFacade{
	onServiceAppeared(cb: ServiceAppearedCallback) {
		IntegrationTestCallbackHandler.onServiceAppeared = cb
	}

	onServiceDisappeared(cb: ServiceDisappearedCallback) {
		IntegrationTestCallbackHandler.onServiceDisappeared = cb
	}
}
