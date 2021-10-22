import {
	AbstractCommunicationFacade,
	ServiceAppearedCallback,
	ServiceDisappearedCallback
} from "@catamaranjs/interface";
import IntegrationTestCallbackHandler from "./IntegrationTestCallbackHandler";

export class IntegrationTestCommunicationFacade extends AbstractCommunicationFacade{
	onServiceAppeared(cb: ServiceAppearedCallback) {
		IntegrationTestCallbackHandler.onServiceAppeared = cb
	}

	onServiceDisappeared(cb: ServiceDisappearedCallback) {
		IntegrationTestCallbackHandler.onServiceDisappeared = cb
	}
}
