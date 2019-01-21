'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)(); // @flow

app.set('port', process.env.PORT || 3001);

app.post('/api/graph', function (req, res) {
  res.json({ message: 'ice' });
});

app.listen(app.get('port'), function () {
  console.log('love-polygon server has started at http://localhost:' + app.get('port') + '/');
});
