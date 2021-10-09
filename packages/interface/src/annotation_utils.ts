import * as konvenient from "konvenient";
export const reconfigureToEnvPrefix = function (envPrefix: string | undefined, configClass: any) {
	if (typeof envPrefix !== 'undefined') {
		konvenient.reconfigure(options => {
			options.envPrefix = options.envPrefix
				? `${envPrefix}_${options.envPrefix}`
				: envPrefix
		}, configClass)
	}
	return configClass
}
