+++
title = "Speeding Things Up With Ruby Inline"
description = "Rewriting your hot Ruby code in C while staying simple by default."
date = 2019-02-21T13:26:15+07:00
tags = ["Ruby"]
draft = false
+++

One of the fun exercises in [The Complete Guide to Rails Performance](https://www.railsspeed.com/) is to profile
the [`dalli`](https://github.com/petergoldstein/dalli) gem with [`ruby-prof`](https://github.com/ruby-prof/ruby-prof).

After cloning the repository and running `ruby-prof test/benchmark_test.rb`, we get the following summary:

```
 %self      total      self      wait     child     calls  name
 13.56      9.181     9.181     0.000     0.000   193917   <Class::IO>#select
  8.12      9.604     5.498     0.000     4.106   275009   Dalli::Ring#binary_search
  5.01      3.390     3.390     0.000     0.000   272536   Kgio::SocketMethods#kgio_write
   ...
```

That sparked my curiosity. Why is `dalli` spending so much time in `binary_search` and can it be improved?

As it turns out, `dalli` already takes care of it in a pretty interesting way. Here's a simplified version of
`binary_search` method definition (full source [here](https://github.com/petergoldstein/dalli/blob/17344b625676bd1aa45f87757e0b718a3e1ae282/lib/dalli/ring.rb#L78)):

```ruby
begin
  require 'inline'
  inline do |builder|
    builder.c <<-EOM
      int binary_search(VALUE ary, unsigned int r) {
        // C implementation
      }
    EOM
  end
rescue LoadError
  def binary_search(ary, value)
    # Ruby implementation
  end
end
```

We're making use of [`rubyinline`](https://github.com/seattlerb/rubyinline) gem which lets you embed small snippets
of C into your code. They get automatically compiled and loaded into the class/module that
defines them. Definitely handy if all you need is a few lines of C to speed things up.

Why not go the more common native extension route, you might ask? This comment from the source provides an indication:

> optional for performance and only necessary if you are using multiple `memcached` servers.

Clearly, the typical user won't need the native extension. More often than not,
they're a [source of frustration](https://stackoverflow.com/search?q=ruby+native+extension).

I like the flexibility of this _simple-by-default_ design. It allows you to optimize only if your metrics tell you so.
If you need more speed, all you need to do is include `rubyinline` in your bundle, without
further configuration in your code. Here's the kind of performance you'll get:

```
 %self      total      self      wait     child     calls  name
 13.57      7.796     7.796     0.000     0.000   197184   <Class::IO>#select
  6.39      3.672     3.672     0.000     0.000   272536   Kgio::SocketMethods#kgio_write
   ...
  0.77      0.440     0.440     0.000     0.000   275009   Dalli::Ring#binary_search

```

Out of the box, fallback to Ruby implementation by means of `LoadError` has you covered.
