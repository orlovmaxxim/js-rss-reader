import 'bootstrap';
import $ from 'jquery';
import validator from 'validator';
import axios from 'axios';
import rssParse from './rss-parse';
import renderRssFlow from './rss-render';
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
        const addedFlow = {
          title,
          description,
          itemsArr,
          url: state.address,
          lastPubDate: itemsArr[0].pubDate,
          id: state.flowId,
        };
        state.addedRssFlow = [addedFlow, ...state.addedRssFlow];
        renderRssFlow(rssList, state.addedRssFlow[0]);
        rssInput.value = '';
        state.flowId += 1;
        state.formValid = true;
        state.address = '';
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateFlow = ({ url, lastPubDate, id }) => {
    const lastPubTime = new Date(lastPubDate).getTime();
    axios.get(url)
      .then((response) => {
        const { itemsArr } = rssParse(response.data);
        const newItemsArr = itemsArr.filter(item => new Date(item.pubDate).getTime() > lastPubTime);
        if (!newItemsArr.length) {
          return;
        }
        $(`#${id}`).find('ul').prepend(`${newItemsArr.map(({ articleTitle, link, articleDesc }) => `
        <li class="list-group-item mb-2">
          <a href=${link}>${articleTitle}</a>
          </br>
          <button type="button" class="btn btn-primary btn-sm btn-outline-dark" data-whatever="${articleDesc}" data-toggle="modal" data-target="#descriptionModal">
            Open description
          </button>
        </li>`).join('')}`);
        const itemIndexTimeChange = state.addedRssFlow.length - id;
        state.addedRssFlow[itemIndexTimeChange].lastPubDate = newItemsArr[0].pubDate;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateNewsOnFlow = () => {
    Promise.all(state.addedRssFlow.map(updateFlow))
      .then(() => setTimeout(updateNewsOnFlow, 5000));
  };

  rssInput.addEventListener('input', handleValidate);
  rssForm.addEventListener('submit', handleSubmitRss);
  descModal.on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const recipient = button.data('whatever');
    descModal.find('.modal-body').text(recipient);
  });
  updateNewsOnFlow();
};
