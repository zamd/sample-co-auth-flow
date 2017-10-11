- POST `/co/authenticate` to authenticate and create session if 3rd party cookies are enabled
- Next start the authorization transaction with `login_ticket` returend in previous step
- auth0-server checks if a session exists and matches with `login_ticket` - if yes, transaction proceeds as normal
- if `login_ticket` is present and **no** session exists - auth0-server would start fallback authentication
 
 ## fallback auth ##

- auth0-server reads the fallback-page url and returns a page with the url embedded in an iFrame. 
- The auth0-server page has *embedded* state and require the iframe to read the `verifier` from the original domain and send it to `auth0-server page`.
- the page creates an inline frame and waits for it to send a `ready` message
- when inline frame is ready - the `auth0-server` page send a `verifier-request`
- the inline frame readys the `verifier` from `sessionStorage` and send it back
- the `auth0-server` page sends the `verifier` and `state` back to auth0 to establish session and complete authorization transaction

```html
  <body>
    <form action="/co/verify" method="post"></form>

    <script type="text/javascript">
      var iframeURL = 'https://requestb.in/118ce081#origin=https://atlassian-cse.auth0.com';
      var targetOrigin = 'https://requestb.in';
      var id = 'VksTXIfZyz-A';

      window.addEventListener('message', function(evt) {
        switch (evt.data.type) {
          case 'ready':
            evt.source.postMessage({ type: 'co_verifier_request', request: { id: id } }, targetOrigin);
            break;

          case 'co_verifier_response':
            if (evt.data.response && evt.data.response.verifier) {
              var vnode = document.createElement('input');
              vnode.setAttribute('type', 'hidden');
              vnode.setAttribute('name', 'verifier');
              vnode.setAttribute('value', evt.data.response.verifier);
              document.forms[0].appendChild(vnode);
            }

            var snode = document.createElement('input');
            snode.setAttribute('type', 'hidden');
            snode.setAttribute('name', 'state');
            snode.setAttribute('value', 'Df6bMdVJYIm71g0AxbY1vvlZ3PFaJP4d');
            document.forms[0].appendChild(snode);

            document.forms[0].submit();
            break;
        }
      });

      node = document.createElement('iframe');
      node.setAttribute('src', iframeURL);
      node.setAttribute('style', 'display: none;');
      document.body.appendChild(node);
    </script>
  </body>
  ```

## embedded iframe code ##

```javascript
function tryGetVerifier(theWindow, key) {
  try {
    var verifier = theWindow.sessionStorage[key];
    theWindow.sessionStorage.removeItem(key);
    return verifier;
  } catch (e) {
    return '';
  }
}

/**
 * Runs the callback code for the cross origin authentication call. This method is meant to be called by the cross origin authentication callback url.
 *
 * @method callback
 */
CrossOriginAuthentication.prototype.callback = function() {
  var targetOrigin = decodeURIComponent(getFragment('origin'));
  var theWindow = windowHelper.getWindow();

  theWindow.addEventListener('message', function(evt) {
    if (evt.data.type !== 'co_verifier_request') {
      return;
    }
    var key = createKey(evt.origin, evt.data.request.id);
    var verifier = tryGetVerifier(theWindow, key);

    evt.source.postMessage(
      {
        type: 'co_verifier_response',
        response: {
          verifier: verifier
        }
      },
      evt.origin
    );
  });

  theWindow.parent.postMessage({ type: 'ready' }, targetOrigin);
};

```
