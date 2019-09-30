+++
title = "Seeding Images From Unsplash"
description = "Get beautiful images seed data with zero effort."
date = 2019-09-30
tags = ["Ruby", "Ruby on Rails"]
draft = false
+++

Recently we've been making a more conscious effort to improve the quality of our seed data.

Firstly, to make it easier to onboard new team members. Secondly, to make the app ready for 
[Review Apps](https://devcenter.heroku.com/articles/github-integration-review-apps). Certainly,
it's a great thing to be able to just re-seed your database if your local experiments go awry 😅

The kind of seeds I've seen over the years typically neglect images. They either use a minimal
placeholder, use a few nicer images that are repeated over and over and checked into source
control, or don't do anything at all. How can we get this kind of awesomeness with almost
no effort?

![Seeded images](/posts/unsplash-seeds/seeds.png)

Enter...

### Unsplash

[Unsplash](https://unsplash.com/) is _the internet's source of freely useable images_. It comes 
with a simple API we can use to seed our images from. Here's how:

[Sign up and create your app](https://unsplash.com/developers) to get your API credentials.

Install the gem:

```ruby
# API for seeding free, high-definition photos
gem 'unsplash'
```

Initialize it (e.g. `config/initializers/unsplash.rb`):

```ruby
Unsplash.configure do |config|
  config.application_access_key = ENV['UNSPLASH_ACCESS_KEY']
  config.application_secret = ENV['UNSPLASH_SECRET_KEY']
  config.utm_source = 'your_app_name'
end
```

With that set up, you can fetch a collection of images with a single command:

```ruby
unsplash_images = Unsplash::Photo.search('architecture', 1, 25)
```

This tells Unsplash to return page 1 of the results and use 25 records per page.

Here's the final implementation used to seed data:

```ruby
module Seeds
  module Images
    def self.seed(property:)
      p 'Seeding property images...'

      # Add more than 20 items to test pagination.
      unsplash_images = Unsplash::Photo.search('architecture', 1, 25)

      unsplash_images.each do |unsplash_image|
        image = Properties::Image.create!(
          property: property,
          category: Properties::Image.categories.keys.sample,
          taken_on: rand(5..200).days.ago,
          title: unsplash_image.description,
          file_remote_url: unsplash_image.urls.regular
        )
        Properties::Images::Publisher.(image)
      end

      p 'Done seeding images! 🎉'
    rescue Unsplash::UnauthorizedError
      p 'Unsplash API keys not found, no images will be seeded.'
    end
  end
end
```

Rescuing from `Unsplash::UnauthorizedError` gives us the flexibility to make this an opt-in
feature available if you set up your Unsplash ENV variables.

Careful observer will notice that this is not your typical structure of `seeds.rb`. In an
effort to make our seeds more maintainable, we've broken it down into modules.

Every module has a single responsibility that is responsible for seeding just one type of records.
We keep these under `db/seeds/*.rb`.

This allows for a wonderfully clean `seeds.rb` file 🎉

```ruby
Dir[Rails.root.join('db', 'seeds', '*.rb')].each { |f| require f }

ApplicationRecord.transaction do
  property = Property.create(name: 'Empire State Building')
  Seeds::Images.seed(property: property)
  # Seeds::Tenants.seed(property: property)
  # Seeds::Files.seed(property: property)
  # etc.
end
```

Eager to learn about your experience with making seeds more useful!
