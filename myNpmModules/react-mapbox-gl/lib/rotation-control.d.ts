/// <reference types="react" />
/// <reference types="mapbox-gl" />
import * as React from 'react';
import { Map } from 'mapbox-gl';
export interface Props {
    position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
    style?: React.CSSProperties;
    className?: string;
}
export interface State {
    hover?: number;
}
export interface Context {
    map: Map;
}
export default class RotationControl extends React.Component<Props, State> {
    context: Context;
    static defaultProps: {
        position: string;
    };
    state: {
        hover: undefined;
    };
    static contextTypes: {
        map: any;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    compassIcon: any;
    private onMouseOut;
    private onMouseIn;
    private onClickCompass;
    private onMapRotate;
    private assignRef;
    render(): JSX.Element;
}
