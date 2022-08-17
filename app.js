// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newService = (function(){
  const apiToken = '0f2e1e69db944c2090893d7d6bb40415';
  const apiURL = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadLines(country = 'ua', category='health', cb) {
      http.get(`${apiURL}/top-headlines?country=${country}&category=${category}&apiKey=${apiToken}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiURL}/everything?q=${query}&apiKey=${apiToken}`, cb);
     }
  }
})()

//element
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categoryInput = form.elements['category'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

//load news function
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categoryInput.value;
  if (!searchText){
    newService.topHeadLines(country, category, getResponse);
  } else {
    newService.everything(searchText, getResponse);
    }
}

//function on get response
function getResponse(err, response) {
  removePreloader();
  if (err) {
    showMessage(err, 'error-msg');
    return;
  }
  if (!response.articles.length) {
    //show empty message
    return;
  }
  renderNews(response.articles);
}

function clearConataner(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

//function render news
function renderNews(news) {
  const newsContainer = document.body.querySelector('.news-container .row');
  if (newsContainer.children.length) {
      clearConataner(newsContainer);
  }
  let htmlFragment = '';
  news.forEach(newsItem => {
    const el = templateNewsItem(newsItem);
    htmlFragment += el;
  });

  //newsContainer.innerHTML = '';
  newsContainer.insertAdjacentHTML('afterbegin', htmlFragment);
}

//template one news
function templateNewsItem({ url,title,description, urlToImage }) {
  return `
  <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${urlToImage || 'https://prikolist.club/wp-content/uploads/2019/11/Screenshot_10-7.jpg'}">
        <span class="card-title">${title || ''}</span>
      </div>
      <div class="card-content">
        <p>${description || ''}</p>
      </div>
      <div class="card-action">
      <a href=${url}>Read more</a>
      </div>
    </div>
</div>`
}

function showMessage(texts, type = 'success') {
  M.toast({ html: texts, classes: type });
}
// show loader 
function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
  <div class=progress-wrap>
    <div class="progress">
      <div class=""></div>
    </div>
  </div>
  `)
}

function removePreloader() {
  const loader = document.querySelector('.progress-wrap');
  document.querySelector(".progress").loader.classList.remove("progress");
  if (loader) {
    loader.remove();
  }
}