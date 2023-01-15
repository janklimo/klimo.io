+++
title = "Migrating acts_as_list to ranked-model"
description = "A step-by-step guide to migrate your data."
date = 2023-01-15
tags = ["Ruby on Rails", "Postgres", "Heroku"]
draft = false
+++

I've been using [`acts_as_list`](https://github.com/brendon/acts_as_list) since the very first release of
my [app](https://apps.shopify.com/robin-pro-image-gallery). Lately I've noticed that it occasionally creates duplicate position values (a
position of a record in a sorted collection should be unique). Besides, the algorithm for reordering items is not exactly optimal.
For example, moving a record from the last position to the first will update every record in the list. Good reasons to migrate to
[`ranked-model`](https://github.com/brendon/ranked-model) which uses a more sophisticated
[algorithm](https://github.com/brendon/ranked-model#internals) to minimize DB writes.

### Migrating data

My app works with galleries that have many images ranked by their `position` value.

While things should just work out of the box, it is a good idea to migrate data to work well with `ranked-model`.

Firstly, to get rid of duplicate ranks.

Secondly, if we deploy this while ranks are sequential, every user will trigger a rebalance almost instantly.

To prevent this extra load on the database, let's space the records further apart:

```SQL
WITH cte AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY gallery_id ORDER BY position, updated_at) as new_position
  FROM images
)
UPDATE images
SET position = 100000 * cte.new_position
FROM cte
WHERE images.id = cte.id;
```

[`ROW_NUMBER`](https://www.postgresql.org/docs/current/functions-window.html) is a window function that returns the number
of the current row within its partition, counting from 1. We partition by galleries and we're taking care of any duplicate
values by sorting by `postion` and also `updated_at` values.

Multiplying the row number will ensure images are ranked in increments of 100,000. This number is arbitrary but also
guarantees no record exceeds the upper bound of the integer type (2147483647). My app's biggest gallery
has less than 2,000 images so this will work ok.

### Safety first

Updating every record in production database feels intimidating but it doesn't have to be.

First of all, create a backup in case anything goes wrong. This is self-explanatory.

![backup](/posts/migrating-acts-as-list-ranked-model/backup.png)

Another tool in our tool belt is pulling production database to a local copy to test the update. Heroku has a handy command for this:

```
heroku pg:pull DATABASE_NAME local-database-name -a app-name
```

Run the SQL command above locally using `psql local-database-name` and verify it updates data correctly.
Then we're ready to update live data.

To give you an idea of how long this might take, here's what I got:

![update](/posts/migrating-acts-as-list-ranked-model/update.png)

380k records in about 7 seconds, not bad.
