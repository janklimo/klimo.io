+++
title = "What Is Your App's MRR?"
description = "An easy way to find out current MRR of your Shopify app."
date = 2019-09-17
tags = ["Shopify", "Ruby on Rails"]
draft = false
+++

One of the most useful features I'd love to see Shopify add to the Partners portal is
a chart of your MRR (monthly recurring revenue).

This answers a simple question of _What is the current value of all of my active recurring charges?_
In other words, how much money will you receive in the _next_ 30 days?

There is one problem with the _Earnings_ chart:

![earnings](/posts/what-is-your-apps-mrr/earnings.png)

It's a _lagging_ indicator showing you the _last_ 30 days. Not very helpful if you need to know
if your marketing or sales efforts are moving the needle.

To find out my current MRR, I've put together a rake task that runs once daily
(using [Heroku Scheduler](https://devcenter.heroku.com/articles/scheduler)) and sends me an
email with the result (thanks, [Sendgrid](https://sendgrid.com/)!).

Here's what it looks like:

```ruby
# frozen_string_literal: true

desc 'Send out daily MRR update email'
task mrr_email: :environment do
  mrr = 0

  Shop.all.find_each do |shop|
    ShopifyAPI::Session.temp(
      domain: shop.shopify_domain,
      token: shop.shopify_token,
      api_version: ShopifyApp.configuration.api_version
    ) do
      p "Reading #{shop.shopify_domain}..."

      begin
        current_charge = ShopifyAPI::RecurringApplicationCharge.current

        next unless current_charge

        mrr += current_charge.attributes['price'].to_f
      rescue ActiveResource::UnauthorizedAccess
        p 'App uninstalled...'
      rescue ActiveResource::ClientError
        p 'Store closed / charge expired...'
      end
    end
  end

  # Account for Shopify's 20% fee
  final_amount = (mrr * 0.8).round(2)
  p "Your MRR is $#{final_amount}."

  NotificationsMailer.mrr_update(amount: final_amount).deliver_now
end
```

**Pro tip:** Set it up so that you receive it as the first thing in the morning and include
some positive encouragement. You're doing a fine job - make sure you know it's making a
difference and pat yourself on the shoulder to keep going! 💪

Here's mine:

![MRR email](/posts/what-is-your-apps-mrr/email.png)

Hope it helps!
