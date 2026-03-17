# davidagood.com

https://davidagood.com

Built with [Eleventy](https://www.11ty.dev/). Runs on AWS.

## Run Locally

```sh
yarn start
```

## Deploy

CI pipeline runs on GitLab: https://gitlab.com/helloworldless/davidagood-com.

So after merging a change, do this to trigger a deployment:

```sh
git pull origin
git push gitlab
```

...where both repositories are configured like this:

```sh
git remote -v
gitlab	git@gitlab.com:helloworldless/davidagood-com.git (fetch)
gitlab	git@gitlab.com:helloworldless/davidagood-com.git (push)
origin	git@github.com:helloworldless/davidagood.com.git (fetch)
origin	git@gitlab.com:helloworldless/davidagood-com.git (push)
```

See `.gitlab-ci.yml`.
