function Circle({ radius }) {
  return ({ getPrimitive }) => {
    const circle = getPrimitive({ mesh: circleMesh(radius) });
  };
}

function CollectionOfShapes({ numberOfSquares }) {
  // do initial calculations based on props

  return ({ getObject, render }) => {
    // set up objects
    const circle = getObject(Circle({ radius: 5 }), { x: 1, y: 3});
    const circle2 = getObject(Circle({ radius: 5 }), { x: circle.x + 1, y: 3});

    // render objects
    return render(
      circle,
      circle2
    )
  };
}

function renderContext(regl) {
  return {
    getPrimitive: ({ mesh }) => {
      return buildPrimitive(regl, mesh);
    },
    getObject: (object, transformation) => {
      // hash and cache here? Should be able to make a hash based on
      // children hashes and parameters? If either changed, call object
      // function
      //
      // calculate height, width
      const renderedObject = buildObject(object(renderContext(regl)));
      this._objects.push(renderedObject);

      return renderedObject;
    },
    render: (...objects) => {
    },
    _objects: [],
  };
}

const baseObject = CollectionOfShapes({ numberOfSquares: 3 }, { x: 5, y: 5 });
baseObject(renderContext(regl));
