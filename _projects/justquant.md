---
layout: justquant
title: JustQuant
description: Plain low-bit operators. Intelligence preserved through progressive distillation.
permalink: /projects/justquant/
importance: 1
category: papers
hide_page_header: true
---

<div class="jq-page">
  <header class="jq-hero jq-container" id="overview">
    <p class="jq-eyebrow">MODEL QUANTIZATION / RESEARCH PROJECT</p>
    <h1>JustQuant</h1>
    <p class="jq-subtitle">Less machinery. More intelligence.</p>
    <div class="jq-resources" aria-label="Project resources">
      <a class="jq-link-primary" href="https://arxiv.org/pdf/2609.33601" target="_blank" rel="noopener"><i class="fa-regular fa-file-lines" aria-hidden="true"></i> Paper <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
      <a href="{{ '/blog/justquant/' | relative_url }}">Blog <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
      <a href="https://github.com/racoonykc/JustQuant" target="_blank" rel="noopener"><i class="fa-brands fa-github" aria-hidden="true"></i> GitHub <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
    </div>
    <div class="jq-intro">
      <p class="jq-eyebrow">01 / THE DEPLOYMENT GAP</p>
      <h2>4-bit on paper.<br>Complicated in practice.</h2>
      <p>Every year, more quantization papers promise nearly lossless 4-bit models. But a small bit width does not always mean a simple deployment: rotations, low-rank branches, and hardware-specific formats can turn a compact model into a complicated inference pipeline.</p>
    </div>
    <figure class="jq-teaser" aria-labelledby="deployment-caption">
      <div class="jq-teaser-scroll" role="region" aria-label="Conference survey of low-bit activation papers" tabindex="0">
        <a href="{{ '/assets/img/justquant/deployment-gap.svg' | relative_url }}" target="_blank" rel="noopener" aria-label="Open the full-size deployment-gap figure"><img src="{{ '/assets/img/justquant/deployment-gap.svg' | relative_url }}" width="2000" height="364" alt="Paper survey of eight conferences from ICLR 2024 to ICML 2026. Stacked bars count activation-quantization papers at 4 bits or below: green means no extra operator and red means extra operators. The shares using extra operators are 50%, 50%, 75%, 50%, 100%, 100%, 67%, and 80%, respectively." fetchpriority="high"></a>
      </div>
      <figcaption id="deployment-caption"><span>From the paper: a survey of &le;4-bit activation quantization across eight conferences (2024&ndash;2026). <span class="jq-op-extra">Red: extra operators.</span> <span class="jq-op-none">Green: no extra operator.</span></span><a href="{{ '/assets/img/justquant/deployment-gap.svg' | relative_url }}" target="_blank" rel="noopener">Full figure <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a></figcaption>
    </figure>
  </header>

  <section class="jq-question" aria-labelledby="question-title">
    <div class="jq-container">
      <p class="jq-eyebrow">02 / A SIMPLE QUESTION</p>
      <h2 id="question-title">Can intelligence live in a body<br class="jq-desktop-break"> made of plain 4-bit operations?</h2>
      <p>Naive low-bit matrix multiplication. No rotation, no SVD branch, no smoothing. Move the complexity into training, and keep the deployed operator simple.</p>
      <p class="jq-notation">W4A4 <span>/</span> W1.58A4 <span>/</span> PLAIN LOW-BIT GEMM</p>
    </div>
  </section>

  <section class="jq-results jq-container" aria-labelledby="results-title">
    <div class="jq-results-heading">
      <div><p class="jq-eyebrow">03 / THE EVIDENCE</p><h2 id="results-title">Start with the results.</h2></div>
      <nav class="jq-result-nav" aria-label="Results by model"><a href="#dit">DiT</a><a href="#flux">FLUX</a><a href="#elf">ELF</a><a href="#llada">LLaDA</a></nav>
    </div>
    <p class="jq-legend"><span class="jq-op-none">None</span> = no additional inference operator <span class="jq-legend-divider">/</span> <span class="jq-op-extra">Named operators</span> = additional transformations. Highlighted rows are ours.</p>

    <article class="jq-model" id="dit" aria-labelledby="dit-title">
      <div class="jq-model-heading"><div><p class="jq-eyebrow">IMAGE GENERATION / 0.6B</p><h3 id="dit-title">DiT-XL/2</h3></div><p>ImageNet 256<br>W4A4 and W1.58A4</p></div>
      <p class="jq-finding">Plain W4A4 reaches <strong>6.48 FID-10K</strong>, versus 6.78 for full precision. With <strong>W1.58A4</strong>, FID-50K improves from 5.57 with direct QAT to <strong>3.30</strong>.</p>
      <div class="jq-gallery" data-gallery>
        <div class="jq-gallery-heading"><p>W1.58A4 visual comparisons</p><div class="jq-gallery-controls"><button type="button" data-direction="-1" aria-label="Previous DiT comparison" title="Previous comparison"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button><button type="button" data-direction="1" aria-label="Next DiT comparison" title="Next comparison"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button></div></div>
        <div class="jq-gallery-track jq-dit-track" tabindex="0" role="region" aria-label="DiT visual comparisons" data-track>
          <figure><img src="{{ '/assets/img/justquant/dit-comparison-01.png' | relative_url }}" alt="DiT W1.58A4 samples, panel one: full precision, direct QAT, RobuQ, and JustQuant, with ten ImageNet classes." width="1630" height="552" loading="lazy"><figcaption>ImageNet samples / panel 01. Rows: FP, direct QAT, RobuQ, JustQuant.</figcaption></figure>
          <figure><img src="{{ '/assets/img/justquant/dit-comparison-02.png' | relative_url }}" alt="DiT W1.58A4 samples, panel two: full precision, direct QAT, RobuQ, and JustQuant, with additional ImageNet classes." width="1630" height="552" loading="lazy"><figcaption>ImageNet samples / panel 02. Original comparisons from the paper appendix.</figcaption></figure>
        </div>
      </div>
      <div class="jq-tabset" data-tabs>
        <div class="jq-tabs" aria-label="DiT evaluation protocol"><button id="dit10-tab" type="button" data-panel="dit10-panel">10K samples / 50 steps</button><button id="dit50-tab" type="button" data-panel="dit50-panel">50K samples / 250 steps</button></div>
        <div id="dit10-panel" class="jq-panel">{% include justquant_table.liquid key="dit10" %}</div>
        <div id="dit50-panel" class="jq-panel">{% include justquant_table.liquid key="dit50" %}</div>
      </div>
      <p class="jq-note">W / A denotes weight / activation bits. All rows from the corresponding main-paper table are retained, including higher-performing baselines on individual metrics. MP = mixed precision; Norm = normalization.</p>
    </article>

    <article class="jq-model" id="flux" aria-labelledby="flux-title">
      <div class="jq-model-heading"><div><p class="jq-eyebrow">TEXT-TO-IMAGE / 12B</p><h3 id="flux-title">FLUX.1</h3></div><p>Naive W4A4 / group size 64<br>18 hours on 4 H200 GPUs</p></div>
      <p class="jq-finding">On schnell, plain W4A4 reaches <strong>0.7149 GenEval</strong>, above the tested rotation and SVD baselines. On dev, ImageReward recovers to <strong>0.956</strong>, close to the BF16 reference of 0.958.</p>
      <div class="jq-tabset" data-tabs>
        <div class="jq-tabs" aria-label="FLUX variant"><button id="schnell-tab" type="button" data-panel="schnell-panel">FLUX.1-schnell / 4 steps</button><button id="dev-tab" type="button" data-panel="dev-panel">FLUX.1-dev / 50 steps</button></div>
        <div id="schnell-panel" class="jq-panel">
          {% include justquant_flux.liquid variant="schnell" %}
          {% include justquant_table.liquid key="schnell" %}
        </div>
        <div id="dev-panel" class="jq-panel">
          {% include justquant_flux.liquid variant="dev" %}
          {% include justquant_table.liquid key="dev" %}
        </div>
      </div>
      <p class="jq-note">The FP / ConvRot / SVDQuant / JustQuant comparisons use original 1024 &times; 1024 PNGs from our image archive. The dev comparison is from the paper. W4A4 applies to transformer-block linear layers; text encoders, VAE, and boundary modules remain at higher precision. Plain operators still require suitable quantization, packing, and GEMM kernels.</p>
    </article>

    <article class="jq-model" id="elf" aria-labelledby="elf-title">
      <div class="jq-model-heading"><div><p class="jq-eyebrow">DIFFUSION LANGUAGE GENERATION / 105M</p><h3 id="elf-title">ELF-B</h3></div><p>OpenWebText<br>Four evaluation seeds</p></div>
      <p class="jq-finding">The same idea extends beyond images. Generation perplexity stays close to full precision under both judge models, for both <strong>W4A4 and W1.58A4</strong>, without Hadamard or SVD operators.</p>
      <div class="jq-tabset" data-tabs>
        <div class="jq-tabs" aria-label="ELF quantization setting"><button id="elf4-tab" type="button" data-panel="elf4-panel">W4A4</button><button id="elf158-tab" type="button" data-panel="elf158-panel">W1.58A4</button></div>
        <div id="elf4-panel" class="jq-panel">{% include justquant_table.liquid key="elf4" %}</div>
        <div id="elf158-panel" class="jq-panel">{% include justquant_table.liquid key="elf158" %}</div>
      </div>
      <p class="jq-note">Mean and variability over four seeds, reported as in the paper. The small W1.58A4 advantage over FP is within the reported variance.</p>
    </article>

    <article class="jq-model" id="llada" aria-labelledby="llada-title">
      <div class="jq-model-heading"><div><p class="jq-eyebrow">DIFFUSION LANGUAGE REASONING / 8B</p><h3 id="llada-title">LLaDA</h3></div><p>NVFP4 W4A4<br>Quantization-format transfer</p></div>
      <p class="jq-finding">Progressive distillation also transfers to <strong>NVFP4</strong>. GSM8K greedy accuracy reaches <strong>0.6543</strong>, while held-out task scores remain broadly comparable to ordinary QAD.</p>
      <div class="jq-tabset" data-tabs>
        <div class="jq-tabs" aria-label="LLaDA evaluation"><button id="gsm-tab" type="button" data-panel="gsm-panel">GSM8K</button><button id="transfer-tab" type="button" data-panel="transfer-panel">Held-out transfer</button></div>
        <div id="gsm-panel" class="jq-panel">{% include justquant_table.liquid key="lladaGsm" %}</div>
        <div id="transfer-panel" class="jq-panel">{% include justquant_table.liquid key="lladaTransfer" %}</div>
      </div>
      <p class="jq-note">Distilled only on GSM8K. This is an NVFP4 format-transfer experiment, not evidence of hardware-independent INT4 deployment. The paper does not report an additional-operator column for this experiment.</p>
    </article>
  </section>

  <section class="jq-method" aria-labelledby="method-title">
    <div class="jq-container">
      <p class="jq-eyebrow">04 / THE SHIP OF THESEUS</p>
      <h2 id="method-title">Change the material.<br>Preserve the intelligence.</h2>
      <p class="jq-method-intro">If every plank of a ship is replaced, what makes it the same ship? For a model, we ask a practical version: can its behavior survive a new, low-bit body?</p>
      {% include justquant_theseus.liquid %}
      <p><strong>Theseus QAD is progressive distillation.</strong> We begin by matching short low-bit segments to a full-precision teacher, then gradually merge them into longer paths, ending with full-model supervision. The student is already low-bit; what grows is the scope of distillation.</p>
      <figure class="jq-method-figure"><a href="{{ '/assets/img/justquant/theseus-qad.png' | relative_url }}" target="_blank" rel="noopener" aria-label="Open full-size Theseus QAD diagram"><img src="{{ '/assets/img/justquant/theseus-qad.png' | relative_url }}" width="2048" height="856" alt="Theseus QAD: teacher-guided quantized segments grow from one block to two, four, and finally the whole model. Local dense supervision becomes global supervision." loading="lazy"></a><figcaption>One block. Longer paths. The whole model. Additional guidance during training, not additional operators at inference.</figcaption></figure>
      <div class="jq-read-more" id="read-more"><h3>The idea is simple.<br>The details matter.</h3><div><p>The schedule, objectives, ablations, and limitations are in the paper. The companion article is now available, and the project repository is open.</p><div class="jq-resources"><a class="jq-link-primary" href="https://arxiv.org/pdf/2609.33601" target="_blank" rel="noopener">Read the paper <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a><a href="{{ '/blog/justquant/' | relative_url }}">Blog <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a><a href="https://github.com/racoonykc/JustQuant" target="_blank" rel="noopener"><i class="fa-brands fa-github" aria-hidden="true"></i> GitHub <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a></div></div></div>
    </div>
  </section>
  <footer class="jq-footer jq-container"><span>Plain operators. Progressive distillation.</span><a href="#overview">Back to top <i class="fa-solid fa-arrow-up" aria-hidden="true"></i></a></footer>
</div>
