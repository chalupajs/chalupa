import {
	ExternalService,
	ExternalServiceMethod,
	ExternalServiceTemplate,
	IExternalServiceCall,
	Service,
	ServiceMethod,
	serviceMethodPlaceholder,
} from "@chalupajs/interface";

@ExternalService({
	name: "Pizza",
})
export class PizzaExternalService extends ExternalServiceTemplate {
	@ExternalServiceMethod()
	ping: () => IExternalServiceCall<string> = serviceMethodPlaceholder;
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
