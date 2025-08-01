---
title: "Data Structure"
layout: archive
permalink: /dev/ds
author_profile: true
types: posts
sidebar:
  nav: "docs"
---

{% assign postsDev = site.posts | where: "categories", "development" %}
{% assign postsDS = postsDev | where: "categories", "data-structure" %}

{% for post in postsDS %}
  {% include archive-single.html type=page.entries_layout %}
{% endfor %}
