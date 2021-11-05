import {ServiceAppearedCallback, ServiceDisappearedCallback} from "@chalupajs/interface";

export interface IntegrationTestCallbackHandler {
	onServiceAppeared?: ServiceAppearedCallback,
	onServiceDisappeared?: ServiceDisappearedCallback
}

const singletonInstance: IntegrationTestCallbackHandler = {}

export default singletonInstance
