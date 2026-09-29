---
layout: page
permalink: /publications/
title: publications
description: Papers and preprints on model quantization, diffusion models, and efficient machine learning.
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<!-- Bibsearch Feature -->

<p class="text-muted">* indicates equal contribution.</p>

{% include bib_search.liquid %}

<div class="publications">

{% bibliography --query @*[hidden!=true]* %}

</div>
