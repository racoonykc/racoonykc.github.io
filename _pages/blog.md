---
layout: default
permalink: /blog/
title: blog
description: Research notes by Kaicheng Yang.
nav: true
nav_order: 1
---

<div class="personal-blog">
  <header class="blog-heading">
    <p class="blog-eyebrow">{{ site.first_name }} {{ site.last_name }} / Notes</p>
    <h1>{{ site.blog_name }}</h1>
    <p class="blog-intro">{{ site.blog_description }}</p>
  </header>
  {% assign posts = site.posts | sort: 'date' | reverse %}
  <section aria-label="Articles">
    <ul class="blog-entries">
      {% for post in posts %}
        <li class="blog-entry">
          <div class="blog-entry-meta">
            {% if post.status == 'in_progress' %}
              <span class="blog-status">In preparation</span>
            {% else %}
              <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%B %d, %Y' }}</time>
            {% endif %}
            {% if post.series %}<span>{{ post.series }}</span>{% endif %}
          </div>
          {% assign is_justquant = false %}
          {% if post.permalink == '/blog/justquant/' or post.slug == 'justquant' %}
            {% assign is_justquant = true %}
          {% endif %}
          <h2>
            <a
              href="{{ post.url | relative_url }}"
              {% if is_justquant %}class="justquant-gradient-title"{% endif %}
            >{{ post.title }}</a>
          </h2>
          <p class="blog-entry-description">{{ post.description }}</p>
          <div class="blog-entry-links">
            <a href="{{ post.url | relative_url }}">{% if post.status == 'in_progress' %}View article{% else %}Read article{% endif %} <span aria-hidden="true">&rarr;</span></a>
            {% if post.project_url %}<a href="{{ post.project_url | relative_url }}">Project page <span aria-hidden="true">&#8599;</span></a>{% endif %}
          </div>
        </li>
      {% else %}
        <li class="blog-empty">New notes will appear here.</li>
      {% endfor %}
    </ul>
  </section>
</div>
