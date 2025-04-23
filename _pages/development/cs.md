---
title: "CS"
layout: archive
permalink: /dev/cs
author_profile: true
types: posts
sidebar:
  nav: "docs"
---

{% assign postsDev = site.posts | where: "categories", "development" %}
{% assign postsCS = postsDev | where: "categories", "cs" %}

{% for post in postsCS %}
  {% include archive-single.html type=page.entries_layout %}
{% endfor %}
