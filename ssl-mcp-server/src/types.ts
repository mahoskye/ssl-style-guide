// TypeScript interfaces derived from ssl-element-list.schema.json

export type ElementType = "class" | "function" | "keyword" | "literal" | "operator" | "special_form";

export interface Members {
  methods: string[];
  properties: string[];
}

export interface Related {
  returned_by?: string[];
  returns?: string[];
  see_also?: string[];
}

export interface Element {
  type: ElementType;
  name: string;
  symbol: string | null;
  syntax: string[];
  members: Members | null;
  related: Related | null;
}

// Class member types
export interface ClassMember {
  name: string;
}

export interface ClassValidation {
  name: string;
  members: {
    methods: ClassMember[];
    properties?: ClassMember[];
  };
}

export interface ClassMemberValidationFile {
  classes: ClassValidation[];
}

// Search result
export interface SearchResult {
  name: string;
  type: ElementType;
  syntax: string;
}

// Naming validation result
export interface NamingValidationResult {
  valid: boolean;
  prefix: string;
  inferred_type: string | null;
  body: string;
  issues: string[];
}
