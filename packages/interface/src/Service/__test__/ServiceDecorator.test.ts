import "reflect-metadata"
import { Service, ServiceOptions } from '../decorators'
import { Metadata } from "../../metadata/Metadata";
import { Errors } from "../../error";
describe('@Service decorator', () => {
	it('should apply the service metadata to the constructor', () => {
		@Service()
		class ClassToBeAnnotated {}
		const isAnnotatedOptions = Reflect.hasOwnMetadata(Metadata.SERVICE_OPTIONS, ClassToBeAnnotated)
		const isAnnotated = Reflect.hasOwnMetadata(Metadata.SERVICE_INJECTED, ClassToBeAnnotated)
		expect(isAnnotatedOptions).toBeTruthy()
		expect(isAnnotated).toBeTruthy()
	})
	it('should throw AlreadyDecoratedError when the service get decorated multiple times', () => {
		class ClassToBeAnnotated {}
		function annotateTwice() {
			const annotated = Service()(ClassToBeAnnotated)
			Service()(annotated)
		}
		expect(annotateTwice).toThrow(Errors.AlreadyDecoratedError)
	})
	it('should attach the same options as metadata', () => {
		const options: Partial<ServiceOptions> = {
			name: 'ASD',
			serviceDirectory: 'Temporary',
			envPrefix: 'Hello',
			dependsOn: ['a', 'b', 'c'],
			delayStart: 1500
		}
		class ClassToBeAnnotated {}
		const annotatedClass = Service(options)(ClassToBeAnnotated)
		const serviceOptions: ServiceOptions = Reflect.getMetadata(Metadata.SERVICE_OPTIONS, annotatedClass) as ServiceOptions
		expect(serviceOptions).toEqual(options)
	})
	it('should automatically fill service name property in options if it is not provided', () => {
		class ClassToBeAnnotated {}
		const annotatedClass = Service()(ClassToBeAnnotated)
		const serviceOptions: ServiceOptions = Reflect.getMetadata(Metadata.SERVICE_OPTIONS, annotatedClass) as ServiceOptions
		expect(serviceOptions.name).toBe(ClassToBeAnnotated.name)
	})
	it('should use service name property provided in the options', () => {
		const providedServiceName = 'ProvidedService'
		class ClassToBeAnnotated {}
		const annotatedClass = Service({ name: providedServiceName })(ClassToBeAnnotated)
		const serviceOptions: ServiceOptions = Reflect.getMetadata(Metadata.SERVICE_OPTIONS, annotatedClass) as ServiceOptions
		expect(serviceOptions.name).toBe(providedServiceName)
	})
	it('should automatically fill serviceDirectory property in options if it is not provided', () => {
		const currentWorkingDirectory = process.cwd()
		class ClassToBeAnnotated {}
		const annotatedClass = Service()(ClassToBeAnnotated)
		const serviceOptions: ServiceOptions = Reflect.getMetadata(Metadata.SERVICE_OPTIONS, annotatedClass) as ServiceOptions
		expect(serviceOptions.serviceDirectory).toBe(currentWorkingDirectory)
	})
	it('should use the provided serviceDirectory property in the options', () => {
		const providedServiceDirectory = 'temporaryDir'
		class ClassToBeAnnotated {}
		const annotatedClass = Service({ serviceDirectory: providedServiceDirectory })(ClassToBeAnnotated)
		const serviceOptions: ServiceOptions = Reflect.getMetadata(Metadata.SERVICE_OPTIONS, annotatedClass) as ServiceOptions
		expect(serviceOptions.serviceDirectory).toBe(providedServiceDirectory)
	})
})
