/* eslint-disable @typescript-eslint/no-var-requires */

const express = require('express');
const path = require('path');
const axios = require('axios');
const dayjs = require('dayjs');

const app = express();
const port = 9001;
const { createProxyMiddleware } = require('http-proxy-middleware');

const HttpsProxyAgent = require('https-proxy-agent');
const { AuthorizationCode } = require('simple-oauth2');

app.get('/testing', (req, res) => {
  res.send('Hello World!');
});

console.log('path', __dirname);

let cachedOAuthMeta = null;

// const clusterSvcUrl = "https://kubernetes.default.svc.cluster.local";
const clusterSvcUrl = 'https://c116-e.us-south.containers.cloud.ibm.com:31468';
let clusterApiProxyOptions = {
  target: clusterSvcUrl,
  changeOrigin: true,
  // pathRewrite: {
  //   "^/cluster-api/": "/",
  // },
  pathRewrite: {
    '^/mig-api/': '/',
  },
  logLevel: process.env.DEBUG ? 'debug' : 'info',
  secure: false,
  ws: true,
  onProxyReq: (proxyReq, req, res) => {
    // add custom header to request
    // proxyreq.setheader("x-added", "foobar");
    // or log the req
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Content-Security-Policy'] = 'sandbox';
    proxyRes.headers['X-Content-Security-Policy'] = 'sandbox';
  },
};

const clusterApiProxy = createProxyMiddleware(clusterApiProxyOptions);
app.use('/mig-api/', clusterApiProxy);
// app.use("/cluster-api/", clusterApiProxy);

app.get('/login', async (req, res, next) => {
  try {
    const clusterAuth = await getClusterAuth();

    //TODO: operator needs to use this redirect uri
    // redirectURIs:
    // - http://localhost:9000/api/plugins/crane-ui-plugin/login/callback

    const authorizationUri = clusterAuth.authorizeURL({
      redirect_uri: 'http://localhost:9000/api/plugins/crane-ui-plugin/login/callback',
      // redirect_uri: "http://localhost:9000/login/callback",
      scope: 'user:full',
    });

    res.redirect(authorizationUri);
  } catch (error) {
    console.error(error);
    if (error.response.statusText === 'Service Unavailable' || error.response.status === 503) {
      res.status(503).send(error.response.data);
    } else {
      const params = new URLSearchParams({ error: JSON.stringify(error) });
      const uri = `/handle-login?${params.toString()}`;
      res.redirect(uri);
      next(error);
    }
  }
});
app.get('/login/callback', async (req, res, next) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: 'http://localhost:9000/api/plugins/crane-ui-plugin/login/callback',
  };
  try {
    const clusterAuth = await getClusterAuth();

    const proxyString = process.env['HTTPS_PROXY'] || process.env['HTTP_PROXY'];
    let httpOptions = {};
    if (proxyString) {
      httpOptions = {
        agent: new HttpsProxyAgent(proxyString),
      };
    }

    // If your authorization_endpoint or token_endpoint values retrieved from oauthMeta are listed in the NO_PROXY variable & a proxy is present,
    // you may experience issues.
    // Example endpoint values:
    // "authorization_endpoint": "https://oauth-openshift.apps.cam-tgt-25871.qe.devcluster.openshift.com/oauth/authorize",
    // "token_endpoint": "https://oauth-openshift.apps.cam-tgt-25871.qe.devcluster.openshift.com/oauth/token",
    const accessToken = await clusterAuth.getToken(options, httpOptions);
    const currentUnixTime = dayjs().unix();
    const user = {
      ...accessToken.token,
      login_time: currentUnixTime,
      expiry_time: currentUnixTime + accessToken.token.expires_in,
    };
    const params = new URLSearchParams({ user: JSON.stringify(user) });
    const uri = `/handle-login?${params.toString()}`;
    res.redirect(uri);
  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

//Helpers
const getOAuthMeta = async () => {
  if (cachedOAuthMeta) {
    return cachedOAuthMeta;
  }
  const oAuthMetaUrl = `${clusterSvcUrl}/.well-known/oauth-authorization-server`;

  const res = await axios.get(oAuthMetaUrl);
  cachedOAuthMeta = res.data;
  return cachedOAuthMeta;
};

const getClusterAuth = async () => {
  const oAuthMeta = await getOAuthMeta();
  return new AuthorizationCode({
    client: {
      id: 'mig-ui',
      secret: 'OAUTH-SECRET-HERE',
    },
    auth: {
      tokenHost: oAuthMeta.token_endpoint,
      authorizePath: oAuthMeta.authorization_endpoint,
    },
  });
};

app.use(express.static(path.join(__dirname, '../dist'))); //  "public" off of current is root

app.listen(port, () => {
  console.log(`Mig UI plugin app listening at http://localhost:${port}`);
});
