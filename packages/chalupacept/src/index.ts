// eslint-disable-next-line import/no-unassigned-import
import 'reflect-metadata'

import externalServiceHelper from './test-runner/ExternalServiceHelper'

export const ExternalServiceHelper = externalServiceHelper

export { Chalupacept } from './test-runner/Chalupacept'
export * from './constants'
export { Errors as ChalupaceptErrors } from './Errors'
export { ensureConfiguration, readConfig } from './test-runner/configuration'
export { ITestableServiceConfig, IServiceConfig } from './config/ITestableServiceConfig'
export { IIntegrationTestingConfig } from './config/IIntegrationTestingConfig'
export { ISharedServiceConfig } from './config/ISharedServiceConfig'

export { defineConfig } from './config/defineConfig'
export { defineShared } from './config/defineShared'
export { defineTestable } from './config/defineTestable'
