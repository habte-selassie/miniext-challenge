export type LoadingTypes = 'not-loaded' | 'loading' | 'loaded' | 'failed';

export enum LoadingStateTypes {
    NOT_LOADED = 'not-loaded',
    LOADING = 'loading',
    LOADED = 'loaded',
    FAILED = 'failed',
}

export type LoadingState =
    | { type: 'not-loaded' }
    | { type: 'loading' }
    | LoadedState
    | { type: 'failed'; errorMessage: string };

export interface LoadedState {
    [x: string]: any;
    type: 'loaded';
    data: any;
}
