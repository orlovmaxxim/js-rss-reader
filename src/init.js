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
    flowId: 1,
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
        pubDate: val.querySelector('pubDate').innerHTML,
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
    if (state.addedRssFlow.find(flow => flow.url === state.address)) {
      state.formValid = false;
      rssInput.classList.add('is-invalid');
      errorSignature.textContent = 'this flow has already been added';
      return;
    }
    axios.get(state.address)
      .then((response) => {
        const { title, description, itemsArr } = rssParse(response.data);
        rssList.prepend(`<div id="${state.flowId}" class="col-6">
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
        const addedFlow = { url: state.address, lastPubDate: itemsArr[0].pubDate, id: state.flowId };
        state.flowId += 1;
        state.addedRssFlow = [addedFlow, ...state.addedRssFlow];
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

  setInterval(() => {
    state.addedRssFlow.forEach((flow, i) => {
      const lastPubTime = new Date(flow.lastPubDate).getTime();
      axios.get(flow.url)
        .then((response) => {
          const { itemsArr } = rssParse(response.data);
          const newItemsArr = itemsArr.filter(item => new Date(item.pubDate).getTime() > lastPubTime);
          if (newItemsArr.length === 0) {
            return;
          }
          state.addedRssFlow[i].lastPubDate = newItemsArr[0].pubDate;
          $(`#${flow.id}`).find('ul').prepend(`${newItemsArr.map(({ articleTitle, link, articleDesc }) => `
          <li class="list-group-item mb-2">
            <a href=${link}>${articleTitle}</a>
            </br>
            <button type="button" class="btn btn-primary btn-sm btn-outline-dark" data-whatever="${articleDesc}" data-toggle="modal" data-target="#descriptionModal">
              Open description
            </button>
          </li></ul>`).join('')}
        </div>`);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }, 5000);
};
