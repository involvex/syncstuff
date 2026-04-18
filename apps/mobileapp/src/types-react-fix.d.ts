// Type fix for Ionic + React 18 type incompatibility
// This file tells TypeScript to be more permissive about JSX component types

/// <reference types="react" />
/// <reference types="react-dom" />

// Make all JSX element types accept any return type
declare global {
  namespace JSX {
    type Element = any;
    type ElementClass = any;
    interface ElementAttributesProperty {}
    interface ElementChildrenAttribute {}
    interface IntrinsicElements {
      [name: string]: any;
    }
    interface IntrinsicAttributes {
      [name: string]: any;
    }
  }
}

// Make ReactNode accept any type
declare module "react" {
  interface ReactNode {}
  interface FC<P = {}> {
    (props: P, context?: any): any;
  }
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): any;
  }
}

// Fix React Router v5 types
declare module "react-router" {
  const Component: any;
  export = Component;
  export as namespace Route;
}

declare module "react-router-dom" {
  const Component: any;
  export = Component;
}

export {};
