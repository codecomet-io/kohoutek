export type Pipeline = {
	// generated nanoid of the pipeline
	id: string

	// the fully qualified name of the path to a CodeComet pipeline file within a git repo
	fqn: string

	// user chosen short name for the pipeline. Example: "My Pipeline for Netlify"
	name: string

	// user defined description for the pipeline. Example: "This pipeline is doing fancy and boo"
	description: string
}
