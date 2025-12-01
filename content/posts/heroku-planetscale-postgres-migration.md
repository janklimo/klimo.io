+++
title = "Migrating from Heroku Postgres to PlanetScale"
description = "A step-by-step guide to migrating your Rails app's database from Heroku Postgres to PlanetScale Postgres"
date = 2025-12-01
tags = ["Heroku", "Postgres", "Ruby on Rails"]
draft = false
+++

I recently migrated [Robin PRO](https://apps.shopify.com/robin-pro-image-gallery) from Heroku Postgres to [PlanetScale Postgres](https://planetscale.com/docs/postgres). PlanetScale, known for their MySQL offering, launched managed Postgres support and I decided to give it a try. The migration turned out to be surprisingly smooth.

There isn't much content out there about migrating specifically from Heroku Postgres to PlanetScale, so I decided to write up my own process.

## Exporting from Heroku Postgres

First, you'll need your Heroku database credentials. You can find these in your Heroku dashboard or by running:

```bash
heroku config:get DATABASE_URL -a your-app-name
```

This will give you a connection string like:

```
postgres://username:password@host:5432/database_name
```

With these credentials, we can use `pg_dump` to export the database:

```bash
pg_dump -h your-heroku-host.cluster-xxx.us-east-1.rds.amazonaws.com \
        -p 5432 \
        -U your_username \
        -d your_database \
        --exclude-schema=_heroku \
        --verbose \
        --no-owner \
        --no-privileges \
        -Fc \
        -f database_dump.dump
```

A few things to note here:

- `--exclude-schema=_heroku` skips _a ton_ of Heroku's internal schema that you don't need
- `--no-owner` and `--no-privileges` ensure the dump doesn't include Heroku-specific ownership and permissions
- `-Fc` uses the custom format which is compressed and binary – this is important for `pg_restore` later

For my 513MB database, this took about 40 seconds.

## Importing to PlanetScale Postgres

Once you have your PlanetScale database set up and connection details ready, you can import the dump. Use the host from your PlanetScale dashboard:

```bash
pg_restore -h your-region.pg.psdb.cloud \
           -p 6432 \
           -U your_planetscale_user \
           -d postgres \
           --verbose \
           --no-owner \
           --no-privileges \
           --jobs=4 \
           database_dump.dump
```

The `--jobs=4` flag runs 4 parallel jobs to speed up the restore. This took about 1 minute 40 seconds for my database.

## Verifying the migration

After the import completes, it's a good idea to verify that everything made it across. You can connect to your new PlanetScale database using:

```bash
psql -h your-region.pg.psdb.cloud \
     -p 6432 \
     -U your_planetscale_user \
     -d postgres
```

This will prompt you for your password. A quick way to check your indexes:

```sql
SELECT
    schemaname,
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname, tablename
ORDER BY tablename;
```

You should see all your tables with their expected index counts.

## Rails configuration

You'll need to update your `database.yml` to use the new connection. I am not 100% sure it's required
but I remember I had to add `schema_search_path: public` to my database configuration for migrations to work correctly:

```yaml
production:
  <<: *default
  username: <%= Rails.application.credentials.planetscale&.fetch(:username) %>
  password: <%= Rails.application.credentials.planetscale&.fetch(:password) %>
  database: <%= Rails.application.credentials.planetscale&.fetch(:database) %>
  host: <%= Rails.application.credentials.planetscale&.fetch(:host) %>
  port: <%= Rails.application.credentials.planetscale&.fetch(:port) %>
  schema_search_path: public
  ssl_mode: verify_identity
```

You can verify your app is connected to the right database by checking in `rails console`:

```ruby
ActiveRecord::Base.connection_db_config.configuration_hash
```

And confirm your schema version:

```bash
bundle exec rails db:version
```

## Detaching the old Heroku database

Here's an important gotcha: Rails will still use `DATABASE_URL` if it's set, regardless of what's in your `database.yml`. Since Heroku automatically sets this environment variable for attached databases, you'll need to detach the old addon:

```bash
heroku addons:detach DATABASE -a your-app-name
```

This removes the `DATABASE_URL` config var, allowing your app to use the new connection string you've configured.

> I'd recommend testing this on staging first. In my case, I ran through the entire process on my staging environment before touching production.

## Things I like so far

Setting up a database with read replicas is dead simple. The `PS-10` plan I went with is a great value:

![PS-10 plan](/posts/heroku-planetscale-postgres-migration/ps-10.png)

No connection limits like you'd see on Heroku.

Frequent, automated backups:

![backups](/posts/heroku-planetscale-postgres-migration/backups.png)

There is no continuous protection on Heroku's Essential plans.

Excellent metrics and insights dashboards. A gem I'm using has been executing an unoptimized query. I wasn't aware of this
and it was super easy to spot (the red warning icon means no index being used):

![insights](/posts/heroku-planetscale-postgres-migration/insights.png)

## Things that aren't there yet

While [branches](https://planetscale.com/docs/vitess/schema-changes/branching) are PlanetScale's killer feature, the support for Postgres
is new and the tooling hasn't caught up yet. I wanted to use the [`planetscale-rails`](https://planetscale.com/docs/vitess/schema-changes/branching) gem in my app but ran into some _"endpoint is only available for Vitess databases"_ roadblocks.

## Wrapping up

The entire migration process was straightforward – export, import, update config, detach. If you're considering moving off Heroku Postgres, PlanetScale is worth a look. The [new $5 Postgres plan](https://planetscale.com/blog/5-dollar-planetscale-is-here) is a particularly
attractive alternative to Heroku's Essential Postgres tiers that have, unfortunately, become very unstable as of late.

Happy migrating!
