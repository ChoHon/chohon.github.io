---
title: "Algorithm"
layout: archive
permalink: /dev/algorithm
author_profile: true
types: posts
sidebar:
  nav: "docs"
---

{% assign postsDev = site.posts | where: "categories", "development" %}
{% assign postsAlgorithm = postsDev | where: "categories", "algorithm" %}

{% for post in postsAlgorithm %}
  {% include archive-single.html type=page.entries_layout %}
{% endfor %}
