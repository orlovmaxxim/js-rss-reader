export default (rssList, rssFlows) => {
  rssList.prepend(`<div id="${rssFlows.flowId}" class="col-6">
    <h2 class='title'>${rssFlows.title}</h2>
    <p class='description'>${rssFlows.description}</p>
    <ul class="list-unstyled list-group">
    ${rssFlows.itemsArr.map(({ articleTitle, link, articleDesc }) => `
    <li class="list-group-item mb-2">
      <a href=${link}>${articleTitle}</a>
      </br>
      <button type="button" class="btn btn-primary btn-sm btn-outline-dark" data-whatever="${articleDesc}" data-toggle="modal" data-target="#descriptionModal">
        Open description
      </button>
    </li>`).join('')}
    </ul>
  </div>`);
};
