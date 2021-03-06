import curry from './curry';
import reduce from './reduce';

const pick = (props, obj) =>
  reduce(
    (acc, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop)
        ? Object.assign(acc, {
            [prop]: obj[prop],
          })
        : acc,
    {},
    props
  );

export default curry(pick);
