import 'bootstrap';
import $ from 'jquery';
import validator from 'validator';
import axios from 'axios';
import './main.scss';

(() => {
  const state = { address: '', addedRssFlow: [] };

  const rssForm = document.getElementById('rss-form');
  const rssInput = rssForm.querySelector('#rss-input');
  const errorSignature = rssInput.nextElementSibling;
  const rssBtn = rssForm.querySelector('#rss-btn');
  const rssList = $('.rss-list');

  const rssParse = (data) => {
    const itemsArr = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'application/xml');
    const channel = doc.querySelector('channel');

    const title = channel.querySelector('title').innerHTML;
    const description = channel.querySelector('description').innerHTML;

    const items = channel.querySelectorAll('item');
    items.forEach((val, i) => {
      itemsArr[i] = {
        articleTitle: val.querySelector('title').innerHTML,
        link: val.querySelector('link').innerHTML,
      };
    });

    return { title, description, itemsArr };
  };

  const handleValidate = () => {
    state.address = `${rssInput.value}`;
    const chekAddress = state.address;
    const isValidUrl = validator.isURL(chekAddress);
    if (!isValidUrl) {
      rssInput.classList.add('is-invalid');
      rssBtn.disabled = true;
      errorSignature.textContent = 'invalid address, please write valid url';
    }
    if (isValidUrl || !chekAddress) {
      rssInput.classList.remove('is-invalid');
      rssBtn.disabled = false;
      errorSignature.textContent = '';
    }
  };

  const handleSubmitRss = (event) => {
    event.preventDefault();
    if (state.addedRssFlow.find(flow => flow === state.address)) {
      rssInput.classList.add('is-invalid');
      errorSignature.textContent = 'this flow has already been added';
      return;
    }
    axios.get(state.address)
      .then((response) => {
        const { title, description, itemsArr } = rssParse(response.data);
        rssList.prepend(`<div>
          <h2 class='title'>${title}</h2>
          <p class='description'>${description}</p>
          ${itemsArr.map(({ articleTitle, link }) => `<ul class="list-unstyled">
          <li>
            <a href=${link}>${articleTitle}</a>
          </li></ul>`).join('')}
        </div>`);
        console.log(state.address);
        rssInput.value = '';
        state.addedRssFlow = [state.address, ...state.addedRssFlow];
      })
      .catch((err) => {
        console.log(err);
      });
  };

  rssInput.addEventListener('input', handleValidate);
  rssForm.addEventListener('submit', handleSubmitRss);
})();
