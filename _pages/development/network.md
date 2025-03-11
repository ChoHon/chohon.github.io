---
title: "Network"
layout: archive
permalink: /dev/network
author_profile: true
types: posts
sidebar:
  nav: "docs"
---

{% assign postsDev = site.posts | where: "categories", "development" %}
{% assign postsNetwork = postsDev | where: "categories", "network" %}

{% for post in postsNetwork %}
  {% include archive-single.html type=page.entries_layout %}
{% endfor %}
