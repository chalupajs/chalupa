import { InversifyContainer } from "@catamaranjs/interface";

export interface IConfigurator {
	configure(container: InversifyContainer): void
}
