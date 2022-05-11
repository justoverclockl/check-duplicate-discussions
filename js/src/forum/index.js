import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';
import DOMPurify from 'dompurify';

app.initializers.add('justoverclock/check-duplicate-discussions', () => {
  extend(DiscussionComposer.prototype, 'oncreate', function () {
    const composerDiv = document.getElementById('composer')
    const newDiv = document.createElement('div')
    newDiv.setAttribute('id', 'simDisc')
    newDiv.setAttribute('class', 'simDisc')
    composerDiv.prepend(newDiv)
  })
  extend(DiscussionComposer.prototype, 'oncreate', function () {
    const numberOfSimilar = app.forum.attribute('justoverclock-check-duplicate-discussions.similarNumber') || 3;
    const simDisc = document.getElementById('simDisc')
    const inputTitle = document.querySelector('li.item-discussionTitle > h3 > input');

    let timeout = null;

    function clearSimilarDiscussions() {
      const resultDisc = document.getElementById('sim-container');
      resultDisc ? resultDisc.remove() : false;
    }

    function searchForSimilarDiscussions(title) {
      const checkTitle = app.translator.trans('justoverclock-check-duplicate-discussions.forum.title');
      const desc = app.translator.trans('justoverclock-check-duplicate-discussions.forum.foundDiscussion');

      app.store
        .find('discussions', {
          page: { limit: numberOfSimilar },
          'filter[q]': title.toLowerCase(),
        })
        .then((res) => {
          if (title === '') return;
          if (res.length > 0) {
            const container = document.createElement('div');
            container.setAttribute('class', 'simdisc-container');
            container.setAttribute('id', 'sim-container');
            const html = `<div>
                             <p class="simtitle" >${checkTitle} </p>
                             <p class="simtitle-desc">${desc}</p>
                          </div>`;

            container.innerHTML = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

            res.forEach((sim) => {
              const div = document.createElement('div');
              div.setAttribute('id', 'similar-discussions');
              div.setAttribute('class', 'similar-discussions');
              let baSimilar = sim.data.attributes.hasBestAnswer;

              if (baSimilar !== false) {
                baSimilar = `<i class="fas fa-check-circle simsolved"></i> ${app.translator.trans(
                  'justoverclock-check-duplicate-discussions.forum.solvedSimilar'
                )}`;
              } else {
                baSimilar = '';
              }
              const resultHtml = `<div class="simdisc">
                                    <li>
                                        <i class="fas fa-exclamation sim"></i>
                                             <a class="simlink" href=${app.route.discussion(sim)}
                                                rel="nofollow"
                                                title="${
                                                  sim
                                                    .firstPost()
                                                    .contentHtml()
                                                    .replace(/<\/?[^>]+(>|$)/g, '')
                                                    .substr(0, 200) + '...'
                                                }">
                                                    ${sim.data.attributes.title}
                                             </a>
                                        <span class="bestAnswer-similar" id="best-similar">${baSimilar}</span>
                                    </li>
                                  </div>`;
              div.innerHTML = DOMPurify.sanitize(resultHtml, { USE_PROFILES: { html: true } });
              container.appendChild(div);
              simDisc.appendChild(container);
            });
          }
        });
    }

    inputTitle.addEventListener('keyup', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        searchForSimilarDiscussions(e.target.value.toLowerCase());
      }, 1000);
      clearSimilarDiscussions();
    });
  });
});
