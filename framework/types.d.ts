import { ParseArgsOptionsConfig, ParseArgsOptionsType } from 'node:util';

/**
 * Configuration for a CLI argument option that gets passed to Node.js parseArgs
 */
export interface KipukaOption {
  /** The name of the option, must match a key from ParseArgsOptionsConfig */
  name: keyof ParseArgsOptionsConfig;
  /** The type of the CLI argument (string, boolean, etc.) */
  type: ParseArgsOptionsType;
  /** Human-readable description of what this option does */
  description?: string;
}

/**
 * Context provided to runArgsTransforms functions
 */
export interface ArgsTransformContext {
  /** Name of the kipuka */
  name: string;
}

/**
 * Configuration for a kipuka (containerized environment)
 */
export interface KipukaConfig {
  /** Display name for this kipuka */
  name?: string;
  /** Base Docker image to build from */
  from?: string;
  /** 
   * Dockerfile transformations - functions that modify Dockerfile setup lines
   * Each function receives an array of Dockerfile lines and returns the modified array
   */
  imageTransforms?: Array<(setup: string[]) => string[]>;
  /** 
   * Docker run arguments transformations - functions that modify docker run command arguments
   * Each function receives an array of arguments and returns the modified array
   */
  runArgsTransforms?: Array<(args: string[], context: ArgsTransformContext) => string[]>;
}

/**
 * A component that can be composed into a kipuka
 */
export interface KipukaComponent {
  /** Unique identifier that must match the name of the component function */
  id: string;
  /** CLI options that this component defines */
  options: KipukaOption[];
  /** 
   * Function called during component composition to generate configuration
   * Receives parsed CLI values and options, returns kipuka configuration
   */
  handler: (params: {
    /** Parsed CLI option values */
    values: Record<string, any>;
    /** Positional CLI arguments */
    positionals?: string[];
    /** Available options for this component */
    options?: KipukaOption[]
  }) => KipukaConfig;
}

/**
 * Global configuration for all kipukas in the system
 */
export interface KipukasGlobalConfig {
  /**
   * Extensions to all kipukas inheriting from kipuka.
   * If you want to customize a single kipuka, create a file next to this instead.
   * Can contain any string key, but 'root', 'user', and 'cli' have special meaning.
   */
  extensions: {
    /** Extensions for root kipuka */
    root?: KipukaComponent[];
    /** Extensions for user kipuka */
    user?: KipukaComponent[];
    /** Extensions for cli kipuka */
    cli?: KipukaComponent[];
    /** Additional extensions can be added with any string key */
    [key: string]: KipukaComponent[] | undefined;
  };

  /**
   * CLI commands to run in a kipuka after 'kipuka alias'
   */
  aliases: string[];
}