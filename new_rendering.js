function Circle({ radius }) {
  return ({ buildPrimitiveComponent, getObject, render }) => {
    return render(
      getObject(buildPrimitiveComponent('Circle', circleMeshBuilder, { radius }));
    );
  };
}

function CollectionOfShapes({ numberOfSquares }) {
  // do initial calculations based on props

  return ({ render, getObject }) => {
    // set up objects
    const circle = getObject(Circle({ radius: 5 }), { x: 1, y: 3});
    const circle2 = getObject(Circle({ radius: 5 }), { x: circle.x + 1, y: 3});

    // render objects
    return render(
      circle,
      circle2
    );
  };
}

function renderContext(regl, baseTransformation) {
  return {
    getObject: (object, transformation) => {
      return object(renderContext(regl, transform(baseTransformation, transformation)));
    },
    buildPrimitiveComponent: (type, meshBuilder, props) => {
      // need to cache height and witdh, actually
      const hash = hashObject(type, props);
      if (!getCommand(hash)) {
        dispatch(addCommand(hash, buildCommand(regl, buildMesh())));
      }
      const command = getCommand(hash);

      return (renderContext) => ({
        children: [],
        transformation: baseTransformation,
        render: () => command({
          ...getStageDimensions(),
          ...vectorize(stagifyPosition(position)),
          ...props,
        }),
      });
    },
    render: (...children) => {
      return {
        children,
        transformation,
        render: _.each(children, child => child.render()),
        height: 5, //height of all children together
        width: 5, //width of all children together
      }
    },
  };
}

const baseObject = CollectionOfShapes({ numberOfSquares: 3 }, { x: 5, y: 5 });
baseObject(renderContext(regl, { x: 0, y: 0 }));
