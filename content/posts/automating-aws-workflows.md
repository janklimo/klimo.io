+++
title = "Automating AWS Workflows"
description = "Using AWS CLI to automatically upload assets to S3 and invalidate CloudFront cache, both locally and on CircleCI."
date = 2019-08-10
tags = ["AWS", "CircleCI", "Shell scripting", "Rails"]
draft = false
+++

> This article shows you how to use AWS CLI programmatically to automate your deployment process. We'll upload assets to S3 (specifying their ACL and caching behavior) and invalidate CloudFront cache. Starting with a local shell script, we conclude with plugging the script into our CircleCI workflow. It may be especially useful if you're using Rails with `Webpacker`, but no experience with Rails is required.

My latest Shopify app [Robin PRO](https://apps.shopify.com/robin-pro-image-gallery) renders image galleries on customer stores. When the store loads, it fetches a remote script (`client.js`) together with a stylesheet (`client.css`), requests gallery data and renders the result.

### How to serve these assets?

All the app assets are served from a CDN, so why not just serve them from the same distribution, right? There are 2 challenges with this:

1. When creating a [script tag](https://help.shopify.com/en/api/reference/online-store/scripttag) with Shopify's API, you need to provide a URL of the remote script. This means that the URL cannot change, otherwise the script tag would point to a wrong location. Rails fingerprints compiled assets, so their URL changes with every change of their contents.
2. I split JavaScript bundles into chunks in production but I can only have one remote script.

Given these constraints, I settled on the following workflow:

1. Temporarily disable code splitting of JS bundles.
2. Precompile assets for production locally.
3. Upload [`client.js`](https://d2yb226523mvk3.cloudfront.net/js/client.js) and [`client.css`](https://d2yb226523mvk3.cloudfront.net/css/client.css) to S3. This is a standalone bucket with its own CloudFront distribution. It gives me asset URLs the app can depend on.
4. Set their caching behavior and [ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) so that they come with public access. Setting `Cache-Control` header is important. The URL of the asset never changes, so on one hand, we want to make sure that no browsers cache them forever, on the other hand, basic caching helps performance.
5. Invalidate CloudFront cache to force clients to fetch the latest assets.

All in all, not too terrible to do manually in a few minutes if these releases are infrequent. However, once they do get more frequent, it's time to optimize the process - you're wasting a lot of time on something that a machine can do both better and faster.

> Making a tedious process fully automated is one of programming's greatest joys.

![automate all things](/posts/automating-aws-workflows/automate.jpg)

### Asset deployment script

Let's tackle the 5 steps outlined above one by one. My script is placed in `bin/publish_client`. You can find the full source in [this gist](https://gist.github.com/janklimo/de516d05a42dce5d3bf9084228c4cc33).

##### Selectively disabling code splitting

Any environment variables you pass to `Webpacker` can be accessed from `process.env` object. With that in mind, we can set up our `production.js` file to watch out for a variable that'd disable chunk splitting:

```js
if (!process.env.PUBLISH_CLIENT) {
  environment.splitChunks(config =>
    Object.assign({}, config, {
      optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /node_modules/,
              chunks: "all",
              name: "vendor",
              enforce: true
            }
          }
        }
      }
    })
  );
}
```

##### Precompiling assets locally

We can start writing our shell script:

```bash
#!/bin/sh

# Clean slate
echo "Cleaning up old assets and packs..."
rm -rf public/assets public/packs

# Precompile assets for production
echo "Precompiling assets..."
bundle exec rake assets:precompile RAILS_ENV=production PUBLISH_CLIENT=true
```

In the first step, we clean the public folder. In the second one we precompile assets in production environment. This will minify your code, etc. We pass in the `PUBLISH_CLIENT` flag to make sure we get one JS bundle for each JS pack.

##### Uploading assets to S3

We'll need `AWS CLI` to continue so [install](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) that first.

Then we'll need an IAM user with permissions to access S3 and CloudFront. Navigate to your [IAM console](https://console.aws.amazon.com/iam) and follow these steps:

![creating an IAM user](/posts/automating-aws-workflows/create_iam.gif)

This gives your user _full_ access to S3 and CloudFront. In general, it's a good idea to make these permissions stricter but I'll stick to default policies for the sake of simplicity.

Next, run `aws configure` in your terminal, you will be prompted for these four inputs:

![aws configure](/posts/automating-aws-workflows/aws_configure.gif)

Insert the credentials obtained in the previous step. They'll be saved under a default profile found at `~/.aws/credentials`. Now you can use AWS CLI and authentication will be handled automatically for you. Try running `aws s3 ls` - if you can see a list of your S3 buckets, you're all set!

Copying our assets to S3 becomes trivial:

```bash
# Upload client JS
echo "Uploading client JS to S3..."
js_file_path=$(find ./public/packs/js -name "client-*.js")
aws s3 cp $js_file_path s3://awesome-gallery/js/client.js \
  --cache-control "max-age=86400" \
  --acl public-read

# Upload client CSS
echo "Uploading client CSS to S3..."
css_file_path=$(find ./public/assets -name "client-*.css")
aws s3 cp $css_file_path s3://awesome-gallery/css/client.css \
  --cache-control "max-age=86400" \
  --acl public-read
```

ACL, headers, and lots of other stuff can be set by passing options to the `cp` command. See the [docs](https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html) for more info.

##### Invalidating CloudFront cache

Now that the assets are uploaded, the final step is to invalidate CDN cache:

```bash
# Invalidate CDN cache
echo "Invalidating CDN cache..."
aws cloudfront create-invalidation \
  --distribution-id E37OOSQGDX84GR \
  --paths /js/* /css/*
```

And that's it! From now on, all we need to do is run `bin/publish_client` 🎉

But you know what's better than running a script every time we release a new feature (and forgetting to do so every now and then)? You guessed it: plugging the script into our CI workflow so that we never even have to think about it again.

### CircleCI job

We'll want to keep our credentials out of source control, so let's begin by configuring them as environment variables in CircleCI. Under Build settings - Environment variables, set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_DEFAULT_REGION`. AWS CLI defaults to these variables so they'll be easily found.

![CircleCI](/posts/automating-aws-workflows/circleci.png)

##### Strategy

To begin with, my CircleCI workflow runs two jobs: one to run specs, the other one to deploy to Heroku. Let's add a third one named `publish-client` that runs our shell script after we deploy to Heroku successfully.

##### Steps

We'll make use of _orbs_ functionality in CircleCI 2.1. At the beginning of `config.yml`, add:

```
version: 2.1
orbs:
  aws-cli: circleci/aws-cli@0.1.13
```

so that we can easily define installation and configuration steps with:

```
publish-client:
  steps:
    - aws-cli/install
    - aws-cli/configure
```

Because we have AWS CLI installed and configured, we can run our shell script like we would do locally:

```
- run:
    name: Publish client
    command: bin/publish_client
```

Finally, let's make sure `publish-client` runs only if deployment to Heroku was successful.

```
workflows:
  version: 2
  build-deploy:
    jobs:
      - test
      - deploy-master:
          requires:
            - test
          filters:
            branches:
              only: master
      - publish-client:
          requires:
            - deploy-master
          filters:
            branches:
              only: master
```

Clearly, I have extracted only the interesting bits from my `config.yml` file. If you'd like to see the full version, you can find it [here](https://gist.github.com/janklimo/9175064c792d91dbeffcefcf1020b51b).

```bash
echo "Done!"
```

![test](https://media.giphy.com/media/xNBcChLQt7s9a/source.gif)

In this post we've converted a slow, error-prone workflow to a fully automated one in under 10 minutes. I hope you've found the process as satisfying as I did and that it gives you inspiration to optimize your own! I'd love to hear what you come up with 👍
