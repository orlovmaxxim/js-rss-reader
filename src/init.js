import 'bootstrap';
import $ from 'jquery';
import validator from 'validator';
import axios from 'axios';
import './main.scss';

export default () => {
  const state = {
    address: '',
    addedRssFlow: [],
    formValid: true,
  };

  const rssForm = document.getElementById('rss-form');
  const rssInput = rssForm.querySelector('#rss-input');
  const errorSignature = rssInput.nextElementSibling;
  const rssBtn = rssForm.querySelector('#rss-btn');
  const rssList = $('.rss-list');
  const descModal = $('#descriptionModal');

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
        articleDesc: val.querySelector('description').innerHTML,
      };
    });

    return { title, description, itemsArr };
  };

  const handleValidate = () => {
    state.address = `${rssInput.value}`;
    const chekAddress = state.address;
    state.formValid = validator.isURL(chekAddress);
    if (!state.formValid) {
      rssInput.classList.add('is-invalid');
      rssBtn.disabled = true;
      errorSignature.textContent = 'invalid address, please write valid url';
    }
    if (state.formValid || !chekAddress) {
      rssInput.classList.remove('is-invalid');
      rssBtn.disabled = false;
      errorSignature.textContent = '';
    }
  };

  const handleSubmitRss = (event) => {
    event.preventDefault();
    if (state.addedRssFlow.find(flow => flow === state.address)) {
      state.formValid = false;
      rssInput.classList.add('is-invalid');
      errorSignature.textContent = 'this flow has already been added';
      return;
    }
    axios.get(state.address)
      .then((response) => {
        const { title, description, itemsArr } = rssParse(response.data);
        rssList.prepend(`<div class="col-6">
          <h2 class='title'>${title}</h2>
          <p class='description'>${description}</p>
          ${itemsArr.map(({ articleTitle, link, articleDesc }) => `<ul class="list-unstyled list-group">
          <li class="list-group-item mb-2">
            <a href=${link}>${articleTitle}</a>
            </br>
            <button type="button" class="btn btn-primary btn-sm btn-outline-dark" data-whatever="${articleDesc}" data-toggle="modal" data-target="#descriptionModal">
              Open description
            </button>
          </li></ul>`).join('')}
        </div>`);
        rssInput.value = '';
        state.addedRssFlow = [state.address, ...state.addedRssFlow];
        state.formValid = true;
        state.address = '';
      })
      .catch((err) => {
        console.log(err);
      });
  };

  rssInput.addEventListener('input', handleValidate);
  rssForm.addEventListener('submit', handleSubmitRss);
  descModal.on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const recipient = button.data('whatever');
    descModal.find('.modal-body').text(recipient);
  });
};
