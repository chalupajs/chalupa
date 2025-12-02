import {
	ExternalService,
	ExternalServiceMethod,
	ExternalServiceTemplate,
	IExternalServiceCall,
	Service,
	ServiceMethod,
} from "@chalupajs/interface";

@ExternalService({
	name: "Pizza",
})
export class PizzaExternalService extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	declare ping: () => IExternalServiceCall<string>;
}

@Service({
	name: "Pizza",
})
export class Pizza {
	@ServiceMethod()
	async ping() {
		return "Pong";
	}
}
