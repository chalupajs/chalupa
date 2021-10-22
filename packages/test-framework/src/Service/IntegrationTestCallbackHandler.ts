import {ServiceAppearedCallback, ServiceDisappearedCallback} from "@catamaranjs/interface";

export interface IntegrationTestCallbackHandler {
	onServiceAppeared?: ServiceAppearedCallback,
	onServiceDisappeared?: ServiceDisappearedCallback
}

const singletonInstance: IntegrationTestCallbackHandler = {}

export default singletonInstance
