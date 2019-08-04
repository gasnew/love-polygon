function getPrimitiveObject(type, meshBuilder, props) {
  const hash = hashObject(type, props);
  if (!getVisualObject(hash)) {
    const { command, height, width } = visualObjectBuilder(props);
    dispatch(addVisualObject(hash, command, height, width));
  }
  return getVisualObject(hash);
}

function Circle({ radius }) {
  return ({ getPrimitiveObject, render }) => {
    return render(
      getPrimitiveObject('Circle', circleMesh, { radius });
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
    render: (...children) => {
      return {
        children,
        transformation,
        height: 5, //height of all children together
        width: 5, //width of all children together
      }
    },
  };
}

const baseObject = CollectionOfShapes({ numberOfSquares: 3 }, { x: 5, y: 5 });
baseObject(renderContext(regl, { x: 0, y: 0 }));
