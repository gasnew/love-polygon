// @flow

import _ from 'lodash';

import { stagifyPosition, transform, vectorize } from './graphics';
import buildPrimitive from './buildPrimitive';
import dispatch, { addPrimitive } from '../state/actions';
import { getPrimitive, getStageDimensions } from '../state/getters';
import type { Regl } from 'regl';
import type { Component, Renderable } from './components/index';
import type { Mesh } from './meshes';
import type { Position } from '../state/state';

type PrimitiveComponentProps<MeshProps, DynamicProps> = {
  type: string,
  buildMesh: MeshProps => Mesh,
  meshProps: MeshProps,
  dynamicProps?: DynamicProps,
};
export type RenderContext = {
  getRenderable: (Component, ?Position) => Renderable,
  PrimitiveComponent: <MeshProps, DynamicProps>(
    PrimitiveComponentProps<MeshProps, DynamicProps>
  ) => Component,
  render: (...renderables: Array<?Renderable>) => Renderable,
};
export type RenderContextBuilder = (Regl, Position) => RenderContext;

export default function renderContext(
  regl: Regl,
  position: Position
): RenderContext {
  return {
    getRenderable: (object, newPosition) => {
      return object(
        renderContext(regl, transform(position, newPosition || { x: 0, y: 0 }))
      );
    },
    // NOTE(gnewman): I think it's a flow bug, but we have to re-annotate the
    // function type here lest the generics throw a fit and get screwed up. It
    // works this way, so I'm leaving it until further notice! :)
    PrimitiveComponent: <MeshProps, DynamicProps>({
      type,
      buildMesh,
      meshProps,
      dynamicProps,
    }: PrimitiveComponentProps<MeshProps, DynamicProps>) => {
      const hash = JSON.stringify({ type, meshProps });
      if (!getPrimitive(hash)) {
        dispatch(
          addPrimitive(
            hash,
            buildPrimitive({
              regl,
              mesh: buildMesh(meshProps),
            })
          )
        );
      }
      const primitive = getPrimitive(hash);

      return context => ({
        children: [],
        position,
        render: () =>
          primitive.command({
            ...getStageDimensions(),
            ...vectorize(stagifyPosition(position)),
            ...dynamicProps,
          }),
        height: primitive.height,
        width: primitive.width,
      });
    },
    render: (...children) => {
      const realChildren = _.compact(children);
      const findWidth = renderables =>
        _.max(
          _.map(renderables, ({ width, position }) => position.x + width / 2)
        ) -
        _.min(
          _.map(renderables, ({ width, position }) => position.x - width / 2)
        );
      const findHeight = renderables =>
        _.max(
          _.map(renderables, ({ height, position }) => position.y + height / 2)
        ) -
        _.min(
          _.map(renderables, ({ height, position }) => position.y - height / 2)
        );
      return {
        children: realChildren,
        position,
        render: () => _.each(_.reverse(realChildren), child => child.render()),
        height: findHeight(realChildren), //height of all children together
        width: findWidth(realChildren), //width of all children together
      };
    },
  };
}
