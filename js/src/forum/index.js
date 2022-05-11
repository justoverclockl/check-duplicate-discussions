import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';
import DOMPurify from 'dompurify';

app.initializers.add('justoverclock/check-duplicate-discussions', () => {
  extend(DiscussionComposer.prototype, 'oncreate', function () {
    const attrs = this.attrs.composer.height
    console.log(typeof attrs)
    const appContent = document.querySelector('.IndexPage-results.sideNavOffset')
    const newDiv = document.createElement('div')
    newDiv.setAttribute('id', 'simDisc')
    newDiv.setAttribute('class', 'simDisc')
    newDiv.style.bottom = attrs + 'px'
    appContent.prepend(newDiv)
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

    function closeSimilarModal(closeBtnElement) {
      const divToDelete = document.getElementById('sim-container')
      closeBtnElement.addEventListener('click', () => {
        divToDelete.remove()
      })
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
            container.setAttribute('class', 'simdisc-container fade-in');
            container.setAttribute('id', 'sim-container');
            const html = `<div>
                             <div class="simdisc-controls">
                             <p class="simtitle" >${checkTitle}</p>
                             <div class="simdisc-close" id="simdisc-close">&times</div>
                             </div>
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
              const resultHtml = `<div class="simdisc" id="sim-disc">
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
              const closeBtn = document.getElementById('simdisc-close')
              closeSimilarModal(closeBtn)
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
