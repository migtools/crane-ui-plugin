FROM registry.access.redhat.com/ubi8/nodejs-16:latest as build
ADD . /usr/src/app
WORKDIR /usr/src/app
USER root
RUN dnf config-manager --add-repo https://dl.yarnpkg.com/rpm/yarn.repo \
 && dnf -y install yarn \
 && yarn install \
 && yarn build

FROM registry.access.redhat.com/ubi8/nginx-120:latest
COPY --from=build /usr/src/app/dist /opt/app-root/src
COPY deploy.yaml /deploy.yaml
ENTRYPOINT ["nginx", "-g", "daemon off;"]
