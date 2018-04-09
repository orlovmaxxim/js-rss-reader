import _ from 'lodash';
import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './main.scss';

const component = () => {
  const element = document.createElement('div');
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  return element;
};

document.body.appendChild(component());
