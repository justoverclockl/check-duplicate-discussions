import app from 'flarum/forum/app';
import {extend} from 'flarum/common/extend';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';
import Tooltip from 'flarum/common/components/Tooltip';

app.initializers.add('justoverclock/check-duplicate-discussions', () => {
  extend(DiscussionComposer.prototype, 'oncreate', function () {
    const numberOfSimilar = app.forum.attribute('justoverclock-check-duplicate-discussions.similarNumber') || 3;
    const composer = document.querySelector('.ComposerBody-editor');
    const inputTitle = document.querySelector('li.item-discussionTitle > h3 > input');
    let timeout = null;

    function clearSimilarDiscussions() {
      const resultDisc = document.getElementById('sim-container');
      resultDisc ? resultDisc.remove() : false;
    }

    function searchForSimilarDiscussions(title) {
      const checkTitle = app.translator.trans('justoverclock-check-duplicate-discussions.forum.title');
      const desc = app.translator.trans('justoverclock-check-duplicate-discussions.forum.foundDiscussion');

      let simDisc = app.store
        .find('discussions', {
          page: {limit: numberOfSimilar},
          'filter[q]': title,
        })
        .then((res) => {
          if (inputTitle.value === '') return;
          if (res.length > 0) {
            const container = document.createElement('div');
            container.setAttribute('class', 'simdisc-container');
            container.setAttribute('id', 'sim-container');
            container.innerHTML = `
                      <div>
                         <p class="simtitle" >${checkTitle} </p>
                         <p class="simtitle-desc">${desc}</p>
                      </div>
            `;

            res.forEach((sim) => {
              const div = document.createElement('div');
              div.setAttribute('id', 'similar-discussions');
              div.setAttribute('class', 'similar-discussions');
              let baSimilar = sim.data.attributes.hasBestAnswer

              if (baSimilar !== false){
                baSimilar = `<i class="fas fa-check-circle simsolved"></i> ${app.translator.trans('justoverclock-check-duplicate-discussions.forum.solvedSimilar')}`
              } else {
                baSimilar = ''
              }

              div.innerHTML = `
                  <div class="simdisc">
                     <li>
                        <i class="fas fa-exclamation sim"></i>
                        <a class="simlink" href=${app.route.discussion(sim)} rel="nofollow" title="${sim.firstPost().contentHtml().replace(/<\/?[^>]+(>|$)/g, '').substr(0, 200) + '...'}">
                            ${sim.data.attributes.title}
                        </a>
                        <span class="bestAnswer-similar" id="best-similar">${baSimilar}</span>
                     </li>
                  </div>`;
              container.appendChild(div);
              composer.insertAdjacentElement('beforebegin', container);
            });
          }
        });
    }

    inputTitle.addEventListener('keyup', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        searchForSimilarDiscussions(e.target.value);
      }, 1000);
      clearSimilarDiscussions();
    });
  });
});
