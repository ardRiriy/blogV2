declare module 'cloudflare:test' {
	interface ProvidedEnv extends Env {}
}
declare module '*.wasm' {
	const content: WebAssembly.Module;
	export default content;
}
