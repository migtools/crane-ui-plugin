const axios = require('axios');

function setupWebSocket(app) {
  const port = process.env['EXPRESS_PORT'] || 9001;
  const k8s = require('@kubernetes/client-node');
  let WSServer = require('ws').Server;
  let server = require('http').createServer();
  let wss = new WSServer({
    server: server,
  });

  server.on('request', app);

  wss.on('connection', (ctx) => {
    ctx.on('message', (data) => {
      let message;
      try {
        message = JSON.parse(data);
      } catch (e) {
        sendError(ws, 'Wrong format');
        return;
      }

      if (message.type === 'GET_EVENTS') {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        const opts = {};
        kc.applyToRequest(opts);
        const eventsURL = `${
          kc.getCurrentCluster().server
        }/api/v1/namespaces/openshift-migration/events`;

        axios
          .get(eventsURL, {
            headers: { Authorization: `Bearer ${message.token.access_token}` },
          })
          .then(
            (response) => {
              if (response.data) {
                console.log(`statusCode: ${response.statusCode}`);
                const messageObject = {
                  type: 'GET_EVENTS',
                  data: response.data,
                };
                ctx.send(JSON.stringify(messageObject));
              }
              console.log(`body: ${response.data}`);
            },
            (error) => {
              if (error) {
                console.log(`error: ${error}`);
              }
            }
          );
      }
    });

    // handle close event
    ctx.on('close', () => {});
  });

  server.listen(port, function () {
    console.log(`http/ws server listening on ${port}`);
  });
}
module.exports = setupWebSocket;
