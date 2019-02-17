---
title: "Optimizing for Performance with Ruby Inline"
description: "something something"
date: 2019-02-17T18:26:15+07:00
draft: false
---

One of the fun exercises in [The Complete Guide to Rails Performance](https://www.railsspeed.com/) is to profile
the [`dalli`](https://github.com/petergoldstein/dalli) gem with [`ruby-prof`](https://github.com/ruby-prof/ruby-prof).

After cloning the gem repo and running `ruby-prof test/benchmark_test.rb`, we get the expected summary:

```
 %self      total      self      wait     child     calls  name
 13.56      9.181     9.181     0.000     0.000   193917   <Class::IO>#select
  8.12      9.604     5.498     0.000     4.106   275009   Dalli::Ring#binary_search
  5.01      3.390     3.390     0.000     0.000   272536   Kgio::SocketMethods#kgio_write
```
That sparked my curiosity. Why is `dalli` spending so much time in `Dalli::Ring#binary_search` and can it be improved?




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

You can see the full source [here](https://github.com/petergoldstein/dalli/blob/17344b625676bd1aa45f87757e0b718a3e1ae282/lib/dalli/ring.rb#L78).


```
 %self      total      self      wait     child     calls  name
 13.57      7.796     7.796     0.000     0.000   197184   <Class::IO>#select
  6.39      3.672     3.672     0.000     0.000   272536   Kgio::SocketMethods#kgio_write
 .
 .
 .
  0.77      0.440     0.440     0.000     0.000   275009   Dalli::Ring#binary_search

```