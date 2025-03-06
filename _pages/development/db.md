---
title: "DB"
layout: archive
permalink: /dev/db
author_profile: true
types: posts
sidebar:
  nav: "docs"
---

{% assign postsDev = site.posts | where: "categories", "development" %}
{% assign postsDB = postsDev | where: "categories", "db" %}

{% for post in postsDB %}
  {% include archive-single.html type=page.entries_layout %}
{% endfor %}